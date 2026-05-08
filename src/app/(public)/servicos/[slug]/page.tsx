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

type Servico = {
  id: string
  slug: string
  nome: string
  tipo: string
  descricao: string | null
  fotos: string[] | null
  preco_base: number | null
  whatsapp: string | null
  instagram: string | null
  status: string
}

async function fetchServico(slug: string): Promise<Servico | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('servicos')
    .select(
      'id, slug, nome, tipo, descricao, fotos, preco_base, whatsapp, instagram, status',
    )
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Servico
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const s = await fetchServico(slug)
  if (!s || s.status !== 'ativo') {
    return { title: 'soyitafun' }
  }
  const title = `${s.nome} | soyitafun`
  const description = s.descricao
    ? truncate(s.descricao, 155)
    : `${s.nome} em Itamambuca, Ubatuba. Serviço curado por soyitafun.`
  const image = s.fotos?.[0] ? buildPhotoUrl(s.fotos[0]) : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: 'website',
      locale: 'pt_BR',
      url: `${SITE_URL}/servicos/${s.slug}`,
    },
  }
}

export default async function ServicoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const s = await fetchServico(slug)
  if (!s) notFound()
  if (s.status !== 'ativo') notFound()

  const fotos = s.fotos ?? []
  const whatsappMessage = `Olá! Vi seu serviço ${s.nome} no soyitafun e gostaria de mais informações.`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.nome,
    image: fotos.map(buildPhotoUrl),
    description: s.descricao ?? undefined,
    areaServed: {
      '@type': 'Place',
      name: 'Itamambuca, Ubatuba',
    },
    provider: {
      '@type': 'LocalBusiness',
      name: s.nome,
      telephone: s.whatsapp ?? undefined,
    },
    offers:
      s.preco_base !== null
        ? {
            '@type': 'Offer',
            price: s.preco_base,
            priceCurrency: 'BRL',
          }
        : undefined,
    url: `${SITE_URL}/servicos/${s.slug}`,
  }

  return (
    <article className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PhotoGallery photos={fotos.map(buildPhotoUrl)} alt={s.nome} />

      <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-8 space-y-12">
          <header className="space-y-4">
            <Badge variant="info">{TIPO_LABELS[s.tipo] ?? s.tipo}</Badge>
            <h1 className="font-display text-4xl md:text-5xl text-texto-principal leading-tight">
              {s.nome}
            </h1>
          </header>

          {s.descricao && (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium mb-4">
                Sobre o serviço
              </h2>
              <p className="text-base text-texto-principal/90 leading-relaxed whitespace-pre-line">
                {s.descricao}
              </p>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 bg-fondo-card border border-texto-secundario/10 rounded-md shadow-sm p-8 space-y-6">
            <Pricing preco={s.preco_base} />
            <div className="border-t border-texto-secundario/10 pt-6">
              <ContactButtons
                whatsapp={s.whatsapp}
                instagram={s.instagram}
                whatsappMessage={whatsappMessage}
              />
            </div>
            {!s.whatsapp && !s.instagram && (
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

function Pricing({ preco }: { preco: number | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-texto-secundario font-medium">
        Preço base
      </p>
      <p className="font-display text-3xl text-texto-principal mt-2">
        {preco !== null ? PRECO_FORMATTER.format(preco) : 'Sob consulta'}
      </p>
      {preco !== null && (
        <p className="text-xs text-texto-secundario mt-1">a partir de</p>
      )}
    </div>
  )
}
