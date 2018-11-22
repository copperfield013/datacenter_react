import React from "react"
import {Link} from 'react-router-dom'

export default class About extends React.Component{
    render(){
        return (
            <div>
                <Link to="/about/test">嵌套路由1</Link>
                <br/>
                <Link to="/about/456">嵌套路由2</Link>
                {this.props.children}
            </div>
        )
    }
}