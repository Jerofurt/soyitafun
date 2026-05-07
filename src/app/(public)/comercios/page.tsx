import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  ComercioCard,
  type ComercioCardData,
} from '@/components/public/comercio-card'
import { EmptyStateCTA } from '@/components/public/empty-state-cta'
import { Filters } from './filters'

const CATA_WHATSAPP = '5512991560367'

export const metadata: Metadata = {
  title: 'Onde comer e comprar em Itamambuca | soyitafun',
  description:
    'Restaurantes, padarias, mercados e lojas curados em Itamambuca, Ubatuba.',
  openGraph: {
    title: 'Onde comer e comprar em Itamambuca | soyitafun',
    description:
      'Restaurantes, padarias, mercados e lojas curados em Itamambuca, Ubatuba.',
    type: 'website',
    locale: 'pt_BR',
  },
}

const VALID_CATEGORIAS = new Set([
  'restaurante',
  'padaria',
  'loja',
  'mercado',
  'farmacia',
  'outro',
])

export default async function ComerciosListPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const params = await searchParams
  const categoria = params.categoria ?? ''

  const supabase = await createClient()
  let query = supabase
    .from('comercios')
    .select('slug, nome, categoria, horario, endereco, fotos')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })

  if (categoria && VALID_CATEGORIAS.has(categoria)) {
    query = query.eq('categoria', categoria)
  }

  const { data } = await query
  const rows = (data ?? []) as ComercioCardData[]
  const hasFilters = Boolean(categoria)

  return (
    <>
      <Hero />

      <section className="max-w-6xl mx-auto px-6 md:px-8 pb-24 md:pb-32 -mt-6 md:-mt-8 space-y-10">
        <Filters categoria={categoria} />

        {rows.length === 0 ? (
          hasFilters ? (
            <Empty />
          ) : (
            <EmptyStateCTA
              title="Seu comércio poderia estar aqui"
              subtitle="Estamos curando os melhores comércios de Itamambuca. Fale com Catalina para fazer parte."
              ctaText="Falar com Catalina"
              whatsappNumber={CATA_WHATSAPP}
              whatsappMessage="Olá Catalina! Tenho um comércio em Itamambuca e gostaria de aparecer no soyitafun."
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {rows.map((c) => (
              <ComercioCard key={c.slug} c={c} />
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
          Onde comer e comprar
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-texto-principal mt-3">
          Comércios em Itamambuca
        </h1>
        <p className="text-base md:text-lg text-texto-secundario mt-5 max-w-2xl leading-relaxed">
          Restaurantes, padarias, mercados, lojas e farmácias — o dia a dia de
          Itamambuca, com endereço e horário.
        </p>
      </div>
    </section>
  )
}

function Empty() {
  return (
    <div className="bg-fondo-card border border-texto-secundario/10 rounded-md px-8 py-16 text-center">
      <h2 className="font-display text-2xl text-texto-principal">
        Nenhum comércio encontrado
      </h2>
      <p className="text-sm text-texto-secundario mt-3 max-w-md mx-auto leading-relaxed">
        Tente ajustar os filtros para ver mais resultados.
      </p>
    </div>
  )
}
