import type { Agendamento, Cliente } from '../types'
import { formatarDataBR } from './formatters'

/**
 * Gera o link do WhatsApp (wa.me) com a mensagem de confirmação já
 * preenchida com os dados reais do agendamento.
 */
export function gerarLinkWhatsApp(agendamento: Agendamento, cliente: Cliente): string {
  const telefone = apenasDigitos(cliente.telefone)
  const dataFormatada = formatarDataBR(agendamento.data)
  const diaDaSemana = formatarDiaDaSemana(agendamento.data)
  const horarioInicio = agendamento.hora_inicio.slice(0, 5)
  const mensagem =
    `Olá! Podemos confirmar seu horário ${dataFormatada}, ${diaDaSemana} às ${horarioInicio}? ` +
    'Por favor confirmar, pois caso você não possa comparecer, poderemos disponibilizar seu horário para outra cliente <3 \n' +
    '• Lembrando que o tempo de tolerância para atraso é de 10 minutos.'
  return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
}

function formatarDiaDaSemana(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(ano, mes - 1, dia))
}

function apenasDigitos(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '')
  // garante o prefixo do Brasil (55) caso o usuário tenha cadastrado só DDD+número
  return digitos.startsWith('55') ? digitos : `55${digitos}`
}
