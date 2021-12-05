import { BigNumber } from 'ethers'
import { useSelector } from 'react-redux'
import { AppState } from '../state'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const ttl = useSelector<AppState, number>((state) => state.user.userDeadline)
  const currentTimestamp: number = parseInt((new Date().getTime()/1000).toString())
  return BigNumber.from(currentTimestamp + ttl);
}
