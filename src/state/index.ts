import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import { useDispatch } from 'react-redux'
import { updateVersion } from './global/actions'
import userReducer from './user/reducer'
import blockReducer from './block/reducer'
import multicallReducer from './multicall/reducer'
import listsReducer from './lists/reducer'
import swapReducer from './swap/reducer'

const PERSISTED_KEYS: string[] = ['lists']

const store = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: {
    block: blockReducer,

    // Exchange
    multicall: multicallReducer,
    user: userReducer,
    lists: listsReducer,
    swap: swapReducer,
  },
  middleware: [...getDefaultMiddleware({ thunk: true }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
export type AppDispatch = typeof store.dispatch
export type AppState = ReturnType<typeof store.getState>
export const useAppDispatch = () => useDispatch()

export default store
