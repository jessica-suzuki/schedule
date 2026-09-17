import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setCarregando(false)
    if (error) setErro('E-mail ou senha inválidos.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-porcelain px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo_michelle.png" alt="Studio Michelle Lima" className="w-full max-w-[300px] h-auto mb-3" />
          <p className="text-sm text-ink/55">Entre para acessar a agenda</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}
          <label className="block">
            <span className="block text-xs font-medium text-ink/60 mb-1">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ink/60 mb-1">Senha</span>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input"
            />
          </label>
          <button type="submit" disabled={carregando} className="btn-primary w-full">
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-xs text-ink/40 text-center mt-4">
          As contas de acesso são criadas no painel do Supabase (Authentication → Users).
        </p>
      </div>
    </div>
  )
}
