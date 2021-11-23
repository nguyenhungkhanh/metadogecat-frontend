import { TradeType } from "@pancakeswap/sdk";
import React, { useMemo } from "react";
import { Field } from "state/swap/actions";
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  warningSeverity,
} from "utils/prices";
import useLastTruthy from "hooks/useLast";
import { ONE_BIPS } from "configs/contants";

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
  const severity = warningSeverity(priceImpactWithoutFee);

  if (!lastTrade) return null;

  return (
    <div>
      {trade.tradeType === TradeType.EXACT_INPUT
        ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? "-"
        : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? "-"}

      <p>
        Price impact:{" "}
        {priceImpactWithoutFee
          ? priceImpactWithoutFee.lessThan(ONE_BIPS)
            ? "<0.01%"
            : `${priceImpactWithoutFee.toFixed(2)}%`
          : "-"}
      </p>
      <p>
        {realizedLPFee
          ? `${realizedLPFee?.toSignificant(6)} ${
              trade.inputAmount.currency.symbol
            }`
          : "-"}
      </p>
      <button className="bg-green-500 active:bg-green-700 px-4 py-2">
        {severity > 2 ? "Swap Anyway" : "Confirm Swap"}
      </button>
    </div>
  );
}
