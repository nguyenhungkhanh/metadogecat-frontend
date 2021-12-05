import { createReducer } from '@reduxjs/toolkit'
import { DEFAULT_DEADLINE_FROM_NOW, GAS_PRICE_GWEI, INITIAL_ALLOWED_SLIPPAGE } from 'configs/contants'
import {
  SerializedToken,
  addSerializedToken,
  updateUserSingleHopOnly,
  updateUserSlippageTolerance,
  updateUserAutoSlippage,
} from './actions'

export interface UserState {
  // only allow swaps on direct pairs
  userSingleHopOnly: boolean,
  userSlippageTolerance: number,
  gasPrice: string,
  userDeadline: number,
  userAutoSlippage: boolean,
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
  userDeadline: DEFAULT_DEADLINE_FROM_NOW,
  userAutoSlippage: true,
  tokens: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserSingleHopOnly, (state, action) => {
      state.userSingleHopOnly = action.payload.userSingleHopOnly
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
    })
    .addCase(updateUserAutoSlippage, (state, action) => {
      state.userAutoSlippage = action.payload.userAutoSlippage
    })
    .addCase(addSerializedToken, (state, { payload: { serializedToken } }) => {
      if (!state.tokens) {
        state.tokens = {}
      }
      state.tokens[serializedToken.chainId] = state.tokens[serializedToken.chainId] || {}
      state.tokens[serializedToken.chainId][serializedToken.address] = serializedToken
    })
)
