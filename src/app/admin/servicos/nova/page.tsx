import Link from 'next/link'
import { ServicoForm } from '../_components/servico-form'

export default function NovoServicoPage() {
  return (
    <main className="min-h-screen bg-fondo-base">
      <header className="bg-fondo-card border-b border-texto-secundario/10">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <Link
            href="/admin/servicos"
            className="text-[11px] uppercase tracking-wider text-texto-secundario hover:text-texto-principal transition-colors duration-200"
          >
            ← Serviços
          </Link>
          <h1 className="text-2xl text-texto-principal mt-2">Novo serviço</h1>
          <p className="text-sm text-texto-secundario mt-1">
            Cadastre um novo serviço — transfer, chef, massagem, limpeza ou
            outro.
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-12">
        <ServicoForm mode="create" />
      </div>
    </main>
  )
}
