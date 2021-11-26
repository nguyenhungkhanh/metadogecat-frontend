import React from 'react'
import { useEagerConnect } from 'hooks'
import useUserAgent from 'hooks/useUserAgent'
import { usePollBlockNumber } from 'state/block/hooks'
import { Router, Switch, Route } from 'react-router-dom'
import history from 'routerHistory'
import Home from 'pages/home'
import Swap from 'pages/swap'
import Header from './Header'

export default function App() {
  usePollBlockNumber()
  useUserAgent()
  useEagerConnect()

  return (
    <Router history={history}>
      <Header />
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/tokens/:tokenAddress" component={Swap} />
      </Switch>
    </Router>
  )
}
