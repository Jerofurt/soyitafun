import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-32 border-t border-texto-secundario/15 bg-fondo-card/40">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div>
            <Link href="/" className="font-display text-2xl text-texto-principal">
              soyitafun
            </Link>
            <p className="text-sm text-texto-secundario mt-4 leading-relaxed max-w-xs">
              Curadoria de Catalina Furtado em Itamambuca.
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-texto-secundario/80 font-medium mb-5">
              Explorar
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/hospedagens"
                  className="text-sm text-texto-principal hover:text-acento-mar transition-colors duration-200"
                >
                  Hospedagens
                </Link>
              </li>
              <li>
                <Link
                  href="/atividades"
                  className="text-sm text-texto-principal hover:text-acento-mar transition-colors duration-200"
                >
                  Atividades
                </Link>
              </li>
              <li>
                <Link
                  href="/comercios"
                  className="text-sm text-texto-principal hover:text-acento-mar transition-colors duration-200"
                >
                  Comércios
                </Link>
              </li>
              <li>
                <Link
                  href="/servicos"
                  className="text-sm text-texto-principal hover:text-acento-mar transition-colors duration-200"
                >
                  Serviços
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-texto-secundario/80 font-medium mb-5">
              Contato
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/5512991560367"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-texto-principal hover:text-acento-mar transition-colors duration-200"
                >
                  WhatsApp +55 12 99156 0367
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/soy.ita.fan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-texto-principal hover:text-acento-mar transition-colors duration-200"
                >
                  Instagram @soy.ita.fan
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-texto-secundario/10">
          <p className="text-xs text-texto-secundario">
            © 2026 soyitafun. Curadoria local em Itamambuca, SP.
          </p>
        </div>
      </div>
    </footer>
  )
}
