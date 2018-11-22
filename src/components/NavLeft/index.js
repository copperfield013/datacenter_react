import React from 'react'
import { Menu, Icon, Switch } from 'antd';
import { NavLink } from 'react-router-dom'
import axios from "./../../axios/index"
import './index.css'
const SubMenu = Menu.SubMenu;

var storage=window.localStorage;
export default class NavLeft extends React.Component{
	state = {
		collapsed: false,
	}
	componentWillMount(){
		this.request()
	}
	request=()=>{		
		axios.ajax({
			url:'/api/menu/getMenu',
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
			return  <Menu.Item key={item.templateGroupId}>
						{item.title}
				    </Menu.Item>
		})
	}
	
	handleMenu=({item, key, keyPath})=>{
		const panes = this.state.panes;
		let flag = false;
		for(let ops of panes){
		  if(ops.key == key){
			flag = true;
			break;
		  }
		  continue;
		}
		if(flag == true){
		  //console.log("打开原来的")
		  this.setState({ panes, activeKey:key });
		}else{
		  //console.log("新增加一个")
		  panes.push({ title: item.props.children, content: "sadasd", key });
		  this.setState({ panes, activeKey:key });
		}
		// const activeKey = `newTab${this.newTabIndex++}`;
		
		console.log(key);
	}
	render(){
		return (
			<div>
				<div className="logo">
					<img src="/asset/logo.svg" alt="" />
					<h1>系统</h1>
				</div>
				 <Menu 
					defaultSelectedKeys={['1']}
					defaultOpenKeys={['sub1']}
					mode="inline"
					theme="dark"
					inlineCollapsed={this.state.collapsed}
					onClick={this.handleMenu}
				 >
					{this.state.menuTreeNode}
				 </Menu>
			</div>
		)
	}
}
