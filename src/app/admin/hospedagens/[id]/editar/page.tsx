import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  HospedagemForm,
  type HospedagemInitial,
} from '../../_components/hospedagem-form'

export default async function EditarHospedagemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hospedagens')
    .select(
      'id, slug, nome, zona, descricao, fotos, capacidade, quartos, banheiros, comodidades, preco_diaria_baixa, preco_diaria_alta, whatsapp, email, instagram, endereco, lat, lng, plano, status, data_inicio, data_vencimento, destaque',
    )
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const initial = data as HospedagemInitial

  return (
    <main className="min-h-screen bg-fondo-base">
      <header className="bg-fondo-card border-b border-texto-secundario/10">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <Link
            href="/admin/hospedagens"
            className="text-[11px] uppercase tracking-wider text-texto-secundario hover:text-texto-principal transition-colors duration-200"
          >
            ← Hospedagens
          </Link>
          <h1 className="text-2xl text-texto-principal mt-2">{initial.nome}</h1>
          <p className="text-xs text-texto-secundario font-mono mt-1">
            /{initial.slug}
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-12 space-y-8">
        {sp.error && (
          <div className="bg-error/10 border border-error/20 rounded-sm px-6 py-4">
            <p className="text-sm font-medium text-error">
              Não foi possível excluir
            </p>
            <p className="text-sm text-error/80 mt-1">{sp.error}</p>
          </div>
        )}

        <HospedagemForm
          mode="edit"
          initial={initial}
          saved={sp.saved === '1'}
        />
      </div>
    </main>
  )
}
