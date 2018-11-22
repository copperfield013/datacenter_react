import React from 'react'
import { Button, Modal, Card, Drawer, Radio } from 'antd';
const RadioGroup = Radio.Group;

function info() {
	Modal.info({
	  title: 'This is a notification message',
	  content: (
		<div>
		  <p>some messages...some messages...</p>
		  <p>some messages...some messages...</p>
		</div>
	  ),
		onOk() {alert("你选了OK")},
	});
  }
  
  function success() {
	Modal.success({
	  title: 'This is a success message',
	  content: 'some messages...some messages...',
	});
  }
  
  function error() {
	Modal.error({
	  title: 'This is an error message',
	  content: 'some messages...some messages...',
	});
  }
  
  function warning() {
	Modal.warning({
	  title: 'This is a warning message',
	  content: 'some messages...some messages...',
	});
	}
export default class Modals extends React.Component{
	state = { visible: false,placement: 'top',visible2:false }

	showModal = () => {
		this.setState({
		visible: true,
		});
	}

	handleOk = (e) => {
		this.setState({
		visible: false,
		});
	}

	handleCancel = (e) => {
		this.setState({
		visible: false,
		});
	}
	
	showDrawer = () => {
    this.setState({
      visible2: true,
    });
  };

  onClose = () => {
    this.setState({
      visible2: false,
    });
  };

  onChange = (e) => {
    this.setState({
      placement: e.target.value,
    });
	}
	
	
	render() {
		return (
		<div>
			<Card title="基础模态框">
				<Button type="primary" onClick={this.showModal}>Open</Button>
				<Button onClick={info}>Info</Button>
				<Button onClick={success}>Success</Button>
				<Button onClick={error}>Error</Button>
				<Button onClick={warning} type="danger">Warning</Button>
			</Card>
			<Modal
				title="Basic Modal"
				visible={this.state.visible}
				onOk={this.handleOk}
				onCancel={this.handleCancel}
				>
				<p>Some contents...</p>
				<p>Some contents...</p>
				<p>Some contents...</p>
			</Modal>
			<Card title="抽屉">
				<RadioGroup
						style={{ marginRight: 8 }}
						defaultValue={this.state.placement}
						onChange={this.onChange}
					>
						<Radio value="top">top</Radio>
						<Radio value="right">right</Radio>
						<Radio value="bottom">bottom</Radio>
						<Radio value="left">left</Radio>
				</RadioGroup>
				<Button type="primary" onClick={this.showDrawer}>
					Open
				</Button>
				<Drawer
					title="Basic Drawer"
					placement={this.state.placement}
					closable={false}
					onClose={this.onClose}
					visible={this.state.visible2}
				>
					<p>Some contents...</p>
					<p>Some contents...</p>
					<p>Some contents...</p>
				</Drawer>
			</Card>
			
		</div>
		);
	}
}
