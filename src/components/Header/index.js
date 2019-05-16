import React from 'react'
import {Row,Col,Dropdown,Menu,Icon} from 'antd'
import { withRouter } from 'react-router-dom'
import Units from './../../units'
import Super from "./../../super"
import "./index.css"

class Header extends React.Component{
	componentWillMount(){
		this.setState({
			userName:Units.getLocalStorge("name")
		})
		this.getUser()
	}
	loginout=()=>{
		window.location.href="/#/login";
	}
	getUser=()=>{
		Super.super({
			url:'api2/meta/user/current_user',                   
		}).then((res)=>{
			this.setState({
				userName:res.user.username,
				id:res.user.id
			})
		})
	}
	userDetail=(type)=>{
		const {id}=this.state
		this.props.history.push(`/user/${type}/${id}`)
	}
	render(){
		const style={
			marginRight:"8px"
		}
		const menu = (
			<Menu>
				<Menu.Item>
					<span onClick={()=>this.userDetail("detail")}><Icon type="user" style={style}/>用户详情</span>
				</Menu.Item>
				<Menu.Item>
					<span onClick={()=>this.userDetail("edit")}><Icon type="form" style={style}/>用户修改</span>
				</Menu.Item>
				<Menu.Item>
					<span onClick={this.loginout}><Icon type="logout" style={style}/>退出登录</span>
				</Menu.Item>
			</Menu>
		  );
		return (
			<div className="header">
				<Row className="header-top">	
					<Col span={24}>
						<Dropdown overlay={menu} placement="bottomCenter" trigger={['click']}>
							<div className="userLogin">
								<Icon type="user" />
								<span>
									{this.state.userName}
								</span>								
							</div>							
						</Dropdown>
					</Col>
				</Row>
			</div>
		)
	}
}
export default withRouter(Header)