import { createClient } from '@/lib/supabase/server'
import { logout } from './login/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

  const [
    { count: hospedagensCount },
    { count: atividadesCount },
    { count: comerciosCount },
    { count: servicosCount },
  ] = await Promise.all([
    supabase.from('hospedagens').select('*', { count: 'exact', head: true }),
    supabase.from('atividades').select('*', { count: 'exact', head: true }),
    supabase.from('comercios').select('*', { count: 'exact', head: true }),
    supabase.from('servicos').select('*', { count: 'exact', head: true }),
  ])

  return (
    <main className="min-h-screen bg-fondo-base">
      <header className="bg-fondo-card border-b border-texto-secundario/10">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-acento-dourado font-medium mb-1">
              Painel administrativo
            </p>
            <h1 className="text-2xl text-texto-principal">soy.ita.fan</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-texto-principal">{profile?.email}</p>
              <p className="text-xs text-texto-secundario capitalize">
                {profile?.role?.replace('_', ' ')}
              </p>
            </div>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="space-y-12">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-texto-secundario font-medium mb-2">
              Bem-vindo de volta
            </p>
            <h2 className="text-3xl text-texto-principal">
              {profile?.nome || 'Admin'}
            </h2>
            <p className="text-sm text-texto-secundario mt-3 max-w-xl leading-relaxed">
              Gerencie as hospedagens, atividades, comércios e serviços de
              Itamambuca a partir deste painel.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DashboardLink
              href="/admin/hospedagens"
              title="Hospedagens"
              count={hospedagensCount ?? 0}
            />
            <DashboardLink
              href="/admin/atividades"
              title="Atividades"
              count={atividadesCount ?? 0}
            />
            <DashboardLink
              href="/admin/comercios"
              title="Comércios"
              count={comerciosCount ?? 0}
            />
            <DashboardLink
              href="/admin/servicos"
              title="Serviços"
              count={servicosCount ?? 0}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function DashboardLink({
  href,
  title,
  count,
  disabled,
}: {
  href: string
  title: string
  count: number | null
  disabled?: boolean
}) {
  const card = (
    <Card
      className={cn(
        'transition-all duration-200 ease-out',
        disabled
          ? 'opacity-50'
          : 'cursor-pointer hover:border-acento-mar/30 hover:shadow-md hover:-translate-y-0.5',
      )}
    >
      <div className="px-6 py-6">
        <p className="text-[11px] uppercase tracking-wider text-texto-secundario font-medium">
          {title}
        </p>
        <p className="text-3xl font-display text-texto-principal mt-3">
          {count === null ? '—' : count}
        </p>
      </div>
    </Card>
  )

  if (disabled) return card
  return <Link href={href}>{card}</Link>
}
