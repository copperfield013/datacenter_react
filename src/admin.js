import React from 'react'
import {Row,Col,Menu,Tabs,Layout,Button,Modal,message} from 'antd'
import "antd/dist/antd.css"
import Header from './components/Header'
import Footer from './components/Footer'
import axios from "./axios/index"
import "./style/common.css"
import Home from './pages/home'
import ActTable from './pages/actTable/actTable'
import Detail from './pages/detail'
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
	handleMenu=({item, key})=>{
		const panes = this.state.panes;
		let flag = false;
		for(let ops of panes){
		  if(ops.key == key){
			flag = true;
			break;
		  }
		  continue;
		}
		this.setState({ panes, activeKey:key,menuId:key});
		if(flag == false){
		  panes.push({ title: item.props.children, key });
		}
		this.requestList(key)
		//console.log(item)
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
			var code=[];	
			res.entities.map((item)=>{			
				return code.push(item.code)
			})
			this.setState({code,}) //不能写一起，不然第一次code取不到
			res.entities.map((item)=>{			
				return list.push(item.fields)
			})
			this.setState({
				formList:res.criterias,
				list:this.renderLists(list,key),
				moduleTitle:res.module.title,
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
		//console.log(this.state.list)
  })
	}
	//list数据转换
	renderLists=(data,key)=>{
			let result=[];
			data.map((item,index)=>{
				let list={};
				list['key']=index;//每一项添加key值
				list['code']={...this.state.code}[index];//添加code
				list['menuId']=key;
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
			data.map((item)=>{
				let key="dataIndex";
				let value=item.title;
				item[key]=value;								
			})
			var act={
				title: '操作',
				key: 'action',
				render: (text, record) => (
				  <span>
					<Button type="primary" icon="align-left" size="small"onClick={()=>this.handleOperate("detail",record)}>详情</Button>
					<Button type="dashed" icon="edit" size="small">修改</Button>
					<Button type="danger" icon="delete" size="small" onClick={()=>this.handleOperate("delete",record)}>删除</Button>
				  </span>
				),
			  }
			  data.push(act)
			  return data
		}		
	}
	handleOperate=(type,record)=>{
		let menuId=storage.getItem("key");
		let code=record.code
		//console.log(record.code)
        if(type=="delete"){
            Modal.confirm({
				title:"删除提示",
				content:`您确定删除这些数据吗？`,
				okText:"确认",
				cancelText:"取消",
				onOk:()=>{
					axios.ajax({
						url:`/api/entity/remove/${menuId}/${code}`,          
					}).then((res)=>{
						if(res.status=="suc"){
							message.success('删除成功！')                               
						}
						this.requestList(menuId);//刷新页面
					})
				}
			})
		}else if(type=="detail"){
			//console.log(record)
			this.handleDetail({record})
		}
	}  
	handleDetail=({record})=>{
		const panes = this.state.panes;
		let flag = false;
		for(let ops of panes){			
		  if(ops.key == record.code){
			flag = true;
			break;
		  }
		  continue;
		}
		this.setState({ panes, activeKey:record.code,xqTitle:record["姓名"]?`详情-${record["姓名"]}`:"详情",menuId:record.menuId});
		if(flag == false){
			panes.push({ title: record["姓名"]?`详情-${record["姓名"]}`:"详情", key:record.code });
		}
		this.requestDetails(record.code)
	} 
	//搜索和页码
	searchList=(params)=>{
		let key=storage.getItem("key");
		axios.ajax({
			url:`/api/entity/list/${key}`,
			data:{
				isShowLoading:true,
				params:isNaN(params)?params:{pageNo:params},		//判断是搜索还是页码	
			}
		}).then((res)=>{
			var list=[]
			var code=[];	
			res.entities.map((item)=>{			
				return code.push(item.code)
			})
			res.entities.map((item)=>{
				return list.push(item.fields)
			})
			this.setState({
				list:this.renderLists(list),
				code
			})
		})			
	}
	Welcome = (title,xqTitle) => {
			switch(title){
					case "主页":
					return <Home />
					case xqTitle:
					return <Detail 
								detailsTitle={this.state.detailsTitle}
					/>
					default:
					return <ActTable 
								formList={this.state.formList} 
								columns={this.state.columns} 
								list={this.state.list} 
								pageCount={this.state.pageCount}
								callbackPage={this.searchList}
								moduleTitle={this.state.moduleTitle}
								searchParams={this.searchList}
								/>
			}  	
	}
	onChange = (activeKey) => {
		console.log(this.state.xqTitle)
		this.setState({ activeKey });
		if(activeKey.length>30){
			this.requestDetails(activeKey)
		}else{
			this.requestList(activeKey)	
		}	
	}
	requestDetails=(activeKey)=>{
		axios.ajax({
			url:`/api/entity/detail/${this.state.menuId}/${activeKey}`,
			data:{
				isShowLoading:true
			}
		}).then((res)=>{
			let detailsTitle=res.entity.title?res.module.title+"-"+res.entity.title+"-详情":res.module.title+"-详情"
			this.setState({ 
				detailsTitle,
			});
			//console.log(res.entity.title)
		})
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
																{this.Welcome(pane.title,this.state.xqTitle)}
														</TabPane>)}
						</Tabs>
					</Content>					
					<Footer/>
				</Col>
			</Row>
		)
	}
}
