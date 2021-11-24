import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ConnectorNames } from "utils/web3React";
import useAuth from "hooks/useAuth";
import {
  useSwapState,
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
} from "state/swap/hooks";
import { CurrencyAmount, JSBI, Token } from "@pancakeswap/sdk";
import { useAllTokens, useCurrency } from "hooks/useTokens";
import useWrapCallback, { WrapType } from "hooks/useWrapCallback";
import { Field } from "state/swap/actions";
import { useUserSingleHopOnly, useUserSlippageTolerance } from "state/user/hooks";
import SwapFooter from "./components/SwapFooter";
import TradePrice from "./components/TradePrice";
import CurrencyInput from "./components/CurrencyInput";
import maxAmountSpend from "utils/maxAmountSpend";
import { ApprovalState, useApproveCallbackFromTrade } from 'hooks/useApproveCallback'
import { computeTradePriceBreakdown, warningSeverity } from "utils/prices";
import { useSwapCallback } from 'hooks/useSwapCallback'

export default function SwapPage() {
  const loadedUrlParams = useDefaultsFromURLSearch();
  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance();
  const [singleHopOnly] = useUserSingleHopOnly()

  console.log(
    loadedUrlParams?.inputCurrencyId,
    loadedUrlParams?.outputCurrencyId
  );

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ];

  const urlLoadedTokens: Token[] = useMemo(
    () =>
      [loadedInputCurrency, loadedOutputCurrency]?.filter(
        (c): c is Token => c instanceof Token
      ) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  );

  const { login, logout } = useAuth();

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo();

  const {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  } = useSwapActionHandlers();

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !(token.address in defaultTokens);
    });

  useEffect(() => {
    console.log('importTokensNotInDefault', importTokensNotInDefault)
  }, [importTokensNotInDefault])
  console.log("v2Trade", v2Trade, currencies, recipient, parsedAmount);

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
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  
  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

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

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

        // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
  !swapInputError &&
  (approval === ApprovalState.NOT_APPROVED ||
    approval === ApprovalState.PENDING ||
    (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
  !(priceImpactSeverity > 3)

  const dependentField: Field =
    independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ""
      : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  const connectInjected = () => {
    login(ConnectorNames.Injected);
  };

  const connectWalletConnect = () => {
    login(ConnectorNames.WalletConnect);
  };

  // const inputCurrency = useCurrency("0xc9849e6fdb743d08faee3e34dd2d1bc69ea11a51")
  const outputCurrency = useCurrency(
    "0xfb78bc4308f926cc26d91cd51b68dd6b8bc79dfe"
  );

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
    if (outputCurrency) {
      if (!currencies[Field.OUTPUT]) {
        onCurrencySelection(Field.OUTPUT, outputCurrency);
      }
    }
  }, [currencies, onCurrencySelection, outputCurrency]);

  // useEffect(() => {
  //   if (inputCurrency) {
  //   }
  // }, [onCurrencySelection, inputCurrency])

  useEffect(() => {
    if (currencies.INPUT) {
      onUserInput(Field.INPUT, "1");
    }
    // if (currencies.OUTPUT) {
    //   onUserInput(Field.INPUT, "1")
    // }
  }, [currencies.INPUT, onUserInput]);

  const isValid = !swapInputError

  return (
    <div className="flex justify-center mt-4 bg-gray-200">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-4">
          <button
            className="bg-green-500 active:bg-green-700 px-4 py-2 mr-2"
            onClick={connectInjected}
          >
            Injected
          </button>
          <button
            className="bg-green-500 active:bg-green-700 px-4 py-2 mr-2"
            onClick={connectWalletConnect}
          >
            WalletConnect
          </button>
          <button
            className="bg-red-500 active:bg-red-700 px-4 py-2"
            onClick={logout}
          >
            Deactivate
          </button>
        </div>
        <div className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <CurrencyInput
              label="From"
              value={formattedAmounts[Field.INPUT]}
              onChange={(value) => onUserInput(Field.INPUT, value)}
              currency={currencies[Field.INPUT]}
              showMaxButton={true}
              onMax={handleMaxInput}
            />
          </div>
          <div className="mb-4">
            <div onClick={() => {
              setApprovalSubmitted(false) // reset 2 step UI for approvals
              onSwitchTokens()
            }}> 
              Switch
            </div>
          </div>
          <div className="mb-4">
            <CurrencyInput
              label="To"
              value={formattedAmounts[Field.OUTPUT]}
              onChange={(value) => onUserInput(Field.OUTPUT, value)}
              currency={currencies[Field.OUTPUT]}
            />
          </div>
          {trade ? (
            <TradePrice
              price={trade?.executionPrice}
              showInverted={showInverted}
              setShowInverted={setShowInverted}
            />
          ) : null}
          {v2Trade ? (
            <SwapFooter trade={v2Trade} allowedSlippage={allowedSlippage} />
          ) : null}
        </div>
        <div>
          {showWrap ? (
            <button disabled={Boolean(wrapInputError)} onClick={onWrap}>
              {wrapInputError ??
                (wrapType === WrapType.WRAP
                  ? "Wrap"
                  : wrapType === WrapType.UNWRAP
                  ? "Unwrap"
                  : (noRoute && userHasSpecifiedInputOutput ? (
                    <div style={{ textAlign: 'center' }}>
                      <div>
                        Insufficient liquidity for this trade.
                      </div>
                      {singleHopOnly && (
                        <div>
                          Try enabling multi-hop trades.
                        </div>
                      )}
                    </div>
                  ) : null))}
            </button>
          ) : showApproveFlow ? (
            <div>
              <button
                className={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
                onClick={approveCallback}
                disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
              >
                {approval === ApprovalState.PENDING ? (
                  <div>
                    Enabling
                  </div>
                ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                  'Enabled'
                ) : (
                  `Enable ${currencies[Field.INPUT]?.symbol}`
                )}
              </button>
              <button
                className={isValid && priceImpactSeverity > 2 ? 'danger' : 'primary'}
                onClick={() => {
                  console.log("Handle swap")
                }}
                id="swap-button"
                disabled={
                  !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3)
                }
              >
                {priceImpactSeverity > 3
                  ? 'Price Impact High'
                  : priceImpactSeverity > 2
                  ? 'Swap Anyway'
                  : 'Swap'}
              </button>
            </div>
          ) : <button
                className={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
                onClick={() => {
                  console.log("Handle swap")
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3) || !!swapCallbackError}
              >
                {swapInputError ||
                  (priceImpactSeverity > 3
                    ? 'Price Impact Too High'
                    : priceImpactSeverity > 2
                    ? 'Swap Anyway'
                    : 'Swap')}
              </button>
            }
        </div>
      </div>
    </div>
  );
}
