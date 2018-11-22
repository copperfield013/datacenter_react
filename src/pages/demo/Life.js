import React from 'react'
import Child from './Child.js'
import {Button} from 'antd'
import "./style.less"
import "antd/dist/antd.css"


export default class Life extends React.Component{
	constructor(props) {
	    super(props);
	    this.state = {
	    	count:0
	    };
	  }
	handleAdd=()=>{
		this.setState({
			count:this.state.count+1
		})
	}
	handleclick(){
		this.setState({
			count:this.state.count+1
		})
	}
	render(){
		return <div className="content">
				<Button onClick={this.handleAdd}>点击一下</Button>
				<Button onClick={this.handleclick.bind(this)}>点击一下</Button>	
				<p>{this.state.count}</p>
				<Child name={this.state.count}></Child>
			</div>
		
	}
}
