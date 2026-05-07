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

type Comercio = {
  id: string
  slug: string
  nome: string
  categoria: string
  descricao: string | null
  fotos: string[] | null
  horario: string | null
  endereco: string | null
  lat: number | null
  lng: number | null
  whatsapp: string | null
  instagram: string | null
  status: string
}

async function fetchComercio(slug: string): Promise<Comercio | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comercios')
    .select(
      'id, slug, nome, categoria, descricao, fotos, horario, endereco, lat, lng, whatsapp, instagram, status',
    )
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Comercio
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const c = await fetchComercio(slug)
  if (!c || c.status !== 'ativo') {
    return { title: 'soyitafun' }
  }
  const title = `${c.nome} em Itamambuca | soyitafun`
  const description = c.descricao
    ? truncate(c.descricao, 155)
    : `${c.nome} em Itamambuca, Ubatuba. Comércio curado por soyitafun.`
  const image = c.fotos?.[0] ? buildPhotoUrl(c.fotos[0]) : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: 'website',
      locale: 'pt_BR',
      url: `${SITE_URL}/comercios/${c.slug}`,
    },
  }
}

export default async function ComercioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const c = await fetchComercio(slug)
  if (!c) notFound()
  if (c.status !== 'ativo') notFound()

  const fotos = c.fotos ?? []
  const whatsappMessage = `Olá! Vi seu comércio ${c.nome} no soyitafun e gostaria de mais informações.`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: c.nome,
    image: fotos.map(buildPhotoUrl),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Itamambuca, Ubatuba',
      addressRegion: 'SP',
      addressCountry: 'BR',
      streetAddress: c.endereco ?? undefined,
    },
    geo:
      c.lat !== null && c.lng !== null
        ? {
            '@type': 'GeoCoordinates',
            latitude: c.lat,
            longitude: c.lng,
          }
        : undefined,
    telephone: c.whatsapp ?? undefined,
    url: `${SITE_URL}/comercios/${c.slug}`,
  }

  return (
    <article className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PhotoGallery photos={fotos} alt={c.nome} buildUrl={buildPhotoUrl} />

      <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-8 space-y-12">
          <header className="space-y-4">
            <Badge variant="info">
              {CATEGORIA_LABELS[c.categoria] ?? c.categoria}
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl text-texto-principal leading-tight">
              {c.nome}
            </h1>
            {c.endereco && (
              <p className="text-sm text-texto-secundario">{c.endereco}</p>
            )}
          </header>

          {c.descricao && (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
                Sobre o comércio
              </h2>
              <p className="text-base text-texto-principal/90 leading-relaxed whitespace-pre-line">
                {c.descricao}
              </p>
            </section>
          )}

          {c.horario && (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
                Horário
              </h2>
              <p className="text-base text-texto-principal/90 leading-relaxed whitespace-pre-line">
                {c.horario}
              </p>
            </section>
          )}

          {c.lat !== null && c.lng !== null && (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
                Localização
              </h2>
              <div className="aspect-[16/9] rounded-md overflow-hidden border border-texto-secundario/15">
                <iframe
                  title={`Mapa de ${c.nome}`}
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${c.lat},${c.lng}&output=embed`}
                  className="w-full h-full"
                />
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 bg-fondo-card border border-texto-secundario/10 rounded-md shadow-sm p-8 space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium">
                Categoria
              </p>
              <p className="font-display text-2xl text-texto-principal mt-2">
                {CATEGORIA_LABELS[c.categoria] ?? c.categoria}
              </p>
            </div>
            <div className="border-t border-texto-secundario/10 pt-6">
              <ContactButtons
                whatsapp={c.whatsapp}
                instagram={c.instagram}
                whatsappMessage={whatsappMessage}
              />
            </div>
            {!c.whatsapp && !c.instagram && (
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
