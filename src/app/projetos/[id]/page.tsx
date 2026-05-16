import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { sair } from '@/app/login/actions'
import { excluirPrancha } from './actions'
import UploadPranchaForm from './UploadPranchaForm'
import AnalisarButton from './AnalisarButton'

const statusLabel: Record<string, { texto: string; cor: string }> = {
  aguardando:  { texto: 'Aguardando análise', cor: 'bg-slate-100 text-slate-600' },
  processando: { texto: 'Analisando...',       cor: 'bg-blue-100 text-blue-700' },
  concluido:   { texto: 'Analisado',           cor: 'bg-green-100 text-green-700' },
  erro:        { texto: 'Erro na análise',      cor: 'bg-red-100 text-red-700' },
}

const disciplinaLabel: Record<string, string> = {
  ar_condicionado:  '❄️ Ar Condicionado',
  eletrica:         '⚡ Elétrica',
  arquitetura:      '🏛️ Arquitetura',
  hidraulica:       '💧 Hidráulica',
  civil_estrutural: '🏗️ Civil / Estrutural',
  drywall:          '🧱 Drywall',
}

const tipoLabel: Record<string, string> = {
  evaporadora:       'Evaporadora',
  duto_insuflamento: 'Duto Insuflamento',
  duto_ar_externo:   'Duto Ar Externo',
  duto_exaustao:     'Duto Exaustão',
  duto_extracao:     'Duto Extração',
  grelha:            'Grelha',
  damper:            'Damper',
  difusor:           'Difusor',
  duto_flexivel:     'Duto Flexível',
  dreno:             'Dreno',
  linha_frigorifera: 'Linha Frigorífera',
  condensadora:      'Condensadora',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function PranchasPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projeto } = await supabase
    .from('projetos')
    .select('*, processos(id, nome)')
    .eq('id', id)
    .single()

  if (!projeto) notFound()

  const { data: pranchas } = await supabase
    .from('pranchas')
    .select('*, elementos(id, tipo, confianca_ia, executado)')
    .eq('projeto_id', id)
    .order('numero_folha', { ascending: true })

  const processo = projeto.processos as { id: string; nome: string }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">🏗️ CRONOMAP</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user.email}</span>
          <form action={sair}>
            <button type="submit" className="text-sm text-slate-600 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <div className="flex gap-2 text-sm text-slate-400">
            <Link href="/processos" className="hover:text-slate-600 transition-colors">Processos</Link>
            <span>/</span>
            <Link href={`/processos/${processo.id}`} className="hover:text-slate-600 transition-colors">
              {processo.nome}
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">{projeto.nome}</h2>
          <p className="text-slate-500 text-sm mt-1">{disciplinaLabel[projeto.disciplina] ?? projeto.disciplina}</p>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-700">Pranchas</h3>
          <UploadPranchaForm projetoId={id} userId={user.id} />
        </div>

        {pranchas && pranchas.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-slate-500">Nenhuma prancha cadastrada ainda.</p>
            <p className="text-slate-400 text-sm mt-1">Clique em "Nova Prancha" para fazer upload de um PDF.</p>
          </div>
        )}

        <div className="space-y-4">
          {pranchas?.map((prancha) => {
            const status = statusLabel[prancha.status_processamento] ?? statusLabel.aguardando
            const elementos = (prancha.elementos ?? []) as Array<{ id: string; tipo: string; confianca_ia: number; executado: boolean }>
            const totalElementos = elementos.length
            const executados = elementos.filter(e => e.executado).length

            // Contagem por tipo
            const porTipo: Record<string, number> = {}
            elementos.forEach(e => { porTipo[e.tipo] = (porTipo[e.tipo] ?? 0) + 1 })

            return (
              <div key={prancha.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        Folha {prancha.numero_folha}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cor}`}>
                        {status.texto}
                      </span>
                    </div>
                    {prancha.titulo && (
                      <p className="text-slate-700 font-medium mt-1">{prancha.titulo}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <a href={prancha.pdf_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        📥 Ver PDF
                      </a>
                      <span className="text-slate-300">|</span>
                      <AnalisarButton pranchaId={prancha.id} statusAtual={prancha.status_processamento} />
                      <span className="text-slate-300">|</span>
                      <form action={excluirPrancha.bind(null, id, prancha.id)}>
                        <button type="submit" className="text-red-400 hover:text-red-600 text-sm transition-colors">
                          Excluir
                        </button>
                      </form>
                    </div>
                  </div>

                  {totalElementos > 0 && (
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-slate-900">{totalElementos}</p>
                      <p className="text-xs text-slate-400">elementos</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">{executados} executados</p>
                    </div>
                  )}
                </div>

                {totalElementos > 0 && (
                  <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                    <p className="text-xs font-medium text-slate-500 mb-3">Elementos detectados por tipo:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(porTipo).map(([tipo, qtd]) => (
                        <span key={tipo} className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-700">
                          {tipoLabel[tipo] ?? tipo} <span className="font-bold text-slate-900">×{qtd}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {prancha.erro_mensagem && (
                  <div className="border-t border-red-100 px-6 py-3 bg-red-50">
                    <p className="text-xs text-red-600">{prancha.erro_mensagem}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
