import React from 'react'
import EditTableList from './editTableList'

export default class EditTable extends React.Component{
    
    initDetailsList=()=>{
        const { type,dataSource,columns,getTemplate,getFormTmpl,isModal }=this.props

        const selectionTemplateId=columns.selectionTemplateId
        const dialogSelectType=columns.dialogSelectType
        const rabcUncreatable=columns.rabcUncreatable
        const rabcTemplateGroupId=columns.rabcTemplateGroupId
        const title=columns.title
        let rabcTemplatecreatable=false
        if(rabcTemplateGroupId && rabcUncreatable===null){
            rabcTemplatecreatable=true
        }
        const data=[]
        dataSource.map((it,i)=>{
            it.fieldMap["order"]=i+1
            data.push(it.fieldMap)
            return false
        })              
        return <EditTableList               
                    key={Math.random()}
                    type={type}
                    columns={columns.fields}
                    dataSource={data}
                    haveTemplate={dialogSelectType && selectionTemplateId?true:false}
                    cardTitle={title}
                    handleAdd={()=>this.props.handleAdd(columns.fields,true)}
                    getTemplate={getTemplate}
                    getFormTmpl={getFormTmpl}
                    rabcTemplatecreatable={rabcTemplatecreatable}
                    isModal={isModal}
                /> 
    }
    render(){
        return(
            <div>
                {this.initDetailsList()}
            </div> 
        )
    }
}