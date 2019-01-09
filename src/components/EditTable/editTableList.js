import React from 'react'
import { Table, Input, Button,Select,InputNumber} from 'antd';
import Units from './../../units'
import NewUpload from './../NewUpload'
import "./index.css"
const Option = Select.Option;

export default class EditTableList extends React.Component {
  state={
    selectedRowKeys: [],
  }
  componentDidMount(){
    const data=this.props.dataSource?this.props.dataSource:[]
    const getFlag=this.props.item
    if(getFlag.composite.name){  //列表记录从无到有时添加$$flag$$
      const arr=[];
      const record={}
      record[`${getFlag.composite.name}.$$flag$$`]=true;
      if(getFlag.composite.addType===5){
        record[`${getFlag.composite.name}[0].$$label$$`]=getFlag.composite.name;
      }
      arr.push(record)
      this.props.callbackdatasource(arr)
    }
    data.map((item)=>{
      for(let k in item){
        if(typeof(item[k]) === 'string' && item[k].indexOf("download-files")>-1){
          delete item[k] //删除datasource图片
        }else if(k.indexOf("flag")>-1){
          const arr=[];
          const record={}
          record[k]=item[k]
          arr.push(record)
          this.props.callbackdatasource(arr) //列表记录从有到无时添加$$flag$$
        }
      }
      return false
    })
    this.props.callbackdatasource(data)//传递原始记录
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
    const count =this.props.count;
    const newDataSource = this.props.dataSource?this.props.dataSource:[]
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
          list[itemTitle+`[${count}].$$label$$`]=itemTitle
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
          list[fieldName]=<NewUpload width={110} onChange={(file)=>this.uploadChange(file,[itemTitle+`[${count}].`+title])}/>
        }else if(item.type==="decimal"){
          list[fieldName]=<InputNumber onBlur={(e)=>this.update(e,[itemTitle+`[${count}].`+title],rendom)}/>
        }
        return false                            
    })
    const arr=[];
    arr.push(list)
    console.log(list)
    this.props.callbackdatasource(arr)
    newDataSource.push(list)
    this.setState({
        dataSource:newDataSource ,
        count: count + 1,
    });
  }
  render() {
    return (
      <div className="editTableList">
          {this.props.type==="edit"?<Button 
                                      type='primary' 
                                      icon="plus" 
                                      onClick={()=>{this.handleAdd()}} 
                                      style={{marginBottom:10,marginRight:10}}
                                      >新增</Button>
                                      :""}
          <Table
            bordered
            dataSource={this.props.dataSource}
            columns={this.props.columns}    
            pagination={false}
          />        
      </div>
    );
  }
}
