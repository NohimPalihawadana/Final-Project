import React from 'react'

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold text-slate-700 px-4 py-3 border-b border-slate-200">{children}</th>
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 border-b border-slate-100 align-top">{children}</td>
}
