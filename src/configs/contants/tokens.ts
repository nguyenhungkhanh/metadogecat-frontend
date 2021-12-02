import { ChainId, Token } from "@pancakeswap/sdk";

const { MAINNET, TESTNET } = ChainId;

export const mainnetTokens: any = {
  wbnb: new Token(
    MAINNET,
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    18,
    "WBNB",
    "Wrapped BNB",
    "https://www.binance.com/"
  ),
  busd: new Token(
    MAINNET,
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    18,
    "BUSD",
    "Binance USD",
    "https://www.paxos.com/busd/"
  ),
  usdt: new Token(
    MAINNET,
    "0x55d398326f99059fF775485246999027B3197955",
    18,
    "USDT",
    "Tether USD",
    "https://tether.to/"
  ),
  btcb: new Token(
    MAINNET,
    "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    18,
    "BTCB",
    "Binance BTC",
    "https://bitcoin.org/"
  ),
  eth: new Token(
    MAINNET,
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    18,
    "ETH",
    "Binance-Peg Ethereum Token",
    "https://ethereum.org/en/"
  ),
};

export const testnetTokens: any = {
  wbnb: new Token(
    TESTNET,
    "0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F",
    18,
    "WBNB",
    "Wrapped BNB",
    "https://www.binance.com/"
  ),
  busd: new Token(
    TESTNET,
    "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
    18,
    "BUSD",
    "Binance USD",
    "https://www.paxos.com/busd/"
  ),
};