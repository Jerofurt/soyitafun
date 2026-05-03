import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Filters } from './filters'
import { AtivoToggle } from './_components/ativo-toggle'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Atividade = {
  id: string
  slug: string
  nome: string
  tipo: string
  duracao_horas: number | null
  preco: number | null
  comissao_percent: number | null
  ativo: boolean
  fotos: string[] | null
}

const TIPO_LABELS: Record<string, string> = {
  lancha: 'Lancha',
  cachoeira: 'Cachoeira',
  surf: 'Surf',
  caminhada: 'Caminhada',
  outro: 'Outro',
}

const PRECO_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function formatDuracao(h: number | null): string {
  if (h === null) return '—'
  return `${h.toString().replace('.', ',')}h`
}

function formatPreco(v: number | null): string {
  if (v === null) return '—'
  return PRECO_FORMATTER.format(v)
}

function formatPercent(v: number | null): string {
  if (v === null) return '—'
  return `${v.toString().replace('.', ',')}%`
}

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/atividades/${path}`
}

export default async function AtividadesListPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; ativo?: string }>
}) {
  const params = await searchParams
  const tipo = params.tipo ?? ''
  const ativoFilter = params.ativo ?? ''

  const supabase = await createClient()
  let query = supabase
    .from('atividades')
    .select(
      'id, slug, nome, tipo, duracao_horas, preco, comissao_percent, ativo, fotos',
    )
    .order('created_at', { ascending: false })

  if (tipo) query = query.eq('tipo', tipo)
  if (ativoFilter === 'true') query = query.eq('ativo', true)
  if (ativoFilter === 'false') query = query.eq('ativo', false)

  const { data, error } = await query
  const rows = (data ?? []) as Atividade[]
  const filtered = Boolean(tipo || ativoFilter)

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
            <h1 className="text-2xl text-texto-principal mt-2">Atividades</h1>
            <p className="text-xs text-texto-secundario mt-1">
              {rows.length} {rows.length === 1 ? 'cadastrada' : 'cadastradas'}
              {filtered && ' · filtradas'}
            </p>
          </div>
          <Link href="/admin/atividades/nova">
            <Button>+ Nova atividade</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12 space-y-6">
        <Filters tipo={tipo} ativo={ativoFilter} />

        {error ? (
          <Card>
            <div className="px-8 py-6 text-error">
              <p className="font-medium">Erro ao carregar atividades</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </Card>
        ) : rows.length === 0 ? (
          <EmptyState filtered={filtered} />
        ) : (
          <AtividadesTable rows={rows} />
        )}
      </div>
    </main>
  )
}

function AtividadesTable({ rows }: { rows: Atividade[] }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <thead className="bg-fondo-base/40 border-b border-texto-secundario/10">
          <tr className="text-left text-[10px] font-medium uppercase tracking-wider text-texto-secundario">
            <th className="px-6 py-4 w-20">Foto</th>
            <th className="px-6 py-4">Nome</th>
            <th className="px-6 py-4">Tipo</th>
            <th className="px-6 py-4">Duração</th>
            <th className="px-6 py-4">Preço</th>
            <th className="px-6 py-4">Comissão</th>
            <th className="px-6 py-4">Ativo</th>
            <th className="px-6 py-4 w-24 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-texto-secundario/10">
          {rows.map((a) => {
            const thumb = a.fotos?.[0]
            return (
              <tr
                key={a.id}
                className="transition-colors duration-200 hover:bg-fondo-base/40"
              >
                <td className="px-6 py-4">
                  {thumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={buildPhotoUrl(thumb)}
                      alt={a.nome}
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
                    {a.nome}
                  </div>
                  <div className="text-xs text-texto-secundario font-mono mt-0.5">
                    /{a.slug}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {TIPO_LABELS[a.tipo] ?? a.tipo}
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {formatDuracao(a.duracao_horas)}
                </td>
                <td className="px-6 py-4 text-sm text-texto-principal">
                  {formatPreco(a.preco)}
                </td>
                <td className="px-6 py-4 text-sm text-texto-secundario">
                  {formatPercent(a.comissao_percent)}
                </td>
                <td className="px-6 py-4">
                  <AtivoToggle id={a.id} ativo={a.ativo} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/atividades/${a.id}/editar`}
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
          {filtered ? 'Nenhuma atividade encontrada' : 'Ainda não há atividades'}
        </h2>
        <p className="text-sm text-texto-secundario mt-3 mb-8 max-w-md mx-auto leading-relaxed">
          {filtered
            ? 'Tente ajustar os filtros para ver mais resultados.'
            : 'Cadastre a primeira atividade — passeio de lancha, trilha pra cachoeira, aula de surf ou o que for.'}
        </p>
        {!filtered && (
          <Link href="/admin/atividades/nova">
            <Button>+ Nova atividade</Button>
          </Link>
        )}
      </div>
    </Card>
  )
}
