import { createClient } from '@/utils/supabase/server'

export default async function TesteConexao() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('processos').select('count').single()

  const conectado = !error

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md w-full">
        <div className="text-5xl mb-4">{conectado ? '✅' : '❌'}</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {conectado ? 'Supabase conectado!' : 'Erro de conexão'}
        </h1>
        {conectado ? (
          <p className="text-slate-500">
            Banco de dados respondeu corretamente.<br />
            As tabelas estão prontas para uso.
          </p>
        ) : (
          <div>
            <p className="text-red-500 font-medium mb-2">Mensagem de erro:</p>
            <pre className="bg-red-50 text-red-700 text-sm rounded p-3 text-left">
              {error?.message}
            </pre>
          </div>
        )}
      </div>
    </main>
  )
}
