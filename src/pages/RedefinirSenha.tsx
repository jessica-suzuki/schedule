import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/apiClient'
import { PasswordInput } from '../components/PasswordInput'
import logoMichelle from '../assets/logo_michelle.png'

export default function RedefinirSenhaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)
    try {
      await api.post('/api/auth/reset-password', { token, senha })
      setSucesso(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.')
    } finally {
      setCarregando(false)
    }
  }

  if (!token) {
    return (
      <div className="admin-login">
        <div className="admin-login__content">
          <div className="admin-login__brand">
            <img src={logoMichelle} alt="Studio Michelle Lima" />
          </div>
          <p className="card p-6 text-sm text-red-600">
            Link inválido. Peça um novo link na tela de login ("Esqueci minha senha").
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-login">
      <div className="admin-login__content">
        <div className="admin-login__brand">
          <img src={logoMichelle} alt="Studio Michelle Lima" />
          <p className="text-sm text-ink/55">Defina sua nova senha</p>
        </div>

        {sucesso ? (
          <div className="admin-login__form card p-6 space-y-4">
            <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
              Senha redefinida com sucesso.
            </p>
            <button onClick={() => navigate('/admin')} className="btn-primary w-full">
              Ir para o login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-login__form card p-6 space-y-4">
            {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}
            <label className="block">
              <span className="block text-xs font-medium text-ink/60 mb-1">Nova senha</span>
              <PasswordInput
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-ink/60 mb-1">Confirmar nova senha</span>
              <PasswordInput
                required
                minLength={6}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="input"
              />
            </label>
            <button type="submit" disabled={carregando} className="btn-primary w-full">
              {carregando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
