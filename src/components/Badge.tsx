import cx from 'classnames'

export function Badge({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border',
        tone === 'neutral' && 'bg-slate-50 text-slate-700 border-slate-200',
        tone === 'success' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
        tone === 'warning' && 'bg-amber-50 text-amber-800 border-amber-200',
        tone === 'danger' && 'bg-rose-50 text-rose-700 border-rose-200',
      )}
    >
      {text}
    </span>
  )
}
