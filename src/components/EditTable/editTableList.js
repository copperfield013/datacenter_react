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
    searchText:""
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
  handleSearch = (selectedKeys,confirm) => {
    confirm()
    this.setState({ searchText: selectedKeys[0] });
  }
  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  }
  onChange=(pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
  }
  render() {
    const dataSource=this.props.dataSource
    const cardTitle=this.props.cardTitle
    const columns=this.props.columns
    if(this.props.type==="detail"){
      columns.map((item)=>{
        const fieldName=item.fieldName;
        if(fieldName){               
            item["filterDropdown"]=({
                setSelectedKeys, selectedKeys, confirm, clearFilters,
              }) => (
                <div className="SearchForm">
                  <Input
                    ref={node => { this.searchInput = node; }}
                    placeholder={`${fieldName}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys,confirm)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                  />
                  <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys,confirm)}
                    icon="search"
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                  >
                    搜索
                  </Button>
                  <Button
                    onClick={() => this.handleReset(clearFilters)}
                    size="small"
                    style={{ width: 90 }}
                  >
                    重置
                  </Button>
                </div>
              )
          item["filterIcon"]=filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} /> 
          item["onFilter"]=(value, record) => record[fieldName].includes(value)        
          item["onFilterDropdownVisibleChange"]= (visible) => {
                                                      if (visible) {
                                                        setTimeout(() => this.searchInput.select());
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
      console.log(columns)
  }
    return (
      <Card 
          title={cardTitle} 
          id={cardTitle} 
          className="hoverable" 
          headStyle={{background:"#f2f4f5"}}
          // extra={this.props.type==="detail"?<Input placeholder="关键字搜索"
          //                                         onChange={(e)=>this.searchValue(e)}
          //                                         addonBefore={<Icon type="search"/>}
          //                                         />:""}
          >
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
                dataSource={dataSource}
                columns={columns}    
                pagination={false}
                onChange={this.onChange}
              />
          </div>
            
      </Card>
    );
  }
}
