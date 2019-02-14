import React from 'react'
import { HashRouter, Route , Switch, Redirect} from 'react-router-dom'
import App from './App'
import Admin from './pages/admin'
import Loginit from './pages/login'
import Home from './pages/home'
import ActTable from "./pages/actTable/actTable"
import Detail from "./pages/detail"
import Import from "./pages/importData/importData"

export default class iRouter extends React.Component{
   
    render(){
        return (
            <HashRouter>
                <App>                  
                    <Switch>                  
                        <Route path="/login"  component={Loginit}/>
                        <Route path='/' render={()=>
                            <Admin>
                                <Switch>
                                    <Route path='/home' component={Home} />
                                    <Route path="/:menuId" component={ActTable} exact />
                                    <Route path="/:menuId/import" component={Import} exact />
                                    <Route path="/:menuId/:type/:code" component={Detail}/>
                                    <Redirect to="/home" />
                                </Switch>
                                
                            </Admin>
                        }/>
                    </Switch>
                </App>
            </HashRouter>
        )
    }
}