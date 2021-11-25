import React from 'react'

export default function ModalWrapper({ children }: { children: React.ReactChild }) {
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 w-full h-full">
      { children }
    </div>
  )
}