import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Wallet, AlertCircle, Users2 } from 'lucide-react'
import { useAgendamentos } from '../hooks/useAgendamentos'
import { formatarMoeda } from '../lib/formatters'
import { StatusBadge } from '../components/StatusBadge'
import { BotaoWhatsApp } from '../components/BotaoWhatsApp'

function hojeIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function Dashboard() {
  const { data: agendamentos = [], isLoading } = useAgendamentos()
  const hoje = hojeIso()
  const mesAtual = hoje.slice(0, 7)

  const agendamentosHoje = useMemo(
    () => agendamentos.filter((a) => a.data === hoje).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    [agendamentos, hoje]
  )

  const agendamentosMes = useMemo(() => agendamentos.filter((a) => a.data.startsWith(mesAtual)), [agendamentos, mesAtual])

  const faturamentoMes = agendamentosMes.reduce((t, a) => t + Number(a.valor_final), 0)
  const pendentes = useMemo(() => agendamentos.filter((a) => !a.confirmado && a.data >= hoje), [agendamentos, hoje])

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Bem-vinda de volta</h1>
      <p className="text-sm text-ink/60 mb-6">Resumo de hoje, {formatarDataExtenso(hoje)}</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Cartao
          icone={<CalendarClock size={18} />}
          label="Atendimentos hoje"
          valor={String(agendamentosHoje.length)}
        />
        <Cartao icone={<Wallet size={18} />} label="Faturamento do mês" valor={formatarMoeda(faturamentoMes)} />
        <Cartao icone={<AlertCircle size={18} />} label="Aguardando confirmação" valor={String(pendentes.length)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <h2 className="font-display text-lg mb-3">Atendimentos de hoje</h2>
          {isLoading ? (
            <p className="text-sm text-ink/50">Carregando...</p>
          ) : agendamentosHoje.length === 0 ? (
            <p className="text-sm text-ink/50 card p-4">Nenhum agendamento para hoje.</p>
          ) : (
            <div className="space-y-2">
              {agendamentosHoje.map((a) => (
                <div key={a.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{a.cliente?.nome_completo}</p>
                    <p className="text-xs text-ink/55">
                      {a.hora_inicio} – {a.hora_fim} ·{' '}
                      {a.procedimentos?.map((p) => p.procedimento?.nome).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge confirmado={a.confirmado} />
                    {a.cliente && <BotaoWhatsApp agendamento={a} cliente={a.cliente} compact />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-lg mb-3">Aguardando confirmação</h2>
          {pendentes.length === 0 ? (
            <p className="text-sm text-ink/50 card p-4">Tudo confirmado por aqui. ✨</p>
          ) : (
            <div className="space-y-2">
              {pendentes.slice(0, 6).map((a) => (
                <div key={a.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{a.cliente?.nome_completo}</p>
                    <p className="text-xs text-ink/55">
                      {a.data.split('-').reverse().join('/')} às {a.hora_inicio}
                    </p>
                  </div>
                  {a.cliente && <BotaoWhatsApp agendamento={a} cliente={a.cliente} compact />}
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/agenda" className="inline-flex items-center gap-1.5 text-sm text-wine mt-3 hover:underline">
            <Users2 size={14} /> Ver agenda completa
          </Link>
        </section>
      </div>
    </div>
  )
}

function Cartao({ icone, label, valor }: { icone: React.ReactNode; label: string; valor: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-wine mb-2">{icone}</div>
      <p className="text-2xl font-display">{valor}</p>
      <p className="text-xs text-ink/55 mt-0.5">{label}</p>
    </div>
  )
}

function formatarDataExtenso(iso: string) {
  const data = new Date(`${iso}T00:00:00`)
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}
