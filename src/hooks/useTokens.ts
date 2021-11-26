// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Token, Currency, ETHER } from "@pancakeswap/sdk";
import useUserAddedTokens from "state/user/hooks/useUserAddedTokens";
import { TokenAddressMap, useUnsupportedTokenList, useCombinedActiveList, useCombinedInactiveList } from "state/lists/hooks";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { isAddress } from 'utils'
import { useTokenContract } from 'hooks/useContract'

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(
  tokenMap: TokenAddressMap,
  includeUserAdded: boolean
): { [address: string]: Token } {
  const { chainId } = useActiveWeb3React();
  const userAddedTokens = useUserAddedTokens();

  return useMemo(() => {
    if (!chainId) return {};

    // reduce to just tokens
    const mapWithoutUrls = Object.keys(tokenMap[chainId]).reduce<{
      [address: string]: Token;
    }>((newMap, address) => {
      newMap[address] = tokenMap[chainId][address].token;
      return newMap;
    }, {});

    if (includeUserAdded) {
      return (
        userAddedTokens
          // reduce into all ALL_TOKENS filtered by the current chain
          .reduce<{ [address: string]: Token }>(
            (tokenMap_, token) => {
              tokenMap_[token.address] = token;
              return tokenMap_;
            },
            // must make a copy because reduce modifies the map, and we do not
            // want to make a copy in every iteration
            { ...mapWithoutUrls }
          )
      );
    }

    return mapWithoutUrls;
  }, [chainId, userAddedTokens, tokenMap, includeUserAdded]);
}

export function useAllTokens(): { [address: string]: Token } {
  const { chainId } = useActiveWeb3React()
  const allTokens = useCombinedActiveList()
  // return useTokensFromMap(allTokens, true)
  // address: "0x55d398326f99059fF775485246999027B3197955"
  // chainId: 56
  // decimals: 18
  // name: "Tether USD"
  // projectLink: undefined
  // symbol: "USDT"
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

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
  const { chainId } = useActiveWeb3React()
  const [token, setToken] = useState<Token | undefined | null>(null)

  const address = isAddress(tokenAddress)
  const tokenContract = useTokenContract(address || undefined, false)

  useEffect(() => {
    async function getTokenInfo() {
      const name = await tokenContract.name()
      const decimals = await tokenContract.decimals()
      const symbol = await tokenContract.symbol()

      setToken(new Token(chainId, address, decimals, symbol, name))
    }
    if (!token) {
      if (!address || !tokenContract) {
        setToken(undefined)
      } else {
        getTokenInfo()
      }
    }
  }, [address, chainId, token, tokenContract])
  
  return token;
}

export function useCurrency(currencyId: string | undefined): Currency | null | undefined {
  const isBNB = currencyId?.toUpperCase() === 'BNB'
  const token = useToken(isBNB ? undefined : currencyId)
  return isBNB ? ETHER : token
}

export function useUnsupportedTokens(): { [address: string]: Token } {
  const unsupportedTokensMap = useUnsupportedTokenList();
  return useTokensFromMap(unsupportedTokensMap, false);
}

export function useAllInactiveTokens(): { [address: string]: Token } {
  // get inactive tokens
  const inactiveTokensMap = useCombinedInactiveList()
  const inactiveTokens = useTokensFromMap(inactiveTokensMap, false)

  // filter out any token that are on active list
  const activeTokensAddresses = Object.keys(useAllTokens())
  const filteredInactive = activeTokensAddresses
    ? Object.keys(inactiveTokens).reduce<{ [address: string]: Token }>((newMap, address) => {
        if (!activeTokensAddresses.includes(address)) {
          newMap[address] = inactiveTokens[address]
        }
        return newMap
      }, {})
    : inactiveTokens

  return filteredInactive
}