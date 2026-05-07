'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/select'

type Props = {
  tipo: string
}

export function Filters({ tipo }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('tipo', value)
    } else {
      params.delete('tipo')
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const hasFilters = Boolean(tipo)

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4">
      <span className="text-[11px] uppercase tracking-wider font-medium text-texto-secundario">
        Filtrar
      </span>
      <div className="min-w-[200px]">
        <Select
          value={tipo}
          onChange={(e) => update(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos os tipos</option>
          <option value="transfer">Transfer</option>
          <option value="chef">Chef</option>
          <option value="massagista">Massagista</option>
          <option value="limpeza">Limpeza</option>
          <option value="aluguel_carro">Aluguel de carro</option>
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
