// @ts-nocheck
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
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
