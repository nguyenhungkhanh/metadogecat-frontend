import React from 'react'
import classNames from 'classnames'

interface SpinnerProps {
  className?: string
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <div 
      style={{ borderTopColor: "transparent" }} 
      className={classNames("w-5 h-5 border-2 border-black border-solid rounded-full animate-spin", className)}
    />
  )
}