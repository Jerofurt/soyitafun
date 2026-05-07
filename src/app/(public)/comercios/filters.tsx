'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/select'

type Props = {
  categoria: string
}

export function Filters({ categoria }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('categoria', value)
    } else {
      params.delete('categoria')
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const hasFilters = Boolean(categoria)

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4">
      <span className="text-[11px] uppercase tracking-wider font-medium text-texto-secundario">
        Filtrar
      </span>
      <div className="min-w-[200px]">
        <Select
          value={categoria}
          onChange={(e) => update(e.target.value)}
          aria-label="Filtrar por categoria"
        >
          <option value="">Todas as categorias</option>
          <option value="restaurante">Restaurante</option>
          <option value="padaria">Padaria</option>
          <option value="loja">Loja</option>
          <option value="mercado">Mercado</option>
          <option value="farmacia">Farmácia</option>
          <option value="outro">Outro</option>
        </Select>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="text-[11px] uppercase tracking-wider text-texto-secundario hover:text-texto-principal transition-colors duration-200"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
