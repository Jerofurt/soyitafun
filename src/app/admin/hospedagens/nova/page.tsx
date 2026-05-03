import Link from 'next/link'
import { HospedagemForm } from '../_components/hospedagem-form'

export default function NovaHospedagemPage() {
  return (
    <main className="min-h-screen bg-fondo-base">
      <header className="bg-fondo-card border-b border-texto-secundario/10">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <Link
            href="/admin/hospedagens"
            className="text-[11px] uppercase tracking-wider text-texto-secundario hover:text-texto-principal transition-colors duration-200"
          >
            ← Hospedagens
          </Link>
          <h1 className="text-2xl text-texto-principal mt-2">
            Nova hospedagem
          </h1>
          <p className="text-sm text-texto-secundario mt-1">
            Cadastre uma nova hospedagem no portal de Itamambuca.
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-12">
        <HospedagemForm mode="create" />
      </div>
    </main>
  )
}
