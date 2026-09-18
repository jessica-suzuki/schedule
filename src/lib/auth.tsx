import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getToken, setToken } from './apiClient'

interface Usuario {
  id: string
  nome: string
  email: string
}

interface AuthContextValue {
  usuario: Usuario | null
  carregando: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setCarregando(false)
      return
    }
    api
      .get<{ usuario: Usuario }>('/api/auth/me')
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => setToken(null))
      .finally(() => setCarregando(false))
  }, [])

  async function login(email: string, senha: string) {
    const { token, usuario } = await api.post<{ token: string; usuario: Usuario }>(
      '/api/auth/login',
      { email, senha }
    )
    setToken(token)
    setUsuario(usuario)
  }

  function logout() {
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
