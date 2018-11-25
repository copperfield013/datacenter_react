import React from 'react'
import {Row,Col,Menu,Tabs,Layout} from 'antd'
import "antd/dist/antd.css"
import Header from './components/Header'
import Footer from './components/Footer'
import axios from "./axios/index"
import "./style/common.css"
import Home from './pages/home'
import ActTable from './pages/actTable/actTable'
const { Content } = Layout;
const SubMenu = Menu.SubMenu;
const TabPane = Tabs.TabPane;

var storage=window.localStorage;
export default class Admin extends React.Component{
	constructor(props) {
		super(props);
		this.newTabIndex = 0;
		const panes = [
		  { title: '主页', key: '0',closable: false },
		];
		this.state = {
			activeKey: panes[0].key,
			panes,
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
		this.requestList(key)
		//console.log(key)
	}
	handleOpen=(openKeys)=>{
		if(openKeys.length>1){
			openKeys.splice(0,1);
		}
	}
	requestList=(key)=>{
		storage.setItem("key",key);
		axios.ajax({
			url:`/api/entity/list/${key}`,
			data:{
				isShowLoading:true
			}
		}).then((res)=>{
			var list=[]		
			res.entities.map((item)=>{
				return list.push(item.fields)
			})
			this.setState({
				formList:res.criterias,
				list:this.renderLists(list),
				moduleTitle:res.module.title
			})
			if(res.entities.length!=0){
				this.setState({
					columns:this.renderColumns(res.entities[0].fields),
					pageCount:res.pageInfo.count
				})
			}else{
				this.setState({
					columns:'',
					pageCount:''
				})
			}
			//console.log(res.entities.length)
  })
	}
	//list数据转换
	renderLists=(data)=>{
			let result=[];		
			data.map((item,index)=>{
				let list={};
				list['key']=index;//每一项添加key值
				item.map((item)=>{
					let key=item.title
					let value=item.value
					list[key]=value
				})
			result.push(list)
		})
		return result
	}
	renderColumns=(data)=>{
		if(data){
			return data.map((item)=>{
				let key="dataIndex";
				let value=item.title
				item[key]=value
				return item
			})
		}		
	}
	freshList=(params)=>{
		let key=storage.getItem("key");
		axios.ajax({
			url:`/api/entity/list/${key}`,
			data:{
				isShowLoading:true,
				params:isNaN(params)?params:{pageNo:params},		//判断是搜索还是页码	
			}
		}).then((res)=>{
			var list=[]
			res.entities.map((item)=>{
				return list.push(item.fields)
			})
			this.setState({
				list:this.renderLists(list),
			})
		})			
	}
	Welcome = (title, key) => {
			switch(title){
					case "主页":
					return <Home />
					default:
					return <ActTable 
											formList={this.state.formList} 
											columns={this.state.columns} 
											list={this.state.list} 
											pageCount={this.state.pageCount}
											callbackPage={this.freshList}
											moduleTitle={this.state.moduleTitle}
											searchParams={this.freshList}
											/>
			}
    	
	}
	onChange = (activeKey) => {
		this.setState({ activeKey });
		if(activeKey!=0){
			this.requestList(activeKey)
		}
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
		if(this.state.activeKey==targetKey && activeKey!=0){
			this.requestList(activeKey)
		}
		//console.log(activeKey+'------'+targetKey+'----'+lastIndex)
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
					  //defaultSelectedKeys={['1']}
						//defaultOpenKeys={['1']}
						mode="inline"
						theme="dark"
						onClick={this.handleMenu}
						onOpenChange={this.handleOpen} //手风琴
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
							{this.state.panes.map(pane => <TabPane 
																								tab={pane.title} 
																								key={pane.key} 
																								closable={pane.closable}
																								>
																								{this.Welcome(pane.title, pane.key)}
																						</TabPane>)}
						</Tabs>
					</Content>					
					<Footer/>
				</Col>
			</Row>
		)
	}
}
