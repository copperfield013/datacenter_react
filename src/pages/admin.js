import React from 'react'
import {Row,Col,Tabs,Layout,Button} from 'antd'
import Header from './../components/Header'
import Footer from './../components/Footer'
import Home from './home'
import ActTable from './actTable/actTable'
import Detail from './detail'
import NavLeft from './../components/NavLeft'
import ImportData from './importData/importData'
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
	judgeActiveKey=(activeKey,panes)=>{		
		let type;
		let xqTitle;
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
			const title=activeKey.split(",")[0]
			const newRecordCode=activeKey.split(",")[1]
			this.child.handleNew(title,newRecordCode);//用acttable的方法
			this.setState({ panes });
		}else if(activeKey.indexOf("导入")>-1){ 
			this.setState({importCode:activeKey});	
		}else{
			this.setState({menuId:activeKey});	
		}
	}
	onChange = (activeKey) => {
		this.setState({activeKey});	
		this.children.handleOpenKey(activeKey);	
		this.judgeActiveKey(activeKey)
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
		if(panes.length<=2){
			this.setState({ showShutAll:"none" });
		}
		this.setState({ panes, activeKey });
		this.children.handleOpenKey(activeKey);
		this.judgeActiveKey(activeKey,panes)		
	}	
	Welcome = (title,xqTitle,newcode,importCode) => {
		switch(title){
			case "主页":
			return <Home />
			case xqTitle:
			return <Detail
						type={this.state.type}
						menuId={this.state.menuId}
						code={this.state.code}
						scrollIds={this.scrollIds}
					/>
			case newcode:
			return <Detail
						type="edit"
						menuId={this.state.menuId}
						code={this.state.newRecordCode}
						flag="creatNewRecord"
						scrollIds={this.scrollIds}
					/>
			case importCode:
			return <ImportData 
						importCode={this.state.importCode}
						menuId={this.state.menuId}
						/>
			default:
			return <ActTable 
						handleDetail={this.handleDetail}
						menuId={this.state.menuId}
						handleNew={this.handleNew}
						panes={this.state.panes}
						actCallBackAdmin={this.actCallBackAdmin}
						newRecordCallback={this.newRecordCallback}
						importCallback={this.importCallback}
						onRef={this.onRef} 
					/>
		}  	
	}
	scrollIds=(scrollIds)=>{
		this.setState({
			scrollIds
		 })
	}
	actCallBackAdmin=(panes,dcode,xqTitle,menuId,code,type)=>{
		if(panes.length>2){
			this.setState({showShutAll:"block"})
		}
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
		if(panes.length>2){
			this.setState({showShutAll:"block"})
		}
		this.setState({ 
			panes, 
			activeKey:newK,
			newcode,
			newRecordCode,
		});
	}
	importCallback=(panes,importCode)=>{
		if(panes.length>2){
			this.setState({showShutAll:"block"})
		}
		this.setState({ 
			panes, 
			activeKey:importCode,
			importCode,
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
		const scrollTop  = e.target.scrollTop;  //页面滚动高度
		const scrollHeight = e.target.scrollHeight;//页面总高度
		const clientHeight   = e.target.clientHeight  ;
		const scrollIds=this.state.scrollIds;		
		const mainTopArr = []; 
		let k=0;
		if(scrollIds){	//滑动锁定导航
			for(let i=0;i<scrollIds.length;i++){
				let node=document.getElementById(scrollIds[i])
				if(node){
					let top = Math.floor(node.offsetTop); 	
					mainTopArr.push(top);
				}		
			} 
			//console.log(mainTopArr)
			for(let i=0;i<mainTopArr.length;i++){ 
				if((scrollTop+clientHeight/2)>=mainTopArr[i]){ 
				k=i; 
				} 
			} 
			const list=document.getElementsByClassName("rightBar")[0]
			if(list){
				const lis=list.getElementsByTagName("li")
				for(let i=0;i<lis.length;i++){
					lis[i].style.backgroundColor="#fff"
				}
				lis[k].style.backgroundColor="#cfe3f5"
			}
		}

		const obj =document.getElementsByClassName("ant-tabs-bar")[0]
		if(scrollTop>50 && scrollHeight>705){
			obj.style.position = 'fixed';
			obj.style.top = '0';	
			obj.style.background='#002140'	
			obj.style.width='100%'	
			obj.style.zIndex='1000'			
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
		this.children.handleOpenKey(null);//复原菜单		
	}
	render(){
		const operations = <Button onClick={this.shutAll} style={{display:this.state.showShutAll}}>关闭所有</Button>;
		return(
			<Row className="container">
				<Col span={4} className="nav-left">
					<NavLeft
						callBackAdmin={this.setPanes}
						panes={this.state.panes}
						activeKey={[this.state.activeKey]}
						onRef2={this.onRef2} 
					/>
				</Col>
				<Col span={20} className="main" onScroll={this.handleScroll}>
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
																{this.Welcome(pane.title,this.state.xqTitle,this.state.newcode,this.state.importCode)}
														</TabPane>)}
						</Tabs>
					</Content>					
					<Footer/>
				</Col>
			</Row>
		)
	}
}