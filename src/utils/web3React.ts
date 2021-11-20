// @ts-nocheck
import { UnsupportedChainIdError } from "@web3-react/core";
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import {
  WalletConnectConnector,
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
} from "@web3-react/walletconnect-connector";
import { BscConnector } from "@binance-chain/bsc-connector";
import { ethers } from "ethers";
import { CHAIN_ID } from "configs";
import getRpcUrl from "./getRpcUrl";

const RPC_URL = getRpcUrl()

export enum ConnectorNames {
  Injected = "injected",
  WalletConnect = "walletconnect",
  BSC = "bsc",
}

export const POLLING_INTERVAL = 12000;

export const injected = new InjectedConnector({
  supportedChainIds: [CHAIN_ID],
});

export const walletconnect = new WalletConnectConnector({
  rpc: { [CHAIN_ID]: RPC_URL },
  qrcode: true,
});

export const bscConnector = new BscConnector({ supportedChainIds: [CHAIN_ID] });

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.BSC]: bscConnector,
};

export const getLibrary = (provider: any): ethers.providers.Web3Provider => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = POLLING_INTERVAL;
  return library;
};

export const getErrorMessage = (error: Error | null) => {
  if (!error) return null;

  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return "Please authorize this website to access your Ethereum account.";
  } else {
    console.error(error);
    return "An unknown error occurred. Check the console for more details.";
  }
};
