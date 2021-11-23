import { createReducer } from '@reduxjs/toolkit'
import { INITIAL_ALLOWED_SLIPPAGE } from 'configs/contants'
import { SerializedToken } from 'configs/contants/types'
import {
  updateUserSingleHopOnly,
} from './actions'
import { GAS_PRICE_GWEI } from './hooks/helpers'

export interface UserState {
  // only allow swaps on direct pairs
  userSingleHopOnly: boolean,

  userSlippageTolerance: number,

  gasPrice: string,

  tokens: {
    [chainId: number]: {
      [address: string]: SerializedToken
    }
  }
}

export const initialState: UserState = {
  userSingleHopOnly: true,
  userSlippageTolerance: INITIAL_ALLOWED_SLIPPAGE,
  gasPrice: GAS_PRICE_GWEI.default,
  tokens: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserSingleHopOnly, (state, action) => {
      state.userSingleHopOnly = action.payload.userSingleHopOnly
    })
)
