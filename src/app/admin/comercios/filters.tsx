'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

type Props = {
  categoria: string
  status: string
}

export function Filters({ categoria, status }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(key: 'categoria' | 'status', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const hasFilters = Boolean(categoria || status)

  return (
    <Card>
      <div className="px-6 py-4 flex flex-wrap items-center gap-4">
        <span className="text-[11px] uppercase tracking-wider font-medium text-texto-secundario">
          Filtrar
        </span>

        <div className="min-w-[200px]">
          <Select
            value={categoria}
            onChange={(e) => update('categoria', e.target.value)}
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
