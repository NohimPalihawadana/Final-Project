import React from 'react'
import cx from 'classnames'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label ? <div className="text-sm font-medium text-slate-700 mb-1">{label}</div> : null}

      <input
        ref={ref}
        className={cx(
          'w-full rounded-xl border px-3 py-2 text-sm bg-white outline-none',
          error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-300 focus:ring-2 focus:ring-slate-200',
          className,
        )}
        {...rest}
      />

      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  )
})
