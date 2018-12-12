import React from 'react'
import {Row,Col,Dropdown,Menu,Icon} from 'antd'
import "./index.css"

var storage=window.sessionStorage;
export default class Header extends React.Component{
	componentWillMount(){
		this.setState({
			userName:storage.getItem("name")
		})
	}
	render(){
		const style={
			marginRight:"6px"
		}
		const menu = (
			<Menu>
			  <Menu.Item>
				<a href="javascript:;"><Icon type="user" style={style}/>用户详情</a>
			  </Menu.Item>
			  <Menu.Item>
				<a href="javascript:;"><Icon type="form" style={style}/>用户修改</a>
			  </Menu.Item>
			  <Menu.Item>
				<a href="#"><Icon type="logout" style={style}/>退出登录</a>
			  </Menu.Item>
			</Menu>
		  );
		return (
			<div className="header">
				<Row className="header-top">	
					<Col span="24">
						<span>
							欢迎，
							<Dropdown overlay={menu} placement="bottomCenter">
								<a href="javascript:;">{this.state.userName}</a>
							</Dropdown>							
						</span>
					</Col>
				</Row>
			</div>
		)
	}
}
