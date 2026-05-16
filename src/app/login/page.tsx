import { entrar, cadastrar } from './actions'

type Props = {
  searchParams: Promise<{ erro?: string; msg?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const erro = params.erro
  const msg = params.msg

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">🏗️ CRONOMAP</h1>
          <p className="text-slate-500 mt-1">Conferência Executiva Digital</p>
        </div>

        {msg === 'verifique-email' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-3 mb-4 text-sm">
            Cadastro realizado! Verifique seu e-mail para confirmar a conta.
          </div>
        )}

        {erro === 'credenciais' && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            E-mail ou senha incorretos. Tente novamente.
          </div>
        )}

        {erro === 'cadastro' && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
            Erro ao cadastrar. Tente com senha de pelo menos 6 caracteres.
          </div>
        )}

        {erro === 'ja-cadastrado' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-3 mb-4 text-sm">
            Este e-mail já tem cadastro. Use o formulário <strong>Entrar</strong> acima com a senha que você criou.
          </div>
        )}

        {/* Formulário de Login */}
        <form action={entrar} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="seu@email.com"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              name="senha"
              required
              placeholder="••••••••"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-slate-700 transition-colors"
          >
            Entrar
          </button>
        </form>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500 text-center mb-4">Ainda não tem conta?</p>
          <form action={cadastrar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="seu@email.com"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                name="senha"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              type="submit"
              className="w-full border border-slate-900 text-slate-900 rounded-lg py-2.5 font-medium hover:bg-slate-50 transition-colors"
            >
              Cadastrar
            </button>
          </form>
        </div>

      </div>
    </main>
  )
}
