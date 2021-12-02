import { createAction } from "@reduxjs/toolkit";

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
  projectLink?: string
}

export const updateUserSingleHopOnly = createAction<{
  userSingleHopOnly: boolean;
}>("user/updateUserSingleHopOnly");

export const updateUserSlippageTolerance = createAction<{
  userSlippageTolerance: number;
}>("user/updateUserSlippageTolerance");

export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>('user/addSerializedToken')
