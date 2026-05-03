import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Filters } from './filters'

type Hospedagem = {
  id: string
  slug: string
  nome: string
  zona: string
  plano: string
  status: string
  data_vencimento: string | null
  fotos: string[] | null
}

const ZONA_LABELS: Record<string, string> = {
  vila: 'Vila',
  condominio: 'Condomínio',
}

const PLANO_LABELS: Record<string, string> = {
  mensal: 'Mensal',
  anual: 'Anual',
}

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  ativo: {
    label: 'Ativo',
    classes: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  },
  pausado: {
    label: 'Pausado',
    classes: 'bg-stone-100 text-stone-700 ring-stone-200',
  },
  pendente: {
    label: 'Pendente',
    classes: 'bg-amber-100 text-amber-800 ring-amber-200',
  },
  vencido: {
    label: 'Vencido',
    classes: 'bg-red-100 text-red-800 ring-red-200',
  },
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/hospedagens/${path}`
}

export default async function HospedagensListPage({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string; status?: string }>
}) {
  const params = await searchParams
  const zona = params.zona ?? ''
  const status = params.status ?? ''

  const supabase = await createClient()
  let query = supabase
    .from('hospedagens')
    .select('id, slug, nome, zona, plano, status, data_vencimento, fotos')
    .order('created_at', { ascending: false })

  if (zona) query = query.eq('zona', zona)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  const rows = (data ?? []) as Hospedagem[]
  const filtered = Boolean(zona || status)

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm text-stone-500">
              <Link href="/admin" className="hover:text-stone-900">
                ← Painel
              </Link>
            </div>
            <h1 className="text-xl font-bold text-stone-900 mt-1">Hospedagens</h1>
            <p className="text-xs text-stone-500">
              {rows.length} {rows.length === 1 ? 'cadastrada' : 'cadastradas'}
              {filtered && ' (filtradas)'}
            </p>
          </div>
          <Link
            href="/admin/hospedagens/nova"
            className="bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-800 transition-colors"
          >
            + Nova hospedagem
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <Filters zona={zona} status={status} />

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <p className="font-semibold">Erro ao carregar hospedagens</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState filtered={filtered} />
        ) : (
          <HospedagensTable rows={rows} />
        )}
      </div>
    </main>
  )
}

function HospedagensTable({ rows }: { rows: Hospedagem[] }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
            <th className="px-4 py-3 w-20">Foto</th>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Zona</th>
            <th className="px-4 py-3">Plano</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Vencimento</th>
            <th className="px-4 py-3 w-24 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((h) => {
            const thumb = h.fotos?.[0]
            const statusStyle = STATUS_STYLES[h.status] ?? STATUS_STYLES.pendente
            return (
              <tr key={h.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  {thumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={buildPhotoUrl(thumb)}
                      alt={h.nome}
                      className="w-14 h-14 rounded object-cover bg-stone-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded bg-stone-100 flex items-center justify-center text-stone-400 text-[10px] text-center px-1">
                      sem foto
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-stone-900">{h.nome}</div>
                  <div className="text-xs text-stone-500">/{h.slug}</div>
                </td>
                <td className="px-4 py-3 text-sm text-stone-700">
                  {ZONA_LABELS[h.zona] ?? h.zona}
                </td>
                <td className="px-4 py-3 text-sm text-stone-700">
                  {PLANO_LABELS[h.plano] ?? h.plano}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusStyle.classes}`}
                  >
                    {statusStyle.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-stone-700">
                  {formatDate(h.data_vencimento)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/hospedagens/${h.id}/editar`}
                    className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <h2 className="text-lg font-semibold text-stone-900">
        {filtered ? 'Nenhuma hospedagem encontrada' : 'Ainda não há hospedagens'}
      </h2>
      <p className="text-stone-600 mt-2 mb-6">
        {filtered
          ? 'Tente ajustar os filtros para ver mais resultados.'
          : 'Cadastre a primeira hospedagem para começar.'}
      </p>
      {!filtered && (
        <Link
          href="/admin/hospedagens/nova"
          className="inline-block bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-800 transition-colors"
        >
          + Nova hospedagem
        </Link>
      )}
    </div>
  )
}
