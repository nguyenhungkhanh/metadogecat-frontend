import React, { useMemo, useState } from 'react'
import { Token } from '@pancakeswap/sdk'
import classNames from 'classnames'
import { deserializeToken, useAllTokens } from 'hooks/useTokens'

import styles from './index.module.scss'

enum TABS {
  ALL = "all",
  HISTORY = "history"
}

function TokenLists({ onSelect }: { onSelect: (token: Token) => void }) {
  const [tabActive, setTabActive] = useState<string>(TABS.ALL)
  const tokens = useAllTokens()

  const offsetLeft = useMemo(() => {
    if (tabActive === TABS.HISTORY) {
      return "calc(80px + 0.5rem)"
    }
    return "0.5rem"
  }, [tabActive])
  
  const allTokens = useMemo(() => {
    let _allTokens = []

    for (const tokenAddress in tokens) {
      _allTokens.push(tokens[tokenAddress])
    }
    return _allTokens;
  }, [tokens])

  const handleOnSelect = (token: Token) => {
    onSelect(deserializeToken(token))
  }

  return (
    <div className={classNames(styles.wrapper)}>
      <div className="tabs flex p-2">
        <div 
          className={classNames("tab-item")} 
          onClick={() => setTabActive(TABS.ALL)}
        >
          All
        </div>
        <div 
          className={classNames("tab-item")}
          onClick={() => setTabActive(TABS.HISTORY)}
        >
          History
        </div>
        <div className="active" style={{ left: offsetLeft }}/>
      </div>
      <div>
      <div className="token-lists">
        <table>
          <tbody>
            {
              allTokens.map((token: any) => (
                <tr key={token.address} onClick={() => handleOnSelect(token)}>
                  <td>{token.name}</td>
                  <td>{token.symbol}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      </div>
    </div>
  ) 
}

export default TokenLists;