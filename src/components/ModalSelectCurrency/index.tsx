import React, { useCallback, useState } from 'react'
import { Currency, Token } from '@pancakeswap/sdk';
import classNames from 'classnames';
import { CloseIcon } from "../icons";
import defaultTokens from './defaultTokens'

import styles from './index.module.scss'
import useDebounce from 'hooks/useDebounce';
import { useToken } from 'hooks/useTokens';
import { Handler } from 'contexts/ModalContext';

export interface InjectedProps {
  onDismiss?: Handler
  onCurrencySelect: (currency: Currency) => void
}

interface ModalSelectCurrencyProps extends InjectedProps {}

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