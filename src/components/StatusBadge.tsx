export function StatusBadge({ confirmado }: { confirmado: boolean }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ' +
        (confirmado ? 'bg-sage/15 text-sage' : 'bg-gold/15 text-gold')
      }
    >
      <span className={'h-1.5 w-1.5 rounded-full ' + (confirmado ? 'bg-sage' : 'bg-gold')} />
      {confirmado ? 'Confirmado' : 'Pendente'}
    </span>
  )
}
