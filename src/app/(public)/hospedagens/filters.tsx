'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/select'

type Props = {
  zona: string
  capacidade: string
}

export function Filters({ zona, capacidade }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(key: 'zona' | 'capacidade', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const hasFilters = Boolean(zona || capacidade)

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4">
      <span className="text-[11px] uppercase tracking-wider font-medium text-texto-secundario">
        Filtrar
      </span>
      <div className="min-w-[180px]">
        <Select
          value={zona}
          onChange={(e) => update('zona', e.target.value)}
          aria-label="Filtrar por zona"
        >
          <option value="">Todas as zonas</option>
          <option value="vila">Vila</option>
          <option value="condominio">Condomínio</option>
        </Select>
      </div>
      <div className="min-w-[180px]">
        <Select
          value={capacidade}
          onChange={(e) => update('capacidade', e.target.value)}
          aria-label="Filtrar por capacidade"
        >
          <option value="">Qualquer capacidade</option>
          <option value="2">2+ pessoas</option>
          <option value="4">4+ pessoas</option>
          <option value="6">6+ pessoas</option>
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
