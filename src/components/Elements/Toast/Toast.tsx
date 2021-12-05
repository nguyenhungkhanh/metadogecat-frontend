import React, { useCallback, useEffect, useRef } from 'react'
import { ToastProps, types } from './types'

const alertTypeMap = {
  [types.INFO]: "info",
  [types.SUCCESS]: "success",
  [types.DANGER]: "danger",
  [types.WARNING]: "warning",
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove, ttl, style, ...props }) => {
  const timer = useRef<number>()
  const ref = useRef(null)
  const removeHandler = useRef(onRemove)
  const { id, title, description, type } = toast

  const handleRemove = useCallback(() => removeHandler.current(id), [id, removeHandler])

  const handleMouseEnter = () => {
    clearTimeout(timer.current)
  }

  const handleMouseLeave = () => {
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = window.setTimeout(() => {
      handleRemove()
    }, ttl)
  }

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = window.setTimeout(() => {
      handleRemove()
    }, ttl)

    return () => {
      clearTimeout(timer.current)
    }
  }, [timer, ttl, handleRemove])

  return (
    <div ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={style} {...props}>
      <div title={title} className={alertTypeMap[type]} onClick={handleRemove}>
        {description}
      </div>
    </div>
  )
}

export default Toast
