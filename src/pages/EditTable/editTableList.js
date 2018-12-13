import React from 'react'
import { Table, Input, Button, message } from 'antd';
import './index.css'

let storage=window.sessionStorage;
let totalRecord=[]
let newRecord=[]
export default class EditTableList extends React.Component {
  state={
    selectedRowKeys: [],
    count:this.props.count===0?0:(this.props.count+1),
    dataSource:this.props.dataSource?this.props.dataSource:[],
  }
  componentWillMount(){
    totalRecord=[]//切换清空原有数据
    storage.removeItem("newRecord")
  }
  
  update=(e,name)=>{
    let record={}
    record[name]=e.target.value
    if(totalRecord.length===0){
      totalRecord.push(record)
      newRecord=record
    }else{
      newRecord=Object.assign(...totalRecord, record)
    }
    //console.log(record)
    storage["newRecord"]=JSON.stringify(newRecord)
  }
  handleAdd=()=> {
    const count =this.state.count;
    const newDataSource = this.state.dataSource
    let list={}    
    this.props.item.map((item)=>{
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

  handleDelete = () => {
    const dataSource = [...this.state.dataSource];
    if(!this.state.selectedRowKeys){
        message.info("请选择一条数据")
    }else{
        //   this.state.selectedRowKeys.map((it)=>{
        //       dataSource.filter(item => item.key===it)
            
        //   })
        
        // console.log(dataSource)
        this.setState({ 
          dataSource: dataSource,
          selectedRowKeys: [],
        });
        let keys=[];
        this.state.selectedRows.map((item)=>{ 
            storage.removeItem(item.code)//在storage里面删除对应数据
            for(let k in item){
              keys.push(this.state.selectedRowKeys+k)
            }
            return false
        })
        for(let k in newRecord){
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
       const { selectedRowKeys } = this.state;
      const rowSelection ={
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          console.log('selectedRows: ', selectedRows);
          console.log(`selectedRowKeys: ${selectedRowKeys}`);
          this.setState({
            selectedRowKeys,
            selectedRows
          })
        },
      }
    return (
      <div>
          {
            this.props.type==="edit"?<div>
                                        <Button type='primary' icon="plus" onClick={()=>{this.handleAdd()}} style={{marginBottom:10,marginRight:10}}>新增</Button>
                                        <Button type='danger' icon="delete" onClick={()=>{this.handleDelete()}} style={{marginBottom:10}}>删除</Button>
                                    </div>
            :""
          }
          <Table
            rowSelection={this.props.type==="edit"?rowSelection:null}
            bordered
            dataSource={this.state.dataSource}
            columns={this.props.columns}
            pagination={false}
          />        
      </div>
    );
  }
}
