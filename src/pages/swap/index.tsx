import React, { useEffect, useMemo, useState } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ConnectorNames, getErrorMessage } from 'utils/web3React'
import useAuth from 'hooks/useAuth'
import { useSwapState, useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks'
import { Token } from '@pancakeswap/sdk'
import { useAllTokens, useCurrency } from 'hooks/useTokens'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { Field } from 'state/swap/actions'
import { useUserSlippageTolerance } from 'state/user/hooks'
import SwapFooter from './components/SwapFooter'
import TradePrice from './components/TradePrice'
import CurrencyInput from './components/CurrencyInput'

export default function SwapPage() {
  const loadedUrlParams = useDefaultsFromURLSearch()
  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  console.log(loadedUrlParams?.inputCurrencyId, loadedUrlParams?.outputCurrencyId)

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  )

  const { chainId, account, active, error } = useActiveWeb3React()

  const { login, logout } = useAuth()

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)
  
  const errorMesssage = error ? getErrorMessage(error) : null;
  
  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  
  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
  urlLoadedTokens &&
  urlLoadedTokens.filter((token: Token) => {
    return !(token.address in defaultTokens)
  })

  console.log('v2Trade', v2Trade, currencies, recipient, parsedAmount)

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  console.log(formattedAmounts)

  const connectInjected = () => {
    login(ConnectorNames.Injected)
  }

  const connectWalletConnect = () => {
    login(ConnectorNames.WalletConnect)
  }

  // const inputCurrency = useCurrency("0xc9849e6fdb743d08faee3e34dd2d1bc69ea11a51")
  const outputCurrency = useCurrency("0xb46c5317d1a8258e330466b7f2355fbef8d6b6a6")

  console.log(outputCurrency)
  useEffect(() => {
    if (outputCurrency) {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    }
  }, [onCurrencySelection, outputCurrency])

  // useEffect(() => {
  //   if (inputCurrency) {
  //   }
  // }, [onCurrencySelection, inputCurrency])

  useEffect(() => {
    if (currencies.INPUT) {
      onUserInput(Field.INPUT, "1")
    }
    // if (currencies.OUTPUT) {
    //   onUserInput(Field.INPUT, "1")
    // }
  }, [currencies.INPUT, onUserInput])

  return (
    <div className="flex justify-center mt-4 bg-gray-200">
      <div className="w-full max-w-md">
        <div className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <CurrencyInput 
              label="From"
              value={formattedAmounts[Field.INPUT]}
              onChange={(value) => onUserInput(Field.INPUT, value)}
              currency={currencies[Field.INPUT]}
            />
          </div>
          <div className="mb-4">
            <CurrencyInput 
              label="To"
              value={formattedAmounts[Field.OUTPUT]}
              onChange={(value) => onUserInput(Field.OUTPUT, value)}
              currency={currencies[Field.OUTPUT]}
            />
          </div>
          {
            trade
            ? <TradePrice 
                price={trade?.executionPrice}
                showInverted={showInverted}
                setShowInverted={setShowInverted}
              />
            : null
          }
          {
            v2Trade
            ? <SwapFooter 
                trade={v2Trade}
                allowedSlippage={allowedSlippage}
              />
            : null
          }
        </div>
        <button className="bg-green-500 active:bg-green-700 px-4 py-2 mr-2" onClick={connectInjected}>Injected</button>
        <button className="bg-green-500 active:bg-green-700 px-4 py-2 mr-2" onClick={connectWalletConnect}>WalletConnect</button>
        <button className="bg-red-500 active:bg-red-700 px-4 py-2" onClick={logout}>Deactivate</button>
      </div>
    </div>
  )
}