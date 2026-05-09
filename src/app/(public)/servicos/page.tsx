import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  ServicoCard,
  type ServicoCardData,
} from '@/components/public/servico-card'
import { EmptyStateCTA } from '@/components/public/empty-state-cta'
import { Filters } from './filters'

const CATA_WHATSAPP = '5512991560367'

export const metadata: Metadata = {
  title: 'Serviços em Itamambuca — soy.ita.fan',
  description:
    'Transfer, chef, massagista, limpeza e aluguel de carro em Itamambuca, Ubatuba.',
  openGraph: {
    title: 'Serviços em Itamambuca — soy.ita.fan',
    description:
      'Transfer, chef, massagista, limpeza e aluguel de carro em Itamambuca, Ubatuba.',
    type: 'website',
    locale: 'pt_BR',
  },
}

const VALID_TIPOS = new Set([
  'transfer',
  'chef',
  'massagista',
  'limpeza',
  'aluguel_carro',
  'outro',
])

export default async function ServicosListPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const params = await searchParams
  const tipo = params.tipo ?? ''

  const supabase = await createClient()
  let query = supabase
    .from('servicos')
    .select('slug, nome, tipo, preco_base, fotos')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })

  if (tipo && VALID_TIPOS.has(tipo)) {
    query = query.eq('tipo', tipo)
  }

  const { data } = await query
  const rows = (data ?? []) as ServicoCardData[]
  const hasFilters = Boolean(tipo)

  return (
    <>
      <Hero />

      <section className="max-w-6xl mx-auto px-6 md:px-8 pb-24 md:pb-32 -mt-6 md:-mt-8 space-y-10">
        <Filters tipo={tipo} />

        {rows.length === 0 ? (
          hasFilters ? (
            <Empty />
          ) : (
            <EmptyStateCTA
              title="Seu serviço poderia estar aqui"
              subtitle="Estamos curando os melhores serviços de Itamambuca. Fale com Catalina para fazer parte."
              ctaText="Falar com Catalina"
              whatsappNumber={CATA_WHATSAPP}
              whatsappMessage="Olá Catalina! Tenho um serviço em Itamambuca e gostaria de aparecer no soy.ita.fan!"
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {rows.map((s) => (
              <ServicoCard key={s.slug} s={s} />
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
          Serviços
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-texto-principal mt-3">
          Serviços em Itamambuca
        </h1>
        <p className="text-base md:text-lg text-texto-secundario mt-5 max-w-2xl leading-relaxed">
          Transfer, chef em casa, massagem, limpeza, aluguel de carro — quem
          atende em Itamambuca, com contato direto.
        </p>
      </div>
    </section>
  )
}

function Empty() {
  return (
    <div className="bg-fondo-card border border-texto-secundario/10 rounded-md px-8 py-16 text-center">
      <h2 className="font-display text-2xl text-texto-principal">
        Nenhum serviço encontrado
      </h2>
      <p className="text-sm text-texto-secundario mt-3 max-w-md mx-auto leading-relaxed">
        Tente ajustar os filtros para ver mais resultados.
      </p>
    </div>
  )
}
