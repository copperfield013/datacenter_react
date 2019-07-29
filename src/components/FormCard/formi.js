import React from 'react'
import {Form} from 'antd'
import moment from 'moment';
import EditTable from '../EditTable'
import FormCard from './../FormCard/index'


class Formi extends React.Component{
    componentDidMount(){
        this.props.onRef(this)
    }
    handleBaseInfoSubmit=()=>{
        this.props.form.validateFields({ force: true }, (err, values) => { //提交再次验证
            if(!err){
                const result={}
                for(let k in values){
                    if(values[k] && moment(values[k],moment.ISO_8601).isValid()){ //日期格式转换
                        result[k]=moment(values[k]).format("YYYY-MM-DD")
                    }else if(values[k] && values[k].originFileObj){
                        result[k]=values[k].originFileObj
                    }else if(!values[k] || values[k].length===0){
                        delete values[k]
                    }else{
                        result[k]=values[k]
                    }
                }
                this.props.baseInfo(result)
            }
        })
    }   
    reset=()=>{
        this.props.form.resetFields()
    }
    initDetailsList=()=>{
        const {dtmplGroup,columns,dataSource,type,loading,options,form}=this.props
        //console.log(dtmplGroup)
        return dtmplGroup.map((item)=>{
            if(item.composite && columns){
                let data=[]
                let column=[]
                for(let k in dataSource){
                    if(k===item.id.toString()){
                        data=dataSource[k]
                    }
                }
                columns.forEach((it)=>{
                    if(it.id===item.id){
                        column=it
                    }
                })
                return <EditTable 
                            type={type}
                            columns={column}
                            dataSource={data}
                            key={item.title}
                            handleAdd={this.props.getForm}
                            getTemplate={this.props.getTemplate} //新增选择实体模板
                            getFormTmpl={this.props.getFormTmpl}//新增修改实体模板
                            isModal={this.props.match?false:true}
                        />   
            }else{
                return <FormCard
                            formList={item}
                            type={type}
                            key={item.title}
                            baseInfo={this.props.baseInfo}
                            loading={loading}
                            getOptions={this.props.getOptions}
                            options={options}
                            form={form}
                            setPassword={this.props.setPassword}
                        />
            }
        })
    }
    render(){
        return(
            <Form layout="inline" autoComplete="off">  
                {this.initDetailsList()}          
            </Form>           
        )
    }
}
export default Form.create()(Formi);