import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CRONOMAP — Conferência Executiva Digital',
  description: 'Mapeamento digital de obras com percentual de avanço em tempo real',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">{children}</body>
    </html>
  )
}
