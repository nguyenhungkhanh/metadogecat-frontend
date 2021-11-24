import React from 'react'

export function Flex({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      { children }
    </div>
  )
}