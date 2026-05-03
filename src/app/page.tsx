import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: hospedagens, error } = await supabase
    .from('hospedagens')
    .select('id, nome')
    .limit(5)

  return (
    <main className="min-h-screen p-8 bg-stone-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-stone-900 mb-4">
          soyitafun
        </h1>
        <p className="text-lg text-stone-600 mb-8">
          Portal de Itamambuca — em construção
        </p>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test de conexão Supabase</h2>
          
          {error ? (
            <div className="text-red-600">
              <p className="font-semibold">❌ Erro de conexão:</p>
              <pre className="mt-2 text-sm bg-red-50 p-2 rounded">{error.message}</pre>
            </div>
          ) : (
            <div className="text-green-700">
              <p className="font-semibold">✅ Conectado a Supabase</p>
              <p className="text-sm text-stone-600 mt-2">
                Hospedagens cadastradas: {hospedagens?.length || 0}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
