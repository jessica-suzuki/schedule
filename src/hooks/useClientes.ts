import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/apiClient'
import type { Cliente } from '../types'

const QUERY_KEY = ['clientes']

export function useClientes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get<Cliente[]>('/api/clientes'),
  })
}

export function useSalvarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (cliente: Partial<Cliente>) => {
      if (cliente.id) {
        await api.put(`/api/clientes/${cliente.id}`, cliente)
      } else {
        await api.post('/api/clientes', cliente)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useExcluirCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/clientes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
