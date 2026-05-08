import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { PhotoGallery } from '@/components/public/photo-gallery'
import { ContactButtons } from '@/components/public/contact-buttons'

const SITE_URL = 'https://soyitafun.netlify.app'

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n - 1).trimEnd() + '…'
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

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/atividades/${path}`
}

type Atividade = {
  id: string
  slug: string
  nome: string
  tipo: string
  descricao: string | null
  fotos: string[] | null
  duracao_horas: number | null
  preco: number | null
  capacidade_max: number | null
  ponto_encontro: string | null
  lat: number | null
  lng: number | null
  whatsapp_operador: string | null
  instagram: string | null
  status: string
}

async function fetchAtividade(slug: string): Promise<Atividade | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('atividades')
    .select(
      'id, slug, nome, tipo, descricao, fotos, duracao_horas, preco, capacidade_max, ponto_encontro, lat, lng, whatsapp_operador, instagram, status',
    )
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Atividade
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const a = await fetchAtividade(slug)
  if (!a || a.status !== 'ativo') {
    return { title: 'soyitafun' }
  }
  const title = `${a.nome} | soyitafun`
  const description = a.descricao
    ? truncate(a.descricao, 155)
    : `${a.nome} em Itamambuca, Ubatuba. Atividade curada por soyitafun.`
  const image = a.fotos?.[0] ? buildPhotoUrl(a.fotos[0]) : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: 'website',
      locale: 'pt_BR',
      url: `${SITE_URL}/atividades/${a.slug}`,
    },
  }
}

export default async function AtividadeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const a = await fetchAtividade(slug)
  if (!a) notFound()
  if (a.status !== 'ativo') notFound()

  const fotos = a.fotos ?? []
  const whatsappMessage = `Olá! Vi a atividade ${a.nome} no soyitafun e gostaria de mais informações.`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: a.nome,
    image: fotos.map(buildPhotoUrl),
    geo:
      a.lat !== null && a.lng !== null
        ? {
            '@type': 'GeoCoordinates',
            latitude: a.lat,
            longitude: a.lng,
          }
        : undefined,
    telephone: a.whatsapp_operador ?? undefined,
    url: `${SITE_URL}/atividades/${a.slug}`,
  }

  return (
    <article className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PhotoGallery photos={fotos.map(buildPhotoUrl)} alt={a.nome} />

      <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-8 space-y-12">
          <header className="space-y-4">
            <Badge variant="info">{TIPO_LABELS[a.tipo] ?? a.tipo}</Badge>
            <h1 className="font-display text-4xl md:text-5xl text-texto-principal leading-tight">
              {a.nome}
            </h1>
          </header>

          {a.descricao && (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
                Sobre a atividade
              </h2>
              <p className="text-base text-texto-principal/90 leading-relaxed whitespace-pre-line">
                {a.descricao}
              </p>
            </section>
          )}

          <Specs a={a} />

          {a.lat !== null && a.lng !== null && (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
                Ponto de encontro
              </h2>
              <div className="aspect-[16/9] rounded-md overflow-hidden border border-texto-secundario/15">
                <iframe
                  title={`Mapa de ${a.nome}`}
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${a.lat},${a.lng}&output=embed`}
                  className="w-full h-full"
                />
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 bg-fondo-card border border-texto-secundario/10 rounded-md shadow-sm p-8 space-y-6">
            <Pricing preco={a.preco} />
            <div className="border-t border-texto-secundario/10 pt-6">
              <ContactButtons
                whatsapp={a.whatsapp_operador}
                instagram={a.instagram}
                whatsappMessage={whatsappMessage}
              />
            </div>
            {!a.whatsapp_operador && !a.instagram && (
              <p className="text-xs text-texto-secundario text-center leading-relaxed">
                Contato em breve.
              </p>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}

function Specs({ a }: { a: Atividade }) {
  const items = [
    a.duracao_horas !== null && {
      label: 'Duração',
      value: formatDuracao(a.duracao_horas),
    },
    a.capacidade_max !== null && {
      label: 'Capacidade',
      value: `até ${a.capacidade_max} pessoas`,
    },
    a.ponto_encontro && {
      label: 'Encontro',
      value: a.ponto_encontro,
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>

  if (items.length === 0) return null

  return (
    <section>
      <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
        Detalhes
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5 max-w-xl">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] uppercase tracking-wider text-texto-secundario font-medium">
              {item.label}
            </dt>
            <dd className="text-base text-texto-principal mt-1.5 leading-snug">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Pricing({ preco }: { preco: number | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium">
        Valor
      </p>
      <p className="font-display text-3xl text-texto-principal mt-2">
        {preco !== null ? PRECO_FORMATTER.format(preco) : 'Sob consulta'}
      </p>
      {preco !== null && (
        <p className="text-xs text-texto-secundario mt-1">por pessoa</p>
      )}
    </div>
  )
}
