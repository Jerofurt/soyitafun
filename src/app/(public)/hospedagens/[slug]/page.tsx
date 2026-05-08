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

type Hospedagem = {
  id: string
  slug: string
  nome: string
  zona: string
  descricao: string | null
  fotos: string[] | null
  capacidade: number | null
  quartos: number | null
  banheiros: number | null
  comodidades: string[] | null
  preco_diaria_baixa: number | null
  preco_diaria_alta: number | null
  whatsapp: string | null
  email: string | null
  instagram: string | null
  endereco: string | null
  lat: number | null
  lng: number | null
  status: string
}

async function fetchHospedagem(slug: string): Promise<Hospedagem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hospedagens')
    .select(
      'id, slug, nome, zona, descricao, fotos, capacidade, quartos, banheiros, comodidades, preco_diaria_baixa, preco_diaria_alta, whatsapp, email, instagram, endereco, lat, lng, status',
    )
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Hospedagem
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const h = await fetchHospedagem(slug)
  if (!h || h.status !== 'ativo') {
    return { title: 'soyitafun' }
  }
  const title = `${h.nome} em Itamambuca | soyitafun`
  const description = h.descricao
    ? truncate(h.descricao, 155)
    : `${h.nome} em Itamambuca, Ubatuba. Hospedagem curada por soyitafun.`
  const image = h.fotos?.[0] ? buildPhotoUrl(h.fotos[0]) : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: 'website',
      locale: 'pt_BR',
      url: `${SITE_URL}/hospedagens/${h.slug}`,
    },
  }
}

export default async function HospedagemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const h = await fetchHospedagem(slug)
  if (!h) notFound()
  if (h.status !== 'ativo') notFound()

  const fotos = h.fotos ?? []
  const comodidades = h.comodidades ?? []
  const whatsappMessage = `Olá! Vi sua hospedagem ${h.nome} no soyitafun e gostaria de mais informações.`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: h.nome,
    image: fotos.map(buildPhotoUrl),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Itamambuca, Ubatuba',
      addressRegion: 'SP',
      addressCountry: 'BR',
      streetAddress: h.endereco ?? undefined,
    },
    geo:
      h.lat !== null && h.lng !== null
        ? {
            '@type': 'GeoCoordinates',
            latitude: h.lat,
            longitude: h.lng,
          }
        : undefined,
    telephone: h.whatsapp ?? undefined,
    url: `${SITE_URL}/hospedagens/${h.slug}`,
  }

  return (
    <article className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PhotoGallery photos={fotos.map(buildPhotoUrl)} alt={h.nome} />

      <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-8 space-y-12">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="info">{ZONA_LABELS[h.zona] ?? h.zona}</Badge>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-texto-principal leading-tight">
              {h.nome}
            </h1>
            {h.endereco && (
              <p className="text-sm text-texto-secundario">{h.endereco}</p>
            )}
          </header>

          {h.descricao && (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
                Sobre a hospedagem
              </h2>
              <p className="text-base text-texto-principal/90 leading-relaxed whitespace-pre-line">
                {h.descricao}
              </p>
            </section>
          )}

          <Specs h={h} />

          {comodidades.length > 0 && (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
                Comodidades
              </h2>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                {comodidades.map((c) => (
                  <li
                    key={c}
                    className="flex items-center gap-2 text-sm text-texto-principal"
                  >
                    <Check />
                    <span className="capitalize">{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {h.lat !== null && h.lng !== null && (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
                Localização
              </h2>
              <div className="aspect-[16/9] rounded-md overflow-hidden border border-texto-secundario/15">
                <iframe
                  title={`Mapa de ${h.nome}`}
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${h.lat},${h.lng}&output=embed`}
                  className="w-full h-full"
                />
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 bg-fondo-card border border-texto-secundario/10 rounded-md shadow-sm p-8 space-y-6">
            <Pricing
              baixa={h.preco_diaria_baixa}
              alta={h.preco_diaria_alta}
            />
            <div className="border-t border-texto-secundario/10 pt-6">
              <ContactButtons
                whatsapp={h.whatsapp}
                instagram={h.instagram}
                email={h.email}
                whatsappMessage={whatsappMessage}
              />
            </div>
            {!h.whatsapp && !h.instagram && !h.email && (
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

function Specs({ h }: { h: Hospedagem }) {
  const items = [
    h.capacidade !== null && {
      label: 'Capacidade',
      value: `até ${h.capacidade} ${h.capacidade === 1 ? 'pessoa' : 'pessoas'}`,
    },
    h.quartos !== null && {
      label: 'Quartos',
      value: `${h.quartos}`,
    },
    h.banheiros !== null && {
      label: 'Banheiros',
      value: `${h.banheiros}`,
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>

  if (items.length === 0) return null

  return (
    <section>
      <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
        Detalhes
      </h2>
      <dl className="grid grid-cols-3 gap-4 max-w-md">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] uppercase tracking-wider text-texto-secundario font-medium">
              {item.label}
            </dt>
            <dd className="text-base text-texto-principal mt-1.5">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Pricing({
  baixa,
  alta,
}: {
  baixa: number | null
  alta: number | null
}) {
  if (baixa === null && alta === null) {
    return (
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium">
          Diária
        </p>
        <p className="text-2xl font-display text-texto-principal mt-2">
          Sob consulta
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium">
        Diária
      </p>
      {baixa !== null && (
        <p className="mt-2">
          <span className="text-xs text-texto-secundario uppercase tracking-wider mr-2">
            Baixa
          </span>
          <span className="font-display text-2xl text-texto-principal">
            {PRECO_FORMATTER.format(baixa)}
          </span>
        </p>
      )}
      {alta !== null && (
        <p className="mt-1">
          <span className="text-xs text-texto-secundario uppercase tracking-wider mr-2">
            Alta
          </span>
          <span className="font-display text-2xl text-texto-principal">
            {PRECO_FORMATTER.format(alta)}
          </span>
        </p>
      )}
    </div>
  )
}

function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="text-acento-mar shrink-0"
    >
      <path
        d="M2 7.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
