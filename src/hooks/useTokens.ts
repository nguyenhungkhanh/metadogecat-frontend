// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Token, Currency, ETHER } from "@pancakeswap/sdk";
import useUserAddedTokens from "state/user/hooks/useUserAddedTokens";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { isAddress } from 'utils'
import { useBytes32TokenContract, useTokenContract } from 'hooks/useContract'
import { useSingleCallResult } from "state/multicall/hooks";
import getTokenInfo from "utils/getTokenInfo";
import { useDispatch } from "react-redux";
import { addSerializedToken } from "state/user/actions";
import { useAddUserToken } from "state/user/hooks";
import { serializeToken } from "state/user/hooks/helpers";

export function useAllTokens(): { [address: string]: Token } {
  const { chainId } = useActiveWeb3React()
  return {
    "0x55d398326f99059fF775485246999027B3197955": new Token(
      chainId,
      "0x55d398326f99059fF775485246999027B3197955",
      18,
      "USDT",
      "Tether USD"
    )
  }
}

export function useToken(tokenAddress?: string): Token | undefined | null {
  const { library, chainId } = useActiveWeb3React()
  const [token, setToken] = useState<Token | undefined | null>(undefined)

  const address = isAddress(tokenAddress)

  useEffect(() => {
    async function handleGetTokenInfo() {
      const _token = await getTokenInfo(library, chainId, address)
      setToken(_token)
    }
    handleGetTokenInfo()
  }, [chainId, library, address])
  
  return token
}

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const isBNB = currencyId?.toUpperCase() === 'BNB'
  const token = useToken(isBNB ? undefined : currencyId)
  return isBNB ? ETHER : token
}

export function useUnsupportedTokens(): { [address: string]: Token } {
  return {};
}

export function useAllInactiveTokens(): { [address: string]: Token } {
  return {}
}