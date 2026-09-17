import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Cliente } from '../types'

const QUERY_KEY = ['clientes']

export function useClientes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Cliente[]> => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome_completo', { ascending: true })
      if (error) throw error
      return data as Cliente[]
    },
  })
}

export function useSalvarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (cliente: Partial<Cliente>) => {
      if (cliente.id) {
        const { error } = await supabase.from('clientes').update(cliente).eq('id', cliente.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('clientes').insert(cliente)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useExcluirCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clientes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
