import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Procedimento } from '../types'

const QUERY_KEY = ['procedimentos']

export function useProcedimentos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Procedimento[]> => {
      const { data, error } = await supabase
        .from('procedimentos')
        .select('*')
        .order('nome', { ascending: true })
      if (error) throw error
      return data as Procedimento[]
    },
  })
}

export function useSalvarProcedimento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (procedimento: Partial<Procedimento>) => {
      if (procedimento.id) {
        const { error } = await supabase
          .from('procedimentos')
          .update(procedimento)
          .eq('id', procedimento.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('procedimentos').insert(procedimento)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useExcluirProcedimento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('procedimentos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
