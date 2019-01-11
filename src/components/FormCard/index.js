import React from 'react'
import {Card,Form} from 'antd'
import moment from 'moment';
import BaseInfoForm from './../BaseForm/BaseInfoForm'


class FormCard extends React.Component{

    componentDidMount(){
        this.props.onRef(this)
    }
    handleBaseInfoSubmit=()=>{
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
    initDetailsList=()=>{
        const formList=this.props.formList;
        const formItemList=[];
        if(formList && formList.length>0){
            formList.map((item,index)=>{
                const cardTitle=this.props.title[index]
                const BASE=<Card 
                                title={cardTitle} 
                                key={cardTitle} 
                                id={cardTitle} 
                                className="hoverable" 
                                headStyle={{background:"#f2f4f5"}}
                                loading={this.props.loading}
                                >
                                <BaseInfoForm 
                                    formList={formList[index]} 
                                    type={this.props.type} 
                                    flag={this.props.flag}
                                    baseInfo={this.baseInfo}
                                    onRef={this.onRef}
                                    form={this.props.form}
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
            <Form layout="inline">  
                {this.initDetailsList()}          
            </Form>           
        )
    }
}
export default Form.create()(FormCard);