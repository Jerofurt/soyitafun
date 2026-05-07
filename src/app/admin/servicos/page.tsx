import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Filters } from './filters'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Servico = {
  id: string
  slug: string
  nome: string
  tipo: string
  preco_base: number | null
  plano: string
  status: string
  data_vencimento: string | null
  fotos: string[] | null
}

const TIPO_LABELS: Record<string, string> = {
  transfer: 'Transfer',
  chef: 'Chef',
  massagista: 'Massagista',
  limpeza: 'Limpeza',
  aluguel_carro: 'Aluguel de carro',
  outro: 'Outro',
}

const PLANO_LABELS: Record<string, string> = {
  mensal: 'Mensal',
  anual: 'Anual',
}

type StatusVariant = 'success' | 'neutral' | 'warning' | 'error'

const STATUS_BADGE: Record<string, { label: string; variant: StatusVariant }> = {
  ativo: { label: 'Ativo', variant: 'success' },
  pausado: { label: 'Pausado', variant: 'neutral' },
  pendente: { label: 'Pendente', variant: 'warning' },
  vencido: { label: 'Vencido', variant: 'error' },
}

const PRECO_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function formatPreco(v: number | null): string {
  if (v === null) return '—'
  return PRECO_FORMATTER.format(v)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/servicos/${path}`
}

export default async function ServicosListPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string }>
}) {
  const params = await searchParams
  const tipo = params.tipo ?? ''
  const status = params.status ?? ''

  const supabase = await createClient()
  let query = supabase
    .from('servicos')
    .select(
      'id, slug, nome, tipo, preco_base, plano, status, data_vencimento, fotos',
    )
    .order('created_at', { ascending: false })

  if (tipo) query = query.eq('tipo', tipo)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  const rows = (data ?? []) as Servico[]
  const filtered = Boolean(tipo || status)

  return (
    <main className="min-h-screen bg-fondo-base">
      <header className="bg-fondo-card border-b border-texto-secundario/10">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="text-[11px] uppercase tracking-wider text-texto-secundario hover:text-texto-principal transition-colors duration-200"
            >
              ← Painel
            </Link>
            <h1 className="text-2xl text-texto-principal mt-2">Serviços</h1>
            <p className="text-xs text-texto-secundario mt-1">
              {rows.length} {rows.length === 1 ? 'cadastrado' : 'cadastrados'}
              {filtered && ' · filtrados'}
            </p>
          </div>
          <Link href="/admin/servicos/nova">
            <Button>+ Novo serviço</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12 space-y-6">
        <Filters tipo={tipo} status={status} />

        {error ? (
          <Card>
            <div className="px-8 py-6 text-error">
              <p className="font-medium">Erro ao carregar serviços</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </Card>
        ) : rows.length === 0 ? (
          <EmptyState filtered={filtered} />
        ) : (
          <ServicosTable rows={rows} />
        )}
      </div>
    </main>
  )
}

function ServicosTable({ rows }: { rows: Servico[] }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <thead className="bg-fondo-base/40 border-b border-texto-secundario/10">
          <tr className="text-left text-[10px] font-medium uppercase tracking-wider text-texto-secundario">
            <th className="px-6 py-4 w-20">Foto</th>
            <th className="px-6 py-4">Nome</th>
            <th className="px-6 py-4">Tipo</th>
            <th className="px-6 py-4">Preço base</th>
            <th className="px-6 py-4">Plano</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Vencimento</th>
            <th className="px-6 py-4 w-24 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-texto-secundario/10">
          {rows.map((s) => {
            const thumb = s.fotos?.[0]
            const status = STATUS_BADGE[s.status] ?? STATUS_BADGE.pendente
            return (
              <tr
                key={s.id}
                className="transition-colors duration-200 hover:bg-fondo-base/40"
              >
                <td className="px-6 py-4">
                  {thumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={buildPhotoUrl(thumb)}
                      alt={s.nome}
                      className="w-14 h-14 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-sm bg-fondo-base/60 border border-texto-secundario/15 flex items-center justify-center text-texto-secundario/60 text-[9px] uppercase tracking-wider text-center px-1">
                      sem foto
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-texto-principal">
                    {s.nome}
                  </div>
                  <div className="text-xs text-texto-secundario font-mono mt-0.5">
                    /{s.slug}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {TIPO_LABELS[s.tipo] ?? s.tipo}
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {formatPreco(s.preco_base)}
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {PLANO_LABELS[s.plano] ?? s.plano}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {formatDate(s.data_vencimento)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/servicos/${s.id}/editar`}
                    className="text-sm text-acento-mar hover:text-acento-mar/70 transition-colors duration-200 font-medium"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <Card>
      <div className="px-8 py-16 text-center">
        <h2 className="text-2xl text-texto-principal">
          {filtered ? 'Nenhum serviço encontrado' : 'Ainda não há serviços'}
        </h2>
        <p className="text-sm text-texto-secundario mt-3 mb-8 max-w-md mx-auto leading-relaxed">
          {filtered
            ? 'Tente ajustar os filtros para ver mais resultados.'
            : 'Cadastre o primeiro serviço — transfer, chef, massagem, limpeza ou aluguel de carro.'}
        </p>
        {!filtered && (
          <Link href="/admin/servicos/nova">
            <Button>+ Novo serviço</Button>
          </Link>
        )}
      </div>
    </Card>
  )
}
