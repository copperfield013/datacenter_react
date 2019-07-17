import React from 'react'
import {Row,Col,Dropdown,Menu,Icon} from 'antd'
import { withRouter,NavLink } from 'react-router-dom'
import Units from './../../units'
import Super from "./../../super"
import "./index.css"
const { SubMenu } = Menu

class Header extends React.Component{

	componentWillMount(){
		this.setState({
			userName:Units.getLocalStorge("name")
		})
		this.getUser()
	}
	componentDidMount(){
		let usedBlockId
		const query = window.location.href.split("?")[1];
		if(query){
			const vars =query.split("&")
			for (let i=0;i<vars.length;i++) {
				const pair = vars[i].split("=");
				if(pair[0] === "blockId"){
					usedBlockId=parseInt(pair[1])
				}
			}
		}
		Super.super({
			url:'api2/meta/menu/get_blocks',                   
		}).then((res)=>{
			const currentBlockId=usedBlockId?usedBlockId:res.currentBlockId //判断url里有blockid
			res.blocks.forEach((item)=>{
				if(item.id===currentBlockId){
					this.props.setCurrentList(item)
				}
				item.l1Menus.forEach((it)=>{
					it.blockId=item.id
					it.l2Menus.forEach((i)=>{
						i.blockId=item.id
					})
				})
				item.menus=<Menu>
								{this.renderBlockMenu(item.l1Menus)}
							</Menu>
			})
			this.setState({
				blocks:res.blocks,
				currentBlockId,
			})
		})
	}
	renderBlockMenu=(data)=>{
		return data.map((item)=>{
			if(item.l2Menus){
				return <SubMenu title={item.title} key={item.id}>
							{ this.renderBlockMenu(item.l2Menus) }
						</SubMenu>				
			}
			return  <Menu.Item key={item.id} >
						<NavLink to={`/${item.id}?blockId=${item.blockId}`} target="_blank">{item.title}</NavLink>
					</Menu.Item>
		})		
	}
	loginout=()=>{
		window.location.hash = "#/login";
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
		const {blocks,currentBlockId}=this.state
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
					<Col span={18}>
						{blocks && blocks.map((item,index)=>{
							return <div style={{float:'left',paddingLeft:10}} key={index} className={item.id===currentBlockId?"active":""}>
										<Dropdown overlay={item.menus}>
											<a className="dropdown-link" 
												href={`#/home?blockId=${item.id}`} 
												target="_blank" 
												rel="noopener noreferrer"
												>
												{item.title}<Icon type="caret-down" />
											</a>
										</Dropdown>
									</div>
						})}
					</Col>					
					<Col span={6}>
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