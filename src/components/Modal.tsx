import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export function Modal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              className="relative w-full max-w-lg card p-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{title}</div>
                </div>
                <Button variant="ghost" onClick={onClose} aria-label="Close">
                  ✕
                </Button>
              </div>

              {/* Content */}
              <div className="mt-4">{children}</div>

              {/* Footer */}
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                {onConfirm ? (
                  <Button variant={confirmVariant} onClick={onConfirm}>
                    {confirmText}
                  </Button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
