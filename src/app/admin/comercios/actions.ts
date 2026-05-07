'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sanitizeInstagramHandle, slugify } from '@/lib/utils'

export type ActionState = { error: string | null }

const VALID_CATEGORIAS = [
  'restaurante',
  'padaria',
  'loja',
  'mercado',
  'farmacia',
  'outro',
] as const
const VALID_PLANOS = ['mensal', 'anual'] as const
const VALID_STATUS = ['ativo', 'pausado', 'pendente', 'vencido'] as const

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

function parseDate(v: FormDataEntryValue | null): string | null {
  const s = parseString(v)
  if (s === null) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
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
  categoria: string
  descricao: string | null
  fotos: string[]
  horario: string | null
  endereco: string | null
  lat: number | null
  lng: number | null
  whatsapp: string | null
  instagram: string | null
  plano: string
  status: string
  data_inicio: string | null
  data_vencimento: string | null
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

  const categoria = parseString(formData.get('categoria'))
  if (
    !categoria ||
    !VALID_CATEGORIAS.includes(
      categoria as (typeof VALID_CATEGORIAS)[number],
    )
  ) {
    return { ok: false, error: 'Selecione uma categoria válida.' }
  }

  const plano = parseString(formData.get('plano')) ?? 'mensal'
  if (!VALID_PLANOS.includes(plano as (typeof VALID_PLANOS)[number])) {
    return { ok: false, error: 'Selecione um plano válido.' }
  }

  const status = parseString(formData.get('status')) ?? 'pendente'
  if (!VALID_STATUS.includes(status as (typeof VALID_STATUS)[number])) {
    return { ok: false, error: 'Selecione um status válido.' }
  }

  return {
    ok: true,
    data: {
      id: parseString(formData.get('id')) ?? undefined,
      slug,
      nome,
      categoria,
      descricao: parseString(formData.get('descricao')),
      fotos: parseStringArray(formData, 'fotos'),
      horario: parseString(formData.get('horario')),
      endereco: parseString(formData.get('endereco')),
      lat: parseNumber(formData.get('lat')),
      lng: parseNumber(formData.get('lng')),
      whatsapp: parseString(formData.get('whatsapp')),
      instagram: sanitizeInstagramHandle(parseString(formData.get('instagram'))),
      plano,
      status,
      data_inicio: parseDate(formData.get('data_inicio')),
      data_vencimento: parseDate(formData.get('data_vencimento')),
      destaque: formData.get('destaque') === 'on',
    },
  }
}

function pgErrorMessage(error: { code?: string | null; message: string }): string {
  if (error.code === '23505') {
    return 'Já existe um comércio com este slug. Escolha outro.'
  }
  return error.message
}

export async function createComercio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseFormData(formData)
  if (!parsed.ok) return { error: parsed.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comercios')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { error: pgErrorMessage(error) }

  revalidatePath('/admin/comercios')
  revalidatePath('/admin')
  redirect(`/admin/comercios/${data.id}/editar?saved=1`)
}

export async function updateComercio(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseFormData(formData)
  if (!parsed.ok) return { error: parsed.error }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('comercios')
    .select('fotos')
    .eq('id', id)
    .single<{ fotos: string[] | null }>()
  const oldPhotos = existing?.fotos ?? []
  const newPhotos = parsed.data.fotos
  const orphanedPhotos = oldPhotos.filter((p) => !newPhotos.includes(p))

  const { id: _ignore, ...updates } = parsed.data
  void _ignore

  const { error } = await supabase
    .from('comercios')
    .update(updates)
    .eq('id', id)

  if (error) return { error: pgErrorMessage(error) }

  if (orphanedPhotos.length > 0) {
    await supabase.storage.from('comercios').remove(orphanedPhotos)
  }

  revalidatePath('/admin/comercios')
  revalidatePath(`/admin/comercios/${id}/editar`)
  revalidatePath('/admin')
  redirect(`/admin/comercios/${id}/editar?saved=1`)
}

export async function deleteComercio(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('comercios').delete().eq('id', id)
  if (error) {
    const qs = new URLSearchParams({ error: error.message })
    redirect(`/admin/comercios/${id}/editar?${qs.toString()}`)
  }

  const { data: files } = await supabase.storage.from('comercios').list(id)
  if (files && files.length > 0) {
    const paths = files.map((f) => `${id}/${f.name}`)
    await supabase.storage.from('comercios').remove(paths)
  }

  revalidatePath('/admin/comercios')
  revalidatePath('/admin')
  redirect('/admin/comercios')
}
