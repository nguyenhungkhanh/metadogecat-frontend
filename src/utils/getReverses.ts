import { Web3Provider } from "@ethersproject/providers";
import { getContract, isAddress } from "utils";
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { Interface } from '@ethersproject/abi'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)

async function getReverses(library: Web3Provider | undefined, pairAddress: string) {
  if (!library || !isAddress(pairAddress)) return undefined

  try {
    const contract = await getContract(pairAddress, PAIR_INTERFACE, library)
    const reverses = await contract.getReserves()
    return reverses
  } catch (error) {
    return undefined
  }
}

export default getReverses