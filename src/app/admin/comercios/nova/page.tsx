import Link from 'next/link'
import { ComercioForm } from '../_components/comercio-form'

export default function NovoComercioPage() {
  return (
    <main className="min-h-screen bg-fondo-base">
      <header className="bg-fondo-card border-b border-texto-secundario/10">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <Link
            href="/admin/comercios"
            className="text-[11px] uppercase tracking-wider text-texto-secundario hover:text-texto-principal transition-colors duration-200"
          >
            ← Comércios
          </Link>
          <h1 className="text-2xl text-texto-principal mt-2">Novo comércio</h1>
          <p className="text-sm text-texto-secundario mt-1">
            Cadastre um novo comércio — restaurante, padaria, loja ou serviço
            local.
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-12">
        <ComercioForm mode="create" />
      </div>
    </main>
  )
}
