import { login } from './actions'
import { Card, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-fondo-base px-8 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <p className="text-[11px] uppercase tracking-[0.25em] text-acento-dourado font-medium">
            Painel administrativo
          </p>
          <h1 className="text-4xl text-texto-principal">soyitafun</h1>
        </div>

        <Card>
          <CardBody>
            <form action={login} className="space-y-6">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </div>

              {params.error && (
                <div className="bg-error/10 border border-error/20 rounded-sm px-4 py-3 text-sm text-error">
                  {params.error === 'invalid_credentials'
                    ? 'E-mail ou senha incorretos.'
                    : 'Erro ao fazer login. Tente novamente.'}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full">
                Entrar
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </main>
  )
}
