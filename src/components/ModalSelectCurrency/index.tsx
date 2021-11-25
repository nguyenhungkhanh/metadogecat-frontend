<<<<<<< HEAD
import React, { useCallback, useEffect, useState } from 'react'
import { Currency } from '@pancakeswap/sdk';
=======
import React, { useCallback, useState } from 'react'
import { Currency, Token } from '@pancakeswap/sdk';
>>>>>>> ba2e3f2e4b4db1f28c1a0c19a10aca4d43752747
import classNames from 'classnames';
import { CloseIcon, LoadingIcon } from "../icons";
import defaultTokens from './defaultTokens'

import styles from './index.module.scss'
import useDebounce from 'hooks/useDebounce';
import { useToken } from 'hooks/useTokens';
<<<<<<< HEAD
import { isAddress } from '@ethersproject/address';

let timeout: any;
=======
>>>>>>> ba2e3f2e4b4db1f28c1a0c19a10aca4d43752747

export declare type Handler = () => void;

export interface InjectedProps {
  onDismiss?: Handler
  onCurrencySelect: (currency: Currency) => void
}

interface ModalSelectCurrencyProps extends InjectedProps {}

<<<<<<< HEAD
export default function ModalSelectCurrency({ onDismiss, onCurrencySelect }: ModalSelectCurrencyProps) {  
  const [result, setResult] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  console.log("debouncedQuery", window.ethereum)

  // if they input an address, use it
  const searchToken = useToken(debouncedQuery)
  console.log('searchToken', searchToken)
  const handleInput = useCallback((event) => {
    const input = event.target.value
    if (isAddress(input)) {
      setSearchQuery(input)
    }
  }, [])
  

  const handleSearch = useCallback(async() => {
    if (!search) {
      setResult(null)
      return
    }

    setLoading(true)

    const token = {};

    setTimeout(() => {
      setResult(token)
      setLoading(false)
    }, 500)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  const handleOnChange = (_token: any) => {
    const t = { ..._token }
    delete t.logo
    // onCurrencySelect(
    //   // new Currency()
    // )
  }

=======
export default function ModalSelectCurrency({ onDismiss, onCurrencySelect }: ModalSelectCurrencyProps) { 
  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  // if they input an address, use it
  const searchToken = useToken(debouncedQuery)
  const handleInput = useCallback((event) => {
    const input = event.target.value
    setSearchQuery(input)
  }, [])

  const handleOnChange = (_token: Token) => {
    onCurrencySelect(_token)
    if (onDismiss) {
      onDismiss()
    }
  }
  
>>>>>>> ba2e3f2e4b4db1f28c1a0c19a10aca4d43752747
  return (
    <div className={styles.wrapper}>
      <div className="modal">
        <div className="modal-header flex justify-content-space-between">
          <span className="modal-header__title">
            Select a token
          </span>
          <div onClick={onDismiss}><CloseIcon /></div>
        </div>
        <div className="modal-body">
          <div className="wrapper-select-token-input">
            <input 
              placeholder="Enter a token address" 
              autoComplete="none" 
              className="w-100" 
              onChange={handleInput} 
            />
<<<<<<< HEAD
            {
              loading
              ? <div className="wrapper-loading-icon">
                  <LoadingIcon />
                </div>
              : null
            }
            <div className={classNames("list-results", { "is-show": result || search})}>
              {
                result
                ? <div className="result-item" onClick={() => handleOnChange(result)}>
                    <span className="result-name">{ result.name } ({ result.symbol })</span><br />
                    <small className="result-address">{ result.address }</small>
                  </div>
                : (
                  search && !loading
                    ? <div className="result-item">
                        <span>No option</span>
                      </div> 
                    : null
                  )
=======
            <div className={classNames("list-results", { "is-show": searchQuery || searchToken})}>
              {
                searchToken
                ? <div className="result-item" onClick={() => handleOnChange(searchToken)}>
                    <span className="result-name">{ searchToken.name } ({ searchToken.symbol })</span><br />
                    <small className="result-address">{ searchToken.address }</small>
                  </div>
                : <div className="result-item">
                    <span>{ searchToken === null ? "Loading..." : "Not found"}</span>
                  </div> 
>>>>>>> ba2e3f2e4b4db1f28c1a0c19a10aca4d43752747
              }
            </div>
          </div>
          <div className="list-tokens mt-1">
            <div className="list-tokens__header">Token</div>
            {
              defaultTokens.map((t: any) => (
                <div key={t.address} className="token-item" onClick={() => handleOnChange(t)}>
                  <img className="token-item__logo mr" src={t.logo} alt="" />
                  <span className="token-item__name">{ t.symbol }</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}