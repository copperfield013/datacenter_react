import React from 'react'
import { Menu} from 'antd';
import Super from "./../../super"
import './index.css'
const SubMenu = Menu.SubMenu;

let storage=window.sessionStorage;
export default class NavLeft extends React.Component{
	state={
		menuTreeNode:[]
	}
	componentWillMount(){
		this.request()
	}
	request=()=>{
		Super.super({
			url:'/api/menu/getMenu',  
			data:{
				isShowLoading:true
			}                 
		}).then((res)=>{
			const menuTreeNode = this.renderMenu(res.menus)
			this.setState({
				menuTreeNode
			})
		})	
	}
	renderMenu=(data)=>{
		return data.map((item)=>{
			if(item.level2s){
				return (
					<SubMenu title={item.title} key={item.id}>
						{ this.renderMenu(item.level2s) }
					</SubMenu>
				)
			}
			return  <Menu.Item key={item.id}>
						{item.title}
				    </Menu.Item>
		})
	}	
	handleMenu=({item, key})=>{
		storage.setItem("menuId",key);
		let panes=this.props.panes;
		let flag = false;
		for(let ops of panes){
		  if(ops.key === key){
			flag = true;
			break;
		  }
		  continue;
		}
		this.setState({ panes, activeKey:key,menuId:key});
		if(flag === false){
		  panes.push({ title: item.props.children, key });
		}
		this.props.callBackAdmin(panes,key)
		//console.log(key)
	}
	handleOpen=(openKeys)=>{
		if(openKeys.length>1){
			openKeys.splice(0,1);
		}
	}
	render(){
		return (
			<div>
				<div className="logo">
					<img src="/asset/logo.svg" alt="" />
					<h1>系统</h1>
				</div>
				 <Menu 
					mode="inline"
					theme="dark"
					onClick={this.handleMenu}
					onOpenChange={this.handleOpen} //手风琴
				 >
					{this.state.menuTreeNode}
				 </Menu>
			</div>
		)
	}
}
