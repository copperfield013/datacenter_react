import React from 'react'
import {Row,Col,Tabs,Layout,Button} from 'antd'
import "antd/dist/antd.css"
import "./style/common.css"
import "./style/coverstyle.css"
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/home'
import ActTable from './pages/actTable/actTable'
import Detail from './pages/detail'
import NavLeft from './components/NavLeft'
const { Content } = Layout;
const TabPane = Tabs.TabPane;

export default class Admin extends React.Component{
	constructor(props) {
		super(props);
		const panes = [
		  { title: '主页', key: '0',closable: false },
		];
		this.state = {
			activeKey: panes[0].key,
			panes,
			showShutAll:"none",
		};
	}
	onChange = (activeKey) => {
		let type;
		let xqTitle;
		this.setState({activeKey});	
		this.children.handleOpenKey(activeKey);	
		if(activeKey.indexOf("detail")>-1 || activeKey.indexOf("edit")>-1){		
			this.state.panes.map((item)=>{
				if(item.key===activeKey){
					xqTitle=item.title
				}
				return false
			})
			if(activeKey.indexOf("detail")===0){
				activeKey=activeKey.slice(6)
				type="detail"
			}else{
				activeKey=activeKey.slice(4)
				type="edit"
			}
			this.setState({
				xqTitle,
				type,
				code:activeKey,
			})
		}else if(activeKey.indexOf(",")>-1){ //新增记录
			let title=activeKey.split(",")[0]
			let newRecordCode=activeKey.split(",")[1]
			this.child.handleNew(title,newRecordCode)//用acttable的方法
		}else{
			this.setState({menuId:activeKey});	
		}
	}
	onEdit = (targetKey, action) => {
		this[action](targetKey);
	}
	remove = (targetKey) => {
		let type;
		let xqTitle;
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
		if(panes.length<=2){
			this.setState({ showShutAll:"none" });
		}
		this.setState({ panes, activeKey });
		this.children.handleOpenKey(activeKey);
		if(activeKey.indexOf("detail")>-1 || activeKey.indexOf("edit")>-1){
			this.state.panes.map((item)=>{
				if(item.key===activeKey){
					xqTitle=item.title
				}
				return false
			})
			if(activeKey.indexOf("detail")===0){
				activeKey=activeKey.slice(6)
				type="detail"
			}else{
				activeKey=activeKey.slice(4)
				type="edit"
			}
			this.setState({ 
				xqTitle,
				type,
				code:activeKey,
			})
		}else if(activeKey.indexOf(",")>-1){ //新增记录
			let title=activeKey.split(",")[0]
			let newRecordCode=activeKey.split(",")[1]
			this.child.handleNew(title,newRecordCode);//用acttable的方法
			this.setState({ panes, activeKey });
		}
	}	
	Welcome = (title,xqTitle,newcode) => {
		switch(title){
			case "主页":
			return <Home />
			case xqTitle:
			return <Detail
						type={this.state.type}
						menuId={this.state.menuId}
						code={this.state.code}
					/>
			case newcode:
			return <Detail
						type="edit"
						menuId={this.state.menuId}
						code={this.state.newRecordCode}
						flag="creatNewRecord"
					/>
			default:
			return <ActTable 
						handleDetail={this.handleDetail}
						menuId={this.state.menuId}
						handleNew={this.handleNew}
						panes={this.state.panes}
						actCallBackAdmin={this.actCallBackAdmin}
						newRecordCallback={this.newRecordCallback}
						onRef={this.onRef} 
					/>
		}  	
	}
	actCallBackAdmin=(panes,dcode,xqTitle,menuId,code,type)=>{
		this.setState({ 
			panes, 
			activeKey:dcode,
			type,
			xqTitle,
			menuId,
			code,
		});
	}
	newRecordCallback=(panes,newK,newcode,newRecordCode)=>{
		this.setState({ 
			panes, 
			activeKey:newK,
			newcode,
			newRecordCode,
		});
	}
	setPanes=(panes,key)=>{
		if(panes.length>2){
			this.setState({showShutAll:"block"})
		}
		this.setState({
			panes,
			activeKey:key,
			menuId:key,
		})
	}
	//固定tab
	handleScroll=(e)=>{		
		let scrollTop  = e.target.scrollTop;  //滚动条滚动高度
		let scrollHeight = e.target.scrollHeight
		let obj =document.getElementsByClassName("ant-tabs-bar")[0]
		if(scrollTop>50 && scrollHeight>705){
			obj.style.position = 'fixed';
			obj.style.top = '0';	
			obj.style.background='#002140'	
			obj.style.width='100%'	
			obj.style.zIndex='1051'			
		}else{
			obj.style.position = 'static';
		}
	}
	onRef = (ref) => {
        this.child = ref
	}
	onRef2 = (ref) => {
        this.children = ref
	}
	shutAll=()=>{
		const panes = [
			{ title: '主页', key: '0',closable: false },
		  ];
		this.setState({
			activeKey: panes[0].key,
			panes,
			showShutAll:"none"
		})
		
	}
	render(){
		const operations = <Button onClick={this.shutAll} style={{display:this.state.showShutAll}}>关闭所有</Button>;
		return(
			<Row className="container">
				<Col span="4" className="nav-left">
					<NavLeft
						callBackAdmin={this.setPanes}
						panes={this.state.panes}
						activeKey={[this.state.activeKey]}
						onRef2={this.onRef2} 
					/>
				</Col>
				<Col span="20" className="main" onScroll={this.handleScroll}>
					<Header/>
					<Content className="content">
						<Tabs 
							hideAdd
							onChange={this.onChange}
							activeKey={this.state.activeKey}
							type="editable-card"
							onEdit={this.onEdit}
							tabBarStyle={{background:"#002140",padding:"0 20px"}}
							tabBarExtraContent={operations}
						>
							{this.state.panes.map(pane => <TabPane
																tab={pane.title} 
																key={pane.key} 
																closable={pane.closable}
																>
																{this.Welcome(pane.title,this.state.xqTitle,this.state.newcode)}
														</TabPane>)}
						</Tabs>
					</Content>					
					<Footer/>
				</Col>
			</Row>
		)
	}
}