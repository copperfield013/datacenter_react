import React from 'react'
import {Card,Table,Form,Input,Button,message,Modal,Avatar,Upload,Icon,Select,DatePicker,Popconfirm} from 'antd'
import axios from "./../../axios"
import './index.css'
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import EditTable from './../../pages/EditTable'
const Option = Select.Option;
const FormItem=Form.Item


class Detail extends React.Component{
    state={
        type:this.props.type,
        count:0,
        columns:[],
        dataSource:[],
        selectedRowKeys:[],
        visible: false,
        value:{},
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
        const props = {
        name: 'file',
        action: '//jsonplaceholder.typicode.com/posts/',
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            }
        },
        };
        if(detailsList && detailsList.length>0){
            detailsList.forEach((item)=>{
                let cardTitle=item.title;
                if(item.fields){
                    const INPUT=<Card title={cardTitle} key={cardTitle}>
                    {
                        item.fields.map((item)=>{ 
                            let type=item.type;
                            //console.log(type)
                            let fieldName=item.fieldName;
                            let fieldValue=item.value; 
                            if(type=="text"){
                                return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                            {
                                                this.state.type=="detail"?<span style={{width:170,display:"inline-block"}}>{fieldValue}</span>:
                                                getFieldDecorator([fieldName],{
                                                initialValue:fieldValue
                                            })(
                                                <Input type="text" style={{width:165}}/>
                                            )}
                                        </FormItem> 
                            }else if(type=="file"){
                                return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                            {
                                                this.state.type=="detail"?<Avatar src={item.fieldId}/>:
                                                getFieldDecorator([fieldName])(
                                                    <Upload {...props}>
                                                        <Button style={{width:165}}>
                                                            <Icon type="upload" /> Click to Upload
                                                        </Button>
                                                    </Upload>
                                            )}
                                        </FormItem>  
                            }else if(type=="select"){
                                return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                            {
                                                this.state.type=="detail"?<span style={{width:170,display:"inline-block"}}>{fieldValue}</span>:
                                                getFieldDecorator([fieldName])(
                                                        <Select style={{width:165}}>
                                                            <Option value="1">男</Option>
                                                            <Option value="2">女</Option>
                                                        </Select>
                                            )}
                                        </FormItem>  
                            }else if(type=="date"){
                                return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                            {
                                                this.state.type=="detail"?<span style={{width:170,display:"inline-block"}}>{fieldValue}</span>:
                                                getFieldDecorator([fieldName])(
                                                    <DatePicker style={{width:165}} locale={locale}/>
                                            )}
                                        </FormItem>  
                            }else if(type=="label"){
                                return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                            {
                                                this.state.type=="detail"?<span style={{width:170,display:"inline-block"}}>{fieldValue}</span>:
                                                getFieldDecorator([fieldName])(
                                                    <Select mode="multiple" style={{width:165}}>
                                                        <Option value="1">游泳</Option>
                                                        <Option value="2">唱歌</Option>
                                                        <Option value="3">旅游</Option>
                                                        <Option value="4">逛街</Option>
                                                        <Option value="5">跳舞</Option>
                                                        <Option value="6">爬山</Option>
                                                    </Select>
                                            )}
                                        </FormItem>  
                            }
                        
                        })    
                    }                   
                    </Card>
                    detailsItemList.push(INPUT)
                }else if(item.descs){
                    const RANGE=<Card title={cardTitle} key={cardTitle}>
                                    {/* {
                                        this.state.type=="edit"?<div>
                                                                    <Button type='primary' icon="plus" onClick={()=>{this.handleAdd(item.descs)}} style={{marginBottom:10}}>新增</Button>
                                                                    <Button type='danger' icon="delete" onClick={()=>{this.handleDelete(this.state.selectedRowKeys)}} style={{marginBottom:10}}>删除</Button>
                                                                </div>
                                        :""
                                    }
                                    <Table
                                        rowSelection={this.state.type=="edit"?rowSelection:""}
                                        pagination={false}
                                        bordered
                                        columns={this.renderColumns(item.descs)}
                                        dataSource={this.requestList(item)}
                                    />                   */}
                                    <EditTable
                                        columns={this.renderColumns(item.descs)}
                                        dataSource={this.requestList(item)}
                                    />
                                </Card>
                    detailsItemList.push(RANGE)
                }
            })          
        }
        if(this.state.type=="edit"){
            let btn=<Button type='primary' icon="cloud-upload" className="submitBtn" onClick={this.showModal} key="submitBtn" htmlType="submit">提交</Button>
            detailsItemList.push(btn)
        }
        return detailsItemList;
    }
    renderColumns=(data)=>{
		if(data){
			data.map((item,index)=>{
                let fieldName=item.fieldName;
                item["dataIndex"]=fieldName;	
                item["key"]=index; 
                item["editable"]=true       					
            })
            console.log(data)
            return data
		}		
    }
    requestList=(data)=>{
        let res=[]
        const { count } = this.state;
        if(data.array){
            data.array.map((item)=>{
                let code=item.code;
                let list={};              
                item.fields.map((it)=>{
                    let fieldValue=it.value;
                    let fieldName=it.fieldName;
                    list["key"]=count;
                    list["code"]=code;
                    list[fieldName]=fieldValue
                })
                res.push(list)              
            })
            return res        
        }
    }
    handleAdd=(data)=> {
        const { count } = this.state;
        console.log(count)
        const { getFieldDecorator } = this.props.form;
        const newDataSource = this.state.dataSource 
        let list={}    
        data.map((item,index)=>{
            let fieldName=item.fieldName;
            let fieldId=item.fieldId;
            list["key"]=count
            //list[fieldId]=<Input type="text" style={{width:165}} key={Date.now()}/>        
            list[fieldId]=<FormItem key={Date.now()} className='labelcss'>
                                {getFieldDecorator([fieldName+count])(
                                    <Input type="text" placeholder={`请输入${fieldName}`}/>
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