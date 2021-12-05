import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { isAddress } from "ethers/lib/utils";
import { CurrencyAmount, JSBI, Trade } from "@pancakeswap/sdk";
import classNames from "classnames";
import { ExchangeIcon } from "components/icons"
import {
  useSwapState,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useLoadCurrency,
} from "state/swap/hooks";
import useWrapCallback, { WrapType } from "hooks/useWrapCallback";
import { Field } from "state/swap/actions";
import { useUserAutoSlippage, useUserSingleHopOnly, useUserSlippageTolerance } from "state/user/hooks";
import maxAmountSpend from "utils/maxAmountSpend";
import { ApprovalState, useApproveCallbackFromTrade } from "hooks/useApproveCallback";
import { computeTradePriceBreakdown, warningSeverity } from "utils/prices";
import { getSlippage, useSwapCallback } from "hooks/useSwapCallback";

import SwapFooter from "./components/SwapFooter";
import CurrencyInput from "./components/CurrencyInput";
import SlippageInput from './components/SlippageInput'
import SwapRoute from "./components/SwapRoute";
import { Button } from "components/Elements";

import styles from "./index.module.scss";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import useTransactionDeadline from "hooks/useTransactionDeadline";

export default function SwapPage() {
  useLoadCurrency();
  const { account, chainId, library } = useActiveWeb3React()
  const params: any = useParams();
  const deadline = useTransactionDeadline()
  const [allowedSlippage, setAllowedSlippage] = useUserSlippageTolerance();
  const [isAutoSlippage, setIsAutoSlippage] = useUserAutoSlippage();
  const [singleHopOnly] = useUserSingleHopOnly();
  
  const [loadingGetAutoSlippage, setLoadingGetAutoSlippage] = useState<boolean>(false)
  const [autoSlippageValue, setAutoSlippageValue] = useState<number | null>(null);

  // swap state
  const { independentField, typedValue } = useSwapState();
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo();

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers();

  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  );

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const trade = showWrap ? undefined : v2Trade;

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage);

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
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage);

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

  // modal and loading
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ""
      : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  const handleGetSlippage = useCallback(async () => {
    setLoadingGetAutoSlippage(true)
    const slippage = await getSlippage(account, chainId, library, deadline, trade)
    if (slippage) {
      setAllowedSlippage(slippage)
      setAutoSlippageValue(slippage)
    }
    setLoadingGetAutoSlippage(false)
    return slippage
  }, [account, chainId, deadline, library, trade, setAllowedSlippage])
  
  const handleSwap = useCallback(() => {
    if (!swapCallback) return
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [tradeToConfirm, swapCallback])

  const onSwap = useCallback(() => {
    if (isAutoSlippage) {
      handleGetSlippage()
    } else {
      handleSwap()
    }
  }, [isAutoSlippage, handleGetSlippage, handleSwap])

  useEffect(() => {
    if (autoSlippageValue) {
      setAutoSlippageValue(null)
      handleSwap()
    }
  }, [autoSlippageValue, swapCallback, handleSwap])

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact());
    }
  }, [maxAmountInput, onUserInput]);

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
        <div className="rounded px-8 pt-6 pb-8">
          <div className="mb-4">
            <SlippageInput 
              isAutoSlippage={isAutoSlippage}
              setIsAutoSlippage={setIsAutoSlippage}
              autoSlippageValue={autoSlippageValue}
            />
          </div>
          <div className="mb-4">
            <CurrencyInput
              label="From"
              value={formattedAmounts[Field.INPUT]}
              onChange={(value: any) => onUserInput(Field.INPUT, value)}
              currency={currencies[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
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
          <div>
            {
              showWrap 
              ? <Button disabled={Boolean(wrapInputError)} onClick={onWrap}>
                  {
                    wrapInputError ?? 
                      (
                        wrapType === WrapType.WRAP 
                        ? "Wrap"
                        : wrapType === WrapType.UNWRAP 
                          ? "Unwrap"
                          : noRoute && userHasSpecifiedInputOutput 
                            ? <div style={{ textAlign: "center" }}>
                                <div>Insufficient liquidity for this trade.</div>
                                {singleHopOnly && <div>Try enabling multi-hop trades.</div>}
                              </div>
                            : null
                      )
                  }
                </Button>
              : showApproveFlow 
                ? <div className="flex">
                    <Button
                      className={
                        `flex-1 mr ${approval === ApprovalState.APPROVED ? "success" : "primary"}`
                      }
                      onClick={approveCallback}
                      loading={approval === ApprovalState.PENDING}
                      disabled={
                        approval !== ApprovalState.NOT_APPROVED || approvalSubmitted
                      }
                    >
                      {
                        approval === ApprovalState.PENDING 
                        ? <div>Enabling</div>
                        : approvalSubmitted && approval === ApprovalState.APPROVED 
                          ? "Enabled"
                          : `Enable ${currencies[Field.INPUT]?.symbol}`
                      }
                    </Button>
                    <Button
                      className={`flex-1 ml ${isValid && priceImpactSeverity > 2 ? "danger" : "primary"}`}
                      disabled={
                        !isValid ||
                        approval !== ApprovalState.APPROVED ||
                        priceImpactSeverity > 3
                      }
                      loading={loadingGetAutoSlippage || (attemptingTxn && !txHash)}
                      onClick={onSwap}
                    >
                      {
                        priceImpactSeverity > 3
                          ? "Price Impact High"
                          : priceImpactSeverity > 2
                            ? "Swap Anyway"
                            : "Swap"
                      }
                    </Button>
                  </div>
                : <Button
                    className={`w-full ${isValid && priceImpactSeverity > 2 && !swapCallbackError ? "danger" : "primary"}`}
                    disabled={!isValid || priceImpactSeverity > 3 || !!swapCallbackError}
                    loading={loadingGetAutoSlippage || (attemptingTxn && !txHash)}
                    onClick={onSwap}
                  >
                    {
                      swapInputError || 
                      (
                        priceImpactSeverity > 3
                        ? "Price Impact Too High"
                        : priceImpactSeverity > 2
                          ? "Swap Anyway"
                          : "Swap"
                      )
                    }
                  </Button>
            }
          </div>
          {
            trade 
            ? <div className="swap-info mt-4">
                <SwapFooter trade={trade} allowedSlippage={allowedSlippage} />
                <SwapRoute trade={trade} />
              </div>
            : null
          }
          {
            swapErrorMessage
            ? <div className="text-danger mt-4">{swapErrorMessage}</div>
            : null
          }
        </div>
      </div>
    </div>
  );
}
