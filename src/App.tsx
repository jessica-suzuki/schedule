import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
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
import { Index as PerfectArchHubPage } from '../perfect-arch-hub/src/routes/index'

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

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {carregando ? null : (
          <Routes>
            {!session ? (
              <>
                <Route path="/" element={<PerfectArchHubPage />} />
                <Route path="/admin" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<PerfectArchHubPage />} />
                <Route path="/admin" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="agenda" element={<AgendamentosPage />} />
                  <Route path="agendamentos" element={<AgendamentoListaPage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="procedimentos" element={<ProcedimentosPage />} />
                  <Route path="relatorios" element={<RelatoriosPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}
