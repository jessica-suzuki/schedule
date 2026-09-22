import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { api } from '../lib/apiClient'
import { PasswordInput } from '../components/PasswordInput'
import logoMichelle from '../assets/logo_michelle.png'

export default function LoginPage() {
  const { login } = useAuth()
  const [modo, setModo] = useState<'login' | 'esqueci-senha'>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      await login(email, senha)
    } catch {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  async function handleEsqueciSenha(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setMensagem(null)
    setCarregando(true)
    try {
      const resp = await api.post<{ mensagem: string }>('/api/auth/forgot-password', { email })
      setMensagem(resp.mensagem)
    } catch {
      setErro('Não foi possível enviar o link agora. Tente novamente em alguns minutos.')
    } finally {
      setCarregando(false)
    }
  }

  function voltarParaLogin() {
    setModo('login')
    setErro(null)
    setMensagem(null)
  }

  return (
    <div className="admin-login">
      <div className="admin-login__content">
        <div className="admin-login__brand">
          <img src={logoMichelle} alt="Studio Michelle Lima" />
          <p className="text-sm text-ink/55">
            {modo === 'login' ? 'Entre para acessar a agenda' : 'Redefinir senha'}
          </p>
        </div>

        {modo === 'login' ? (
          <form onSubmit={handleSubmit} className="admin-login__form card p-6 space-y-4">
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
              <PasswordInput
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input"
              />
            </label>
            <button type="submit" disabled={carregando} className="btn-primary w-full">
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
            <button
              type="button"
              onClick={() => setModo('esqueci-senha')}
              className="block w-full text-center text-xs text-ink/50 hover:text-ink/80"
            >
              Esqueci minha senha
            </button>
          </form>
        ) : (
          <form onSubmit={handleEsqueciSenha} className="admin-login__form card p-6 space-y-4">
            <p className="text-xs text-ink/55">
              Digite seu e-mail de acesso. Se ele estiver cadastrado, enviamos um link para
              você criar uma nova senha.
            </p>
            {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}
            {mensagem && (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                {mensagem}
              </p>
            )}
            {!mensagem && (
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
            )}
            {!mensagem && (
              <button type="submit" disabled={carregando} className="btn-primary w-full">
                {carregando ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            )}
            <button
              type="button"
              onClick={voltarParaLogin}
              className="block w-full text-center text-xs text-ink/50 hover:text-ink/80"
            >
              Voltar para o login
            </button>
          </form>
        )}

        {/* Contas de acesso são criadas pela equipe técnica via
            server/scripts/create-user.js (não existe cadastro pelo painel). */}
      </div>
    </div>
  )
}
