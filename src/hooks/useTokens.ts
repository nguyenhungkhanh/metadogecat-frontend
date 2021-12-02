// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Token, Currency, ETHER } from "@pancakeswap/sdk";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { isAddress } from 'utils'
import getTokenInfo from "utils/getTokenInfo";
import { useDispatch, useSelector } from "react-redux";
import { addSerializedToken } from "state/user/actions";

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
    projectLink: token.projectLink,
  }
}

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
    serializedToken.projectLink,
  )
}

export function useAllTokens(): { [address: string]: Token } {
  const { chainId } = useActiveWeb3React()

  const userTokens = useSelector<AppState, AppState['user']['tokens']>((state) => state.user.tokens)

  return userTokens[chainId] || {}
}

export function useToken(tokenAddress?: string): Token | undefined | null {
  const dispatch = useDispatch()
  const { library, chainId } = useActiveWeb3React()
  const tokens = useAllTokens()
  const [token, setToken] = useState<Token | undefined | null>(undefined)
  const address = isAddress(tokenAddress)
  
  useEffect(() => {
    async function handleGetTokenInfo() {
      const _token = await getTokenInfo(library, chainId, address)
      if (_token) {
        dispatch(addSerializedToken({ serializedToken: serializeToken(_token) }))
      }
      setToken(_token)
    }
    if (!tokens[address]) {
      handleGetTokenInfo()
    }
  }, [chainId, library, address, tokens, dispatch])
  
  return useMemo(() => {
    if (tokens[address]) {
      return deserializeToken(tokens[address])
    }
  
    return token
  }, [address, token, tokens])
}

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const isBNB = currencyId?.toUpperCase() === 'BNB'
  const token = useToken(isBNB ? undefined : currencyId)
  return isBNB ? ETHER : token
}