'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function salvarPrancha(projetoId: string, dados: {
  numero_folha: string
  titulo: string
  pdf_url: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('pranchas').insert({
    projeto_id: projetoId,
    numero_folha: dados.numero_folha,
    titulo: dados.titulo || null,
    pdf_url: dados.pdf_url,
    status_processamento: 'aguardando',
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/projetos/${projetoId}`)
}

export async function excluirPrancha(projetoId: string, pranchaId: string) {
  const supabase = await createClient()
  await supabase.from('pranchas').delete().eq('id', pranchaId)
  revalidatePath(`/projetos/${projetoId}`)
}
