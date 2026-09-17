import { useMemo, useState } from 'react'
import { Modal } from './Modal'
import { BotaoWhatsApp } from './BotaoWhatsApp'
import type { Agendamento, AgendamentoFormValues, Cliente, Procedimento, TipoAgendamento, TipoDesconto } from '../types'
import {
  somarDuracao,
  somarPreco,
  somarMinutosAoHorario,
  calcularValorFinal,
  existeConflito,
} from '../lib/calculations'
import { formatarDuracao, formatarMoeda, FORMAS_PAGAMENTO } from '../lib/formatters'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface Props {
  clientes: Cliente[]
  procedimentos: Procedimento[]
  agendamentos: Agendamento[]
  valoresIniciais: AgendamentoFormValues
  agendamentoOriginal?: Agendamento
  onClose: () => void
  onSalvar: (valores: AgendamentoFormValues, procedimentosSelecionados: Procedimento[]) => Promise<void>
  onExcluir?: () => void
  salvando?: boolean
}

export function AgendamentoModal({
  clientes,
  procedimentos,
  agendamentos,
  valoresIniciais,
  agendamentoOriginal,
  onClose,
  onSalvar,
  onExcluir,
  salvando,
}: Props) {
  const [valores, setValores] = useState<AgendamentoFormValues>(valoresIniciais)
  const [erro, setErro] = useState<string | null>(null)

  const procedimentosSelecionados = useMemo(
    () => procedimentos.filter((p) => valores.procedimento_ids.includes(p.id)),
    [procedimentos, valores.procedimento_ids]
  )

  const duracaoTotal = somarDuracao(procedimentosSelecionados)
  const subtotal = somarPreco(procedimentosSelecionados)
  const horaFim = valores.hora_inicio ? somarMinutosAoHorario(valores.hora_inicio, duracaoTotal) : '--:--'
  const valorFinal = calcularValorFinal(subtotal, valores.desconto_tipo, valores.desconto_valor)

  const clienteSelecionada = clientes.find((c) => c.id === valores.cliente_id)

  function toggleProcedimento(id: string) {
    setValores((v) => ({
      ...v,
      procedimento_ids: v.procedimento_ids.includes(id)
        ? v.procedimento_ids.filter((p) => p !== id)
        : [...v.procedimento_ids, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (!valores.data || !valores.hora_inicio) return setErro('Informe data e hora de início.')
    if (valores.tipo === 'bloqueio') {
      if (!valores.hora_fim) return setErro('Informe o horário de término.')
      if (valores.hora_fim <= valores.hora_inicio) return setErro('O término deve ser depois do início.')
      if (!valores.motivo.trim()) return setErro('Informe o motivo do bloqueio.')
    } else {
      if (!valores.cliente_id) return setErro('Selecione a cliente.')
      if (procedimentosSelecionados.length === 0) return setErro('Selecione ao menos 1 procedimento.')
    }

    const horaFimConflito = valores.tipo === 'bloqueio' ? valores.hora_fim : horaFim

    const conflito = existeConflito(
      { data: valores.data, hora_inicio: valores.hora_inicio, hora_fim: horaFimConflito },
      agendamentos,
      valores.id
    )
    if (conflito) {
      setErro(
        `Conflito de horário: já existe um agendamento das ${conflito.hora_inicio} às ${conflito.hora_fim} nesta data.`
      )
      return
    }

    try {
      await onSalvar(valores, procedimentosSelecionados)
    } catch (error) {
      setErro(formatarErroSalvamento(error))
    }
  }

  return (
    <Modal
      title={valores.id ? 'Editar agendamento' : 'Novo agendamento'}
      onClose={onClose}
      widthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && (
          <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {erro}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {(['atendimento', 'bloqueio'] as TipoAgendamento[]).map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setValores({ ...valores, tipo })}
              className={tipo === valores.tipo ? 'btn-primary' : 'btn-secondary'}
            >
              {tipo === 'atendimento' ? 'Atendimento' : 'Bloqueio de agenda'}
            </button>
          ))}
        </div>

        {valores.tipo === 'atendimento' && (
          <label className="block">
            <span className="block text-xs font-medium text-ink/60 mb-1">Cliente *</span>
            <select
              required
              value={valores.cliente_id}
              onChange={(e) => setValores({ ...valores, cliente_id: e.target.value })}
              className="input"
            >
              <option value="">Selecione...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome_completo}</option>
              ))}
            </select>
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-ink/60 mb-1">Data *</span>
            <input
              required
              type="date"
              value={valores.data}
              onChange={(e) => setValores({ ...valores, data: e.target.value })}
              className="input"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ink/60 mb-1">Hora de início *</span>
            <input
              required
              type="time"
              value={valores.hora_inicio}
              onChange={(e) => setValores({ ...valores, hora_inicio: e.target.value })}
              className="input"
            />
          </label>
          {valores.tipo === 'bloqueio' && (
            <label className="block">
              <span className="block text-xs font-medium text-ink/60 mb-1">Hora de término *</span>
              <input
                required
                type="time"
                value={valores.hora_fim}
                onChange={(e) => setValores({ ...valores, hora_fim: e.target.value })}
                className="input"
              />
            </label>
          )}
        </div>

        {valores.tipo === 'atendimento' && <div>
          <span className="block text-xs font-medium text-ink/60 mb-1.5">Procedimentos *</span>
          <div className="border border-line rounded-lg divide-y divide-line max-h-40 overflow-y-auto">
            {procedimentos.map((p) => (
              <label
                key={p.id}
                className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-porcelain"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={valores.procedimento_ids.includes(p.id)}
                    onChange={() => toggleProcedimento(p.id)}
                    className="accent-[#7a3b4e]"
                  />
                  {p.nome}
                </span>
                <span className="text-ink/50 text-xs">
                  {formatarDuracao(p.duracao_min)} · {formatarMoeda(p.preco)}
                </span>
              </label>
            ))}
          </div>
        </div>}

        {valores.tipo === 'atendimento' && <div className="grid grid-cols-2 gap-3 bg-porcelain rounded-lg p-3 text-sm">
          <div>
            <span className="text-ink/50 text-xs block">Duração total</span>
            <span className="font-medium">{formatarDuracao(duracaoTotal)}</span>
          </div>
          <div>
            <span className="text-ink/50 text-xs block">Término previsto</span>
            <span className="font-medium">{horaFim}</span>
          </div>
          <div>
            <span className="text-ink/50 text-xs block">Subtotal</span>
            <span className="font-medium">{formatarMoeda(subtotal)}</span>
          </div>
          <div>
            <span className="text-ink/50 text-xs block">Valor final</span>
            <span className="font-semibold text-wine">{formatarMoeda(valorFinal)}</span>
          </div>
        </div>}

        {valores.tipo === 'atendimento' && <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <label className="block">
            <span className="block text-xs font-medium text-ink/60 mb-1">Desconto</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={valores.desconto_valor}
              onChange={(e) => setValores({ ...valores, desconto_valor: Number(e.target.value) })}
              className="input"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ink/60 mb-1">Tipo</span>
            <select
              value={valores.desconto_tipo}
              onChange={(e) => setValores({ ...valores, desconto_tipo: e.target.value as TipoDesconto })}
              className="input"
            >
              <option value="valor">R$</option>
              <option value="percentual">%</option>
            </select>
          </label>
        </div>}

        {valores.tipo === 'atendimento' && <label className="block">
          <span className="block text-xs font-medium text-ink/60 mb-1">Forma de pagamento</span>
          <select
            value={valores.forma_pagamento}
            onChange={(e) => setValores({ ...valores, forma_pagamento: e.target.value as any })}
            className="input"
          >
            <option value="">Selecione...</option>
            {Object.entries(FORMAS_PAGAMENTO).map(([valor, label]) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
        </label>}

        {valores.tipo === 'atendimento' && <label className="block">
          <span className="block text-xs font-medium text-ink/60 mb-1">Observação</span>
          <textarea
            value={valores.observacao}
            onChange={(e) => setValores({ ...valores, observacao: e.target.value })}
            rows={2}
            className="input resize-none"
          />
        </label>}

        {valores.tipo === 'bloqueio' && <label className="block">
          <span className="block text-xs font-medium text-ink/60 mb-1">Motivo *</span>
          <textarea
            required
            value={valores.motivo}
            onChange={(e) => setValores({ ...valores, motivo: e.target.value })}
            rows={2}
            className="input resize-none"
          />
        </label>}

        {valores.tipo === 'atendimento' && <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={valores.confirmado}
            onChange={(e) => setValores({ ...valores, confirmado: e.target.checked })}
            className="accent-[#5b7b63]"
          />
          Agendamento confirmado
        </label>}

        <div className="flex items-center justify-between pt-2 border-t border-line">
          <div>
            {onExcluir && (
              <button
                type="button"
                onClick={onExcluir}
                className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 size={15} /> Excluir
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {agendamentoOriginal && clienteSelecionada && (
              <BotaoWhatsApp agendamento={agendamentoOriginal} cliente={clienteSelecionada} compact />
            )}
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="btn-primary">
              Salvar
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

function formatarErroSalvamento(error: unknown): string {
  if (error instanceof Error) return error.message

  if (typeof error === 'object' && error !== null) {
    const erroSupabase = error as { message?: string; details?: string; hint?: string }
    return [erroSupabase.message, erroSupabase.details, erroSupabase.hint].filter(Boolean).join(' ') || 'Não foi possível salvar o bloqueio.'
  }

  return 'Não foi possível salvar o bloqueio.'
}
