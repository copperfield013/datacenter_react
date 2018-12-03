import React from 'react'
import { Table, Input, Button, message, Form } from 'antd';
import './index.css'
const FormItem = Form.Item;


class EditTable extends React.Component {
 
  state={
    count:this.props.count,
    selectedRowKeys:"",
    dataSource:this.props.dataSource,
    columns:this.props.columns,
    item:this.props.item,
  }
  componentDidMount(){
    console.log(this.state.dataSource)
  }
 
  handleAdd=(item)=> {
        const count = this.state.count;
        const newDataSource = this.state.dataSource 
        let list={}    
        item.map((item,index)=>{
            let fieldName=item.fieldName;
            let fieldId=item.fieldId;
            list["key"]=count
            list[fieldName]=<Input type="text" style={{width:185}} key={[fieldName+count]} placeholder={`请输入${fieldName}`}/>
                                  
        })
        newDataSource.push(list)
        this.setState({
            dataSource:newDataSource ,
            count: count + 1,
        });
          console.log(this.state.dataSource)
  }

    handleDelete = (key) => {
      const dataSource = [...this.state.dataSource];
      if(key.length==0){
          message.info("请选择")
      }else{
          console.log(dataSource)
          key.map((key)=>{
              this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
          })
      }      
  }
  render() {
    const rowSelection = {
      type: 'radio',
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          selectedRowKeys
        })
      },
    };
    return (
      <div>
        <div>
            {
              this.props.type=="edit"?<div>
                                          <Button type='primary' icon="plus" onClick={()=>{this.handleAdd(this.props.item)}} style={{marginBottom:10,marginRight:10}}>新增</Button>
                                          <Button type='danger' icon="delete" onClick={()=>{this.handleDelete(this.state.selectedRowKeys)}} style={{marginBottom:10}}>删除</Button>
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

const WrappedHorizontalLoginForm = Form.create()(EditTable);
export default WrappedHorizontalLoginForm
