import { createClient } from '@/lib/supabase/server'
import { logout } from './login/actions'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, email, role')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900">soyitafun</h1>
            <p className="text-xs text-stone-500">Painel de administração</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-stone-900">
                {profile?.email}
              </p>
              <p className="text-xs text-stone-500 capitalize">
                {profile?.role?.replace('_', ' ')}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-stone-600 hover:text-stone-900 px-3 py-1 border border-stone-300 rounded-md hover:bg-stone-100 transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Bem-vindo, {profile?.nome || profile?.email}
          </h2>
          <p className="text-stone-600 mb-8">
            Painel em construção. Os módulos de hospedagens, atividades, comércios e serviços
            serão habilitados em breve.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DashboardCard title="Hospedagens" count={0} />
            <DashboardCard title="Atividades" count={0} />
            <DashboardCard title="Comércios" count={0} />
            <DashboardCard title="Serviços" count={0} />
          </div>
        </div>
      </div>
    </main>
  )
}

function DashboardCard({ title, count }: { title: string; count: number }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
      <p className="text-sm text-stone-600">{title}</p>
      <p className="text-2xl font-bold text-stone-900 mt-1">{count}</p>
    </div>
  )
}