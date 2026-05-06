import { Button } from '@/components/ui/button'

/**
 * Strip everything that isn't a digit. Operadores pasteam o WhatsApp em
 * formatos diferentes ("+55 12 99156 0367", "(12) 99156-0367", "5512991560367")
 * — wa.me só aceita dígitos, então normalizamos antes de montar a URL.
 */
function digitsOnly(input: string): string {
  return input.replace(/\D/g, '')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const num = digitsOnly(phone)
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

export function buildInstagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`
}

type Props = {
  whatsapp: string | null
  instagram: string | null
  email?: string | null
  whatsappMessage: string
}

export function ContactButtons({
  whatsapp,
  instagram,
  email,
  whatsappMessage,
}: Props) {
  return (
    <div className="space-y-3">
      {whatsapp && (
        <a
          href={buildWhatsAppUrl(whatsapp, whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button size="lg" className="w-full">
            Falar pelo WhatsApp
          </Button>
        </a>
      )}
      {instagram && (
        <a
          href={buildInstagramUrl(instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button size="lg" variant="secondary" className="w-full">
            Ver no Instagram
          </Button>
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="block">
          <Button size="lg" variant="ghost" className="w-full">
            Enviar e-mail
          </Button>
        </a>
      )}
    </div>
  )
}
