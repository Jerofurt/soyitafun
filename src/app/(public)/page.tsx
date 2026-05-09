import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  HospedagemCard,
  type HospedagemCardData,
} from '@/components/public/hospedagem-card'
import {
  AtividadeCard,
  type AtividadeCardData,
} from '@/components/public/atividade-card'
import {
  ComercioCard,
  type ComercioCardData,
} from '@/components/public/comercio-card'
import {
  ServicoCard,
  type ServicoCardData,
} from '@/components/public/servico-card'
import { EmptyStateCTA } from '@/components/public/empty-state-cta'

const CATA_WHATSAPP = '5512991560367'

export const metadata: Metadata = {
  title: 'soy.ita.fan — Portal de Itamambuca',
  description:
    '110 praias, mata atlântica e cachoeiras escondidas no litoral norte de São Paulo. Hospedagens curadas e atividades em Itamambuca, Ubatuba.',
  openGraph: {
    title: 'soy.ita.fan — Portal de Itamambuca',
    description:
      '110 praias, mata atlântica e cachoeiras escondidas no litoral norte de São Paulo. Hospedagens curadas e atividades em Itamambuca, Ubatuba.',
    images: ['/itamambuca-amanhecer.jpeg'],
    type: 'website',
    locale: 'pt_BR',
  },
}

/**
 * Fetch up to `limit` rows for a home destaque section. Hybrid logic:
 * destaque=true first, then top up with the most recent non-destaque
 * actives if the destacados alone don't fill the slots. Empty state CTA
 * fires only when the table has zero ativos at all.
 */
async function fetchHomeRows<T extends { id: string }>(
  table: string,
  columns: string,
  limit = 3,
): Promise<T[]> {
  const supabase = await createClient()

  const { data: destacadosRaw } = await supabase
    .from(table)
    .select(columns)
    .eq('status', 'ativo')
    .eq('destaque', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  const destacados = (destacadosRaw ?? []) as unknown as T[]
  if (destacados.length >= limit) return destacados

  const ids = destacados.map((d) => d.id)
  const remaining = limit - destacados.length

  let q = supabase
    .from(table)
    .select(columns)
    .eq('status', 'ativo')
    .eq('destaque', false)
    .order('created_at', { ascending: false })
    .limit(remaining)

  if (ids.length > 0) {
    q = q.not('id', 'in', `(${ids.join(',')})`)
  }

  const { data: complementoRaw } = await q
  const complemento = (complementoRaw ?? []) as unknown as T[]

  return [...destacados, ...complemento]
}

export default async function HomePage() {
  const [hospedagens, atividades, comercios, servicos] = await Promise.all([
    fetchHomeRows<HospedagemCardData & { id: string }>(
      'hospedagens',
      'id, slug, nome, zona, capacidade, preco_diaria_baixa, fotos',
    ),
    fetchHomeRows<AtividadeCardData & { id: string }>(
      'atividades',
      'id, slug, nome, tipo, duracao_horas, preco, capacidade_max, fotos',
    ),
    fetchHomeRows<ComercioCardData & { id: string }>(
      'comercios',
      'id, slug, nome, categoria, horario, endereco, fotos',
    ),
    fetchHomeRows<ServicoCardData & { id: string }>(
      'servicos',
      'id, slug, nome, tipo, preco_base, fotos',
    ),
  ])

  return (
    <>
      <Hero />

      <Section
        kicker="Onde ficar"
        title="Onde ficar em Itamambuca"
        seeAllLabel="Ver todas as hospedagens"
        seeAllHref="/hospedagens"
        showSeeAll={hospedagens.length > 0}
      >
        {hospedagens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {hospedagens.map((h) => (
              <HospedagemCard key={h.slug} h={h} />
            ))}
          </div>
        ) : (
          <EmptyStateCTA
            title="Sua pousada poderia estar aqui"
            subtitle="Estamos curando os melhores hospedagens de Itamambuca. Fale com Catalina para fazer parte."
            ctaText="Falar com Catalina"
            whatsappNumber={CATA_WHATSAPP}
            whatsappMessage="Olá Catalina! Tenho uma pousada em Itamambuca e gostaria de aparecer no soy.ita.fan!"
          />
        )}
      </Section>

      <Section
        kicker="O que fazer"
        title="Aventuras em Itamambuca"
        seeAllLabel="Ver todas as atividades"
        seeAllHref="/atividades"
        showSeeAll={atividades.length > 0}
      >
        {atividades.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {atividades.map((a) => (
              <AtividadeCard key={a.slug} a={a} />
            ))}
          </div>
        ) : (
          <EmptyStateCTA
            title="Sua atividade poderia estar aqui"
            subtitle="Estamos curando lanchas, surf, cachoeiras e trilhas em Itamambuca. Fale com Catalina para fazer parte."
            ctaText="Falar com Catalina"
            whatsappNumber={CATA_WHATSAPP}
            whatsappMessage="Olá Catalina! Tenho uma atividade em Itamambuca e gostaria de aparecer no soy.ita.fan!"
          />
        )}
      </Section>

      <Section
        kicker="Onde comer e comprar"
        title="Comércios em Itamambuca"
        seeAllLabel="Ver todos os comércios"
        seeAllHref="/comercios"
        showSeeAll={comercios.length > 0}
      >
        {comercios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {comercios.map((c) => (
              <ComercioCard key={c.slug} c={c} />
            ))}
          </div>
        ) : (
          <EmptyStateCTA
            title="Seu comércio poderia estar aqui"
            subtitle="Estamos curando os melhores comércios de Itamambuca. Fale com Catalina para fazer parte."
            ctaText="Falar com Catalina"
            whatsappNumber={CATA_WHATSAPP}
            whatsappMessage="Olá Catalina! Tenho um comércio em Itamambuca e gostaria de aparecer no soy.ita.fan!"
          />
        )}
      </Section>

      <Section
        kicker="Serviços"
        title="Serviços em Itamambuca"
        seeAllLabel="Ver todos os serviços"
        seeAllHref="/servicos"
        showSeeAll={servicos.length > 0}
      >
        {servicos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {servicos.map((s) => (
              <ServicoCard key={s.slug} s={s} />
            ))}
          </div>
        ) : (
          <EmptyStateCTA
            title="Seu serviço poderia estar aqui"
            subtitle="Estamos curando os melhores serviços de Itamambuca. Fale com Catalina para fazer parte."
            ctaText="Falar com Catalina"
            whatsappNumber={CATA_WHATSAPP}
            whatsappMessage="Olá Catalina! Tenho um serviço em Itamambuca e gostaria de aparecer no soy.ita.fan!"
          />
        )}
      </Section>

      <Sobre />
    </>
  )
}

