import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import { useDispatch } from 'react-redux'
import userReducer from './user/reducer'
import transactionsReducer from './transactions/reducer'
import swapReducer from './swap/reducer'

const PERSISTED_KEYS: string[] = ['user', 'lists']

const store = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: {
    // Exchange
    transactions: transactionsReducer,
    user: userReducer,
    swap: swapReducer,
  },
  middleware: [save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
export type AppDispatch = typeof store.dispatch
export type AppState = ReturnType<typeof store.getState>
export const useAppDispatch = () => useDispatch()

export default store
