import React, { useCallback, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useHistory, useParams } from 'react-router';
import { SearchIcon, LoadingIcon, WalletIcon } from "components/icons";
import useActiveWeb3React from 'hooks/useActiveWeb3React';
import logoImage from "assets/images/logo.png";
import ModalWalletConnect from 'components/ModalWalletConnect';
import styles from './index.module.scss';
import useModal from 'hooks/useModal';

let timeout: any;

const formattedAccount = (account: string) => {
  return account?.slice(0, 2) + "..." + account?.slice(-4)
}

function Header() {
  const history = useHistory()
  const { account } = useActiveWeb3React()
  const params: any = useParams()

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleOnChange = (event: any) => {
    setSearch(event?.target?.value)
  }

  const [onPresentModal] = useModal(
    <ModalWalletConnect />,
  )

  return (
    <div className={styles.wrapper}>
      {
        isOpen
        ? <div className="overlay" onClick={() => setIsOpen(false)} />
        : null
      }
      <div className="container mx-auto">
        <div 
          className="wrapper-logo pointer flex align-items-center" 
          onClick={() => {
            setSearch("")
            history.push("/")
          }}
        >
          <img className="logo-image mr" src={logoImage} alt="logo"  />
          <span className="logo-text">MDC Tool</span>
        </div>
        <div className={classNames("wrapper-input-search", { "is-open": isOpen })}>
          <div className="wrapper-content">
            <input 
              autoComplete="nope" 
              value={search} 
              placeholder="Enter a token address" 
              onChange={handleOnChange}
              onFocus={() => setIsOpen(true)}
            />
            <div className="wrapper-icon">
              {
                loading 
                ? <LoadingIcon className="loading-icon" width={22} height={22} />
                : <SearchIcon className="search-icon" width={22} height={22} />
              }
            </div>
            <div className="search-results">
              {
                result
                ? <div className="result-item" onClick={() => {}}>
                    <span className="result-item__name">{ result.name } ({ result.symbol })</span> <br />
                    <small>{ result.address }</small>
                  </div>
                : null
              }
            </div>
          </div>
        </div>
        <div className="connect-wallet-btn" onClick={onPresentModal}>
          <div className="wrapper-wallet-address">
            { account ? formattedAccount(account) : "Connect wallet" }
            <div className="livenow" />
          </div>
          <div className="wrapper-wallet-icon">
            <WalletIcon />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header;