import React from 'react'
import { Button } from './Button'

type Props = {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  confirmVariant?: 'primary' | 'secondary' | 'danger'
}

export function Modal({ open, title, children, onClose, onConfirm, confirmText = 'Confirm', confirmVariant = 'primary' }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">{title}</div>
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        <div className="mt-4">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {onConfirm ? (
            <Button variant={confirmVariant} onClick={onConfirm}>{confirmText}</Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
