import React from 'react'
import cx from 'classnames'

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, className, children, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label ? <div className="text-sm font-medium text-slate-700 mb-1">{label}</div> : null}

      <select
        ref={ref}
        className={cx(
          'w-full rounded-xl border px-3 py-2 text-sm bg-white outline-none',
          error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-300 focus:ring-2 focus:ring-slate-200',
          className,
        )}
        {...rest}
      >
        {children}
      </select>

      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  )
})
