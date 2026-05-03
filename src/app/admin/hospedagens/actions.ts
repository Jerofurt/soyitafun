'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { slugify } from '@/lib/utils'

export type ActionState = { error: string | null }

const VALID_ZONAS = ['vila', 'condominio'] as const
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

function parseInt32(v: FormDataEntryValue | null): number | null {
  const n = parseNumber(v)
  return n === null ? null : Math.trunc(n)
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
  zona: string
  descricao: string | null
  fotos: string[]
  capacidade: number | null
  quartos: number | null
  banheiros: number | null
  comodidades: string[]
  preco_diaria_baixa: number | null
  preco_diaria_alta: number | null
  whatsapp: string | null
  email: string | null
  endereco: string | null
  lat: number | null
  lng: number | null
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

  const zona = parseString(formData.get('zona'))
  if (!zona || !VALID_ZONAS.includes(zona as (typeof VALID_ZONAS)[number])) {
    return { ok: false, error: 'Selecione uma zona válida.' }
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
      zona,
      descricao: parseString(formData.get('descricao')),
      fotos: parseStringArray(formData, 'fotos'),
      capacidade: parseInt32(formData.get('capacidade')),
      quartos: parseInt32(formData.get('quartos')),
      banheiros: parseInt32(formData.get('banheiros')),
      comodidades: parseStringArray(formData, 'comodidades'),
      preco_diaria_baixa: parseNumber(formData.get('preco_diaria_baixa')),
      preco_diaria_alta: parseNumber(formData.get('preco_diaria_alta')),
      whatsapp: parseString(formData.get('whatsapp')),
      email: parseString(formData.get('email')),
      endereco: parseString(formData.get('endereco')),
      lat: parseNumber(formData.get('lat')),
      lng: parseNumber(formData.get('lng')),
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
    return 'Já existe uma hospedagem com este slug. Escolha outro.'
  }
  return error.message
}

export async function createHospedagem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseFormData(formData)
  if (!parsed.ok) return { error: parsed.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hospedagens')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) return { error: pgErrorMessage(error) }

  revalidatePath('/admin/hospedagens')
  revalidatePath('/admin')
  redirect(`/admin/hospedagens/${data.id}/editar?saved=1`)
}

export async function updateHospedagem(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseFormData(formData)
  if (!parsed.ok) return { error: parsed.error }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('hospedagens')
    .select('fotos')
    .eq('id', id)
    .single<{ fotos: string[] | null }>()
  const oldPhotos = existing?.fotos ?? []
  const newPhotos = parsed.data.fotos
  const orphanedPhotos = oldPhotos.filter((p) => !newPhotos.includes(p))

  // id should not change on update
  const { id: _ignore, ...updates } = parsed.data
  void _ignore

  const { error } = await supabase
    .from('hospedagens')
    .update(updates)
    .eq('id', id)

  if (error) return { error: pgErrorMessage(error) }

  if (orphanedPhotos.length > 0) {
    await supabase.storage.from('hospedagens').remove(orphanedPhotos)
  }

  revalidatePath('/admin/hospedagens')
  revalidatePath(`/admin/hospedagens/${id}/editar`)
  revalidatePath('/admin')
  redirect(`/admin/hospedagens/${id}/editar?saved=1`)
}

export async function deleteHospedagem(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('hospedagens').delete().eq('id', id)
  if (error) {
    const qs = new URLSearchParams({ error: error.message })
    redirect(`/admin/hospedagens/${id}/editar?${qs.toString()}`)
  }

  const { data: files } = await supabase.storage.from('hospedagens').list(id)
  if (files && files.length > 0) {
    const paths = files.map((f) => `${id}/${f.name}`)
    await supabase.storage.from('hospedagens').remove(paths)
  }

  revalidatePath('/admin/hospedagens')
  revalidatePath('/admin')
  redirect('/admin/hospedagens')
}
