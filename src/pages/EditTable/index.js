import React from 'react'
import { Table, Input, Button, message, Form } from 'antd';
import './index.css'
const FormItem = Form.Item;

var storage=window.localStorage;
var totalRecord=[]
var newRecord=[]

export default class EditTable extends React.Component {
 
  state={
    count:this.props.count,
    selectedRowKeys:"",
    dataSource:this.props.dataSource,
    columns:this.props.columns,
    item:this.props.item,
  }
  componentDidMount(){

  }
  
  update=(e,name)=>{
    let record={}
    record[name]=e.target.value
    if(totalRecord.length<1){
      totalRecord.push(record)
    }else{
      newRecord=Object.assign(...totalRecord, record)
    }
    storage["newRecord"]=JSON.stringify(newRecord)
    console.log(storage["newRecord"])
  }
  handleAdd=(item)=> {
    const count = this.state.count;
    const newDataSource = this.state.dataSource 
    let list={}    
    item.map((item,index)=>{
        let fieldName=item.fieldName;
        let fieldId=item.fieldId;
        list["key"]=count
        list[fieldName]=<Input type="text" 
                          style={{width:185}} 
                          key={[fieldName+count]} 
                          placeholder={`请输入${fieldName}`}
                          onBlur={(e)=>this.update(e,[count+fieldName])}
                          />                               
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
          })
          var keys=[];
          rows.map((item)=>{ 
              storage.removeItem(item.code)//在storage里面删除对应数据
              for(var k in item){
                keys.push(key+k)
              }
          })
            for(var k in newRecord){
              keys.map((it)=>{
                if(k==it){
                  delete(newRecord[k])
                }
              })
              storage["newRecord"]=JSON.stringify(newRecord)
            }

         
       
          
          // keys.map((item)=>{
          //   if(storage.getItem(item)){
          //     storage.removeItem(item)
          //   }
          // })
      }      
  }
  render() {
    const rowSelection = {
      type: 'radio',
      onChange: (selectedRowKeys, selectedRows) => {
       console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          selectedRowKeys,
          selectedRows
        })
      },
    };
    return (
      <div>
        <div>
            {
              this.props.type=="edit"?<div>
                                          <Button type='primary' icon="plus" onClick={()=>{this.handleAdd(this.props.item)}} style={{marginBottom:10,marginRight:10}}>新增</Button>
                                          <Button type='danger' icon="delete" onClick={()=>{this.handleDelete(this.state.selectedRowKeys,this.state.selectedRows)}} style={{marginBottom:10}}>删除</Button>
                                      </div>
              :""
            }
        </div>
        
          <Table
            rowSelection={this.props.type=="edit"?rowSelection:""}
            bordered
            dataSource={this.state.dataSource}
            columns={this.state.columns}
            pagination={false}
          />
        
        
      </div>
    );
  }
}
