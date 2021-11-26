import React, { useState } from 'react'
import { Price } from '@pancakeswap/sdk'
import { RefreshIcon } from 'components/icons'

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
    <div>
      <span className="text-muted">Price: </span> 
      <span className="pointer" onClick={() => setShowInverted(!showInverted)}>
        <RefreshIcon fill="#c6d3e7" />
        <span> {formattedPrice ?? '-'} {label} </span>
      </span>
    </div>
  )
}
