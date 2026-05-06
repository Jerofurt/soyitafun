import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

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

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/atividades/${path}`
}

export type AtividadeCardData = {
  slug: string
  nome: string
  tipo: string
  duracao_horas: number | null
  preco: number | null
  capacidade_max: number | null
  fotos: string[] | null
}

export function AtividadeCard({ a }: { a: AtividadeCardData }) {
  const thumb = a.fotos?.[0]

  return (
    <Link
      href={`/atividades/${a.slug}`}
      className="group block bg-fondo-card border border-texto-secundario/10 rounded-md overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="aspect-[4/3] bg-fondo-base/60 relative overflow-hidden">
        {thumb ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={buildPhotoUrl(thumb)}
            alt={a.nome}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-texto-secundario/50 text-xs uppercase tracking-wider">
            sem foto
          </div>
        )}
      </div>

      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-texto-principal leading-tight group-hover:text-acento-mar transition-colors duration-200">
            {a.nome}
          </h3>
          <Badge variant="info">{TIPO_LABELS[a.tipo] ?? a.tipo}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-texto-secundario">
            {[
              formatDuracao(a.duracao_horas),
              a.capacidade_max ? `até ${a.capacidade_max} pessoas` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
          {a.preco !== null && (
            <span className="text-texto-principal font-medium">
              {PRECO_FORMATTER.format(a.preco)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
