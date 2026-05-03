import { cn } from '@/lib/utils'

type Variant = 'success' | 'warning' | 'error' | 'neutral' | 'info'

const variantClasses: Record<Variant, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning:
    'bg-acento-dourado/15 text-acento-dourado border-acento-dourado/30',
  error: 'bg-error/10 text-error border-error/25',
  neutral:
    'bg-texto-secundario/10 text-texto-secundario border-texto-secundario/20',
  info: 'bg-acento-mar/10 text-acento-mar border-acento-mar/20',
}

export function Badge({
  variant = 'neutral',
  className,
  children,
}: {
  variant?: Variant
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider rounded-sm border',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
