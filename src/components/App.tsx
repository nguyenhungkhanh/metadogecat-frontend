import { Router, Switch, Route, Redirect } from 'react-router-dom'
import { useUserAgent, useEagerConnect } from 'hooks'
import history from 'routerHistory'
import Swap from 'pages/swap'
import Header from './layouts/Header'

export default function App() {
  useUserAgent()
  useEagerConnect()

  return (
    <Router history={history}>
      <Header />
      <Switch>
        <Route path="/tokens/:tokenAddress" component={Swap} />
        <Route path="*">
          <Redirect to="/tokens/0x5566af9836828e9f4d6616b5dffa366ed0d65fe6" />
        </Route>
      </Switch>
    </Router>
  )
}
