'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function criarProjeto(processoId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('projetos').insert({
    processo_id: processoId,
    nome: formData.get('nome') as string,
    disciplina: formData.get('disciplina') as string,
    descricao: formData.get('descricao') as string || null,
  })

  if (error) redirect(`/processos/${processoId}?erro=criar`)

  revalidatePath(`/processos/${processoId}`)
}

export async function excluirProjeto(processoId: string, projetoId: string) {
  const supabase = await createClient()
  await supabase.from('projetos').delete().eq('id', projetoId)
  revalidatePath(`/processos/${processoId}`)
}
