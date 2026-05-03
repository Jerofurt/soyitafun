'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
    <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg shadow p-4">
      <span className="text-sm font-medium text-stone-700">Filtrar:</span>

      <select
        value={zona}
        onChange={(e) => update('zona', e.target.value)}
        className="text-sm border border-stone-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">Todas as zonas</option>
        <option value="vila">Vila</option>
        <option value="condominio">Condomínio</option>
      </select>

      <select
        value={status}
        onChange={(e) => update('status', e.target.value)}
        className="text-sm border border-stone-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="pausado">Pausado</option>
        <option value="pendente">Pendente</option>
        <option value="vencido">Vencido</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-stone-600 hover:text-stone-900 underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
