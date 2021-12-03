import { TokenAmount, Pair, Currency } from '@pancakeswap/sdk'
import { useEffect, useMemo, useState } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import getReverses from 'utils/getReverses'

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePairs(currencies: [Currency | undefined, Currency | undefined][]): [PairState, Pair | null][] {
  const { chainId, library } = useActiveWeb3React()
  const [results, setResults] = useState<any>([])

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies],
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
      }),
    [tokens],
  )

  useEffect(() => {
    async function handleGetReverses() {
      try {
        let arrayPromise = [];

        for (const pairAddresse of pairAddresses) {
          arrayPromise.push(
            pairAddresse
              ? getReverses(library, pairAddresse)
              : undefined
          )
        }
  
        const responses = await Promise.all(arrayPromise)
        setResults(responses)
      } catch (error) {

      }
    }
    handleGetReverses()
  }, [library, pairAddresses])

  return useMemo(() => {
    return results.map((result: any, i: any) => {
      const tokenA = tokens[i] && tokens[i][0] ? tokens[i][0] : undefined
      const tokenB = tokens[i] && tokens[i][1] ? tokens[i][1] : undefined

      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!result) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = result
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
      ]
    })
  }, [results, tokens])
}

export function usePair(tokenA?: Currency, tokenB?: Currency): [PairState, Pair | null] {
  return usePairs([[tokenA, tokenB]])[0]
}
