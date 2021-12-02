import { Currency, CurrencyAmount, ETHER, Token, JSBI, TokenAmount } from "@pancakeswap/sdk"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ERC20_ABI } from 'configs/abi/erc20'
import { getContract } from 'utils'
import useActiveWeb3React from "hooks/useActiveWeb3React"

export function useCurrencyBalance(account?: string, currency?: Currency | undefined): CurrencyAmount | undefined {
  const { library } = useActiveWeb3React();
  const [balance, setBalance] = useState<CurrencyAmount | undefined>(undefined);

  const getBNBBalance = useCallback(async () => {
    if (library && account) {
      const _balance = await library?.getBalance(account)
      if (_balance) {
        setBalance(CurrencyAmount.ether(JSBI.BigInt(_balance.toString())))
      }
    }
  }, [account, library])

  const getTokenBalance = useCallback(async (token) => {
    if (library && account && token?.address) {
      const contract = await getContract(token.address, ERC20_ABI, library)
      const _balance = await contract.balanceOf(account)
      if (_balance) {
        setBalance(new TokenAmount(token, JSBI.BigInt(_balance.toString())))
      }
    }
  }, [account, library])

  useEffect(() => {
    if (currency === ETHER) {
      getBNBBalance()
    } else if (currency instanceof Token) {
      getTokenBalance(currency)
    }
  }, [account, currency, getBNBBalance, getTokenBalance, library])

  return balance;
}

export function useCurrencyBalances(account?: string, currencies?: (Currency | undefined)[]): (CurrencyAmount | undefined)[] {
  const inputBalance = useCurrencyBalance(account, currencies ? currencies[0] : undefined)
  const outputBalance = useCurrencyBalance(account, currencies ? currencies[1] : undefined)

  return useMemo(
    () => [inputBalance, outputBalance],
    [inputBalance, outputBalance],
  )
}