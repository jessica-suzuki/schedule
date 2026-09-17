import { MessageCircle } from 'lucide-react'
import type { Agendamento, Cliente } from '../types'
import { gerarLinkWhatsApp } from '../lib/whatsapp'

interface Props {
  agendamento: Agendamento
  cliente: Cliente
  compact?: boolean
}

export function BotaoWhatsApp({ agendamento, cliente, compact }: Props) {
  const link = gerarLinkWhatsApp(agendamento, cliente)
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={
        compact
          ? 'inline-flex items-center justify-center rounded-full bg-sage/15 text-sage p-1.5 hover:bg-sage/25'
          : 'inline-flex items-center gap-2 rounded-lg bg-sage text-white px-4 py-2 text-sm font-medium hover:bg-sage/90'
      }
      title="Confirmar via WhatsApp"
    >
      <MessageCircle size={compact ? 14 : 16} />
      {!compact && 'Confirmar no WhatsApp'}
    </a>
  )
}
