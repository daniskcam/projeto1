'use client'

import { useState } from 'react'
import { criarProjeto } from './actions'

const disciplinas = [
  { value: 'ar_condicionado',  label: '❄️ Ar Condicionado' },
  { value: 'eletrica',         label: '⚡ Elétrica' },
  { value: 'arquitetura',      label: '🏛️ Arquitetura' },
  { value: 'hidraulica',       label: '💧 Hidráulica' },
  { value: 'civil_estrutural', label: '🏗️ Civil / Estrutural' },
  { value: 'drywall',          label: '🧱 Drywall' },
]

export default function NovoProjetoForm({ processoId }: { processoId: string }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div>
      {!aberto ? (
        <button
          onClick={() => setAberto(true)}
          className="bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          + Novo Projeto
        </button>
      ) : (
        <form
          action={async (formData) => {
            await criarProjeto(processoId, formData)
            setAberto(false)
          }}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-slate-900">Novo Projeto</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Disciplina <span className="text-red-500">*</span>
            </label>
            <select
              name="disciplina"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">Selecione a disciplina...</option>
              {disciplinas.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do projeto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome"
              required
              minLength={3}
              maxLength={200}
              placeholder="Ex: AC — Pavimento Tipo"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              name="descricao"
              rows={2}
              placeholder="Informações adicionais..."
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="border border-slate-300 text-slate-600 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
