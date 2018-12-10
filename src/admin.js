import React from 'react'
import {Row,Col,Menu,Tabs,Layout,Button,Modal,message} from 'antd'
import "antd/dist/antd.css"
import Header from './components/Header'
import Footer from './components/Footer'
import "./style/common.css"
import "./style/coverstyle.css"
import Home from './pages/home'
import ActTable from './pages/actTable/actTable'
import Detail from './pages/detail'
import Super from "./super"
import NavLeft from './components/NavLeft'
import Cont from "./components/Content"
const { Content } = Layout;
const TabPane = Tabs.TabPane;

let storage=window.sessionStorage;
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
	handleOperate=(type,record)=>{
		let menuId=storage.getItem("menuId");		
		let code=record.code
		this.setState({
			menuId,
			code
		})
		//console.log(code)
        if(type==="delete"){
            Modal.confirm({
				title:"删除提示",
				content:`您确定删除这些数据吗？`,
				okText:"确认",
				cancelText:"取消",
				onOk:()=>{
					Super.super({
						url:`/api/entity/remove/${menuId}/${code}`,  
						data:{
							isShowLoading:true
						}                 
					}).then((res)=>{
						if(res.status==="suc"){
							message.success('删除成功！')                               
						}
						this.requestList(menuId);//刷新页面
					})
				}
			})
		}else if(type==="detail"){	
			this.handleDetail({record},"detail")
		}else if(type==="edit"){
			this.handleDetail({record},"edit")
		}
	}  
	handleDetail=({record},type)=>{
		const panes = this.state.panes;
		let flag = false;
		let dcode=type; 
		dcode+=record.code;  //为了打开新页面，加入detail和eidt的code
		//console.log(record)
		for(let ops of panes){			
		  if(ops.key === dcode){
			flag = true;
			break;
		  }
		  continue;
		}
		let xqTitle="";
		if(type==="detail"){
			xqTitle=record["姓名"]?`详情-${record["姓名"]}`:"详情"
			this.setState({type:"detail"})
		}else{
			xqTitle=record["姓名"]?`修改-${record["姓名"]}`:"修改"
			this.setState({type:"edit"})
		}
		this.setState({ 
			panes, 
			activeKey:dcode,
			xqTitle,
			menuId:record.menuId,
		});
		if(flag === false){
			panes.push({ title:xqTitle, key:dcode });
		}		
		//console.log(record.code)
	}
	handleNew=()=>{
		console.log(999)
		const panes = this.state.panes;
		let flag = false;
		let newcode="abc"
		for(let ops of panes){			
			if(ops.key === newcode){
			  flag = true;
			  break;
			}
			continue;
		  }
		this.setState({ 
			panes, 
			activeKey:newcode,
		});
		if(flag === false){
			panes.push({ title:"abc", key:newcode });
		}
	}
	onChange = (activeKey) => {
		let type="";
		this.setState({ activeKey });
		if(activeKey.length>30){
			activeKey.indexOf("detail")===0?type="detail":type="edit";
			//console.log(activeKey+"---"+type)			
			this.state.panes.map((item)=>{
				if(item.key===activeKey){
					if(activeKey.indexOf("detail")===0){
						activeKey=activeKey.slice(6)
					}else{
						activeKey=activeKey.slice(4)
					}
					this.setState({
						xqTitle:item.title,
						type,
						code:activeKey,
					}) 
				}
				return false
			})
		}
	}
	onEdit = (targetKey, action) => {
		this[action](targetKey);
	}
	remove = (targetKey) => {
		let type="";
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
		if(activeKey.length>30){
			activeKey.indexOf("detail")===0?type="detail":type="edit";
			this.state.panes.map((item)=>{
				if(item.key===activeKey){
					if(activeKey.indexOf("detail")===0){
						activeKey=activeKey.slice(6)
					}else{
						activeKey=activeKey.slice(4)
					}
					this.setState({ 
						xqTitle:item.title,
						type,
						code:activeKey,
					}) 
				}
				return false
			})
		}
	}
	
	Welcome = (title,xqTitle) => {
		switch(title){
			case "主页":
			return <Home />
			case xqTitle:
			return <Detail
						type={this.state.type}
						menuId={this.state.menuId}
						code={this.state.code}
					/>
			case "abc":
			return <Home />
			default:
			return <ActTable 
						handleOperate={this.handleOperate}
						activeKey={this.state.activeKey}
						handleDetail={this.handleDetail}
						handleNew={this.handleNew}
					/>
		}  	
	}
	//固定tab
	handleScroll=(e)=>{		
		let scrollTop  = e.target.scrollTop;  //滚动条滚动高度
		let scrollHeight = e.target.scrollHeight
		let obj =document.getElementsByClassName("ant-tabs-bar")[0]
		if(scrollTop>55 && scrollHeight>705){
			obj.style.position = 'fixed';
			obj.style.top = '0';	
			obj.style.background='#002140'	
			obj.style.width='100%'		
		}else{
			obj.style.position = 'static';
		}
	}
	setPanes=(panes,key)=>{
		//this.requestList(key)
		this.setState({
			panes,
			activeKey:key,
			menuId:key,
		})
	}
	render(){
		return(
			<Row className="container">
				<Col span="4" className="nav-left">
					<NavLeft
						//editList={this.editList}
						callBackAdmin={this.setPanes}
						panes={this.state.panes}
						activeKey={this.state.activeKey}
					/>
				</Col>
				<Col span="20" className="main" onScroll={this.handleScroll}>
					<Header/>
					{/* <Cont
						 className="content"
						 activeKey={this.state.activeKey}
					/> */}
					<Content className="content">
						<Tabs 
							hideAdd
							onChange={this.onChange}
							activeKey={this.state.activeKey}
							type="editable-card"
							onEdit={this.onEdit}
							tabBarStyle={{background:"#002140",padding:"0 20px"}}
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
