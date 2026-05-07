import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const TIPO_LABELS: Record<string, string> = {
  transfer: 'Transfer',
  chef: 'Chef',
  massagista: 'Massagista',
  limpeza: 'Limpeza',
  aluguel_carro: 'Aluguel de carro',
  outro: 'Outro',
}

const PRECO_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/servicos/${path}`
}

export type ServicoCardData = {
  slug: string
  nome: string
  tipo: string
  preco_base: number | null
  fotos: string[] | null
}

export function ServicoCard({ s }: { s: ServicoCardData }) {
  const thumb = s.fotos?.[0]

  return (
    <Link
      href={`/servicos/${s.slug}`}
      className="group block bg-fondo-card border border-texto-secundario/10 rounded-md overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="aspect-[4/3] bg-fondo-base/60 relative overflow-hidden">
        {thumb ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={buildPhotoUrl(thumb)}
            alt={s.nome}
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
            {s.nome}
          </h3>
          <Badge variant="info">{TIPO_LABELS[s.tipo] ?? s.tipo}</Badge>
        </div>

        {s.preco_base !== null && (
          <p className="text-sm pt-1">
            <span className="text-texto-secundario">a partir de </span>
            <span className="text-texto-principal font-medium">
              {PRECO_FORMATTER.format(s.preco_base)}
            </span>
          </p>
        )}
      </div>
    </Link>
  )
}
