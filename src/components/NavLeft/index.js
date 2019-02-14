import React from 'react'
import { Menu} from 'antd';
import Super from "./../../super"
import { NavLink } from 'react-router-dom'
import './index.css'
const SubMenu = Menu.SubMenu;

export default class NavLeft extends React.Component{
	state={
		menuTreeNode:[],
	}
	componentWillMount(){
		this.request()
	}
	request=()=>{
		Super.super({
			url:'/api/menu/getMenu',                 
		}).then((res)=>{
			const menuTreeNode = this.renderMenu(res.menus)
			this.setState({
				menuTreeNode,
			})
		})	
	}
	renderMenu=(data)=>{
		return data.map((item)=>{
			if(item.level2s){
				return <SubMenu title={item.title} key={item.id}>
							{ this.renderMenu(item.level2s) }
						</SubMenu>				
			}
			return  <Menu.Item key={item.id} >
						<NavLink to={`/${item.id}`}>{item.title}</NavLink>
				    </Menu.Item>
		})
	}
	handleOpen=(openKeys)=>{
		if(openKeys.length>1){
			openKeys.splice(0,1);
		}		
	}
	render(){
		const { menuTreeNode }=this.state
		return (
			<div>
				<div className="logo">
					<h1>易+数据融合中心</h1>
				</div>
				<Menu 
					mode="inline"
					theme="dark"
					onOpenChange={this.handleOpen} //手风琴
					>
					{menuTreeNode}
				</Menu>
			</div>
		)
	}
}
