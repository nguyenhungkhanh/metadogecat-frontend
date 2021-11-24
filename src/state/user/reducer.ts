import { createReducer } from '@reduxjs/toolkit'
import { DEFAULT_DEADLINE_FROM_NOW, INITIAL_ALLOWED_SLIPPAGE } from 'configs/contants'
import { SerializedToken } from 'configs/contants/types'
import {
  addSerializedToken,
  updateUserSingleHopOnly,
} from './actions'
import { GAS_PRICE_GWEI } from './hooks/helpers'

export interface UserState {
  // only allow swaps on direct pairs
  userSingleHopOnly: boolean,

  userSlippageTolerance: number,

  gasPrice: string,

  timestamp: number,

  userDeadline: number,

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
  timestamp: new Date().getTime(),
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  tokens: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserSingleHopOnly, (state, action) => {
      state.userSingleHopOnly = action.payload.userSingleHopOnly
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
      state.timestamp = new Date().getTime()
    })
)
