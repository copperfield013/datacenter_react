import React from 'react'
import {Row,Col} from 'antd'
import Unit from '../../units/unit'
import "./index.css"

var storage=window.localStorage;
export default class Header extends React.Component{
		
	componentWillMount(){
		this.setState({
			userName:storage.getItem("name")
		})
		this.timerID = setInterval(()=>{
			let sysTime=Unit.formateDate(new Date())
			this.setState({
				sysTime
			})
		},1000)
	}
	componentWillUnmount(){
		clearInterval(this.timerID);
	}
	render(){
		return (
			<div className="header">
				<Row className="header-top">	
					<Col span="24">
						<span className="date">{this.state.sysTime}</span>
						<span>欢迎，{this.state.userName}</span>
						<a href="/#/login" >退出</a>
					</Col>
				</Row>
			</div>
		)
	}
}
