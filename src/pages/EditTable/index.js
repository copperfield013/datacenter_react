import React from 'react'
import { Table, Input, Button, message, Form } from 'antd';
import './index.css'
const FormItem = Form.Item;

class EditTable extends React.Component {
 
  state={
    selectedRowKeys:"",
    dataSource:this.props.dataSource,
    columns:this.props.columns
  }
  componentDidMount(){
    console.log(this.props.dataSource)
  }
  handleAdd=(data)=> {
    // const { count } = this.state;
    // console.log(count)
    // const { getFieldDecorator } = this.props.form;
    // const newDataSource = this.state.dataSource 
    // let list={}    
    // data.map((item,index)=>{
    //     let fieldName=item.fieldName;
    //     let fieldId=item.fieldId;
    //     list["key"]=count
    //     //list[fieldId]=<Input type="text" style={{width:165}} key={Date.now()}/>        
    //     list[fieldId]=<FormItem key={Date.now()} className='labelcss'>
    //                         {getFieldDecorator([fieldName+count])(
    //                             <Input type="text" placeholder={`请输入${fieldName}`}/>
    //                         )}
    //                     </FormItem>
                              
    // })
    // newDataSource.push(list)
    // this.setState({
    //     dataSource:newDataSource ,
    //     count: count + 1,
    // });
    console.log(111)
    }

  handleDelete = (key) => {
    const dataSource = [...this.props.dataSource];
    const newSource=[]
    if(key.length==0){
        message.info("请选择")
    }else{
        key.map((key)=>{
            //this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
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
            <Button type='primary' icon="plus" onClick={()=>{this.handleAdd()}} style={{marginBottom:10,marginRight:10}}>新增</Button>
            <Button type='danger' icon="delete" onClick={()=>{this.handleDelete(this.state.selectedRowKeys)}} style={{marginBottom:10}}>删除</Button>
        </div>
        
          <Table
            rowSelection={rowSelection}
            bordered
            dataSource={this.state.dataSource}
            columns={this.props.columns}
            pagination={false}
          />
        
        
      </div>
    );
  }
}

export default Form.create()(EditTable)
