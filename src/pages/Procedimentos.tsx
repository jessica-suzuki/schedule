import { useState } from 'react'
import { Plus, Pencil, Trash2, Clock, Tag } from 'lucide-react'
import {
  useProcedimentos,
  useSalvarProcedimento,
  useExcluirProcedimento,
} from '../hooks/useProcedimentos'
import type { Procedimento } from '../types'
import { Modal } from '../components/Modal'
import { formatarDuracao, formatarMoeda } from '../lib/formatters'

const VAZIO: Partial<Procedimento> = { nome: '', descricao: '', duracao_min: 30, preco: 0, ativo: true }

export default function ProcedimentosPage() {
  const { data: procedimentos = [], isLoading } = useProcedimentos()
  const salvar = useSalvarProcedimento()
  const excluir = useExcluirProcedimento()

  const [editando, setEditando] = useState<Partial<Procedimento> | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState<Procedimento | null>(null)

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!editando?.nome || !editando?.duracao_min || editando?.preco == null) return
    await salvar.mutateAsync(editando)
    setEditando(null)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Procedimentos</h1>
          <p className="text-sm text-ink/60 mt-0.5">{procedimentos.length} cadastrados</p>
        </div>
        <button onClick={() => setEditando({ ...VAZIO })} className="btn-primary inline-flex items-center gap-2">
          <Plus size={16} /> Novo procedimento
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Carregando...</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {procedimentos.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{p.nome}</h3>
                <div className="flex gap-1 -mt-1 -mr-1">
                  <button
                    onClick={() => setEditando(p)}
                    className="p-1.5 rounded-lg text-ink/50 hover:bg-porcelain hover:text-wine"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmarExclusao(p)}
                    className="p-1.5 rounded-lg text-ink/50 hover:bg-porcelain hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {p.descricao && <p className="text-sm text-ink/60 mt-1">{p.descricao}</p>}
              <div className="flex gap-4 mt-3 text-sm">
                <span className="inline-flex items-center gap-1.5 text-ink/70">
                  <Clock size={14} /> {formatarDuracao(p.duracao_min)}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-wine">
                  <Tag size={14} /> {formatarMoeda(p.preco)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editando && (
        <Modal title={editando.id ? 'Editar procedimento' : 'Novo procedimento'} onClose={() => setEditando(null)}>
          <form onSubmit={handleSalvar} className="space-y-4">
            <label className="block">
              <span className="block text-xs font-medium text-ink/60 mb-1">Nome *</span>
              <input
                required
                value={editando.nome}
                onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                className="input"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-ink/60 mb-1">Descrição</span>
              <textarea
                value={editando.descricao ?? ''}
                onChange={(e) => setEditando({ ...editando, descricao: e.target.value })}
                rows={3}
                className="input resize-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-ink/60 mb-1">Duração (minutos) *</span>
                <input
                  required
                  type="number"
                  min={5}
                  step={5}
                  value={editando.duracao_min}
                  onChange={(e) => setEditando({ ...editando, duracao_min: Number(e.target.value) })}
                  className="input"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-ink/60 mb-1">Preço (R$) *</span>
                <input
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  value={editando.preco}
                  onChange={(e) => setEditando({ ...editando, preco: Number(e.target.value) })}
                  className="input"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditando(null)} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={salvar.isPending} className="btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmarExclusao && (
        <Modal title="Excluir procedimento" onClose={() => setConfirmarExclusao(null)} widthClass="max-w-sm">
          <p className="text-sm text-ink/70">
            Tem certeza que deseja excluir <strong>{confirmarExclusao.nome}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setConfirmarExclusao(null)} className="btn-secondary">
              Cancelar
            </button>
            <button
              onClick={async () => {
                await excluir.mutateAsync(confirmarExclusao.id)
                setConfirmarExclusao(null)
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
