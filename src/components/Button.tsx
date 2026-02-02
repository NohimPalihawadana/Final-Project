import React from 'react'
import cx from 'classnames'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  ...rest
}: Props) {
  const classes = cx(
    'inline-flex items-center justify-center rounded-xl font-medium transition border',
    size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-sm',
    variant === 'primary' && 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800',
    variant === 'secondary' && 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50',
    variant === 'danger' && 'bg-rose-600 text-white border-rose-600 hover:bg-rose-500',
    variant === 'ghost' && 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100',
    (disabled || loading) && 'opacity-60 cursor-not-allowed',
    className,
  )

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? 'Please wait…' : children}
    </button>
  )
}
