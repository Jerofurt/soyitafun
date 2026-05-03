'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full bg-fondo-base border border-texto-secundario/20 rounded-sm',
        'px-4 py-2.5 text-sm text-texto-principal',
        'placeholder:text-texto-secundario/50',
        'transition-colors duration-200',
        'focus:outline-none focus:border-acento-mar focus:ring-1 focus:ring-acento-mar',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
})
