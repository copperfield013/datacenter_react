import React from 'react'
import { Button,Card,Radio } from 'antd';
import './index.css'

export default class But extends React.Component{
	state={
		loading:true,
		size:"default"
	}
	handleLoading=(e)=>{
		this.setState({
			loading:!this.state.loading			
		})
		if(this.state.loading){
			e.target.innerHTML="开启"
		}else{
			e.target.innerHTML="关闭"
		}
	}
	handleSize=(e)=>{
		this.setState({
			size:e.target.value
		})
	}

	render(){
		return(
			<div>
				<Card title="基础按钮">
					<Button type="primary">Primary</Button>
					<Button>Default</Button>
					<Button type="dashed">Dashed</Button>
					<Button type="danger">Danger</Button>					
					<Button disabled>Disabled</Button>
				</Card>
				<Card title="图形按钮">
					<Button icon="plus">创建</Button>
					<Button icon="edit">编辑</Button>
					<Button type="dashed" icon="delete">删除</Button>
					<Button shape="circle" icon="search"></Button>
					<Button type="primary" icon="search">搜索</Button>
				</Card>
				<Card title="Loading按钮">
					<Button type="primary" loading={this.state.loading}>确定</Button>
					<Button type="primary" shape="circle" loading={this.state.loading} />
					<Button loading={this.state.loading}>点击加载</Button>
					<Button shape="circle" loading={this.state.loading} />
					<Button type="primary" onClick={this.handleLoading}>关闭</Button>
				</Card>  
				<Card title="按钮大小">
					<Radio.Group value={this.state.size} onChange={this.handleSize}>
						<Radio value="small">小</Radio>
						<Radio value="default">中</Radio>
						<Radio value="large">大</Radio>
					</Radio.Group>
					<Button type="primary" size={this.state.size}>Primary</Button>
					<Button size={this.state.size}>Default</Button>
					<Button type="dashed" size={this.state.size}>Dashed</Button>
					<Button type="danger" size={this.state.size}>Danger</Button>					
					<Button disabled size={this.state.size}>Disabled</Button>
				</Card>    
			</div>   
		)
	}
}
