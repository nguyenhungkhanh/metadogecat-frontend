import React from 'react'
import { CloseIcon, CopyIcon, LogoutIcon } from "components/icons";

import useActiveWeb3React from 'hooks/useActiveWeb3React';
import { Handler } from 'contexts/ModalContext';
import { ConnectorNames } from 'utils/web3React';
import useAuth from 'hooks/useAuth';

import metamaskImage from "assets/images/metamask.svg";
import styles from './index.module.scss'

export interface InjectedProps {
  onDismiss?: Handler
}

interface ModalWalletConnectProps extends InjectedProps {}

export default function ModalWalletConnect({ onDismiss }: ModalWalletConnectProps) {
  const { account } = useActiveWeb3React()
  const { login, logout } = useAuth();

  const connectWallet = async (connector: ConnectorNames) => {
    login(connector)
  }

  const disconnectWallet = async () => {
    logout()
    if (onDismiss) {
      onDismiss()
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className="modal">
        <div className="modal-header flex justify-content-space-between">
          <span className="modal-header__title">
            { account ? "Your wallet" : "Select a wallet" }
          </span>
          <div onClick={onDismiss}><CloseIcon /></div>
        </div>
        <div className="modal-body">
          {
            !account
            ? <div className="wallets">
                <div className="wallet-item" onClick={() => connectWallet(ConnectorNames.Injected)}>
                  <img className="wallet-item__logo mr" src={metamaskImage} alt="metamask logo" /> 
                  <span className="wallet-item__name">Metamask</span>
                </div>
              </div>
            : <div className="wallet-info">
                <div className="wallet-info__address flex justify-content-space-between align-items-center">
                  <span className="account-address">{ account }</span>
                  <CopyIcon />
                </div>
              </div>
          }
        </div>
        {
          account
          ? <div className="modal-footer">
              <div className="wrapper-disconnect flex align-items-center" onClick={disconnectWallet}>
                <LogoutIcon /> <span className="ml">Disconnect</span>
              </div>
            </div>
          : null
        }
      </div>
    </div>
  )
}