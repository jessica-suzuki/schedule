import { NavLink } from 'react-router-dom'
import { CalendarDays, CalendarPlus, LayoutDashboard, Users, Sparkles, BarChart3, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { supabase } from '../lib/supabaseClient'

const ITENS = [
  { to: '/admin', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/admin/agendamentos', label: 'Agendamentos', icon: CalendarPlus },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/procedimentos', label: 'Procedimentos', icon: Sparkles },
  { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-60 shrink-0 bg-wine text-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <img src="/logo_michelle.png" alt="Studio Michelle Lima" className="w-full max-w-[188px] h-auto" />
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {ITENS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => supabase.auth.signOut()}
        className="flex items-center gap-3 mx-3 mb-4 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
      >
        <LogOut size={18} /> Sair
      </button>
      <div className="px-6 py-4 text-xs text-white/50 border-t border-white/10">Gestão de agenda &amp; financeiro</div>
    </aside>
  )
}
