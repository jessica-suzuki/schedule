import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Agendamento, AgendamentoFormValues, Procedimento } from '../types'
import { somarDuracao, somarMinutosAoHorario, somarPreco, calcularValorFinal } from '../lib/calculations'

const QUERY_KEY = ['agendamentos']

const SELECT_COMPLETO = `
  *,
  cliente:clientes(*),
  procedimentos:agendamento_procedimentos(
    id, procedimento_id, preco_unitario, duracao_min,
    procedimento:procedimentos(*)
  )
`

export function useAgendamentos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Agendamento[]> => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(SELECT_COMPLETO)
        .order('data', { ascending: true })
        .order('hora_inicio', { ascending: true })
      if (error) throw error
      return data as unknown as Agendamento[]
    },
  })
}

export function useRelatorioAgendamentos(filtros: {
  dataInicio: string
  dataFim: string
  procedimentoId: string
}) {
  const { dataInicio, dataFim, procedimentoId } = filtros

  return useQuery({
    queryKey: ['relatorio-agendamentos', dataInicio, dataFim, procedimentoId],
    queryFn: async (): Promise<Agendamento[]> => {
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:clientes(*),
          procedimentos:agendamento_procedimentos!inner(
            id, procedimento_id, preco_unitario, duracao_min,
            procedimento:procedimentos(*)
          )
        `)
        .order('data', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (dataInicio) query = query.gte('data', dataInicio)
      if (dataFim) query = query.lte('data', dataFim)
      if (procedimentoId) query = query.eq('agendamento_procedimentos.procedimento_id', procedimentoId)

      const { data, error } = await query
      if (error) throw error
      return data as unknown as Agendamento[]
    },
  })
}

interface SalvarAgendamentoInput {
  valores: AgendamentoFormValues
  procedimentosSelecionados: Procedimento[]
}

export function useSalvarAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ valores, procedimentosSelecionados }: SalvarAgendamentoInput) => {
      const duracaoTotal = somarDuracao(procedimentosSelecionados)
      const subtotal = somarPreco(procedimentosSelecionados)
      const horaFim = somarMinutosAoHorario(valores.hora_inicio, duracaoTotal)
      const valorFinal = calcularValorFinal(subtotal, valores.desconto_tipo, valores.desconto_valor)

      const payloadAgendamento = {
        tipo: valores.tipo,
        cliente_id: valores.tipo === 'bloqueio' ? null : valores.cliente_id,
        motivo: valores.tipo === 'bloqueio' ? valores.motivo.trim() : null,
        data: valores.data,
        hora_inicio: valores.hora_inicio,
        hora_fim: valores.tipo === 'bloqueio' ? valores.hora_fim : horaFim,
        duracao_total_min: valores.tipo === 'bloqueio'
          ? calcularDuracaoEntreHorarios(valores.hora_inicio, valores.hora_fim)
          : duracaoTotal,
        subtotal: valores.tipo === 'bloqueio' ? 0 : subtotal,
        desconto_tipo: valores.tipo === 'bloqueio' ? null : valores.desconto_tipo,
        desconto_valor: valores.tipo === 'bloqueio' ? 0 : valores.desconto_valor || 0,
        valor_final: valores.tipo === 'bloqueio' ? 0 : valorFinal,
        forma_pagamento: valores.tipo === 'bloqueio' ? null : valores.forma_pagamento || null,
        observacao: valores.tipo === 'bloqueio' ? null : valores.observacao || null,
        confirmado: valores.tipo === 'atendimento' && valores.confirmado,
      }

      let agendamentoId = valores.id

      if (agendamentoId) {
        const { error } = await supabase
          .from('agendamentos')
          .update(payloadAgendamento)
          .eq('id', agendamentoId)
        if (error) throw error

        // Remove vínculos antigos de procedimentos antes de recriar
        const { error: delError } = await supabase
          .from('agendamento_procedimentos')
          .delete()
          .eq('agendamento_id', agendamentoId)
        if (delError) throw delError
      } else {
        const { data, error } = await supabase
          .from('agendamentos')
          .insert(payloadAgendamento)
          .select('id')
          .single()
        if (error) throw error
        agendamentoId = data.id
      }

      if (procedimentosSelecionados.length > 0) {
        const vinculos = procedimentosSelecionados.map((p) => ({
          agendamento_id: agendamentoId,
          procedimento_id: p.id,
          preco_unitario: p.preco,
          duracao_min: p.duracao_min,
        }))
        const { error: insError } = await supabase.from('agendamento_procedimentos').insert(vinculos)
        if (insError) throw insError
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

function calcularDuracaoEntreHorarios(inicio: string, fim: string): number {
  const [horaInicio, minutoInicio] = inicio.split(':').map(Number)
  const [horaFim, minutoFim] = fim.split(':').map(Number)
  return (horaFim * 60 + minutoFim) - (horaInicio * 60 + minutoInicio)
}

export function useExcluirAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agendamentos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useAtualizarConfirmacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, confirmado }: { id: string; confirmado: boolean }) => {
      const { error } = await supabase.from('agendamentos').update({ confirmado }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
