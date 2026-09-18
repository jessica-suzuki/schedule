import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import AgendamentosPage from './pages/Agendamentos'
import AgendamentoListaPage from './pages/AgendamentoLista'
import ClientesPage from './pages/Clientes'
import ProcedimentosPage from './pages/Procedimentos'
import RelatoriosPage from './pages/Relatorios'
import LoginPage from './pages/Login'
import RedefinirSenhaPage from './pages/RedefinirSenha'
import { Index as PerfectArchHubPage } from '../perfect-arch-hub/src/routes/index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function AppRoutes() {
  const { usuario, carregando } = useAuth()

  if (carregando) return null

  return (
    <Routes>
      <Route path="/admin/redefinir-senha" element={<RedefinirSenhaPage />} />
      {!usuario ? (
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
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
