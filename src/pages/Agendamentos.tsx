import { useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core'
import { CheckCircle2, Clock3 } from 'lucide-react'

import { useClientes } from '../hooks/useClientes'
import { useProcedimentos } from '../hooks/useProcedimentos'
import {
  useAgendamentos,
  useSalvarAgendamento,
  useExcluirAgendamento,
} from '../hooks/useAgendamentos'
import { AgendamentoModal } from '../components/AgendamentoModal'
import type { Agendamento, AgendamentoFormValues, Procedimento } from '../types'
import { Modal } from '../components/Modal'
import { somarMinutosAoHorario } from '../lib/calculations'

function agendamentoParaFormulario(a?: Agendamento, dataInicial?: string, horaInicial?: string, tipo: 'atendimento' | 'bloqueio' = 'atendimento'): AgendamentoFormValues {
  if (a) {
    return {
      id: a.id,
      tipo: a.tipo ?? 'atendimento',
      cliente_id: a.cliente_id ?? '',
      data: a.data,
      hora_inicio: a.hora_inicio,
      hora_fim: a.hora_fim,
      procedimento_ids: a.procedimentos?.map((ap) => ap.procedimento_id) ?? [],
      desconto_tipo: a.desconto_tipo ?? 'valor',
      desconto_valor: a.desconto_valor ?? 0,
      forma_pagamento: a.forma_pagamento ?? '',
      observacao: a.observacao ?? '',
      motivo: a.motivo ?? '',
      confirmado: a.confirmado,
    }
  }
  return {
    cliente_id: '',
    tipo,
    data: dataInicial ?? new Date().toISOString().slice(0, 10),
    hora_inicio: horaInicial ?? '09:00',
    hora_fim: horaInicial ? normalizarHorario(somarMinutosAoHorario(horaInicial, 60)) : '10:00',
    procedimento_ids: [],
    desconto_tipo: 'valor',
    desconto_valor: 0,
    forma_pagamento: '',
    observacao: '',
    motivo: '',
    confirmado: false,
  }
}

export default function AgendamentosPage() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const { data: clientes = [] } = useClientes()
  const { data: procedimentos = [] } = useProcedimentos()
  const { data: agendamentos = [] } = useAgendamentos()
  const salvar = useSalvarAgendamento()
  const excluir = useExcluirAgendamento()

  const [modalAberto, setModalAberto] = useState<{
    valores: AgendamentoFormValues
    original?: Agendamento
  } | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState<Agendamento | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const atualizarViewport = () => setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', atualizarViewport)
    return () => mediaQuery.removeEventListener('change', atualizarViewport)
  }, [])

  const eventos = useMemo(
    () =>
      agendamentos.map((a) => ({
        id: a.id,
        title: tituloEvento(a),
        start: `${a.data}T${normalizarHorario(a.hora_inicio)}`,
        end: `${a.data}T${normalizarHorario(a.hora_fim)}`,
        backgroundColor: a.tipo === 'bloqueio' ? 'var(--color-wine)' : a.confirmado ? 'var(--color-sage)' : 'var(--color-gold)',
        extendedProps: { agendamento: a },
      })),
    [agendamentos]
  )

  function abrirNovo(dataStr: string, horaStr?: string, tipo: 'atendimento' | 'bloqueio' = 'atendimento') {
    setModalAberto({ valores: agendamentoParaFormulario(undefined, dataStr, horaStr, tipo) })
  }

  function abrirEdicao(agendamento: Agendamento) {
    setModalAberto({ valores: agendamentoParaFormulario(agendamento), original: agendamento })
  }

  function handleDateClick(arg: DateClickArg) {
    const [dataStr, horaStr] = arg.dateStr.split('T')
    abrirNovo(dataStr, horaStr ? horaStr.slice(0, 5) : undefined)
  }

  function handleEventClick(arg: EventClickArg) {
    const agendamento = arg.event.extendedProps.agendamento as Agendamento
    abrirEdicao(agendamento)
  }

  async function handleSalvar(valores: AgendamentoFormValues, procedimentosSelecionados: Procedimento[]) {
    await salvar.mutateAsync({ valores, procedimentosSelecionados })
    setModalAberto(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl">Agenda</h1>
          <p className="text-sm text-ink/60 mt-0.5">Clique num horário vazio para agendar, ou num bloco para editar</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink/60">
          <button type="button" onClick={() => abrirNovo(new Date().toISOString().slice(0, 10), undefined, 'bloqueio')} className="btn-secondary">
            Bloquear agenda
          </button>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sage inline-block" /> Confirmado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gold inline-block" /> Pendente
          </span>
        </div>
      </div>

      <div className="card min-w-0 overflow-hidden p-2 md:p-4">
        <FullCalendar
          key={isMobile ? 'mobile' : 'desktop'}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
          headerToolbar={isMobile
            ? { left: 'prev,next', center: 'title', right: 'today' }
            : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
          locale="pt-br"
          buttonText={{ today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia', list: 'Lista' }}
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          height="auto"
          nowIndicator
          selectable
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          events={eventos}
          eventContent={renderEvento}
          eventOverlap={false}
        />
      </div>

      {modalAberto && (
        <AgendamentoModal
          clientes={clientes}
          procedimentos={procedimentos}
          agendamentos={agendamentos}
          valoresIniciais={modalAberto.valores}
          agendamentoOriginal={modalAberto.original}
          onClose={() => setModalAberto(null)}
          onSalvar={handleSalvar}
          salvando={salvar.isPending}
          onExcluir={
            modalAberto.original
              ? () => {
                  setConfirmarExclusao(modalAberto.original!)
                }
              : undefined
          }
        />
      )}

      {confirmarExclusao && (
        <Modal title="Excluir agendamento" onClose={() => setConfirmarExclusao(null)} widthClass="max-w-sm">
          <p className="text-sm text-ink/70">Tem certeza que deseja excluir este agendamento?</p>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setConfirmarExclusao(null)} className="btn-secondary">
              Cancelar
            </button>
            <button
              onClick={async () => {
                await excluir.mutateAsync(confirmarExclusao.id)
                setConfirmarExclusao(null)
                setModalAberto(null)
              }}
              className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function tituloEvento(a: Agendamento): string {
  if (a.tipo === 'bloqueio') return `Bloqueado — ${a.motivo ?? 'Sem motivo'}`
  const nomes = a.procedimentos?.map((p) => p.procedimento?.nome).filter(Boolean) ?? []
  const cliente = a.cliente?.nome_completo ?? 'Cliente'
  return `${cliente} — ${nomes.join(', ')}`
}

function normalizarHorario(horario: string): string {
  return horario.slice(0, 5)
}

function renderEvento(arg: EventContentArg) {
  const a = arg.event.extendedProps.agendamento as Agendamento
  return (
    <div className="flex items-start gap-1 px-1 py-0.5 text-white text-[11px] leading-tight overflow-hidden">
      {a.tipo === 'bloqueio' ? <Clock3 size={11} className="mt-0.5 shrink-0" /> : a.confirmado ? <CheckCircle2 size={11} className="mt-0.5 shrink-0" /> : <Clock3 size={11} className="mt-0.5 shrink-0" />}
      <div className="overflow-hidden">
        <div className="font-medium truncate">{arg.event.title}</div>
        <div className="opacity-80">{arg.timeText}</div>
      </div>
    </div>
  )
}
