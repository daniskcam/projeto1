import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { sair } from '@/app/login/actions'
import { excluirProjeto } from './actions'
import NovoProjetoForm from './NovoProjetoForm'

const disciplinaLabel: Record<string, string> = {
  ar_condicionado:  '❄️ Ar Condicionado',
  eletrica:         '⚡ Elétrica',
  arquitetura:      '🏛️ Arquitetura',
  hidraulica:       '💧 Hidráulica',
  civil_estrutural: '🏗️ Civil / Estrutural',
  drywall:          '🧱 Drywall',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProjetosPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: processo } = await supabase
    .from('processos')
    .select('*')
    .eq('id', id)
    .single()

  if (!processo) notFound()

  const { data: projetos } = await supabase
    .from('projetos')
    .select('*')
    .eq('processo_id', id)
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
        <div>
          <Link href="/processos" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Voltar para Processos
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">{processo.nome}</h2>
          {processo.descricao && (
            <p className="text-slate-500 text-sm mt-1">{processo.descricao}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-700">Projetos</h3>
          <NovoProjetoForm processoId={id} />
        </div>

        {projetos && projetos.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-4xl mb-3">📐</p>
            <p className="text-slate-500">Nenhum projeto cadastrado ainda.</p>
            <p className="text-slate-400 text-sm mt-1">Clique em "Novo Projeto" para adicionar uma disciplina.</p>
          </div>
        )}

        <div className="space-y-3">
          {projetos?.map((projeto) => (
            <div
              key={projeto.id}
              className="bg-white border border-slate-200 rounded-xl px-6 py-5 flex items-start justify-between gap-4"
            >
              <Link href={`/projetos/${projeto.id}`} className="flex-1 min-w-0">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {disciplinaLabel[projeto.disciplina] ?? projeto.disciplina}
                </span>
                <h4 className="font-semibold text-slate-900 mt-0.5 hover:text-slate-600 transition-colors">
                  {projeto.nome}
                </h4>
                {projeto.descricao && (
                  <p className="text-slate-500 text-sm mt-1">{projeto.descricao}</p>
                )}
                <p className="text-slate-400 text-xs mt-2">
                  Criado em {new Date(projeto.created_at).toLocaleDateString('pt-BR')}
                </p>
              </Link>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/projetos/${projeto.id}`}
                  className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
                >
                  Ver pranchas →
                </Link>
                <form action={excluirProjeto.bind(null, id, projeto.id)}>
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
