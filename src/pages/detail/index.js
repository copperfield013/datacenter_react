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

var storage=window.localStorage;
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
    componentDidMount(){
        this.props.onRef(this)
    }
    componentWillMount(){
        this.requestLists()
    }
    requestLists=()=>{
        let menuId=this.props.menuId;
        let code=this.props.code;
        axios.ajax({
            url:`/api/entity/detail/${menuId}/${code}`,
            data:{
                isShowLoading:true
            }
        }).then((res)=>{
            let detailsList=res.entity.fieldGroups || "";          
            console.log(res)
           
            detailsList.forEach((item)=>{
                if(item.descs){
                    this.setState({
                        itemDescs:item.descs,
                        columns:this.renderColumns(item.descs),
                        dataSource:this.requestList(item)
                    })
                }
            })
            this.setState({
                detailsList,
                
            })
        })
      
    }
    initDetailsList=()=>{      
        const { getFieldDecorator } = this.props.form;
        const detailsList=this.state.detailsList;
        const detailsItemList=[];

        const rowSelection = {
            type: 'radio',
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
                                                this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                                getFieldDecorator([fieldName],{
                                                initialValue:fieldValue
                                            })(
                                                <Input type="text" style={{width:220}}/>
                                            )}
                                        </FormItem> 
                            }else if(type=="file"){
                                return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                            {
                                                this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}><Avatar src={item.fieldId}/></span>:
                                                getFieldDecorator([fieldName])(
                                                    <Upload {...props}>
                                                        <Button style={{width:220}}>
                                                            <Icon type="upload" /> Click to Upload
                                                        </Button>
                                                    </Upload>
                                            )}
                                        </FormItem>  
                            }else if(type=="select"){
                                return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                            {
                                                this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                                getFieldDecorator([fieldName])(
                                                        <Select style={{width:220}}>
                                                            <Option value="1">男</Option>
                                                            <Option value="2">女</Option>
                                                        </Select>
                                            )}
                                        </FormItem>  
                            }else if(type=="date"){
                                return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                            {
                                                this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                                getFieldDecorator([fieldName])(
                                                    <DatePicker style={{width:220}} locale={locale}/>
                                            )}
                                        </FormItem>  
                            }else if(type=="label"){
                                return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                            {
                                                this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                                getFieldDecorator([fieldName])(
                                                    <Select mode="multiple" style={{width:220}}>
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
                }else if(this.state.itemDescs){
                    const RANGE=<Card title={cardTitle} key={cardTitle}>
                                    {
                                        this.state.type=="edit"?<div>
                                                                    <Button type='primary' icon="plus" onClick={()=>{this.handleAdd(item)}} style={{marginBottom:10,marginRight:10}}>新增</Button>
                                                                    <Button type='danger' icon="delete" onClick={()=>{this.handleDelete(this.state.selectedRowKeys)}} style={{marginBottom:10}}>删除</Button>
                                                                </div>
                                        :""
                                    }
                                    <Table
                                        rowKey="index"
                                        rowSelection={this.state.type=="edit"?rowSelection:""}
                                        pagination={false}
                                        bordered
                                        columns={this.state.columns}
                                        dataSource={this.state.dataSource}
                                    />                  
                                    {/* <EditTable 
                                        rowKey="index"
                                        rowSelection={this.state.type=="edit"?rowSelection:""}
                                        pagination={false}
                                        bordered
                                        columns={this.state.columns}
                                        dataSource={this.state.dataSource}
                                    /> */}
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
                let fieldId=item.fieldId;
                item["dataIndex"]=fieldId;	
                item["key"]=index;       					
            })
            //console.log(data)
            return data
		}		
    }
    requestList=(data)=>{
        let res=[]      
        const count = this.state.count;
        const { getFieldDecorator } = this.props.form;
        if(data.array){
            data.array.map((item)=>{
                let code=item.code;
                let list={};              
                item.fields.map((it)=>{
                    let fieldName=item.fieldName;
                    let fieldValue=it.value;
                    let fieldId=it.fieldId;
                    list["key"]=count;
                    list["code"]=code;
                    list[fieldId]=fieldValue;
                })
                res.push(list)              
            })
            return res        
        }
    }
    onInputChange(e) {
        this.setState({ value: e.target.value } );
        this.props.form.setFieldsValue({
            value: "2222"
          });
    }
    handleAdd=(data)=> {
        const count = this.state.count+data.array.length;
        const { getFieldDecorator } = this.props.form;
        const newDataSource = this.state.dataSource 
        let list={}    
        data.descs.map((item,index)=>{
            let fieldName=item.fieldName;
            let fieldId=item.fieldId;
            list["key"]=count
            //list[fieldId]=<Input type="text" style={{width:165}} key={Date.now()}/>        
            list[fieldId]=<FormItem key={Date.now()} className='labelcss'>
                            {getFieldDecorator([fieldName+count])(
                                <Input type="text" placeholder={`请输入${fieldName}`} onChange={this.state.onInputChange} key={[fieldName+count]}/>
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
            // dataSource.map((item)=>{
            //     key.map((key)=>{
            //         if(item.key!==key){
            //             return newSource.push(item)  
            //         }
            //     })
                
            // })
            console.log(dataSource)
            // this.setState({ 
            //     dataSource: newSource,
            //     selectedRowKeys:[]
            //  });
            key.map((key)=>{
                this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
            })
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
                <div>
                    <Form layout="inline" onSubmit={this.handleSubmit}>
                        {this.initDetailsList()}
                    </Form>
                </div>
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