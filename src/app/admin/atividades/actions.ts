'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'

export type ActionState = { error: string | null }

const VALID_TIPOS = [
  'lancha',
  'cachoeira',
  'surf',
  'caminhada',
  'outro',
] as const

function parseString(v: FormDataEntryValue | null): string | null {
  if (v === null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

function parseNumber(v: FormDataEntryValue | null): number | null {
  const s = parseString(v)
  if (s === null) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function parseInt32(v: FormDataEntryValue | null): number | null {
  const n = parseNumber(v)
  return n === null ? null : Math.trunc(n)
}

function parseStringArray(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((v) => String(v).trim())
    .filter((s) => s !== '')
}

type Payload = {
  id?: string
  slug: string
  nome: string
  tipo: string
  descricao: string | null
  fotos: string[]
  duracao_horas: number | null
  preco: number | null
  capacidade_max: number | null
  ponto_encontro: string | null
  lat: number | null
  lng: number | null
  whatsapp_operador: string | null
  comissao_percent: number | null
  ativo: boolean
  destaque: boolean
}

type ParseResult =
  | { ok: true; data: Payload }
  | { ok: false; error: string }

function parseFormData(formData: FormData): ParseResult {
  const nome = parseString(formData.get('nome'))
  if (!nome) return { ok: false, error: 'O nome é obrigatório.' }

  let slug = parseString(formData.get('slug'))
  if (!slug) slug = slugify(nome)
  if (!slug) {
    return {
      ok: false,
      error: 'Não foi possível gerar um slug a partir do nome.',
    }
  }

  const tipo = parseString(formData.get('tipo'))
  if (!tipo || !VALID_TIPOS.includes(tipo as (typeof VALID_TIPOS)[number])) {
    return { ok: false, error: 'Selecione um tipo válido.' }
  }

  return {
    ok: true,
    data: {
      id: parseString(formData.get('id')) ?? undefined,
      slug,
      nome,
      tipo,
      descricao: parseString(formData.get('descricao')),
      fotos: parseStringArray(formData, 'fotos'),
      duracao_horas: parseNumber(formData.get('duracao_horas')),
      preco: parseNumber(formData.get('preco')),
      capacidade_max: parseInt32(formData.get('capacidade_max')),
      ponto_encontro: parseString(formData.get('ponto_encontro')),
      lat: parseNumber(formData.get('lat')),
      lng: parseNumber(formData.get('lng')),
      whatsapp_operador: parseString(formData.get('whatsapp_operador')),
      comissao_percent: parseNumber(formData.get('comissao_percent')),
      ativo: formData.get('ativo') === 'on',
      destaque: formData.get('destaque') === 'on',
    },
  }
}

function pgErrorMessage(error: { code?: string | null; message: string }): string {
  if (error.code === '23505') {
    return 'Já existe uma atividade com este slug. Escolha outro.'
  }
  return error.message
}

/**
 * Flips atividades.ativo for a single row. Used by the inline toggle in the
 * listing — UX optimistic-flips on the client, then revalidates after the
 * server-side update lands.
 */
export async function toggleAtivo(id: string): Promise<void> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('atividades')
    .select('ativo')
    .eq('id', id)
    .single<{ ativo: boolean }>()

  if (!existing) return

  await supabase
    .from('atividades')
    .update({ ativo: !existing.ativo })
    .eq('id', id)

  revalidatePath('/admin/atividades')
}

export async function createAtividade(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseFormData(formData)
  if (!parsed.ok) return { error: parsed.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('atividades')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { error: pgErrorMessage(error) }

  revalidatePath('/admin/atividades')
  revalidatePath('/admin')
  redirect(`/admin/atividades/${data.id}/editar?saved=1`)
}

export async function updateAtividade(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseFormData(formData)
  if (!parsed.ok) return { error: parsed.error }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('atividades')
    .select('fotos')
    .eq('id', id)
    .single<{ fotos: string[] | null }>()
  const oldPhotos = existing?.fotos ?? []
  const newPhotos = parsed.data.fotos
  const orphanedPhotos = oldPhotos.filter((p) => !newPhotos.includes(p))

  const { id: _ignore, ...updates } = parsed.data
  void _ignore

  const { error } = await supabase
    .from('atividades')
    .update(updates)
    .eq('id', id)

  if (error) return { error: pgErrorMessage(error) }

  if (orphanedPhotos.length > 0) {
    await supabase.storage.from('atividades').remove(orphanedPhotos)
  }

  revalidatePath('/admin/atividades')
  revalidatePath(`/admin/atividades/${id}/editar`)
  revalidatePath('/admin')
  redirect(`/admin/atividades/${id}/editar?saved=1`)
}

export async function deleteAtividade(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('atividades').delete().eq('id', id)
  if (error) {
    const qs = new URLSearchParams({ error: error.message })
    redirect(`/admin/atividades/${id}/editar?${qs.toString()}`)
  }

  const { data: files } = await supabase.storage.from('atividades').list(id)
  if (files && files.length > 0) {
    const paths = files.map((f) => `${id}/${f.name}`)
    await supabase.storage.from('atividades').remove(paths)
  }

  revalidatePath('/admin/atividades')
  revalidatePath('/admin')
  redirect('/admin/atividades')
}
