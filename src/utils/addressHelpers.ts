// @ts-nocheck
import { ChainId } from '@pancakeswap/sdk'
import addresses from 'configs/contants/contracts'
import { Address } from 'configs/contants/types'

export const getAddress = (address: Address): string => {
  const chainId = process.env.REACT_APP_CHAIN_ID
  return address[chainId] ? address[chainId] : address[ChainId.MAINNET]
}

export const getMulticallAddress = () => {
  return getAddress(addresses.multiCall)
}