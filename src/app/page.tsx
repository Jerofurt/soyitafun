import { createClient } from '@/lib/supabase/server'
import { Card, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function Home() {
  const supabase = await createClient()

  const { data: hospedagens, error } = await supabase
    .from('hospedagens')
    .select('id, nome')
    .limit(5)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-fondo-base px-8 py-16">
      <div className="max-w-2xl w-full text-center space-y-12">
        <div className="space-y-5">
          <p className="text-[11px] uppercase tracking-[0.25em] text-acento-dourado font-medium">
            Portal de Itamambuca
          </p>
          <h1 className="text-5xl md:text-6xl text-texto-principal">
            soyitafun
          </h1>
          <p className="text-base text-texto-secundario max-w-md mx-auto leading-relaxed">
            Hospedagens, atividades, comércios e serviços em uma das praias mais
            preservadas do litoral norte de São Paulo.
          </p>
        </div>

        <Card>
          <CardBody className="text-left space-y-4">
            <p className="text-[11px] uppercase tracking-wider text-texto-secundario font-medium">
              Status do sistema
            </p>
            {error ? (
              <div className="space-y-3">
                <Badge variant="error">Erro de conexão</Badge>
                <pre className="text-xs bg-fondo-base p-3 rounded-sm border border-error/20 text-error overflow-x-auto">
                  {error.message}
                </pre>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant="success">Conectado</Badge>
                <span className="text-sm text-texto-secundario">
                  {hospedagens?.length ?? 0} hospedagens cadastradas
                </span>
              </div>
            )}
          </CardBody>
        </Card>

        <p className="text-xs text-texto-secundario/70 uppercase tracking-wider">
          Em construção
        </p>
      </div>
    </main>
  )
}
