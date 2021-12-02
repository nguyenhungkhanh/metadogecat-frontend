import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useHistory, } from 'react-router';
import { SearchIcon, LoadingIcon, WalletIcon } from "components/icons";
import useActiveWeb3React from 'hooks/useActiveWeb3React';
import logoImage from "assets/images/logo.png";
import ModalWalletConnect from 'components/ModalWalletConnect';
import styles from './index.module.scss';
import useModal from 'hooks/useModal';
import { Token } from '@pancakeswap/sdk';
import { isAddress } from 'ethers/lib/utils';
import getTokenInfo from 'utils/getTokenInfo';

const formattedAccount = (account: string) => {
  return account?.slice(0, 2) + "..." + account?.slice(-4)
}

function Header() {
  const history = useHistory()
  const { account, library, chainId } = useActiveWeb3React()

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<Token | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)

  const handleOnChange = (event: any) => {
    setSearch(event?.target?.value)
  }

  const handleGetTokenInfo = useCallback(async (tokenAddress) => {
    setLoading(true)
    try {
      const _token = await getTokenInfo(library, chainId, tokenAddress)
      setToken(_token)
    } catch(error) {
      console.error(error)
    }
    setLoading(false)
  }, [chainId, library])

  useEffect(() => {
    if (isAddress(search)) {
      handleGetTokenInfo(search)
    } else {
      setToken(undefined)
    }
  }, [handleGetTokenInfo, search])

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
                token
                ? <div className="result-item" onClick={() => {}}>
                    <span className="result-item__name">{ token.name } ({ token.symbol })</span> <br />
                    <small>{ token.address }</small>
                  </div>
                : <div className="result-item">
                    { loading ? 'Loading...' : 'No option' }
                  </div>
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