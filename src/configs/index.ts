import { ChainId } from "@pancakeswap/sdk";

export const CONNECTOR_KEY = "connector_id";

export const WALLET_KEY = "wallet";

export const BASE_BSC_SCAN_URLS = {
  [ChainId.MAINNET]: 'https://bscscan.com',
  [ChainId.TESTNET]: 'https://testnet.bscscan.com',
}

export const BSC_SCAN_URL = process.env.REACT_APP_BSC_SCAN_URL

export const CHAIN_ID = Number(process.env.REACT_APP_CHAIN_ID)