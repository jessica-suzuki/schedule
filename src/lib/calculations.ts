import type { Procedimento, TipoDesconto, Agendamento } from '../types'

/** Soma a duração (em minutos) de uma lista de procedimentos selecionados. */
export function somarDuracao(procedimentos: Procedimento[]): number {
  return procedimentos.reduce((total, p) => total + (p.duracao_min || 0), 0)
}

/** Soma o preço (subtotal) de uma lista de procedimentos selecionados. */
export function somarPreco(procedimentos: Procedimento[]): number {
  return procedimentos.reduce((total, p) => total + Number(p.preco || 0), 0)
}

/** Soma minutos a um horário "HH:mm" e retorna o novo horário "HH:mm". */
export function somarMinutosAoHorario(horaInicio: string, minutos: number): string {
  const [h, m] = horaInicio.split(':').map(Number)
  const totalMin = h * 60 + m + minutos
  const hFim = Math.floor(totalMin / 60) % 24
  const mFim = totalMin % 60
  return `${String(hFim).padStart(2, '0')}:${String(mFim).padStart(2, '0')}`
}

/** Calcula o valor final a pagar aplicando o desconto (em R$ ou %). */
export function calcularValorFinal(
  subtotal: number,
  descontoTipo: TipoDesconto | null,
  descontoValor: number
): number {
  if (!descontoTipo || !descontoValor) return arredondar(subtotal)
  if (descontoTipo === 'percentual') {
    return arredondar(subtotal - subtotal * (descontoValor / 100))
  }
  return arredondar(Math.max(0, subtotal - descontoValor))
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/** Converte "HH:mm" em minutos desde a meia-noite, para comparação de intervalos. */
function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

/**
 * Verifica se um novo agendamento (data/hora_inicio/hora_fim) conflita com
 * algum agendamento já existente no mesmo dia. Ignora o próprio registro
 * quando estiver editando (ignorarId).
 */
export function existeConflito(
  novo: { data: string; hora_inicio: string; hora_fim: string },
  existentes: Agendamento[],
  ignorarId?: string
): Agendamento | null {
  const inicioNovo = horaParaMinutos(novo.hora_inicio)
  const fimNovo = horaParaMinutos(novo.hora_fim)

  for (const ag of existentes) {
    if (ag.id === ignorarId) continue
    if (ag.data !== novo.data) continue
    const inicioExistente = horaParaMinutos(ag.hora_inicio)
    const fimExistente = horaParaMinutos(ag.hora_fim)
    // sobreposição de intervalos [inicio, fim)
    const sobrepoe = inicioNovo < fimExistente && fimNovo > inicioExistente
    if (sobrepoe) return ag
  }
  return null
}
