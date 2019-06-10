import React from 'react'
import { Menu} from 'antd';
//import Super from "./../../super"
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
	componentDidMount(){
        this.props.onRef(this)
    }
	//componentWillMount(){
		//this.request()
	//}
	// request=()=>{
	// 	Super.super({
	// 		url:'api2/meta/menu/get_menu',                 
	// 	}).then((res)=>{
	// 		const menuTreeNode = this.renderMenu(res.menus)
	// 		const menuId=this.props.history.location.pathname.split("/")[1]
	// 		const open={}
	// 		res.menus.map((item)=>{
	// 			if(item.level2s){
	// 				const ids=[]
	// 				item.level2s.map((it)=>{
	// 					ids.push(it.id)
	// 					return false
	// 				})
	// 				open[item.id]=ids
	// 			}
	// 			return false
	// 		})
	// 		const key=[]
	// 		for(let k in open){
	// 			open[k].map((it)=>{
	// 				if(it.toString()===menuId){
	// 					key.push(k)
	// 				}
	// 				return false
	// 			})
	// 		}
	// 		this.setState({
	// 			selectedKeys:[menuId],//刷新或打开新页面，展示导航位置
	// 			openKeys:key,//刷新或打开新页面，展示导航位置
	// 			menuTreeNode,
	// 			open
	// 		})
	// 	})	
	// }
	setMenuTreeNode=(list)=>{
		console.log(list)
		const menuId=this.props.location.pathname.split("/")[1]
		const open={}
		list.l1Menus.map((item)=>{
			if(item.l2Menus){
				const ids=[]
				item.l2Menus.map((it)=>{
					ids.push(it.id)
					return false
				})
				open[item.id]=ids
			}
			return false
		})
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
			menuTreeNode:this.renderMenu(list.l1Menus),
			selectedKeys:[menuId],
			openKeys:key,
			open
		})
	}
	renderMenu=(data)=>{
		return data.map((item)=>{
			if(item.l2Menus){
				return <SubMenu title={item.title} key={item.id}>
							{ this.renderMenu(item.l2Menus) }
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
