import React from 'react'
import {Card,Form} from 'antd'
import moment from 'moment';
import BaseInfoForm from './../BaseForm/BaseInfoForm'

class FormCard extends React.Component{

    componentDidMount(){
        this.props.onRef(this)
    }
    handleBaseInfoSubmit=()=>{
        this.props.form.validateFields({ force: true }, (err, values) => { //提交再次验证
            if(!err){               
                const fieldsValue=this.props.form.getFieldsValue()
                for(let k in fieldsValue){
                    if(k.indexOf("日期")>-1 && fieldsValue[k]){ //日期格式转换
                        fieldsValue[k]=moment(fieldsValue[k]).format("YYYY-MM-DD")
                    }else if(!fieldsValue[k]){ //去除undefined
                        fieldsValue[k]=""
                    }
                }
                this.props.baseInfo(fieldsValue)
            }
        })
    }
    initDetailsList=()=>{
        const { formList,type,flag,form,loading,title }=this.props
        const formItemList=[];
        if(formList && formList.length>0){
            formList.map((item,index)=>{
                const BASE=<Card 
                                title={title[index]} 
                                key={title[index]} 
                                id={title[index]} 
                                className="hoverable" 
                                headStyle={{background:"#f2f4f5"}}
                                loading={loading}
                                >
                                <BaseInfoForm 
                                    formList={formList[index]} 
                                    type={type} 
                                    flag={flag}
                                    baseInfo={this.baseInfo}
                                    onRef={this.onRef}
                                    form={form}
                                    width={220}
                                    />
                            </Card>
                formItemList.push(BASE)         
                return false     
            })          
        }
        return formItemList;
    }
    render(){
        return(
            <Form layout="inline" autoComplete="off">  
                {this.initDetailsList()}          
            </Form>           
        )
    }
}
export default Form.create()(FormCard);