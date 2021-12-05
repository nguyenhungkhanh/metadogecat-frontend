import { Web3Provider } from "@ethersproject/providers";
import { Token } from "@pancakeswap/sdk";
import { getContract, isAddress } from "utils";
import ERC20_ABI from 'configs/abi/erc20.json';

async function getTokenInfo(library: Web3Provider | undefined, chainId: number | undefined, tokenAddress: string) {
  if (!library || !chainId || !isAddress(tokenAddress)) return undefined

  try {
    const contract = await getContract(tokenAddress, ERC20_ABI, library)
    const name = await contract.name()
    const decimals = await contract.decimals()
    const symbol = await contract.symbol()

    return new Token(chainId, tokenAddress, decimals, symbol, name)
  } catch (error) {
    return undefined
  }
}

export default getTokenInfo