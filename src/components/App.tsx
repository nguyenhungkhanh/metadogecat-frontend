import React from 'react'
import { useEagerConnect } from 'hooks'
import useUserAgent from 'hooks/useUserAgent'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ConnectorNames, getErrorMessage } from 'utils/web3React'
import useTokenBalance, { useGetBnbBalance } from 'hooks/useTokenBalance'
import useAuth from 'hooks/useAuth'
import { formatBigNumber } from 'utils/formatBalance'

export default function App() {
  useUserAgent()
  useEagerConnect()

  const { library, chainId, account, active, error } = useActiveWeb3React()
  const bnbBalance = useGetBnbBalance()
  const daiBalance = useTokenBalance("0x8a9424745056Eb399FD19a0EC26A14316684e274");

  const { login, logout } = useAuth()

  const errorMesssage = error ? getErrorMessage(error) : null;


  const connectInjected = () => {
    login(ConnectorNames.Injected)
  }

  const connectWalletConnect = () => {
    login(ConnectorNames.WalletConnect)
  }

  console.log(library, formatBigNumber(bnbBalance.balance), daiBalance.balance)

  return (
    <div>
      <p>active: { active }</p>
      <p>chain id: {chainId} </p>
      <p>account: { account } </p>
      <p>error: {errorMesssage} </p>
      <button className="bg-green-500 active:bg-green-700 px-4 py-2 mr-2" onClick={connectInjected}>Injected</button>
      <button className="bg-green-500 active:bg-green-700 px-4 py-2" onClick={connectWalletConnect}>WalletConnect</button>
      <br />
      <button className="bg-red-500 active:bg-red-700 px-4 py-2" onClick={logout}>Deactivate</button>
    </div>
  )
}
