'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

type Props = {
  zona: string
  status: string
}

export function Filters({ zona, status }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(key: 'zona' | 'status', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const hasFilters = Boolean(zona || status)

  return (
    <Card>
      <div className="px-6 py-4 flex flex-wrap items-center gap-4">
        <span className="text-[11px] uppercase tracking-wider font-medium text-texto-secundario">
          Filtrar
        </span>

        <div className="min-w-[200px]">
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

        <div className="min-w-[200px]">
          <Select
            value={status}
            onChange={(e) => update('status', e.target.value)}
            aria-label="Filtrar por status"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="pausado">Pausado</option>
            <option value="pendente">Pendente</option>
            <option value="vencido">Vencido</option>
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
    </Card>
  )
}
