import React from 'react'
import classNames from 'classnames'
import Spinner from '../Spinner'

import styles from './index.module.scss'

interface ButtonProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export default function Button({ children, className, disabled, loading, onClick }: ButtonProps) {
  return (
    <button 
      type="button" 
      className={classNames(styles.wrapper, "px-3 rounded-sm", className)}
      disabled={disabled || loading}
      onClick={onClick}
    >
      { children }
      { loading ? <Spinner className="ml" /> : null }
    </button>
  )
}