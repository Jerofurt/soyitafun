'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleAtivo } from '../actions'
import { cn } from '@/lib/utils'

type Props = {
  id: string
  ativo: boolean
}

export function AtivoToggle({ id, ativo }: Props) {
  const [optimistic, setOptimistic] = useOptimistic<boolean>(ativo)
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      setOptimistic(!optimistic)
      await toggleAtivo(id)
    })
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={optimistic ? 'Desativar atividade' : 'Ativar atividade'}
      disabled={pending}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full',
        'transition-colors duration-200 ease-out cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento-mar focus-visible:ring-offset-2 focus-visible:ring-offset-fondo-card',
        'disabled:cursor-wait disabled:opacity-60',
        optimistic ? 'bg-success' : 'bg-texto-secundario/25',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-fondo-base shadow-sm',
          'transition-transform duration-200 ease-out',
          optimistic ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
