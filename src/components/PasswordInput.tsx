import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visivel ? 'text' : 'password'}
        className={clsx('pr-10', className)}
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        tabIndex={-1}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-ink/40 hover:text-ink/70"
      >
        {visivel ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
