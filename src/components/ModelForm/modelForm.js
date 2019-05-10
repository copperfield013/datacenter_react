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
        const {formList,form}=this.props
        let key,groupId,totalName
        formList.map((item)=>{
            if(item.name!=="关系"){
                key=item.key
                groupId=item.groupId
                totalName=item.name.split(".")[0]
            }
            return false
        })      
        let fieldsValue=form.getFieldsValue()[totalName]
        //console.log(formList)
        const trueKey=key?key:Units.RndNum(9);//随机生成key，进行第二次更改
        for(let k in fieldsValue){
            fieldsValue[k+"*"]=fieldsValue[k]
            formList.map((item)=>{
                if(k===item.title){
                    fieldsValue[item.id]=fieldsValue[k]
                }
                return false
            })
            if(fieldsValue[k] && moment(fieldsValue[k],moment.ISO_8601).isValid()){ //日期格式转换
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
        fieldsValue["groupId"]=groupId
        fieldsValue["totalName"]=totalName    
        const relation=form.getFieldsValue()["关系"]
        if(relation){
            fieldsValue["关系"]=relation
        }
        // console.log(formList)
        //console.log(fieldsValue)
        this.props.handleOk(fieldsValue);
    } 
    render(){
        const { formList,type,form,title,visibleForm,handleCancel,getOptions,options }=this.props;
        return(
            <Modal
                title={title}
                visible={visibleForm}
                onOk={this.handleOk}
                onCancel={handleCancel}
                okText="确认"
                cancelText="取消"
                destroyOnClose
                >
                <Form layout="inline" autoComplete="off"> 
                    <BaseInfoForm
                        key={title}
                        formList={formList} 
                        type={type} 
                        form={form}
                        width={220}
                        getOptions={getOptions}
                        options={options}
                        flag={false}
                        />          
                </Form>                    
            </Modal> 
        )
    }
}
export default Form.create()(ModelForm);