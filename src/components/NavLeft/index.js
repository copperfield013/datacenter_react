import React from 'react'
import { Menu} from 'antd';
import Super from "./../../super"
import './index.css'
const SubMenu = Menu.SubMenu;

const storage=window.sessionStorage;
export default class NavLeft extends React.Component{
	state={
		menuTreeNode:[],
		openKeys:[]
	}	
    componentDidMount(){
        this.props.onRef2(this)
    }
	componentWillMount(){
		this.request()
	}
	request=()=>{
		Super.super({
			url:'/api/menu/getMenu',                 
		}).then((res)=>{
			const menuTreeNode = this.renderMenu(res.menus)
			const objKey={}
			res.menus.map((item)=>{
				objKey[item.id]=item.level2s
				return false
			})
			this.setState({
				menuTreeNode,
				objKey
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
						{item.title}
				    </Menu.Item>
		})
	}	
	handleMenu=({item, key})=>{
		storage.setItem("menuId",key);
		const panes=this.props.panes;
		let flag = false;
		for(let ops of panes){
		  if(ops.key === key){
			flag = true;
			break;
		  }
		  continue;
		}
		this.setState({openKeys:item.props.openKeys});
		if(flag === false){
		  panes.push({ title: item.props.children, key });
		}
		this.props.callBackAdmin(panes,key)
		//console.log(key)
	}
	handleOpen=(openKeys)=>{
		//console.log(openKeys)
		if(openKeys.length>1){
			openKeys.splice(0,1);
		}
		this.setState({openKeys})		
	}
	handleOpenKey=(activeKey)=>{
		if(activeKey){
			const objKey=this.state.objKey;
			for(let key in objKey){
				objKey[key].map((item)=>{
					const itemId=item.id.toString()
					if(itemId===activeKey){
						this.setState({openKeys:[key]})
					}
					return false
				})
			}
		}else{
			this.setState({openKeys:[]})
		}
		return false
	}
	render(){
		const { openKeys,menuTreeNode }=this.state
		return (
			<div>
				<div className="logo">
					<h1>易+数据融合中心</h1>
				</div>
				 <Menu 
					mode="inline"
					theme="dark"
					openKeys={openKeys}
					onClick={this.handleMenu}
					onOpenChange={this.handleOpen} //手风琴
					selectedKeys={this.props.activeKey}
				 >
					{menuTreeNode}
				 </Menu>
			</div>
		)
	}
}
