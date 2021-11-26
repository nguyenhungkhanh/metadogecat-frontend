import React, { useState } from 'react'
import { Price } from '@pancakeswap/sdk'

interface TradePriceProps {
  price?: Price
}

export default function TradePrice({ price }: TradePriceProps) {
  const [showInverted, setShowInverted] = useState<boolean>(false);

  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = showInverted
    ? `${price?.quoteCurrency?.symbol}/${price?.baseCurrency?.symbol}`
    : `${price?.baseCurrency?.symbol}/${price?.quoteCurrency?.symbol}`

  if (!show) return <span>-</span>
  
  return (
    <div className="flex">
      <div className="mr">
        <span className="text-muted">Price: </span> 
        <span>{formattedPrice ?? '-'} {label}</span>
      </div>
      <span onClick={() => setShowInverted(!showInverted)}>
        invert
      </span>
    </div>
  )
}
