import React from 'react'
import { useEagerConnect } from 'hooks'
import useUserAgent from 'hooks/useUserAgent'
import { Router, Switch, Route } from 'react-router-dom'
import history from 'routerHistory'
import Home from 'pages/home'
import Swap from 'pages/swap'

export default function App() {
  useUserAgent()
  useEagerConnect()

  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route exact strict path="/swap" component={Swap} />
      </Switch>
    </Router>
  )
}
