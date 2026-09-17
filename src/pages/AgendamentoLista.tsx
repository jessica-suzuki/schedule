import { useMemo, useState } from 'react'
import { CalendarPlus, CheckCircle2, Clock3, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useClientes } from '../hooks/useClientes'
import { useProcedimentos } from '../hooks/useProcedimentos'
import {
  useAgendamentos,
  useExcluirAgendamento,
  useSalvarAgendamento,
} from '../hooks/useAgendamentos'
import { AgendamentoModal } from '../components/AgendamentoModal'
import { Modal } from '../components/Modal'
import type { Agendamento, AgendamentoFormValues, Procedimento } from '../types'
import { formatarDataBR, formatarMoeda } from '../lib/formatters'

function valoresDoAgendamento(agendamento?: Agendamento): AgendamentoFormValues {
  if (!agendamento) {
    return {
      cliente_id: '',
      tipo: 'atendimento',
      data: new Date().toISOString().slice(0, 10),
      hora_inicio: '09:00',
      hora_fim: '10:00',
      procedimento_ids: [],
      desconto_tipo: 'valor',
      desconto_valor: 0,
      forma_pagamento: '',
      observacao: '',
      motivo: '',
      confirmado: false,
    }
  }

  return {
    id: agendamento.id,
    tipo: agendamento.tipo ?? 'atendimento',
    cliente_id: agendamento.cliente_id ?? '',
    data: agendamento.data,
    hora_inicio: agendamento.hora_inicio.slice(0, 5),
    hora_fim: agendamento.hora_fim.slice(0, 5),
    procedimento_ids: agendamento.procedimentos?.map((item) => item.procedimento_id) ?? [],
    desconto_tipo: agendamento.desconto_tipo ?? 'valor',
    desconto_valor: agendamento.desconto_valor ?? 0,
    forma_pagamento: agendamento.forma_pagamento ?? '',
    observacao: agendamento.observacao ?? '',
    motivo: agendamento.motivo ?? '',
    confirmado: agendamento.confirmado,
  }
}

export default function AgendamentoListaPage() {
  const { data: clientes = [], isLoading: carregandoClientes } = useClientes()
  const { data: procedimentos = [], isLoading: carregandoProcedimentos } = useProcedimentos()
  const { data: agendamentos = [], isLoading } = useAgendamentos()
  const salvar = useSalvarAgendamento()
  const excluir = useExcluirAgendamento()
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<Agendamento | null>(null)
  const [criando, setCriando] = useState(false)
  const [confirmarExclusao, setConfirmarExclusao] = useState<Agendamento | null>(null)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return agendamentos
    return agendamentos.filter((agendamento) => {
      const cliente = agendamento.cliente?.nome_completo.toLowerCase() ?? ''
      const motivo = agendamento.motivo?.toLowerCase() ?? ''
      const nomes = agendamento.procedimentos
        ?.map((item) => item.procedimento?.nome.toLowerCase() ?? '')
        .join(' ') ?? ''
      return cliente.includes(termo) || nomes.includes(termo) || motivo.includes(termo)
    })
  }, [agendamentos, busca])

  async function handleSalvar(valores: AgendamentoFormValues, selecionados: Procedimento[]) {
    await salvar.mutateAsync({ valores, procedimentosSelecionados: selecionados })
    setEditando(null)
    setCriando(false)
  }

  const modalAgendamento = editando ?? (criando ? undefined : null)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Agendamentos</h1>
          <p className="text-sm text-ink/60 mt-0.5">{agendamentos.length} cadastrados</p>
        </div>
        <button
          onClick={() => setCriando(true)}
          className="inline-flex items-center gap-2 bg-wine text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-wine-dark"
        >
          <Plus size={16} /> Novo agendamento
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por cliente ou procedimento..."
          className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wine/30"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Carregando...</p>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-12 text-sm text-ink/50">
          <CalendarPlus size={28} className="mx-auto mb-2 text-ink/30" />
          Nenhum agendamento encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((agendamento) => (
            <div
              key={agendamento.id}
              className="flex items-center justify-between gap-4 bg-surface border border-line rounded-xl px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{agendamento.tipo === 'bloqueio' ? 'Agenda bloqueada' : agendamento.cliente?.nome_completo ?? 'Cliente'}</p>
                  {agendamento.confirmado ? (
                    <span className="inline-flex items-center gap-1 text-xs text-sage shrink-0">
                      <CheckCircle2 size={13} /> Confirmado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gold shrink-0">
                      <Clock3 size={13} /> Pendente
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/55 mt-1">
                  <span>{formatarDataBR(agendamento.data)} às {agendamento.hora_inicio.slice(0, 5)}</span>
                  <span className="truncate">{agendamento.tipo === 'bloqueio' ? `Motivo: ${agendamento.motivo ?? '—'}` : agendamento.procedimentos?.map((item) => item.procedimento?.nome).filter(Boolean).join(', ') || 'Sem procedimento'}</span>
                  <span>{agendamento.tipo === 'bloqueio' ? 'Bloqueio' : formatarMoeda(agendamento.valor_final)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditando(agendamento)}
                  aria-label="Editar agendamento"
                  className="p-2 rounded-lg text-ink/50 hover:bg-porcelain hover:text-wine"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmarExclusao(agendamento)}
                  aria-label="Excluir agendamento"
                  className="p-2 rounded-lg text-ink/50 hover:bg-porcelain hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAgendamento !== null && !carregandoClientes && !carregandoProcedimentos && (
        <AgendamentoModal
          clientes={clientes}
          procedimentos={procedimentos}
          agendamentos={agendamentos}
          valoresIniciais={valoresDoAgendamento(modalAgendamento)}
          agendamentoOriginal={modalAgendamento}
          onClose={() => {
            setEditando(null)
            setCriando(false)
          }}
          onSalvar={handleSalvar}
          salvando={salvar.isPending}
          onExcluir={modalAgendamento ? () => setConfirmarExclusao(modalAgendamento) : undefined}
        />
      )}

      {confirmarExclusao && (
        <Modal title="Excluir agendamento" onClose={() => setConfirmarExclusao(null)} widthClass="max-w-sm">
          <p className="text-sm text-ink/70">Tem certeza que deseja excluir este agendamento?</p>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setConfirmarExclusao(null)} className="btn-secondary">Cancelar</button>
            <button
              onClick={async () => {
                await excluir.mutateAsync(confirmarExclusao.id)
                setConfirmarExclusao(null)
                setEditando(null)
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