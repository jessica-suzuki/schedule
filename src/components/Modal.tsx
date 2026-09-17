import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  widthClass?: string
}

export function Modal({ title, onClose, children, widthClass = 'max-w-lg' }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-ink/40 backdrop-blur-[2px]">
      <div
        className={`w-full ${widthClass} bg-surface rounded-t-2xl md:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-surface">
          <h2 className="font-display text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink/50 hover:text-ink rounded-full p-1 hover:bg-porcelain"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
