import React from 'react'
import {Card} from 'antd'
import BaseInfoForm from './../BaseForm/BaseInfoForm'


export default class FormCard extends React.Component{

    baseInfo=(fieldsValue)=>{
        console.log(fieldsValue)
        this.props.baseInfo(fieldsValue);
    }
    componentDidMount(){
        this.props.onRef(this)
    }
    handleSubmit=()=>{
        this.child.handleBaseInfoSubmit()
    }
    onRef=(ref)=>{
		this.child=ref
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
                this.initDetailsList()
            
        )
    }
}