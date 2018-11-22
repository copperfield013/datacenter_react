import React from 'react'
import { Button, Card, notification,Select  } from 'antd';

const { Option } = Select;
const options = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

export default class Notification extends React.Component{
    openNotification = () => {
        notification.open({
          message: 'Notification Title',
          description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        })
    }
    openNotification2 = (type) => {
        notification[type]({
          message: 'Notification Title',
          description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
        })
    }
    render(){
        return (
            <div>
                <Card title="Notification通知提醒位置">
                    <Select
                        defaultValue="topRight"
                        style={{ width: 120, marginRight: 10 }}
                        onChange={(val) => {
                            notification.config({
                            placement: val,
                            });
                        }}
                        >
                        {options.map(val => <Option key={val} value={val}>{val}</Option>)}
                    </Select>
                    <Button
                        type="primary"
                        onClick={this.openNotification}
                        >
                        Open the notification box
                    </Button>
			    </Card>
                <Card title="Notification通知提醒图标">
                    <Button onClick={()=>this.openNotification2('success')}>Success</Button>
                    <Button onClick={()=>this.openNotification2('info')}>Info</Button>
                    <Button onClick={()=>this.openNotification2('warning')}>Warning</Button>
                    <Button onClick={()=>this.openNotification2('error')}>Error</Button>
			    </Card>
            </div>
        )
    }
}