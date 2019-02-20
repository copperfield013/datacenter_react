import React from 'react'
import {Row,Col} from 'antd'
import Header from './../components/Header'
import Footer from './../components/Footer'
import NavLeft from './../components/NavLeft'

const storage=window.sessionStorage;
export default class Admin extends React.Component{
	handleNav=(e)=>{	
		e.preventDefault()
		e.stopPropagation()	
		let scrollIds=storage.getItem("scrollIds")
		const obj=document.getElementsByClassName("main")[0]		
		const scrollTop  = obj.scrollTop;  //页面滚动高度
		const clientHeight=obj.clientHeight;
		const mainTopArr = []; 
		let k=0;
		if(scrollIds){	//滑动锁定导航
			scrollIds=scrollIds.split(",")
			for(let i=0;i<scrollIds.length;i++){
                let node=document.getElementById(scrollIds[i])
				if(node){
					let top = Math.floor(node.offsetTop); 	
					mainTopArr.push(top);
				}		
			}
			mainTopArr.sort((a,b)=> a-b)//排序
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
				const ul=list.getElementsByTagName("ul")[0]
				ul.style.marginTop=-scrollTop/13+"px"
			}
        }
	}
	render(){
		return(
			<Row className="container">
				<Col span={4} className="nav-left">
					<NavLeft/>
				</Col>
				<Col span={20} className="main" onScroll={this.handleNav}>
					<Header/>
					<Row className="content" style={{padding:20}}>
						{this.props.children}
					</Row>					
					<Footer/>
				</Col>
			</Row>
		)
	}
}