import React from 'react'
import {Form,Modal} from 'antd'
import moment from 'moment';
import Units from './../../units'
import BaseInfoForm from './../BaseForm/BaseInfoForm'

class ModelForm extends React.Component{

    componentDidMount(){
        this.props.onRef2(this)
    }
    handleReset = () => {
        this.props.form.resetFields();
    } 
    handleOk=()=>{
        const key=this.props.formList[1]["key"]
        const totalName=this.props.formList[1]["fieldName"].split(".")[0]
        let fieldsValue=this.props.form.getFieldsValue()[totalName];
        const trueKey=key?key:Units.RndNum(9);//随机生成key，进行第二次更改
        for(let k in fieldsValue){
            if(k.indexOf("期")>-1 && fieldsValue[k]){ //日期格式转换
                fieldsValue[k]=moment(fieldsValue[k]).format("YYYY-MM-DD")
            }else if(!fieldsValue[k]){ //去除undefined
                fieldsValue[k]=""
            }else if(typeof fieldsValue[k]==="object"){ //图片
                fieldsValue[k]=<img 
                                style={{width:55}} 
                                src={fieldsValue[k].thumbUrl} 
                                owlner={fieldsValue[k].originFileObj} 
                                alt="" />
            }
        }
        fieldsValue["key"]=trueKey
        fieldsValue["totalName"]=totalName    
        const relation=this.props.form.getFieldsValue()["关系"]
        if(relation){
            fieldsValue["关系"]=relation
        }
        this.props.handleOk(fieldsValue);
    } 
    render(){
        const { formList,type,form }=this.props;
        return(
            <Modal
                title={this.props.title}
                visible={this.props.visibleForm}
                onOk={this.handleOk}
                onCancel={this.props.handleCancel}
                okText="确认"
                cancelText="取消"
                destroyOnClose
                >
                <Form layout="inline" autoComplete="off" > 
                    <BaseInfoForm
                        key={this.props.title}
                        formList={formList} 
                        type={type} 
                        form={form}
                        width={220}
                        getOptions={this.props.getOptions}
                        options={this.props.options}
                        flag={false}
                        />          
                </Form>                    
            </Modal> 
        )
    }
}
export default Form.create()(ModelForm);