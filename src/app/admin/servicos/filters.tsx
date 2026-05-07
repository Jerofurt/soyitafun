'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

type Props = {
  tipo: string
  status: string
}

export function Filters({ tipo, status }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(key: 'tipo' | 'status', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const hasFilters = Boolean(tipo || status)

  return (
    <Card>
      <div className="px-6 py-4 flex flex-wrap items-center gap-4">
        <span className="text-[11px] uppercase tracking-wider font-medium text-texto-secundario">
          Filtrar
        </span>

        <div className="min-w-[200px]">
          <Select
            value={tipo}
            onChange={(e) => update('tipo', e.target.value)}
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
