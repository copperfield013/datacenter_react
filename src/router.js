import React from 'react'
import { HashRouter, Route , Switch, Redirect} from 'react-router-dom'
import App from './App'
import Admin from './admin'
import Home from './pages/home'
import Button from './pages/ui/button'
import Modals from './pages/ui/modals'
import Loadings from './pages/ui/loading'
import Notification from "./pages/ui/notification"
import Tab from "./pages/ui/tab"
import Car from "./pages/ui/car"
import Login from "./pages/form/login"
import Register from "./pages/form/register"
import Rich from "./pages/rich"
import Table from "./pages/table/table"
import actTable from "./pages/actTable/actTable"
import Bar from "./pages/echarts/bar"
import Pie from "./pages/echarts/pie"
import Line from "./pages/echarts/line"
import Nomatch from "./pages/demo/nomatch"
import Loginit from './login'

export default class iRouter extends React.Component{
    
    render(){
        return (
            <HashRouter>
                <App>                  
                    <Switch>                  
                        <Route path="/login"  component={Loginit}/>
                        <Route path='/admin' render={()=>
                            <Admin>
                                <Switch> 
                                    <Route path='/admin/home' component={Home}/>
                                    <Route path='/admin/ui/buttons' component={Button}/>
                                    <Route path='/admin/ui/modals' component={Modals}/>
                                    <Route path='/admin/ui/loadings' component={Loadings}/>
                                    <Route path='/admin/ui/notification' component={Notification}/>
                                    <Route path='/admin/ui/tab' component={Tab}/>
                                    <Route path='/admin/ui/car' component={Car}/>
                                    <Route path='/admin/form/login' component={Login}/>
                                    <Route path='/admin/form/reg' component={Register}/>
                                    <Route path='/admin/rich' component={Rich}/>
                                    <Route path='/admin/table/' component={Table}/>
                                    <Route path='/admin/actTable/:id' component={actTable}/>
                                    <Route path='/admin/echarts/bar' component={Bar}/>
                                    <Route path='/admin/echarts/pie' component={Pie}/>
                                    <Route path='/admin/echarts/line' component={Line}/>
                                    <Route component={Nomatch}/>
                                </Switch>
                            </Admin>
                        }/>
                        <Redirect from="/" to="/login" /> 
                    </Switch>
                </App>
            </HashRouter>
        )
    }
}