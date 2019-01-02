import React from 'react'
import { Table, Input, Button, message } from 'antd';
import Units from './../../units'
import './index.css'

export default class EditTableList extends React.Component {
  state={
    selectedRowKeys: [],
    count:this.props.count===0?0:(this.props.count+1),
    dataSource:this.props.dataSource?this.props.dataSource:[],
  }
  componentDidMount(){
    this.props.callbackdatasource(this.state.dataSource)//传递原始记录
  }
  
  update=(e,name,key)=>{
    const record={}
    const arr=[];
    record[name]=e.target.value
    record["key"]=key
    arr.push(record)
    this.props.callbackdatasource(arr)//新增记录
  }
  handleAdd=()=> {
    const count =this.state.count;
    const newDataSource = this.state.dataSource
    const list={}     
    const rendom=Units.RndNum(10)
    list["key"]=rendom  //自定义随机数作key值
    this.props.item.map((item)=>{
        let fieldName=item.fieldName;
        list[fieldName]=<Input type="text" 
                          style={{width:185}} 
                          key={[fieldName+count]} 
                          placeholder={`请输入${fieldName}`}
                          onBlur={(e)=>this.update(e,[fieldName+count],rendom)}
                          />   
        return false                            
    })
    newDataSource.push(list)
    this.setState({
        dataSource:newDataSource ,
        count: count + 1,
    });
      //console.log(this.state.dataSource)
  }
  handleDelete = () => {
    const dataSource = [...this.state.dataSource];
    const skeys=this.state.selectedRowKeys
    const len=this.state.selectedRowKeys.length
    if(len===0){
        message.info("请选择一条数据")
    }else{
      skeys.map((key)=>{
        this.setState({ 
          dataSource:dataSource.filter(item => item.key !== key),
          selectedRowKeys: [],
        })
        this.props.columns.map((item)=>{
          this.props.deleSource(key)//有多少列，执行多少次
          return false
        })
        return false
      })
    }      
  }
  render() {
      const { selectedRowKeys } = this.state;
      const rowSelection ={
        type:"radio",
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          //console.log('selectedRows: ', selectedRows);
          //console.log(selectedRowKeys);
          this.setState({
            selectedRowKeys,
            selectedRows
          })
        },
      }
    return (
      <div>
          {this.props.type==="edit"?<div>
                                        <Button type='primary' icon="plus" onClick={()=>{this.handleAdd()}} style={{marginBottom:10,marginRight:10}}>新增</Button>
                                        <Button type='danger' icon="delete" onClick={()=>{this.handleDelete()}} style={{marginBottom:10}}>删除</Button>
                                    </div>
            :""}
          <Table
            rowSelection={this.props.type==="edit"?rowSelection:null}
            bordered
            dataSource={this.state.dataSource}
            columns={this.props.columns}
            pagination={{pageSize:6,showQuickJumper:true,hideOnSinglePage:true,}}     
          />        
      </div>
    );
  }
}
