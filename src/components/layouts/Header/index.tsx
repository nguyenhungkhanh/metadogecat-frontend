import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import classNames from 'classnames';
import { Token } from '@pancakeswap/sdk';
import { isAddress } from 'ethers/lib/utils';
import { SearchIcon, LoadingIcon, WalletIcon } from "components/icons";
import { ModalWalletConnect } from 'components/modals';
import { TokenLists } from 'components/lists';
import useActiveWeb3React from 'hooks/useActiveWeb3React';
import useModal from 'hooks/useModal';
import getTokenInfo from 'utils/getTokenInfo';

import logoImage from "assets/images/logo.png";
import styles from './index.module.scss';

const formattedAccount = (account: string) => {
  return account?.slice(0, 2) + "..." + account?.slice(-4)
}

function Header() {
  const history: any = useHistory()
  const { account, library, chainId } = useActiveWeb3React()

  const [search, setSearch] = useState("")
  const [placeHolder, setPlaceHolder] = useState("")
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<Token | null | undefined>(null)
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
      setToken(search ? undefined : null)
    }
  }, [handleGetTokenInfo, search])

  useEffect(() => {
    const path = history?.location?.pathname || ""
    const tokenAddress = path.split("/tokens/")[1]

    if (isAddress(tokenAddress)) {
      setPlaceHolder(tokenAddress)
    }
  }, [history?.location?.pathname])

  const [onPresentModal] = useModal(<ModalWalletConnect />)
  
  const onSelect = (token: Token) => {
    setIsOpen(false)
    history.push(`/tokens/${token.address}`)
  }

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
            setPlaceHolder("0x5566af9836828e9f4d6616b5dffa366ed0d65fe6")
            history.push("/tokens/0x5566af9836828e9f4d6616b5dffa366ed0d65fe6")
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
              placeholder={placeHolder || "Enter a token address" }
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
                token === null
                ? <TokenLists onSelect={onSelect} />
                : (
                    token
                    ? <div className="result-item" onClick={() => onSelect(token)}>
                        <span className="result-item__name">{ token.name } ({ token.symbol })</span> <br />
                        <small>{ token.address }</small>
                      </div>
                    : <div className="result-item">
                        { loading ? 'Loading...' : 'No option' }
                      </div> 
                  ) 
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