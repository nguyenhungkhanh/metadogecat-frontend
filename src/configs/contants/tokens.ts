import { ChainId, Token } from '@pancakeswap/sdk'

const { MAINNET, TESTNET } = ChainId

export const mainnetTokens = {
  wbnb: new Token(
    MAINNET,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.com/',
  ),
  // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
  bnb: new Token(MAINNET, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'BNB', 'BNB', 'https://www.binance.com/'),
  cake: new Token(
    MAINNET,
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    18,
    'CAKE',
    'PancakeSwap Token',
    'https://pancakeswap.finance/',
  ),
  busd: new Token(
    MAINNET,
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    18,
    'BUSD',
    'Binance USD',
    'https://www.paxos.com/busd/',
  ),
  usdt: new Token(
    MAINNET,
    '0x55d398326f99059fF775485246999027B3197955',
    18,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  btcb: new Token(
    MAINNET,
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    18,
    'BTCB',
    'Binance BTC',
    'https://bitcoin.org/',
  ),
  ust: new Token(
    MAINNET,
    '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
    18,
    'UST',
    'Wrapped UST Token',
    'https://mirror.finance/',
  ),
  eth: new Token(
    MAINNET,
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    18,
    'ETH',
    'Binance-Peg Ethereum Token',
    'https://ethereum.org/en/',
  ),
  usdc: new Token(
    MAINNET,
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    18,
    'USDC',
    'Binance-Peg USD Coin',
    'https://www.centre.io/usdc',
  ),
}

export const testnetTokens = {
  wbnb: new Token(
    TESTNET,
    '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.com/',
  ),
  cake: new Token(
    TESTNET,
    '0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe',
    18,
    'CAKE',
    'PancakeSwap Token',
    'https://pancakeswap.finance/',
  ),
  busd: new Token(
    TESTNET,
    '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
    18,
    'BUSD',
    'Binance USD',
    'https://www.paxos.com/busd/',
  ),
}
