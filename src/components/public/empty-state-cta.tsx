import { Button } from '@/components/ui/button'
import { buildWhatsAppUrl } from '@/components/public/contact-buttons'

type Props = {
  title: string
  subtitle: string
  ctaText: string
  whatsappNumber: string
  whatsappMessage: string
}

export function EmptyStateCTA({
  title,
  subtitle,
  ctaText,
  whatsappNumber,
  whatsappMessage,
}: Props) {
  return (
    <div className="bg-fondo-card border border-texto-secundario/15 rounded-md px-8 md:px-12 py-16 md:py-20 text-center max-w-2xl mx-auto">
      <h2 className="font-display text-2xl md:text-3xl text-texto-principal leading-tight">
        {title}
      </h2>
      <p className="text-base text-texto-secundario mt-4 leading-relaxed max-w-md mx-auto">
        {subtitle}
      </p>
      <div className="mt-8">
        <a
          href={buildWhatsAppUrl(whatsappNumber, whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg">{ctaText}</Button>
        </a>
      </div>
    </div>
  )
}
