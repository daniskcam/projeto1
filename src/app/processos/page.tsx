import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { sair } from '@/app/login/actions'
import { excluirProcesso } from './actions'
import NovoProcessoForm from './NovoProcessoForm'

export default async function ProcessosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: processos } = await supabase
    .from('processos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">🏗️ CRONOMAP</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user.email}</span>
          <form action={sair}>
            <button
              type="submit"
              className="text-sm text-slate-600 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Processos</h2>
            <p className="text-slate-500 text-sm mt-1">
              Cada processo representa uma obra ou projeto em andamento.
            </p>
          </div>
          <NovoProcessoForm />
        </div>

        {processos && processos.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-500">Nenhum processo cadastrado ainda.</p>
            <p className="text-slate-400 text-sm mt-1">Clique em "Novo Processo" para começar.</p>
          </div>
        )}

        <div className="space-y-3">
          {processos?.map((processo) => (
            <div
              key={processo.id}
              className="bg-white border border-slate-200 rounded-xl px-6 py-5 flex items-start justify-between gap-4"
            >
              <Link href={`/processos/${processo.id}`} className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 hover:text-slate-600 transition-colors">
                  {processo.nome}
                </h3>
                {processo.descricao && (
                  <p className="text-slate-500 text-sm mt-1">{processo.descricao}</p>
                )}
                <p className="text-slate-400 text-xs mt-2">
                  Criado em {new Date(processo.created_at).toLocaleDateString('pt-BR')}
                </p>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/processos/${processo.id}`}
                  className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
                >
                  Ver projetos →
                </Link>
                <form action={excluirProcesso.bind(null, processo.id)}>
                  <button
                    type="submit"
                    className="text-red-400 hover:text-red-600 text-sm transition-colors"
                  >
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
