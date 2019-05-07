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
    const {columns,dataSource}=this.props
    const txt=e.target.value
    const data=[]
    columns.map((item)=>{
      const fieldName=item.fieldName;
      if(fieldName && fieldName.indexOf("封面")===-1){
        if(e.target.value){
          const arr=[]
          arr.push(...dataSource.filter(item=>typeof item[fieldName]==="string" && item[fieldName].indexOf(txt)>-1))
          //匹配到一行两个条件，去重
          for(let i=0;i<arr.length;i++){ 
            　　let flag = true;
            　　for(let j=0;j<data.length;j++){
            　　　　if(arr[i].key === data[j].key){
            　　　　　　flag = false;
            　　　　};
            　　}; 
            　　if(flag){
                  data.push(arr[i]);
            　　};
            };
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
    const { cardTitle,columns,type,dataSource,stmplId,itemDescs }=this.props
    const page={pageSize:5,hideOnSinglePage:true}
    let excepts=""
    dataSource.map((item)=>{
      excepts+=item.key+","
      return false
    })
    // let opti=""
    // if(itemDescs.composite.relationSubdomain){
    //   const opArr=itemDescs.composite.relationSubdomain
    //   if(opArr.length===1){
    //     opti=opArr[0]
    //   }
    // }
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
              {stmplId?<Button 
                              type='primary' 
                              icon="snippets" 
                              size="small"
                              //onClick={()=>this.props.getTemplate(stmplId,columns,1,excepts,opti)}
                              style={{marginBottom:10,marginRight:10}}
                              >选择</Button>:""}
              <Table
                bordered
                dataSource={dataSource}
                //dataSource={type==="edit"?dataSource:this.state.dataSource}
                columns={columns}    
                pagination={type==="edit"?false:page}
                onChange={this.tableChange}
              />
          </div>
            
      </Card>
    );
  }
}
