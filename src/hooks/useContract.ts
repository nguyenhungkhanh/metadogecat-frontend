// @ts-nocheck
// Code below migrated from Exchange useContract.ts
import { useMemo } from "react"
import useActiveWeb3React from "./useActiveWeb3React"
import { Contract } from '@ethersproject/contracts'
import { getContract } from 'utils'
import ERC20_ABI from 'configs/abi/erc20.json'
import { WETH } from '@pancakeswap/sdk'
import WETH_ABI from 'configs/abi/weth.json'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}