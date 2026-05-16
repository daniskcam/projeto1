'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalisarButton({
  pranchaId,
  statusAtual,
}: {
  pranchaId: string
  statusAtual: string
}) {
  const [analisando, setAnalisando] = useState(false)
  const [resultado, setResultado] = useState('')
  const router = useRouter()

  async function analisar() {
    setAnalisando(true)
    setResultado('')

    try {
      const res = await fetch('/api/analisar-prancha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pranchaId }),
      })

      const data = await res.json()

      if (res.ok) {
        setResultado(`✅ ${data.totalElementos} elemento(s) detectado(s)`)
        router.refresh()
      } else {
        setResultado(`❌ ${data.erro}`)
      }
    } catch {
      setResultado('❌ Erro ao conectar com o servidor')
    } finally {
      setAnalisando(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={analisar}
        disabled={analisando || statusAtual === 'processando'}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-40"
      >
        {analisando ? '🔄 Analisando...' : '🤖 Analisar com IA'}
      </button>
      {resultado && (
        <span className="text-xs text-slate-500">{resultado}</span>
      )}
    </div>
  )
}
