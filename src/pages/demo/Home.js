import React from "react"
import { HashRouter, Route , Link ,Switch} from 'react-router-dom'
import Main from "./Main"
import About from "./About"
import Topic from "./Topic"
import Info from "./info"
import Nomatch from "./nomatch"

export default class Home extends React.Component{
    render(){
        return (
            <HashRouter>
                <div>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/about">About</Link>
                        </li>
                        <li>
                            <Link to="/topic">Topic</Link>
                        </li>
                        <li>
                            <Link to="/Ceshi">Ceshi</Link>
                        </li>
                    </ul>
                    <hr/>
                    <Switch>
                        <Route exact={true} path="/" component={Main}></Route>
                        <Route path="/about" render={()=>
                            <About>
                                <Route path="/about/:id" component={Info}></Route>
                            </About>
                        }></Route>
                        <Route path="/topic" component={Topic}></Route>
                        <Route component={Nomatch}></Route>
                    </Switch>
                </div>
            </HashRouter>
        )
    }
}