'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  action?: React.ReactNode
}

interface ToastState {
  toasts: Toast[]
}

const initialState: ToastState = {
  toasts: []
}

let toastCounter = 0

export function useToast() {
  const [state, setState] = useState(initialState)

  const toast = useCallback(
    ({ title, description, variant = 'default', action }: Omit<Toast, 'id'>) => {
      const id = (++toastCounter).toString()

      const newToast: Toast = {
        id,
        title,
        description,
        variant,
        action
      }

      setState((prevState) => ({
        toasts: [...prevState.toasts, newToast]
      }))

      // Auto remove after 5 seconds
      setTimeout(() => {
        setState((prevState) => ({
          toasts: prevState.toasts.filter((t) => t.id !== id)
        }))
      }, 5000)

      return id
    },
    []
  )

  const dismiss = useCallback((toastId: string) => {
    setState((prevState) => ({
      toasts: prevState.toasts.filter((t) => t.id !== toastId)
    }))
  }, [])

  return {
    toast,
    dismiss,
    toasts: state.toasts
  }
}