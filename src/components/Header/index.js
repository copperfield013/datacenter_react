import React from 'react'
import {Row,Col} from 'antd'
import "./index.css"

var storage=window.localStorage;
export default class Header extends React.Component{
		
	componentWillMount(){
		this.setState({
			userName:storage.getItem("name")
		})
	}
	render(){
		return (
			<div className="header">
				<Row className="header-top">	
					<Col span="24">
						<span>欢迎，{this.state.userName}</span>
						<a href="/#/login" >退出</a>
					</Col>
				</Row>
			</div>
		)
	}
}
