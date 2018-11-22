import React from 'react'
import { Tabs,Card,Icon } from 'antd';
import Login from "./../table/table"
import Button from './../ui/button'
const TabPane = Tabs.TabPane;

export default class Tab extends React.Component{
    handleCallback=(key)=> {
        console.log(key);
    }
    constructor(props) {
        super(props);
        this.newTabIndex = 0;
        const panes = [
          { title: 'Tab 1', content: 'Content of Tab 1', key: '1' },
          { title: 'Tab 2', content: 'Content of Tab 2', key: '2' },
          { title: 'Tab 3', content: 'Content of Tab 3', key: '3', closable: false },
        ];
        this.state = {
          activeKey: panes[0].key,
          panes,
        };
      }
    
      onChange = (activeKey) => {
        this.setState({ activeKey });
      }
    
      onEdit = (targetKey, action) => {
        this[action](targetKey);
      }
    
      add = () => {
        const panes = this.state.panes;
        const activeKey = `newTab${this.newTabIndex++}`;
        panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
        this.setState({ panes, activeKey });
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
      Welcome = (title, key) => {
        switch(title){
            case "Tab 1":
                return <Login />
            case "Tab 2":
                return <Button />   
          default:
            return "Hello React"
        }
        
      }
    render(){
        return(
            <div>
                <Card title="普通页签">
                    <Tabs defaultActiveKey="1" onChange={this.handleCallback}>
                        <TabPane tab={<span><Icon type="apple" />Tab 1</span>} key="1">Content of Tab Pane 1</TabPane>
                        <TabPane tab={<span><Icon type="android" />Tab 2</span>} key="2">Content of Tab Pane 2</TabPane>
                        <TabPane tab={<span><Icon type="copy" />Tab 3</span>} key="3">Content of Tab Pane 3</TabPane>
                    </Tabs>
                </Card>
                <Card title="循环页签可编辑">
                    <Tabs
                        onChange={this.onChange}
                        activeKey={this.state.activeKey}
                        type="editable-card"
                        onEdit={this.onEdit}
                    >
                        {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>{this.Welcome(pane.title, pane.key)}</TabPane>)}
                    </Tabs>
                </Card>
            </div>
            
        )
    }
}