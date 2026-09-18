import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/apiClient'
import type { Agendamento, AgendamentoFormValues, Procedimento } from '../types'
import { somarDuracao, somarMinutosAoHorario, somarPreco, calcularValorFinal } from '../lib/calculations'

const QUERY_KEY = ['agendamentos']

export function useAgendamentos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get<Agendamento[]>('/api/agendamentos'),
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
    queryFn: () => {
      const params = new URLSearchParams()
      if (dataInicio) params.set('dataInicio', dataInicio)
      if (dataFim) params.set('dataFim', dataFim)
      if (procedimentoId) params.set('procedimentoId', procedimentoId)
      return api.get<Agendamento[]>(`/api/agendamentos/relatorio?${params.toString()}`)
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

      const agendamento = {
        tipo: valores.tipo,
        cliente_id: valores.tipo === 'bloqueio' ? null : valores.cliente_id,
        motivo: valores.tipo === 'bloqueio' ? valores.motivo.trim() : null,
        data: valores.data,
        hora_inicio: valores.hora_inicio,
        hora_fim: valores.tipo === 'bloqueio' ? valores.hora_fim : horaFim,
        duracao_total_min: duracaoTotal,
        subtotal: valores.tipo === 'bloqueio' ? 0 : subtotal,
        desconto_tipo: valores.tipo === 'bloqueio' ? null : valores.desconto_tipo,
        desconto_valor: valores.tipo === 'bloqueio' ? 0 : valores.desconto_valor || 0,
        valor_final: valores.tipo === 'bloqueio' ? 0 : valorFinal,
        forma_pagamento: valores.tipo === 'bloqueio' ? null : valores.forma_pagamento || null,
        observacao: valores.tipo === 'bloqueio' ? null : valores.observacao || null,
        confirmado: valores.tipo === 'atendimento' && valores.confirmado,
      }

      const procedimentos = procedimentosSelecionados.map((p) => ({
        id: p.id,
        preco: p.preco,
        duracao_min: p.duracao_min,
      }))

      if (valores.id) {
        await api.put(`/api/agendamentos/${valores.id}`, { agendamento, procedimentos })
      } else {
        await api.post('/api/agendamentos', { agendamento, procedimentos })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useExcluirAgendamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/agendamentos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useAtualizarConfirmacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, confirmado }: { id: string; confirmado: boolean }) =>
      api.patch(`/api/agendamentos/${id}/confirmado`, { confirmado }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
