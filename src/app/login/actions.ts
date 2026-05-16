'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function entrar(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('senha') as string,
  })

  if (error) {
    redirect('/login?erro=credenciais')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function cadastrar(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('senha') as string,
  })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      redirect('/login?erro=ja-cadastrado')
    }
    redirect('/login?erro=cadastro')
  }

  revalidatePath('/', 'layout')
  redirect('/login?msg=verifique-email')
}

export async function sair() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
