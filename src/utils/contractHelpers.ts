import { ethers } from "ethers"
import erc20Abi from "configs/abi/erc20.json"
import { simpleRpcProvider } from "./providers"

const getContract = (abi: any, address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  const signerOrProvider = signer ?? simpleRpcProvider
  return new ethers.Contract(address, abi, signerOrProvider)
}

export const getErc20Contract = (address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(erc20Abi, address, signer)
}