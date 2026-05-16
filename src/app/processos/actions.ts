'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function criarProcesso(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('processos').insert({
    gestor_id: user.id,
    nome: formData.get('nome') as string,
    descricao: formData.get('descricao') as string || null,
  })

  if (error) {
    redirect('/processos?erro=criar')
  }

  revalidatePath('/processos')
}

export async function excluirProcesso(id: string) {
  const supabase = await createClient()

  await supabase.from('processos').delete().eq('id', id)

  revalidatePath('/processos')
}
