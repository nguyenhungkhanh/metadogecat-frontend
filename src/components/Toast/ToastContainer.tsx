import useToast from 'hooks/useToast'
import React from 'react'
import Toast from './Toast'
import { ToastContainerProps } from './types'

const ZINDEX = 1000
const TOP_POSITION = 80 // Initial position from the top

const ToastContainer: React.FC<ToastContainerProps> = ({ ttl = 60000000000, stackSpacing = 24 }) => {
  const { toasts, remove: onRemove } = useToast()

  return (
    <div>
      {
        toasts.map((toast: any, index: number) => {
          const zIndex = (ZINDEX - index).toString()
          const top = TOP_POSITION + index * stackSpacing

          return (
            <Toast key={toast.id} toast={toast} onRemove={onRemove} ttl={ttl} style={{ top: `${top}px`, zIndex }} />
          )
        })
      }
    </div>
  )
}

export default ToastContainer
