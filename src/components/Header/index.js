import React from 'react'
import {Row,Col,Dropdown,Menu,Icon} from 'antd'
import Units from './../../units'
import "./index.css"

export default class Header extends React.Component{
	componentWillMount(){
		this.setState({
			userName:Units.getLocalStorge("name")
		})
	}
	loginout=()=>{
		window.location.href="/#/login";
	}
	render(){
		const style={
			marginRight:"8px"
		}
		const menu = (
			<Menu>
				<Menu.Item>
					<span><Icon type="user" style={style}/>用户详情</span>
				</Menu.Item>
				<Menu.Item>
					<span><Icon type="form" style={style}/>用户修改</span>
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
