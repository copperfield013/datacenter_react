import React from 'react'
import { Table, Input, Button, message } from 'antd';
import './index.css'

const storage=window.sessionStorage;
let totalRecord=[]
let newRecord=[]
let res=[]
export default class EditTableList extends React.Component {
  state={
    selectedRowKeys: [],
    count:this.props.count===0?0:(this.props.count+1),
    dataSource:this.props.dataSource?this.props.dataSource:[],
  }
  componentDidMount(){
    res.push(this.props.dataSource)
    storage["records"]=JSON.stringify(res)
  }
  componentWillMount(){
    totalRecord=[]//切换清空原有数据
    storage.removeItem("records")
  }
  
  update=(e,name)=>{
    const record={}
    record[name]=e.target.value
    if(totalRecord.length===0){
      totalRecord.push(record)
      newRecord=record
    }else{
      newRecord=Object.assign(...totalRecord, record)
    }
    console.log(newRecord)
    storage["records"]=JSON.stringify(res)
  }
  handleAdd=()=> {
    const count =this.state.count;
    const newDataSource = this.state.dataSource
    const list={}    
    this.props.item.map((item)=>{
        let fieldName=item.fieldName;
        list["key"]=fieldName+count
        list[fieldName]=<Input type="text" 
                          style={{width:185}} 
                          key={[fieldName+count]} 
                          placeholder={`请输入${fieldName}`}
                          onBlur={(e)=>this.update(e,[count+fieldName])}
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
        return false
      })
      console.log(this.state.dataSource)    
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
            pagination={{pageSize:6,showQuickJumper:true}}       
          />        
      </div>
    );
  }
}
