import React from 'react'
import { Menu} from 'antd';
import Super from "./../../super"
import { NavLink,withRouter } from 'react-router-dom'
import './index.css'
const SubMenu = Menu.SubMenu;

class NavLeft extends React.Component{
	state={
		menuTreeNode:[],
		selectedKeys:[],
		openKeys:[]
	}
	componentWillReceiveProps(){
		const menuId=this.props.history.location.pathname.split("/")[1]
		const {open}=this.state
		const key=[]
		for(let k in open){
			open[k].map((it)=>{
				if(it.toString()===menuId){
					key.push(k)
				}
				return false
			})
		}
		this.setState({
			selectedKeys:[menuId],
			openKeys:key
		})
	}
	componentWillMount(){
		this.request()
	}
	request=()=>{
		Super.super({
			url:'/api/menu/getMenu',                 
		}).then((res)=>{
			const menuTreeNode = this.renderMenu(res.menus)
			const open={}
			res.menus.map((item)=>{
				if(item.level2s){
					const ids=[]
					item.level2s.map((it)=>{
						ids.push(it.id)
						return false
					})
					open[item.id]=ids
				}
				return false
			})
			this.setState({
				menuTreeNode,
				open
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
		this.setState({
			openKeys
		})
	}
	render(){
		const { menuTreeNode,selectedKeys,openKeys }=this.state
		return (
			<div>
				<div className="logo">
					<h1>易+数据融合中心</h1>
				</div>
				<Menu 
					mode="inline"
					theme="dark"
					onOpenChange={this.handleOpen} //手风琴
					selectedKeys={selectedKeys}
					openKeys={openKeys}
					>
					{menuTreeNode}
				</Menu>
			</div>
		)
	}
}
export default withRouter(NavLeft)
