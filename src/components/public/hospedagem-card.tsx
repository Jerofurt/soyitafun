import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const ZONA_LABELS: Record<string, string> = {
  vila: 'Vila',
  condominio: 'Condomínio',
}

const PRECO_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/hospedagens/${path}`
}

export type HospedagemCardData = {
  slug: string
  nome: string
  zona: string
  capacidade: number | null
  preco_diaria_baixa: number | null
  fotos: string[] | null
}

export function HospedagemCard({ h }: { h: HospedagemCardData }) {
  const thumb = h.fotos?.[0]

  return (
    <Link
      href={`/hospedagens/${h.slug}`}
      className="group block bg-fondo-card border border-texto-secundario/10 rounded-md overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="aspect-[4/3] bg-fondo-base/60 relative overflow-hidden">
        {thumb ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={buildPhotoUrl(thumb)}
            alt={h.nome}
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
            {h.nome}
          </h3>
          <Badge variant="info">{ZONA_LABELS[h.zona] ?? h.zona}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-texto-secundario">
            {h.capacidade
              ? `até ${h.capacidade} ${h.capacidade === 1 ? 'pessoa' : 'pessoas'}`
              : '—'}
          </span>
          {h.preco_diaria_baixa !== null && (
            <span className="text-texto-principal">
              <span className="text-texto-secundario text-xs">a partir de </span>
              <span className="font-medium">
                {PRECO_FORMATTER.format(h.preco_diaria_baixa)}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
