import React from 'react'
import {Table,Input,Button,Select,InputNumber,Card,Icon} from 'antd';
import Units from './../../units'
import NewUpload from './../NewUpload'
import Highlighter from 'react-highlight-words';
import "./index.css"
const Option = Select.Option;

export default class EditTableList extends React.Component {
  state={
    selectedRowKeys: [],
    count:this.props.count,
    dataSource:this.props.dataSource,
    searchText:"",
  }
  componentDidMount(){
    const data=this.props.dataSource?this.props.dataSource:[]
    data.map((item)=>{
      for(let k in item){
        if(typeof(item[k]) === 'string' && item[k].indexOf("download-files")>-1){
          delete item[k] //删除datasource图片
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
    this.props.newRecords(arr)//新增记录
  }
  handleChange=(value)=> {
    console.log(`selected ${value}`);
  }
  uploadChange=(file,name)=>{
    this.props.uploadChange(file,name)
  }
  handleAdd=()=> {
    const count =this.state.count;
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
    //console.log(list)
    this.props.callbackdatasource(arr)
    newDataSource.push(list)
    this.setState({
        dataSource:newDataSource ,
        count: count + 1,
    });
  }
  searchValue=(e)=>{
    const columns=this.props.columns
    const dataSource=this.props.dataSource
    const txt=e.target.value
    const data=[]
    columns.map((item)=>{
      const fieldName=item.fieldName;
      if(fieldName && fieldName.indexOf("封面")===-1){
        if(e.target.value){
          data.push(...dataSource.filter(item=>item[fieldName].indexOf(txt)>-1))
        }else{
          if(data.indexOf(...dataSource)===-1){
            data.push(...dataSource)
          }
        }  
        item["render"]=(text) => (<Highlighter
                                      highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                                      searchWords={[this.state.searchText]}
                                      autoEscape
                                      textToHighlight={text.toString()}
                                      />)        
      }
        return false
    })
    this.setState({
      searchText:e.target.value,
      dataSource:data
    })
  }
  tableChange=(pagination)=>{
    console.log(pagination)
    this.props.columns.map((item)=>{
      if(item.key==="order"){
        item["render"]=(text, record,index) => (
              <label>{(pagination.current-1)*pagination.pageSize+index+1}</label>
          )       
      }
      return false
    })
  }
  render() {
    const { cardTitle,columns,type,dataSource }=this.props
    const page={pageSize:5,hideOnSinglePage:true}
    return (
      <Card 
          title={cardTitle} 
          id={cardTitle} 
          className="hoverable" 
          headStyle={{background:"#f2f4f5"}}
          extra={type==="detail"?<Input placeholder="关键字搜索"
                                                  onChange={this.searchValue}
                                                  addonBefore={<Icon type="search"/>}
                                                  />:""}
          >
          <div className="editTableList">
            {type==="edit"?<Button 
                                          type='primary' 
                                          icon="plus" 
                                          onClick={()=>{this.handleAdd()}} 
                                          style={{marginBottom:10,marginRight:10}}
                                          >新增</Button>
                                          :""}
              <Table
                bordered
                dataSource={type==="edit"?dataSource:this.state.dataSource}
                columns={columns}    
                pagination={type==="edit"?false:page}
                onChange={this.tableChange}
              />
          </div>
            
      </Card>
    );
  }
}
