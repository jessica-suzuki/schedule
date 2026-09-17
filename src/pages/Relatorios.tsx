import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useProcedimentos } from '../hooks/useProcedimentos'
import { useRelatorioAgendamentos } from '../hooks/useAgendamentos'
import { formatarMoeda, formatarDataBR } from '../lib/formatters'
import type { Agendamento } from '../types'

type LinhaRelatorio = {
  data: string
  procedimento: string
  valor: number
  cliente: string
}

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [procedimentoId, setProcedimentoId] = useState('')
  const { data: procedimentos = [] } = useProcedimentos()
  const { data: agendamentos = [], isLoading, isError } = useRelatorioAgendamentos({
    dataInicio,
    dataFim,
    procedimentoId,
  })

  const linhas = useMemo(() => criarLinhas(agendamentos), [agendamentos])
  const totalValor = linhas.reduce((total, linha) => total + linha.valor, 0)

  function limparFiltros() {
    setDataInicio('')
    setDataFim('')
    setProcedimentoId('')
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl mb-1">Relatório de procedimentos</h1>
          <p className="text-sm text-ink/60">Consulte os procedimentos realizados por período e tipo.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportarCSV(linhas)} disabled={!linhas.length} className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50">
            <Download size={15} /> CSV
          </button>
          <button onClick={() => exportarXLSX(linhas)} disabled={!linhas.length} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            <Download size={15} /> XLSX
          </button>
        </div>
      </div>

      <div className="card p-4 mb-5">
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <CampoFiltro label="Data início">
            <input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} className="input" />
          </CampoFiltro>
          <CampoFiltro label="Data fim">
            <input type="date" value={dataFim} min={dataInicio || undefined} onChange={(event) => setDataFim(event.target.value)} className="input" />
          </CampoFiltro>
          <CampoFiltro label="Tipo de procedimento">
            <select value={procedimentoId} onChange={(event) => setProcedimentoId(event.target.value)} className="input">
              <option value="">Todos os procedimentos</option>
              {procedimentos.map((procedimento) => (
                <option key={procedimento.id} value={procedimento.id}>{procedimento.nome}</option>
              ))}
            </select>
          </CampoFiltro>
        </div>
        {(dataInicio || dataFim || procedimentoId) && (
          <button onClick={limparFiltros} className="text-sm text-wine hover:text-wine-dark mt-3">Limpar filtros</button>
        )}
      </div>

      {isError && <p className="text-sm text-red-600 mb-4">Não foi possível carregar o relatório.</p>}
      {isLoading ? (
        <p className="text-sm text-ink/50">Carregando...</p>
      ) : linhas.length === 0 ? (
        <p className="text-sm text-ink/50">Nenhum procedimento encontrado para os filtros selecionados.</p>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-porcelain text-ink/60 text-xs">
              <tr>
                {['Data', 'Procedimento', 'Valor', 'Cliente'].map((coluna) => (
                  <th key={coluna} className="text-left px-4 py-2.5 font-medium">{coluna}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {linhas.map((linha, index) => (
                <tr key={`${linha.data}-${linha.cliente}-${linha.procedimento}-${index}`}>
                  <td className="px-4 py-2.5 whitespace-nowrap">{formatarDataBR(linha.data)}</td>
                  <td className="px-4 py-2.5">{linha.procedimento}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{formatarMoeda(linha.valor)}</td>
                  <td className="px-4 py-2.5">{linha.cliente}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-porcelain border-t-2 border-line font-semibold">
              <tr>
                <td className="px-4 py-3" colSpan={2}>Total</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatarMoeda(totalValor)}</td>
                <td className="px-4 py-3">{linhas.length} {linhas.length === 1 ? 'procedimento' : 'procedimentos'}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

function criarLinhas(agendamentos: Agendamento[]): LinhaRelatorio[] {
  return agendamentos.flatMap((agendamento) =>
    (agendamento.procedimentos ?? []).map((item) => ({
      data: agendamento.data,
      procedimento: item.procedimento?.nome ?? '—',
      valor: Number(item.preco_unitario),
      cliente: agendamento.cliente?.nome_completo ?? '—',
    }))
  )
}

function CampoFiltro({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-ink/60 mb-1">{label}</span>{children}</label>
}

function exportarCSV(linhas: LinhaRelatorio[]) {
  const conteudo = [
    ['Data', 'Procedimento', 'Valor', 'Cliente'],
    ...linhas.map((linha) => [formatarDataBR(linha.data), linha.procedimento, linha.valor.toFixed(2).replace('.', ','), linha.cliente]),
    [],
    ['Total de procedimentos', String(linhas.length)],
    ['Total do valor', linhas.reduce((total, linha) => total + linha.valor, 0).toFixed(2).replace('.', ',')],
  ]
  const csv = conteudo.map((linha) => linha.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(';')).join('\n')
  baixarArquivo(`\uFEFF${csv}`, `relatorio-procedimentos-${dataAtual()}.csv`, 'text/csv;charset=utf-8;')
}

function exportarXLSX(linhas: LinhaRelatorio[]) {
  const dados = [
    ['Data', 'Procedimento', 'Valor', 'Cliente'],
    ...linhas.map((linha) => [formatarDataBR(linha.data), linha.procedimento, linha.valor, linha.cliente]),
    [],
    ['Total de procedimentos', linhas.length],
    ['Total do valor', linhas.reduce((total, linha) => total + linha.valor, 0)],
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(dados), 'Relatório')
  XLSX.writeFile(workbook, `relatorio-procedimentos-${dataAtual()}.xlsx`)
}

function baixarArquivo(conteudo: string, nome: string, tipo: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
  link.download = nome
  link.click()
  URL.revokeObjectURL(link.href)
}

function dataAtual() {
  return new Date().toISOString().slice(0, 10)
}
