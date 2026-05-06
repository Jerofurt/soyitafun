import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  HospedagemCard,
  type HospedagemCardData,
} from '@/components/public/hospedagem-card'
import { EmptyStateCTA } from '@/components/public/empty-state-cta'
import { Filters } from './filters'

const CATA_WHATSAPP = '5512991560367'

export const metadata: Metadata = {
  title: 'Hospedagens em Itamambuca | soyitafun',
  description:
    'Pousadas, casas e hospedagens curadas em Itamambuca, uma das praias mais preservadas de Ubatuba.',
  openGraph: {
    title: 'Hospedagens em Itamambuca | soyitafun',
    description:
      'Pousadas, casas e hospedagens curadas em Itamambuca, uma das praias mais preservadas de Ubatuba.',
    type: 'website',
    locale: 'pt_BR',
  },
}

const VALID_ZONAS = new Set(['vila', 'condominio'])

export default async function HospedagensListPage({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string; capacidade?: string }>
}) {
  const params = await searchParams
  const zona = params.zona ?? ''
  const capacidade = params.capacidade ?? ''
  const minCapacidade = Number(capacidade)
  const hasCapacidadeFilter = Number.isFinite(minCapacidade) && minCapacidade > 0

  const supabase = await createClient()
  let query = supabase
    .from('hospedagens')
    .select(
      'slug, nome, zona, capacidade, preco_diaria_baixa, fotos',
    )
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })

  if (zona && VALID_ZONAS.has(zona)) {
    query = query.eq('zona', zona)
  }
  if (hasCapacidadeFilter) {
    query = query.gte('capacidade', minCapacidade)
  }

  const { data } = await query
  const rows = (data ?? []) as HospedagemCardData[]
  const hasFilters = Boolean(zona || hasCapacidadeFilter)

  return (
    <>
      <Hero />

      <section className="max-w-6xl mx-auto px-6 md:px-8 pb-24 md:pb-32 -mt-6 md:-mt-8 space-y-10">
        <Filters zona={zona} capacidade={capacidade} />

        {rows.length === 0 ? (
          hasFilters ? (
            <Empty />
          ) : (
            <EmptyStateCTA
              title="Sua pousada poderia estar aqui"
              subtitle="Estamos curando os melhores hospedagens de Itamambuca. Fale com Catalina para fazer parte."
              ctaText="Falar com Catalina"
              whatsappNumber={CATA_WHATSAPP}
              whatsappMessage="Olá Catalina! Tenho uma pousada em Itamambuca e gostaria de aparecer no soyitafun."
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {rows.map((h) => (
              <HospedagemCard key={h.slug} h={h} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function Hero() {
  return (
    <section className="bg-fondo-card/40 border-b border-texto-secundario/10">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.25em] text-acento-dourado font-medium">
          Onde ficar
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-texto-principal mt-3">
          Hospedagens em Itamambuca
        </h1>
        <p className="text-base md:text-lg text-texto-secundario mt-5 max-w-2xl leading-relaxed">
          Pousadas, casas e refúgios curados em uma das praias mais preservadas
          do litoral norte de São Paulo.
        </p>
      </div>
    </section>
  )
}

function Empty() {
  return (
    <div className="bg-fondo-card border border-texto-secundario/10 rounded-md px-8 py-16 text-center">
      <h2 className="font-display text-2xl text-texto-principal">
        Nenhuma hospedagem encontrada
      </h2>
      <p className="text-sm text-texto-secundario mt-3 max-w-md mx-auto leading-relaxed">
        Tente ajustar os filtros para ver mais resultados.
      </p>
    </div>
  )
}