function Hero() {
  return (
    <section
      className="relative w-full flex items-center justify-center -mt-16 pt-16"
      style={{ minHeight: '80vh' }}
    >
      <Image
        src="/itamambuca-amanhecer.jpeg"
        alt="Amanecer en Itamambuca, Ubatuba — mata atlántica e mar"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-texto-principal/55 via-texto-principal/40 to-texto-principal/65"
      />

      <div className="relative max-w-3xl mx-auto px-6 md:px-8 py-24 text-center">
        <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-acento-dourado font-medium">
          Portal de Itamambuca
        </p>
        <h1 className="font-display text-6xl md:text-8xl text-fondo-base mt-6 leading-none">
          soy.ita.fan
        </h1>
        <p className="text-base md:text-lg text-fondo-base/90 mt-8 leading-relaxed max-w-xl mx-auto">
          110 praias, mata atlântica e cachoeiras escondidas no litoral norte de
          São Paulo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-12">
          <Link href="/hospedagens" className="block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto shadow-lg">
              Ver hospedagens
            </Button>
          </Link>
          <Link href="/atividades" className="block w-full sm:w-auto">
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto bg-fondo-base text-acento-mar hover:bg-fondo-card border border-fondo-base shadow-lg"
            >
              O que fazer
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Section({
  kicker,
  title,
  seeAllLabel,
  seeAllHref,
  showSeeAll,
  children,
}: {
  kicker: string
  title: string
  seeAllLabel: string
  seeAllHref: string
  showSeeAll: boolean
  children: React.ReactNode
}) {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-32">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-acento-dourado font-medium">
            {kicker}
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-texto-principal mt-3">
            {title}
          </h2>
        </div>
        {showSeeAll && (
          <Link
            href={seeAllHref}
            className="text-sm text-acento-mar hover:text-acento-mar/70 font-medium transition-colors duration-200 self-start md:self-end"
          >
            {seeAllLabel} →
          </Link>
        )}
      </div>

      {children}
    </section>
  )
}

function Sobre() {
  return (
    <section className="max-w-3xl mx-auto px-6 md:px-8 py-24 md:py-32">
      <p className="text-[11px] uppercase tracking-[0.25em] text-acento-dourado font-medium text-center">
        Sobre Itamambuca
      </p>
      <h2 className="font-display text-3xl md:text-4xl text-texto-principal mt-3 text-center">
        Uma das praias mais preservadas de Ubatuba
      </h2>
      <div className="mt-12 space-y-6 text-base md:text-lg text-texto-principal/90 leading-relaxed">
        <p>
          Itamambuca é uma das praias mais preservadas de Ubatuba. Aqui, a mata
          atlântica encontra o mar — e o que esperamos é que você descubra tudo
          o que essa região tem para oferecer.
        </p>
        <p>
          Andar de bike por trilhas verdes. Caminhar ou correr respirando ar
          puro. Aprender a surfar em águas cristalinas. Descobrir as 110 praias
          que Ubatuba esconde. Explorar rios e cachoeiras. Percorrer trilhas
          que levam a tesouros escondidos.
        </p>
        <p className="text-texto-secundario">
          Tudo isso a poucas horas de São Paulo.
        </p>
      </div>
    </section>
  )
}
