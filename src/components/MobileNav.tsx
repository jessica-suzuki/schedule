import { NavLink } from 'react-router-dom'
import { CalendarDays, CalendarPlus, LayoutDashboard, Users, Sparkles, BarChart3 } from 'lucide-react'
import clsx from 'clsx'

const ITENS = [
  { to: '/', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/agendamentos', label: 'Agendamentos', icon: CalendarPlus },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/procedimentos', label: 'Serviços', icon: Sparkles },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-line flex justify-around py-1.5 z-40">
      {ITENS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-0.5 px-2 py-1 text-[11px]',
              isActive ? 'text-wine font-medium' : 'text-ink/50'
            )
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
