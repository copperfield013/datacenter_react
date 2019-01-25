import React from 'react'
import {Form,Modal} from 'antd'
import moment from 'moment';
import BaseInfoForm from './../BaseForm/BaseInfoForm'

class ModelForm extends React.Component{

    componentDidMount(){
        this.props.onRef2(this)
    }
    handleReset = () => {
        this.props.form.resetFields();
    } 
    handleOk=()=>{
        let fieldsValue=this.props.form.getFieldsValue();
        for(let k in fieldsValue){
            if(k.indexOf("期")>-1 && fieldsValue[k]){ //日期格式转换
                fieldsValue[k]=moment(fieldsValue[k]).format("YYYY-MM-DD")
            }else if(!fieldsValue[k]){ //去除undefined
                fieldsValue[k]=""
            }
        }
        fieldsValue["key"]=this.props.formList[0]["key"]
        this.props.handleOk(fieldsValue);
    } 
    initDetailsList=()=>{
        const { formList,type,form }=this.props
        const formItemList=[];
        if(formList && formList.length>0){
            const BASE=<BaseInfoForm 
                            key="ModelForm"
                            formList={formList} 
                            type={type} 
                            form={form}
                            width={220}
                            getOptions={this.props.getOptions}
                            options={this.props.options}
                            />
            formItemList.push(BASE)       
        }
        return formItemList;
    }
    render(){
        return(
            <Modal
                title="编辑"
                visible={this.props.visibleForm}
                onOk={this.handleOk}
                onCancel={this.props.handleCancel}
                okText="确认"
                cancelText="取消"
                >
                <Form layout="inline" autoComplete="off">  
                    {this.initDetailsList()}          
                </Form>                    
            </Modal> 
        )
    }
}
export default Form.create()(ModelForm);