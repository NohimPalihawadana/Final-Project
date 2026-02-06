import React from 'react'
import cx from 'classnames'

/* ---------- TABLE ---------- */

type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  children: React.ReactNode
}

export function Table({ children, className, ...rest }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table
        className={cx('w-full text-sm border-collapse', className)}
        {...rest}
      >
        {children}
      </table>
    </div>
  )
}

/* ---------- TH ---------- */

type ThProps = React.ThHTMLAttributes<HTMLTableCellElement>

export function Th({ children, className, ...rest }: ThProps) {
  return (
    <th
      className={cx(
        'text-left font-semibold text-slate-700 px-4 py-3 border-b border-slate-200 bg-slate-50',
        className
      )}
      {...rest}
    >
      {children}
    </th>
  )
}

/* ---------- TD ---------- */

type TdProps = React.TdHTMLAttributes<HTMLTableCellElement>

export function Td({ children, className, ...rest }: TdProps) {
  return (
    <td
      className={cx(
        'px-4 py-3 border-b border-slate-100 align-top',
        className
      )}
      {...rest}
    >
      {children}
    </td>
  )
}
