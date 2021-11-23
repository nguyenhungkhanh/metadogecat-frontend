import { useAllTokens } from 'hooks/useTokens'
import React from 'react'

export default function ModalSelectCurrency() {
  const tokens = useAllTokens()
  console.log(tokens)
  
  return (
    <div>
      <h1>ModalSelectCurrency</h1>
    </div>
  )
}