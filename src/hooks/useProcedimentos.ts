import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/apiClient'
import type { Procedimento } from '../types'

const QUERY_KEY = ['procedimentos']

export function useProcedimentos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get<Procedimento[]>('/api/procedimentos'),
  })
}

export function useSalvarProcedimento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (procedimento: Partial<Procedimento>) => {
      if (procedimento.id) {
        await api.put(`/api/procedimentos/${procedimento.id}`, procedimento)
      } else {
        await api.post('/api/procedimentos', procedimento)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useExcluirProcedimento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/procedimentos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
