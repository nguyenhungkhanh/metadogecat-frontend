import { useCallback } from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { NoBscProviderError } from '@binance-chain/bsc-connector'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from '@web3-react/walletconnect-connector'
import { connectorsByName, ConnectorNames } from 'utils/web3React'
import { setupNetwork } from 'utils/wallet'
import { CONNECTOR_KEY } from 'configs'

const useAuth = () => {
  const { activate, deactivate } = useWeb3React()

  const login = useCallback(
    (connectorID: ConnectorNames) => {
      const connector = connectorsByName[connectorID]
      
      if (connector) {
        window.localStorage.setItem(CONNECTOR_KEY, connectorID)

        activate(connector, async (error: Error) => {
          if (error instanceof UnsupportedChainIdError) {
            const hasSetup = await setupNetwork()
            if (hasSetup) {
              activate(connector)
            }
          } else {
            window.localStorage.removeItem(CONNECTOR_KEY)
            if (error instanceof NoEthereumProviderError || error instanceof NoBscProviderError) {
              // toastError('Provider Error', 'No provider was found')
            } else if (
              error instanceof UserRejectedRequestErrorInjected ||
              error instanceof UserRejectedRequestErrorWalletConnect
            ) {
              if (connector instanceof WalletConnectConnector) {
                const walletConnector = connector as WalletConnectConnector
                walletConnector.walletConnectProvider = null
              }
              // toastError('Authorization Error', 'Please authorize to access your account')
            } else {
              // toastError(error.name, error.message)
            }
          }
        })
      } else {
        // toastError('Unable to find connector', 'The connector config is wrong')
      }
    },
    [activate],
  )

  const logout = useCallback(() => {
    deactivate()
    
    // This localStorage key is set by @web3-react/walletconnect-connector
    if (window.localStorage.getItem('walletconnect')) {
      connectorsByName.walletconnect.close()
      connectorsByName.walletconnect.walletConnectProvider = null
    }
    window.localStorage.removeItem(CONNECTOR_KEY)
  }, [deactivate])

  return { login, logout }
}

export default useAuth
