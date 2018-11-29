import React from 'react'
import {Card,Table,Form,Input,Button,message,Modal} from 'antd'
import axios from "./../../axios"
import './index.css'
const FormItem=Form.Item

let id=0
class Detail extends React.Component{
    state={
        type:this.props.type,
        count:0,
        columns:[],
        dataSource:[],
        selectedRowKeys:[],
        visible: false,
    }
    initDetailsList=()=>{      
        const { getFieldDecorator } = this.props.form;
        const detailsList=this.props.detailsList;
        const detailsItemList=[];

        const rowSelection = {
            type: 'radio',
            onChange: (selectedRowKeys, selectedRows) => {
              //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
              this.setState({
                selectedRowKeys
              })
            },
          };
        if(detailsList && detailsList.length>0){
            detailsList.forEach((item)=>{
                let cardTitle=item.title;
                if(item.fields){
                    const INPUT=<Card title={cardTitle} key={cardTitle}>
                    {
                        item.fields.map((item)=>{      
                        let fieldName=item.fieldName;
                        let fieldValue=item.value;
                        return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                    {
                                        this.state.type=="detail"?<span style={{width:165,display:"inline-block"}}>{fieldValue}</span>:
                                        getFieldDecorator([fieldName],{
                                        initialValue:fieldValue
                                    })(
                                        <Input type="text" style={{width:165}}/>
                                    )}
                                </FormItem> 
                        })    
                    }                   
                    </Card>
                    detailsItemList.push(INPUT)
                }else if(item.descs){
                    const RANGE=<Card title={cardTitle} key={cardTitle}>
                                    {
                                        this.state.type=="edit"?<div>
                                                                    <Button type='primary' icon="plus" onClick={()=>{this.handleAdd(item.descs)}} style={{marginBottom:10}}>新增</Button>
                                                                    <Button type='danger' icon="delete" onClick={()=>{this.handleDelete(this.state.selectedRowKeys)}} style={{marginBottom:10}}>删除</Button>
                                                                </div>
                                        :""
                                    }
                                    <Table
                                        rowSelection={rowSelection}
                                        pagination={false}
                                        bordered
                                        columns={this.renderColumns(item.descs)}
                                        dataSource={this.state.dataSource}
                                    />                  
                                </Card>
                    detailsItemList.push(RANGE)
                }
            })          
        }
        if(this.state.type=="edit"){
            let btn=<Button type='primary' className="submitBtn" onClick={this.showModal} key="submitBtn"  htmlType="submit">提交</Button>
            detailsItemList.push(btn)
        }
        return detailsItemList;
    }
    renderColumns=(data)=>{
		if(data){
			data.map((item,index)=>{
                let fieldId=item.fieldId;
				let key="dataIndex";
                item[key]=fieldId;	
                item["key"]=index;          					
            })
            //console.log(data)
            return data
		}		
    }
    handleAdd=(data)=> {
        const { getFieldDecorator } = this.props.form;
        const newDataSource = this.state.dataSource
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        console.log(keys)
        //const nextKeys = keys.concat(++id);
        const { count } = this.state;  
        let list={}    
        data.map((item,index)=>{
            let fieldName=item.fieldName;
            let fieldId=item.fieldId;
            list["key"]=count
            list[fieldId]=<FormItem key={count} className='labelcss'>
                                {
                                    getFieldDecorator([fieldName])(
                                    <Input type="text" style={{width:165}}/>
                                )}
                            </FormItem>
                                  
        })
        newDataSource.push(list)
        this.setState({
            dataSource:newDataSource ,
            count: count + 1,
        });
        console.log(newDataSource)
        }
    handleDelete = (key) => {
        const dataSource = [...this.state.dataSource];
        const newSource=[]
        if(key.length==0){
            message.info("请选择")
        }else{
            dataSource.map((item)=>{
                key.map((key)=>{
                    if(item.key!==key){
                        return newSource.push(item)  
                    }
                })
                
            })
            console.log(key)
            this.setState({ 
                dataSource: newSource,
                selectedRowKeys:[]
             });
        }      
    }
    handleOk = (e) => {
        e.preventDefault();
        let menuId=this.props.menuId;
        let code=this.props.code;
        this.props.form.validateFields((err, values) => {
          if (!err) {
            // axios.ajax({
            //     url:`/api/entity/update/${menuId}`,
            //     data:{
            //         isShowLoading:true,
            //         "唯一编码":code,
            //         "实体字段":values			
            //     }
            // }).then((res)=>{
            //      console.log(res)
            //       message.success("提交成功！")
            // })
            console.log(values)
          }
        });
        this.setState({
          visible: false,
        });
      }
    
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    render(){
        return(
            <div>
                <h3>{this.props.detailsTitle}</h3>
                <Card>
                    <Form layout="inline" onSubmit={this.handleSubmit}>
                        {this.initDetailsList()}
                    </Form>
                </Card>
                <Modal
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="确认"
                    cancelText="取消"
                    >
                    <p>确认提交数据吗</p>
                </Modal>
            </div>
        )
    }
}
export default Form.create()(Detail)