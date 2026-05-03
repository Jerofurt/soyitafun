'use client'

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%235C6677' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full bg-fondo-base border border-texto-secundario/20 rounded-sm',
        'px-4 py-2.5 pr-10 text-sm text-texto-principal cursor-pointer',
        'transition-colors duration-200',
        'focus:outline-none focus:border-acento-mar focus:ring-1 focus:ring-acento-mar',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'appearance-none bg-no-repeat [background-position:right_0.875rem_center]',
        className,
      )}
      style={{ backgroundImage: chevron }}
      {...props}
    >
      {children}
    </select>
  )
})
