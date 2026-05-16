'use client'

import { useState } from 'react'
import { criarProcesso } from './actions'

export default function NovoProcessoForm() {
  const [aberto, setAberto] = useState(false)

  return (
    <div>
      {!aberto ? (
        <button
          onClick={() => setAberto(true)}
          className="bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          + Novo Processo
        </button>
      ) : (
        <form
          action={async (formData) => {
            await criarProcesso(formData)
            setAberto(false)
          }}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-slate-900">Novo Processo</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do processo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome"
              required
              minLength={3}
              maxLength={200}
              placeholder="Ex: Obra Torre Comercial — Bloco A"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              name="descricao"
              rows={3}
              placeholder="Informações adicionais sobre o processo..."
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
