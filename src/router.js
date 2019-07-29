import React from 'react'
import { HashRouter, Route , Switch, Redirect} from 'react-router-dom'
import App from './App'
import Admin from './pages/admin'
import Loginit from './pages/login'
import Home from './pages/home'
import ActTable from "./pages/actTable"
import Detail from "./pages/detail"
import Import from "./pages/importData/importData"
import ActTree from "./pages/actTree"
import CustomPageRouter from "./pages/customPage/CustomPageRouter";

export default class iRouter extends React.Component{
    render(){
        //console.log(process.env);
        return (
            <HashRouter>
                <App>                  
                    <Switch>                  
                        <Route path="/login"  component={Loginit}/>
                        <Route path='/' render={()=>
                            <Admin>
                                <Switch>
                                    <Route path='/home' component={Home} exact/>
                                    <Route path='/customPage/:menuId/:pageName(.+)' component={CustomPageRouter}/>
                                    <Route path="/:menuId" component={ActTable} exact />
                                    <Route path="/:menuId/search" component={ActTable} exact />
                                    <Route path="/:menuId/import" component={Import} exact />
                                    <Route path="/:menuId/ActTree" component={ActTree} exact />
                                    <Route path="/:menuId/:type" component={Detail} exact />
                                    <Route path="/:menuId/:type/:code" component={Detail} exact/>
                                    <Route path="/:menuId/:type/:code/:nodeId" component={Detail} exact/>
                                    <Route path="/user/:type/:code" component={Detail}/>
                                    <Redirect to="/home"/>
                                </Switch>
                                
                            </Admin>
                        }/>
                    </Switch>
                </App>
            </HashRouter>
        )
    }
}