import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Phone, Mail } from 'lucide-react'
import { useClientes, useExcluirCliente, useSalvarCliente } from '../hooks/useClientes'
import type { Cliente } from '../types'
import { Modal } from '../components/Modal'
import { maskCPF, maskTelefone } from '../lib/formatters'

const CLIENTE_VAZIO: Partial<Cliente> = {
  nome_completo: '',
  cpf: '',
  data_nasc: '',
  telefone: '',
  email: '',
}

export default function ClientesPage() {
  const { data: clientes = [], isLoading } = useClientes()
  const salvar = useSalvarCliente()
  const excluir = useExcluirCliente()

  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<Partial<Cliente> | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState<Cliente | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return clientes
    return clientes.filter(
      (c) =>
        c.nome_completo.toLowerCase().includes(termo) || c.cpf.replace(/\D/g, '').includes(termo)
    )
  }, [busca, clientes])

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!editando?.nome_completo || !editando?.cpf || !editando?.telefone) {
      setErro('Nome, CPF e telefone são obrigatórios.')
      return
    }
    try {
      await salvar.mutateAsync(editando)
      setEditando(null)
      setErro(null)
    } catch (err: any) {
      setErro(err.message?.includes('duplicate') ? 'Já existe uma cliente com este CPF.' : err.message)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Clientes</h1>
          <p className="text-sm text-ink/60 mt-0.5">{clientes.length} cadastradas</p>
        </div>
        <button
          onClick={() => setEditando({ ...CLIENTE_VAZIO })}
          className="inline-flex items-center gap-2 bg-wine text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-wine-dark"
        >
          <Plus size={16} /> Nova cliente
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wine/30"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/50">Carregando...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-ink/50">Nenhuma cliente encontrada.</p>
      ) : (
        <div className="space-y-2">
          {filtrados.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between bg-surface border border-line rounded-xl px-4 py-3"
            >
              <div>
                <p className="font-medium">{c.nome_completo}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/55 mt-1">
                  <span>CPF: {c.cpf}</span>
                  <span className="inline-flex items-center gap-1">
                    <Phone size={12} /> {c.telefone}
                  </span>
                  {c.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail size={12} /> {c.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditando(c)}
                  className="p-2 rounded-lg text-ink/50 hover:bg-porcelain hover:text-wine"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmarExclusao(c)}
                  className="p-2 rounded-lg text-ink/50 hover:bg-porcelain hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editando && (
        <Modal title={editando.id ? 'Editar cliente' : 'Nova cliente'} onClose={() => setEditando(null)}>
          <form onSubmit={handleSalvar} className="space-y-4">
            {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}
            <Campo label="Nome completo *">
              <input
                required
                value={editando.nome_completo}
                onChange={(e) => setEditando({ ...editando, nome_completo: e.target.value })}
                className="input"
              />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="CPF *">
                <input
                  required
                  value={editando.cpf}
                  onChange={(e) => setEditando({ ...editando, cpf: maskCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  className="input"
                />
              </Campo>
              <Campo label="Data de nascimento">
                <input
                  type="date"
                  value={editando.data_nasc ?? ''}
                  onChange={(e) => setEditando({ ...editando, data_nasc: e.target.value })}
                  className="input"
                />
              </Campo>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Telefone (WhatsApp) *">
                <input
                  required
                  value={editando.telefone}
                  onChange={(e) => setEditando({ ...editando, telefone: maskTelefone(e.target.value) })}
                  placeholder="(61) 99999-9999"
                  className="input"
                />
              </Campo>
              <Campo label="E-mail">
                <input
                  type="email"
                  value={editando.email ?? ''}
                  onChange={(e) => setEditando({ ...editando, email: e.target.value })}
                  className="input"
                />
              </Campo>
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
        <Modal title="Excluir cliente" onClose={() => setConfirmarExclusao(null)} widthClass="max-w-sm">
          <p className="text-sm text-ink/70">
            Tem certeza que deseja excluir <strong>{confirmarExclusao.nome_completo}</strong>? Esta ação
            não pode ser desfeita.
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

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink/60 mb-1">{label}</span>
      {children}
    </label>
  )
}
