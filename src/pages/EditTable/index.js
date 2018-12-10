import React from 'react'
import { Table, Input, Button, message } from 'antd';
import './index.css'

let storage=window.sessionStorage;
let totalRecord=[]
let newRecord=[]

export default class EditTable extends React.Component {
 
  state={
    count:this.props.count,
    selectedRowKeys:"",
    dataSource:this.props.dataSource,
    columns:this.props.columns,
    item:this.props.item,
  }
  componentWillMount(){
     totalRecord=[]//切换清空原有数据
    storage.removeItem("newRecord")
  }
  
  update=(e,name)=>{
    let record={}
    record[name]=e.target.value
    if(totalRecord.length<1){
      newRecord=totalRecord.push(record)
    }else{
      newRecord=Object.assign(...totalRecord, record)
    }
    storage["newRecord"]=JSON.stringify(newRecord)
  }
  handleAdd=(item)=> {
    const count = this.state.count;
    const newDataSource = this.state.dataSource 
    let list={}    
    item.map((item,index)=>{
        let fieldName=item.fieldName;
        //let fieldId=item.fieldId;
        list["key"]=count
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

    handleDelete = (key,rows) => {
      const dataSource = [...this.state.dataSource];
      if(!key){
          message.info("请选择一条数据")
      }else{
          key.map((key)=>{
              this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
              return false
          })
          var keys=[];
          rows.map((item)=>{ 
              storage.removeItem(item.code)//在storage里面删除对应数据
              for(var k in item){
                keys.push(key+k)
              }
              return false
          })
            for(var k in newRecord){
              keys.map((it)=>{
                if(k===it){
                  delete(newRecord[k])
                }
                return false
              })
              storage["newRecord"]=JSON.stringify(newRecord)
            }
      }      
  }
  render() {
    const rowSelection =this.props.type==="edit"?{
      type: 'radio',
      onChange: (selectedRowKeys, selectedRows) => {
        //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          selectedRowKeys,
          selectedRows
        })
      },
    }:'';
    return (
      <div>
        <div>
            {
              this.props.type==="edit"?<div>
                                          <Button type='primary' icon="plus" onClick={()=>{this.handleAdd(this.props.item)}} style={{marginBottom:10,marginRight:10}}>新增</Button>
                                          <Button type='danger' icon="delete" onClick={()=>{this.handleDelete(this.state.selectedRowKeys,this.state.selectedRows)}} style={{marginBottom:10}}>删除</Button>
                                      </div>
              :""
            }
        </div>
        
          <Table
            rowSelection={rowSelection}
            bordered
            dataSource={this.state.dataSource}
            columns={this.state.columns}
            pagination={false}
          />
        
        
      </div>
    );
  }
}
