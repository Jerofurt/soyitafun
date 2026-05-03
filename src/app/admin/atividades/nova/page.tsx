import Link from 'next/link'
import { AtividadeForm } from '../_components/atividade-form'

export default function NovaAtividadePage() {
  return (
    <main className="min-h-screen bg-fondo-base">
      <header className="bg-fondo-card border-b border-texto-secundario/10">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <Link
            href="/admin/atividades"
            className="text-[11px] uppercase tracking-wider text-texto-secundario hover:text-texto-principal transition-colors duration-200"
          >
            ← Atividades
          </Link>
          <h1 className="text-2xl text-texto-principal mt-2">Nova atividade</h1>
          <p className="text-sm text-texto-secundario mt-1">
            Cadastre uma nova atividade — passeio, trilha, aula ou o que for.
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-12">
        <AtividadeForm mode="create" />
      </div>
    </main>
  )
}
