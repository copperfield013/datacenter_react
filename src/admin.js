import React from 'react'
import {Row,Col,Menu,Tabs,Layout} from 'antd'
import "antd/dist/antd.css"
import Header from './components/Header'
import Footer from './components/Footer'
import axios from "./axios/index"
import "./style/common.css"
import Home from './pages/home'
import ActTable from './pages/actTable/actTable'
import { list } from 'postcss';
const { Content } = Layout;
const SubMenu = Menu.SubMenu;
const TabPane = Tabs.TabPane;

var storage=window.localStorage;
export default class Admin extends React.Component{
	constructor(props) {
		super(props);
		this.newTabIndex = 0;
		const panes = [
		  { title: '主页', content: '欢迎页', key: '0',closable: false },
		];
		this.state = {
			activeKey: panes[0].key,
			panes,
			title:storage.getItem("title"),
			collapsed: false,
		};
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
			return  <Menu.Item key={item.id}>
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
		  panes.push({ title: item.props.children, key });
		  this.setState({ panes, activeKey:key });
		}
		// const activeKey = `newTab${this.newTabIndex++}`;
		axios.ajax({
			url:`/api/entity/list/${key}`,
			data:{
				isShowLoading:true
			}
		}).then((res)=>{
			var list=[]
			var result={}
			res.entities.map((item)=>{
				return list.push(item.fields)
			})

			this.setState({
				formList:res.criterias,
				columns:res.entities[0].fields,
				//list
			})
			console.log(list);   
        })
		//console.log(key);
	}
	Welcome = (title, key) => {
        switch(title){
            case "主页":
            return <Home />
            default:
            return <ActTable formList={this.state.formList} pageId={key} columns={this.state.columns} list={this.state.list}/>
        }
    
	}
	onChange = (activeKey) => {
		this.setState({ activeKey });
		console.log(activeKey)
	  }
	
	onEdit = (targetKey, action) => {
		this[action](targetKey);
	}
	remove = (targetKey) => {
		let activeKey = this.state.activeKey;
		let lastIndex;
		this.state.panes.forEach((pane, i) => {
		  if (pane.key === targetKey) {
			lastIndex = i - 1;
		  }
		});
		const panes = this.state.panes.filter(pane => pane.key !== targetKey);
		if (lastIndex >= 0 && activeKey === targetKey) {
		  activeKey = panes[lastIndex].key;
		}
		this.setState({ panes, activeKey });
	  }
	render(){
		return(
			<Row className="container">
				<Col span="4" className="nav-left">
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
				</Col>
				<Col span="20" className="main">
					<Header title={this.state.title}/>
					<Content className="content">
						<Tabs
							hideAdd
							onChange={this.onChange}
							activeKey={this.state.activeKey}
							type="editable-card"
							onEdit={this.onEdit}
						>
							{this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>{this.Welcome(pane.title, pane.key)}</TabPane>)}
						</Tabs>
					</Content>					
					<Footer/>
				</Col>
			</Row>
		)
	}
}
