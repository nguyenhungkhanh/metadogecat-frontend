import { Router, Switch, Route } from 'react-router-dom'
import { useUserAgent, useEagerConnect } from 'hooks'
import history from 'routerHistory'
import Home from 'pages/home'
import Swap from 'pages/swap'
import Header from './Header'

export default function App() {
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
