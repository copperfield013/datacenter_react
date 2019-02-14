import React from 'react'
import {Table,Input,Button,Card,Icon} from 'antd';
import Highlighter from 'react-highlight-words';
import "./index.css"

export default class EditTableList extends React.Component {
  state={
    count:this.props.count,
    dataSource:this.props.dataSource,
    searchText:"",
  }
  componentDidMount(){
    
  }
  handleChange=(value)=> {
    console.log(`selected ${value}`);
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
            {type==="detail"?"":<Button 
                              type='primary' 
                              icon="plus" 
                              size="small"
                              onClick={this.props.handleAdd} 
                              style={{marginBottom:10,marginRight:10}}
                              >新增</Button>}
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
