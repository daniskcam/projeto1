'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { salvarPrancha } from './actions'

export default function UploadPranchaForm({
  projetoId,
  userId,
}: {
  projetoId: string
  userId: string
}) {
  const [aberto, setAberto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const form = e.currentTarget
    const arquivo = (form.elements.namedItem('arquivo') as HTMLInputElement).files?.[0]
    const numero_folha = (form.elements.namedItem('numero_folha') as HTMLInputElement).value
    const titulo = (form.elements.namedItem('titulo') as HTMLInputElement).value

    if (!arquivo) {
      setErro('Selecione um arquivo PDF.')
      setEnviando(false)
      return
    }

    try {
      const supabase = createClient()
      const caminho = `${userId}/${projetoId}/${Date.now()}-${arquivo.name}`

      const { error: uploadError } = await supabase.storage
        .from('pranchas')
        .upload(caminho, arquivo)

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from('pranchas')
        .getPublicUrl(caminho)

      await salvarPrancha(projetoId, { numero_folha, titulo, pdf_url: publicUrl })

      formRef.current?.reset()
      setAberto(false)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar o arquivo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      {!aberto ? (
        <button
          onClick={() => setAberto(true)}
          className="bg-slate-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          + Nova Prancha
        </button>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-slate-900">Nova Prancha</h3>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número da folha <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero_folha"
                required
                placeholder="Ex: 01, A-02, P-15"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Título (opcional)
              </label>
              <input
                type="text"
                name="titulo"
                placeholder="Ex: Planta Pavimento Tipo"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Arquivo PDF <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="arquivo"
              accept=".pdf"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="bg-slate-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => { setAberto(false); setErro('') }}
              disabled={enviando}
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
