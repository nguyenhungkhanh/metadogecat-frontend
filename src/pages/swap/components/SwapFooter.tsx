import React, { useMemo } from "react";
import { TradeType } from "@pancakeswap/sdk";
import { Field } from "state/swap/actions";
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from "utils/prices";
import useLastTruthy from "hooks/useLast";
import { ONE_BIPS } from "configs/contants";
import TradePrice from "./TradePrice";

export default function SwapFooter({
  trade,
  allowedSlippage,
}: {
  trade: any;
  allowedSlippage: any;
}) {
  const lastTrade = useLastTruthy(trade);

  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [allowedSlippage, trade]
  );

  const { priceImpactWithoutFee, realizedLPFee } = useMemo(
    () => computeTradePriceBreakdown(trade),
    [trade]
  );

  if (!lastTrade) return null;

  return (
    <div>
      <div>
        <span className="text-muted">
          {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received: ' : 'Maximum sold: '}
        </span>
        <span>
          {
            trade.tradeType === TradeType.EXACT_INPUT
              ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? "-"
              : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? "-"
          }
        </span>
        <span>
          {
            trade.tradeType === TradeType.EXACT_INPUT
              ? ` ${trade.outputAmount.currency.symbol}`
              : ` ${trade.inputAmount.currency.symbol}`
          }
        </span>
      </div>
      <p>
        <span className="text-muted">Price impact: </span>
        <span>
          {priceImpactWithoutFee
            ? priceImpactWithoutFee.lessThan(ONE_BIPS)
              ? "<0.01%"
              : `${priceImpactWithoutFee.toFixed(2)}%`
            : "-"
          }
        </span>
      </p>
      <p>
        <span className="text-muted">Liquidity Provider Fee: </span> 
        <span>
          {
            realizedLPFee
              ? `${realizedLPFee?.toSignificant(6)} ${trade.inputAmount.currency.symbol}`
              : "-"
          }
        </span>
      </p>
      <TradePrice price={trade?.executionPrice} />
    </div>
  );
}
