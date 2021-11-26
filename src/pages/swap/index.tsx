import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ExchangeIcon } from "components/icons"
import {
  useSwapState,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useLoadCurrency,
} from "state/swap/hooks";
import { CurrencyAmount, JSBI, Token } from "@pancakeswap/sdk";
import { useAllTokens, useCurrency } from "hooks/useTokens";
import useWrapCallback, { WrapType } from "hooks/useWrapCallback";
import { Field } from "state/swap/actions";
import {
  useUserSingleHopOnly,
  useUserSlippageTolerance,
} from "state/user/hooks";
import SwapFooter from "./components/SwapFooter";
import TradePrice from "./components/TradePrice";
import CurrencyInput from "./components/CurrencyInput";
import maxAmountSpend from "utils/maxAmountSpend";
import {
  ApprovalState,
  useApproveCallbackFromTrade,
} from "hooks/useApproveCallback";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { computeTradePriceBreakdown, warningSeverity } from "utils/prices";
import { useSwapCallback } from "hooks/useSwapCallback";
import { isAddress } from "ethers/lib/utils";
import getTokenInfo from "utils/getTokenInfo";
import classNames from "classnames";

import styles from "./index.module.scss";
import SwapRoute from "./components/SwapRoute";
import { Button } from "components/Elements";

export default function SwapPage() {
  useLoadCurrency();
  const params: any = useParams();
  const { chainId, library } = useActiveWeb3React();

  const [allowedSlippage] = useUserSlippageTolerance();
  const [singleHopOnly] = useUserSingleHopOnly();

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo();

  console.log(currencies);

  const { onSwitchTokens, onCurrencySelection, onUserInput } =
    useSwapActionHandlers();

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  );

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const trade = showWrap ? undefined : v2Trade;

  // the callback to execute the swap
  const { error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    recipient
  );

  // errors
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]:
          independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]:
          independentField === Field.OUTPUT
            ? parsedAmount
            : trade?.outputAmount,
      };

  const route = trade?.route;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  );
  const noRoute = !route;

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(
    trade,
    allowedSlippage
  );

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3);

  const dependentField: Field =
    independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ""
      : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(
    currencyBalances[Field.INPUT]
  );
  // const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact());
    }
  }, [maxAmountInput, onUserInput]);

  useEffect(() => {
    async function loadCurrency() {
      const outputCurrency = await getTokenInfo(library, chainId, params?.tokenAddress)
      if (outputCurrency) {
        onCurrencySelection(Field.OUTPUT, outputCurrency)
      }
    }
    if (chainId && library) {
      loadCurrency()
    }
  }, [chainId, library, onCurrencySelection, params?.tokenAddress])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency);
    },
    [onCurrencySelection]
  );

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency);
    },

    [onCurrencySelection]
  );

  const handleSwitch = useCallback(() => {
    setApprovalSubmitted(false); // reset 2 step UI for approvals
    onSwitchTokens();
  }, [onSwitchTokens])

  const isValid = !swapInputError;

  if (!isAddress(params?.tokenAddress)) {
    return null;
  }

  return (
    <div
      className={classNames(styles.wrapper, "flex justify-center mx-auto")}
      style={{ marginTop: "calc(1rem + 60px)" }}
    >
      <div className="w-full max-w-md">
        <div className="rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <CurrencyInput
              label="From"
              value={formattedAmounts[Field.INPUT]}
              onChange={(value: any) => onUserInput(Field.INPUT, value)}
              currency={currencies[Field.INPUT]}
              showMaxButton={true}
              onMax={handleMaxInput}
              onCurrencySelect={handleInputSelect}
            />
          </div>
          <div className="mb-4 wrapper-switch-icon" onClick={handleSwitch}>
            <ExchangeIcon />
          </div>
          <div className="mb-4">
            <CurrencyInput
              label="To"
              value={formattedAmounts[Field.OUTPUT]}
              onChange={(value: any) => onUserInput(Field.OUTPUT, value)}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
            />
          </div>
          <div className="mb-4">
            {showWrap ? (
              <Button disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? (
                    "Wrap"
                  ) : wrapType === WrapType.UNWRAP ? (
                    "Unwrap"
                  ) : noRoute && userHasSpecifiedInputOutput ? (
                    <div style={{ textAlign: "center" }}>
                      <div>Insufficient liquidity for this trade.</div>
                      {singleHopOnly && (
                        <div>Try enabling multi-hop trades.</div>
                      )}
                    </div>
                  ) : null)}
              </Button>
            ) : showApproveFlow ? (
              <div>
                <Button
                  className={
                    approval === ApprovalState.APPROVED ? "success" : "primary"
                  }
                  onClick={approveCallback}
                  disabled={
                    approval !== ApprovalState.NOT_APPROVED || approvalSubmitted
                  }
                >
                  {approval === ApprovalState.PENDING ? (
                    <div>Enabling</div>
                  ) : approvalSubmitted &&
                    approval === ApprovalState.APPROVED ? (
                    "Enabled"
                  ) : (
                    `Enable ${currencies[Field.INPUT]?.symbol}`
                  )}
                </Button>
                <Button
                  className={
                    isValid && priceImpactSeverity > 2 ? "danger" : "primary"
                  }
                  onClick={() => {
                    console.log("Handle swap");
                  }}
                  disabled={
                    !isValid ||
                    approval !== ApprovalState.APPROVED ||
                    priceImpactSeverity > 3
                  }
                >
                  {priceImpactSeverity > 3
                    ? "Price Impact High"
                    : priceImpactSeverity > 2
                    ? "Swap Anyway"
                    : "Swap"}
                </Button>
              </div>
            ) : (
              <Button
                className={
                  isValid && priceImpactSeverity > 2 && !swapCallbackError
                    ? "danger"
                    : "w-full primary"
                }
                onClick={() => {
                  console.log("Handle swap");
                }}
                disabled={
                  !isValid || priceImpactSeverity > 3 || !!swapCallbackError
                }
              >
                {swapInputError ||
                  (priceImpactSeverity > 3
                    ? "Price Impact Too High"
                    : priceImpactSeverity > 2
                    ? "Swap Anyway"
                    : "Swap")}
              </Button>
            )}
          </div>
          {
            trade 
            ? <div className="swap-info mb-4">
                <SwapFooter trade={trade} allowedSlippage={allowedSlippage} />
              </div>
            : null
          }
          { trade ? <SwapRoute trade={trade} /> : null }
        </div>
      </div>
    </div>
  );
}
