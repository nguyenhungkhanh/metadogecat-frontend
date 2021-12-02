import React, { createContext, ReactNode, useCallback, useState } from 'react'
import { kebabCase } from 'lodash'

export const toastTypes = {
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
}

export interface Toast {
  id: string
  type: typeof toastTypes[keyof typeof toastTypes]
  title: string
  description?: ReactNode
}

type ToastSignature = (title: Toast['title'], description?: Toast['description']) => void

export interface ToastContextApi {
  toasts: Toast[]
  clear: () => void
  remove: (id: string) => void
  toastError: ToastSignature
  toastInfo: ToastSignature
  toastSuccess: ToastSignature
  toastWarning: ToastSignature
}

export const ToastContext = createContext<ToastContextApi | undefined>(undefined)

export const ToastProvider: React.FC = ({ children }) => {
  const [toasts, setToasts] = useState<ToastContextApi['toasts']>([])

  const toast = useCallback(
    ({ title, description, type }: Omit<Toast, 'id'>) => {
      setToasts((prevToasts) => {
        const id = kebabCase(title)

        // Remove any existing toasts with the same id
        const currentToasts = prevToasts.filter((prevToast) => prevToast.id !== id)

        return [
          {
            id,
            title,
            description,
            type,
          },
          ...currentToasts,
        ]
      })
    },
    [setToasts],
  )

  const toastError = (title: Toast['title'], description?: Toast['description']) => {
    return toast({ title, description, type: toastTypes.DANGER })
  }
  const toastInfo = (title: Toast['title'], description?: Toast['description']) => {
    return toast({ title, description, type: toastTypes.INFO })
  }
  const toastSuccess = (title: Toast['title'], description?: Toast['description']) => {
    return toast({ title, description, type: toastTypes.SUCCESS })
  }
  const toastWarning = (title: Toast['title'], description?: Toast['description']) => {
    return toast({ title, description, type: toastTypes.WARNING })
  }
  const clear = () => setToasts([])
  const remove = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((prevToast) => prevToast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, clear, remove, toastError, toastInfo, toastSuccess, toastWarning }}>
      {children}
    </ToastContext.Provider>
  )
}
