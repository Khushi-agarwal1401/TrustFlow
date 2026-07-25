"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./button"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

function Modal({ open, onClose, title, description, children, footer, className }: ModalProps) {
  React.useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.overflow = "hidden"

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
      }
      document.addEventListener("keydown", handleEscape)

      return () => {
        document.body.style.paddingRight = ""
        document.body.style.overflow = ""
        document.removeEventListener("keydown", handleEscape)
      }
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full max-w-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-modal",
              className
            )}
          >
            <div className="flex items-start justify-between p-5 pb-0">
              <div className="min-w-0">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {description && <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{description}</p>}
              </div>
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mr-1 -mt-1">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="p-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 p-5 pt-0 border-t border-[var(--color-border-subtle)] mt-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  side?: "left" | "right"
}

function Drawer({ open, onClose, title, children, side = "right" }: DrawerProps) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute top-0 bottom-0 w-full max-w-lg bg-[var(--color-bg-surface)] border-l border-[var(--color-border-subtle)] shadow-modal",
              side === "right" ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-subtle)]">
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-5 overflow-y-auto h-[calc(100%-64px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export { Modal, Drawer }
