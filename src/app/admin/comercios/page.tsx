import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Filters } from './filters'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Comercio = {
  id: string
  slug: string
  nome: string
  categoria: string
  plano: string
  status: string
  data_vencimento: string | null
  fotos: string[] | null
}

const CATEGORIA_LABELS: Record<string, string> = {
  restaurante: 'Restaurante',
  padaria: 'Padaria',
  loja: 'Loja',
  mercado: 'Mercado',
  farmacia: 'Farmácia',
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

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/comercios/${path}`
}

export default async function ComerciosListPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; status?: string }>
}) {
  const params = await searchParams
  const categoria = params.categoria ?? ''
  const status = params.status ?? ''

  const supabase = await createClient()
  let query = supabase
    .from('comercios')
    .select(
      'id, slug, nome, categoria, plano, status, data_vencimento, fotos',
    )
    .order('created_at', { ascending: false })

  if (categoria) query = query.eq('categoria', categoria)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  const rows = (data ?? []) as Comercio[]
  const filtered = Boolean(categoria || status)

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
            <h1 className="text-2xl text-texto-principal mt-2">Comércios</h1>
            <p className="text-xs text-texto-secundario mt-1">
              {rows.length} {rows.length === 1 ? 'cadastrado' : 'cadastrados'}
              {filtered && ' · filtrados'}
            </p>
          </div>
          <Link href="/admin/comercios/nova">
            <Button>+ Novo comércio</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12 space-y-6">
        <Filters categoria={categoria} status={status} />

        {error ? (
          <Card>
            <div className="px-8 py-6 text-error">
              <p className="font-medium">Erro ao carregar comércios</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </Card>
        ) : rows.length === 0 ? (
          <EmptyState filtered={filtered} />
        ) : (
          <ComerciosTable rows={rows} />
        )}
      </div>
    </main>
  )
}

function ComerciosTable({ rows }: { rows: Comercio[] }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <thead className="bg-fondo-base/40 border-b border-texto-secundario/10">
          <tr className="text-left text-[10px] font-medium uppercase tracking-wider text-texto-secundario">
            <th className="px-6 py-4 w-20">Foto</th>
            <th className="px-6 py-4">Nome</th>
            <th className="px-6 py-4">Categoria</th>
            <th className="px-6 py-4">Plano</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Vencimento</th>
            <th className="px-6 py-4 w-24 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-texto-secundario/10">
          {rows.map((c) => {
            const thumb = c.fotos?.[0]
            const status = STATUS_BADGE[c.status] ?? STATUS_BADGE.pendente
            return (
              <tr
                key={c.id}
                className="transition-colors duration-200 hover:bg-fondo-base/40"
              >
                <td className="px-6 py-4">
                  {thumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={buildPhotoUrl(thumb)}
                      alt={c.nome}
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
                    {c.nome}
                  </div>
                  <div className="text-xs text-texto-secundario font-mono mt-0.5">
                    /{c.slug}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {CATEGORIA_LABELS[c.categoria] ?? c.categoria}
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {PLANO_LABELS[c.plano] ?? c.plano}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {formatDate(c.data_vencimento)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/comercios/${c.id}/editar`}
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
          {filtered ? 'Nenhum comércio encontrado' : 'Ainda não há comércios'}
        </h2>
        <p className="text-sm text-texto-secundario mt-3 mb-8 max-w-md mx-auto leading-relaxed">
          {filtered
            ? 'Tente ajustar os filtros para ver mais resultados.'
            : 'Cadastre o primeiro comércio — restaurante, padaria, loja, mercado, farmácia ou outro.'}
        </p>
        {!filtered && (
          <Link href="/admin/comercios/nova">
            <Button>+ Novo comércio</Button>
          </Link>
        )}
      </div>
    </Card>
  )
}
