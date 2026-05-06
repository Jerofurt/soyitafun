import { createClient } from '@/lib/supabase/server'
import {
  AtividadeCard,
  type AtividadeCardData,
} from '@/components/public/atividade-card'
import { Filters } from './filters'

const VALID_TIPOS = new Set([
  'lancha',
  'cachoeira',
  'surf',
  'caminhada',
  'outro',
])

export default async function AtividadesListPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const params = await searchParams
  const tipo = params.tipo ?? ''

  const supabase = await createClient()
  let query = supabase
    .from('atividades')
    .select(
      'slug, nome, tipo, duracao_horas, preco, capacidade_max, fotos',
    )
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })

  if (tipo && VALID_TIPOS.has(tipo)) {
    query = query.eq('tipo', tipo)
  }

  const { data } = await query
  const rows = (data ?? []) as AtividadeCardData[]

  return (
    <>
      <Hero />

      <section className="max-w-6xl mx-auto px-6 md:px-8 pb-24 md:pb-32 -mt-6 md:-mt-8 space-y-10">
        <Filters tipo={tipo} />

        {rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {rows.map((a) => (
              <AtividadeCard key={a.slug} a={a} />
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
          O que fazer
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-texto-principal mt-3">
          Aventuras em Itamambuca
        </h1>
        <p className="text-base md:text-lg text-texto-secundario mt-5 max-w-2xl leading-relaxed">
          Lancha, surf, cachoeiras, trilhas — tudo o que essa região tem para
          oferecer, com operadores locais.
        </p>
      </div>
    </section>
  )
}

function Empty() {
  return (
    <div className="bg-fondo-card border border-texto-secundario/10 rounded-md px-8 py-16 text-center">
      <h2 className="font-display text-2xl text-texto-principal">
        Nenhuma atividade encontrada
      </h2>
      <p className="text-sm text-texto-secundario mt-3 max-w-md mx-auto leading-relaxed">
        Tente ajustar os filtros para ver mais resultados.
      </p>
    </div>
  )
}
