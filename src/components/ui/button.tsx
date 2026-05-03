'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-acento-mar text-fondo-base hover:bg-acento-mar/90 shadow-sm',
  secondary:
    'bg-fondo-card text-texto-principal border border-texto-secundario/20 hover:border-texto-secundario/40 hover:bg-fondo-card/60',
  ghost:
    'bg-transparent text-texto-principal hover:bg-fondo-card/60',
  destructive:
    'bg-error text-fondo-base hover:bg-error/90 shadow-sm',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-4 py-2 rounded-sm',
  md: 'text-sm px-6 py-3 rounded-md',
  lg: 'text-base px-8 py-3.5 rounded-md',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento-mar focus-visible:ring-offset-2 focus-visible:ring-offset-fondo-base',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
})
