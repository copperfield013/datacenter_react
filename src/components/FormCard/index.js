import React from 'react'
import {Card} from 'antd'
import BaseInfoForm from './../BaseForm/BaseInfoForm'

export default class FormCard extends React.Component{

    initDetailsList=()=>{
        const { formList,type,form,loading,options }=this.props
        if(formList && formList.fields.length>0){ 
            const title=formList.title
            const fields=formList.fields
            return <Card 
                        title={title} 
                        key={title} 
                        id={title} 
                        className="hoverable" 
                        headStyle={{background:"#f2f4f5"}}
                        loading={loading}
                        >
                        <BaseInfoForm 
                            key={title}
                            formList={fields} 
                            type={type}
                            form={form}
                            width={220}
                            getOptions={this.props.getOptions}
                            options={options}
                            setPassword={this.props.setPassword}
                            />
                    </Card>        
        }
    }
    render(){
        return( 
                this.initDetailsList()       
        )
    }
}