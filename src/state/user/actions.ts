import { createAction } from "@reduxjs/toolkit";
import { SerializedToken } from "configs/contants/types";

export const updateUserSingleHopOnly = createAction<{
  userSingleHopOnly: boolean;
}>("user/updateUserSingleHopOnly");

export const updateUserSlippageTolerance = createAction<{
  userSlippageTolerance: number;
}>("user/updateUserSlippageTolerance");

export const addSerializedToken = createAction<{ serializedToken: SerializedToken }>('user/addSerializedToken')
