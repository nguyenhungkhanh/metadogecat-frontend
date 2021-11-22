import React, { useMemo } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ConnectorNames, getErrorMessage } from 'utils/web3React'
import useTokenBalance, { useGetBnbBalance } from 'hooks/useTokenBalance'
import useAuth from 'hooks/useAuth'
import { useSwapState, useDefaultsFromURLSearch, useDerivedSwapInfo } from 'state/swap/hooks'
import { Token } from '@pancakeswap/sdk'
import { useCurrency } from 'hooks/useTokens'
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback'
import { Field } from 'state/swap/actions'

export default function SwapPage() {
  const loadedUrlParams = useDefaultsFromURLSearch()

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

  const bnbBalance = useGetBnbBalance()

  const { login, logout } = useAuth()

  const errorMesssage = error ? getErrorMessage(error) : null;
  
  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()
  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)

  console.log(v2Trade, wrapType, independentField, typedValue, recipient, urlLoadedTokens)

  const connectInjected = () => {
    login(ConnectorNames.Injected)
  }

  const connectWalletConnect = () => {
    login(ConnectorNames.WalletConnect)
  }

  return (
    <div>
      <p>active: { active }</p>
      <p>chain id: {chainId} </p>
      <p>account: { account } </p>
      <p>error: {errorMesssage} </p>
      <button className="bg-green-500 active:bg-green-700 px-4 py-2 mr-2" onClick={connectInjected}>Injected</button>
      <button className="bg-green-500 active:bg-green-700 px-4 py-2" onClick={connectWalletConnect}>WalletConnect</button>
      <br />
      <button className="bg-red-500 active:bg-red-700 px-4 py-2" onClick={logout}>Deactivate</button>
    </div>
  )
}