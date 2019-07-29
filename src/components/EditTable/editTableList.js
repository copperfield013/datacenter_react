import React from 'react'
import {Table,Input,Button,Card,Icon} from 'antd';
import Highlighter from 'react-highlight-words';
import "./index.css"

export default class EditTableList extends React.Component {
  state={
    count:this.props.count,
    dataSource:this.props.dataSource,
    searchText:"",
    current:this.props.dataSource&&this.props.dataSource.length>0?this.props.dataSource[0].current:1,
  }
  searchValue=(e)=>{
    const {columns,dataSource}=this.props
    const txt=e.target.value
    const data=[]
    columns.forEach((item)=>{
      const id=item.id;
      if(item && item.type!=="file"){
        if(e.target.value){
          const arr=[]
          arr.push(...dataSource.filter(item=>typeof item[id]==="string" && item[id].includes(txt)===true))
          //匹配到一行两个条件，去重
          for(let i=0;i<arr.length;i++){ 
            　　let flag = true;
            　　for(let j=0;j<data.length;j++){
            　　　　if(Object.is(arr[i], data[j])===true){ //判断两个对象是否相同
            　　　　　　flag = false;
            　　　　}
            　　}; 
            　　if(flag){
                  data.push(arr[i]);
            　　};
            };
        }else{
          if(data.includes(...dataSource)===false){
            data.push(...dataSource)
          }
        }  
        item["render"]=text => 
            <Highlighter 
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={[this.state.searchText]}
              autoEscape
              textToHighlight= {text?text.toString():""}
              />        
      }
    })
    this.setState({
      searchText:e.target.value,
      dataSource:data
    })
  }
  tabChange=(pagination)=>{
    const {dataSource}=this.state
    dataSource.forEach((item)=>{
      item.current=pagination.current
    })
    this.setState({
      dataSource
    })
  }
  showTotal=(total)=> {
    return `总共有${total}条`;
  }
  render() {
    let { cardTitle,columns,type,haveTemplate,rabcTemplatecreatable,isModal,unallowedCreate }=this.props
    const {current,dataSource}=this.state
    const page={pageSize:5,hideOnSinglePage:true,defaultCurrent:current,total:dataSource.length,showTotal:this.showTotal}
    let groupId
    const arr1=[]
    const arr2=[]
    if(columns){     
      columns.forEach((item)=>{
        if(item.groupId){
          groupId=item.groupId
          arr2.push(item.id)
        }
      })
    }
    dataSource.forEach((item)=>{
      arr1.push(item.code)
    })
    let excepts=arr1.join(',')
    let dfieldIds=arr2.join(',')
    return (
      <Card 
          title={cardTitle} 
          id={cardTitle} 
          className="hoverable" 
          headStyle={{background:"#f2f4f5"}}
          extra={type==="detail"?
            <Input placeholder="关键字搜索"
              onChange={this.searchValue}
              addonBefore={<Icon type="search"/>}
              />:""}
          >
          <div className="editTableList">
            {type==="detail" || unallowedCreate===1?"":
            <Button 
              type='primary' 
              icon="plus" 
              size="small"
              onClick={this.props.handleAdd} 
              style={{marginBottom:10,marginRight:10}}
              >新增</Button>}
              {!isModal&&haveTemplate && type!=="detail"?
              <Button 
                type='primary' 
                icon="snippets" 
                size="small"
                onClick={()=>this.props.getTemplate(groupId,excepts,dfieldIds)}
                style={{marginBottom:10,marginRight:10}}
                >选择</Button>:""}
              {!isModal&&rabcTemplatecreatable && type!=="detail"?
              <Button 
                type='primary' 
                icon="plus-square" 
                size="small"
                onClick={()=>this.props.getFormTmpl({groupId},true)} 
                style={{marginBottom:10,marginRight:10}}
                >新增</Button>:""}
              <Table
                bordered
                dataSource={dataSource}
                columns={columns}    
                pagination={page}
                onChange={this.tabChange}
              />
          </div>           
      </Card>
    );
  }
}
