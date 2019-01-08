import React from 'react'
import { Table, Input, Button, message,Select,InputNumber} from 'antd';
import Units from './../../units'
import NewUpload from './../NewUpload'
const Option = Select.Option;

export default class EditTableList extends React.Component {
  state={
    selectedRowKeys: [],
    count:this.props.count===0?0:(this.props.count+1),
    dataSource:this.props.dataSource?this.props.dataSource:[],
  }
  componentDidMount(){
    const data=this.state.dataSource
    data.map((item)=>{
      for(let k in item){
        if(typeof(item[k]) === 'string' && item[k].indexOf("download-files")>-1){
          delete item[k] //删除datasource图片
        }
      }
      return false
    })
    this.props.callbackdatasource(data)//传递原始记录
    console.log(this.props.dataSource)
  }
  update=(e,name,key)=>{
    const record={}
    const arr=[];
    record[name]=e.target.value
    record["key"]=key
    arr.push(record)
    this.props.callbackdatasource(arr)//新增记录
  }
  handleChange=(value)=> {
    console.log(`selected ${value}`);
  }
  uploadChange=(file,name)=>{
    this.props.uploadChange(file,name)
  }
  handleAdd=()=> {
    const count =this.state.count;
    const newDataSource = this.state.dataSource
    const itemList=this.props.item
    const itemTitle=itemList.title   
    const list={}     
    const rendom=Units.RndNum(10)
    list["key"]=rendom  //自定义随机数作key值 
    list[`${itemTitle}.$$flag$$`]=true
    itemList.descs.map((item)=>{
        const fieldName=item.fieldName;
        const title=item.title;
        if(itemList.composite.addType===5){
          list[itemTitle+".$$label$$"]=itemTitle
          list["关系"]=<Select defaultValue={itemList.composite.relationSubdomain[0]} onChange={this.handleChange}>                                   
                          {
                              itemList.composite.relationSubdomain.map((item,index)=>{
                                  return <Option value={item} key={index}>{item}</Option>
                              })
                          }
                      </Select>
        }
        if(item.type==="text"){
          list[fieldName]=<Input type="text" 
                          key={[itemTitle+count]} 
                          placeholder={`请输入${fieldName}`}
                          onBlur={(e)=>this.update(e,[itemTitle+`[${count}].`+title],rendom)}
                          />   
        }else if(item.type==="file"){
          list[fieldName]=<NewUpload onChange={(file)=>this.uploadChange(file,[itemTitle+`[${count}].`+title])}/>
        }else if(item.type==="decimal"){
          list[fieldName]=<InputNumber onBlur={(e)=>this.update(e,[itemTitle+`[${count}].`+title],rendom)}/>
        }
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
        const newDataSource=dataSource.filter(item => item.key !== key)       
        this.setState({ 
          dataSource:newDataSource,
          selectedRowKeys: [],
        })
        const toFlag=[] //清空表格列表是，添加$$flag$$
        if(newDataSource.length===0){
          dataSource.map((item)=>{
            for(let k in item){
              if(k.indexOf("flag")>-1){
                const flag={}
                flag[k]=item[k]
                flag["key"]=-1
                toFlag.push(flag)
              }
            }
            return false
          })
        }        
        this.props.callbackdatasource(toFlag)
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
