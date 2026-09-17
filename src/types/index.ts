export interface Cliente {
  id: string
  nome_completo: string
  cpf: string
  data_nasc: string | null
  telefone: string
  email: string | null
  created_at?: string
}

export interface Procedimento {
  id: string
  nome: string
  descricao: string | null
  duracao_min: number
  preco: number
  ativo: boolean
  created_at?: string
}

export type FormaPagamento = 'pix' | 'credito' | 'debito' | 'dinheiro'
export type TipoDesconto = 'percentual' | 'valor'
export type TipoAgendamento = 'atendimento' | 'bloqueio'

export interface AgendamentoProcedimento {
  id?: string
  agendamento_id?: string
  procedimento_id: string
  preco_unitario: number
  duracao_min: number
  // populated client-side for convenience
  procedimento?: Procedimento
}

export interface Agendamento {
  id: string
  cliente_id: string | null
  tipo: TipoAgendamento
  motivo: string | null
  data: string // YYYY-MM-DD
  hora_inicio: string // HH:mm
  hora_fim: string // HH:mm (calculated)
  duracao_total_min: number
  subtotal: number
  desconto_tipo: TipoDesconto | null
  desconto_valor: number
  valor_final: number
  forma_pagamento: FormaPagamento | null
  observacao: string | null
  confirmado: boolean
  created_at?: string
  // relations populated client-side
  cliente?: Cliente
  procedimentos?: AgendamentoProcedimento[]
}

export interface AgendamentoFormValues {
  id?: string
  tipo: TipoAgendamento
  cliente_id: string
  data: string
  hora_inicio: string
  hora_fim: string
  procedimento_ids: string[]
  desconto_tipo: TipoDesconto
  desconto_valor: number
  forma_pagamento: FormaPagamento | ''
  observacao: string
  motivo: string
  confirmado: boolean
}
