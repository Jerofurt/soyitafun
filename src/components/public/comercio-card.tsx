import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const CATEGORIA_LABELS: Record<string, string> = {
  restaurante: 'Restaurante',
  padaria: 'Padaria',
  loja: 'Loja',
  mercado: 'Mercado',
  farmacia: 'Farmácia',
  outro: 'Outro',
}

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/comercios/${path}`
}

function firstLine(s: string | null): string | null {
  if (!s) return null
  const line = s.split('\n')[0].trim()
  return line === '' ? null : line
}

export type ComercioCardData = {
  slug: string
  nome: string
  categoria: string
  horario: string | null
  endereco: string | null
  fotos: string[] | null
}

export function ComercioCard({ c }: { c: ComercioCardData }) {
  const thumb = c.fotos?.[0]
  const horarioLine = firstLine(c.horario)

  return (
    <Link
      href={`/comercios/${c.slug}`}
      className="group block bg-fondo-card border border-texto-secundario/10 rounded-md overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="aspect-[4/3] bg-fondo-base/60 relative overflow-hidden">
        {thumb ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={buildPhotoUrl(thumb)}
            alt={c.nome}
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
            {c.nome}
          </h3>
          <Badge variant="info">
            {CATEGORIA_LABELS[c.categoria] ?? c.categoria}
          </Badge>
        </div>

        <div className="space-y-1.5 pt-1">
          {horarioLine && (
            <p className="text-sm text-texto-secundario truncate">
              {horarioLine}
            </p>
          )}
          {c.endereco && (
            <p className="text-xs text-texto-secundario/80 truncate">
              {c.endereco}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
