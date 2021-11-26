import React, { Fragment, memo } from 'react'
import { Trade } from '@pancakeswap/sdk'
import { unwrappedToken } from 'utils/wrappedCurrency'

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  if (!trade) return null
  return (
    <div className="flex text-muted">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = unwrappedToken(token)
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            <div>
              <span>
                {currency.symbol}
              </span>
            </div>
            {!isLastItem ? <span className="px-2">{">"}</span> : ""}
          </Fragment>
        )
      })}
    </div>
  )
})
