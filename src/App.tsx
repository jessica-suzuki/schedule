import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import AgendamentosPage from './pages/Agendamentos'
import AgendamentoListaPage from './pages/AgendamentoLista'
import ClientesPage from './pages/Clientes'
import ProcedimentosPage from './pages/Procedimentos'
import RelatoriosPage from './pages/Relatorios'
import LoginPage from './pages/Login'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCarregando(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (carregando) return null
  if (!session) return <LoginPage />

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="agenda" element={<AgendamentosPage />} />
            <Route path="agendamentos" element={<AgendamentoListaPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="procedimentos" element={<ProcedimentosPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
