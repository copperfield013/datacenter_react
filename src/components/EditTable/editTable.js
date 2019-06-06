import React from 'react'
import EditTableList from './editTableList'

export default class EditTable extends React.Component{
    
    initDetailsList=()=>{
        const { type,dataSource,columns,getTemplate,getFormTmpl,isModal }=this.props
        const detailsItemList=[];
        //console.log(dataSource)  
        if(columns){
            columns.map((item)=>{
                const selectionTemplateId=item.selectionTemplateId
                const dialogSelectType=item.dialogSelectType
                const rabcUncreatable=item.rabcUncreatable
                const rabcTemplateGroupId=item.rabcTemplateGroupId
                let rabcTemplatecreatable=false
                if(rabcTemplateGroupId && rabcUncreatable===null){
                    rabcTemplatecreatable=true
                }
                const arr = Object.keys(dataSource)
                if(arr.length!==0){ //说明dataSource里面不为空
                    for(let k in dataSource){
                        if(item.id.toString()===k){
                            const data=[]
                            dataSource[k].map((it,i)=>{
                                it.fieldMap["order"]=i+1
                                data.push(it.fieldMap)
                                return false
                            })
                            const RANGE=<EditTableList               
                                            key={Math.random()}
                                            type={type}
                                            columns={item.fields}
                                            dataSource={data}
                                            haveTemplate={dialogSelectType && selectionTemplateId?true:false}
                                            cardTitle={item.title}
                                            handleAdd={()=>this.props.handleAdd(item.fields,true)}
                                            getTemplate={getTemplate}
                                            getFormTmpl={getFormTmpl}
                                            rabcTemplatecreatable={rabcTemplatecreatable}
                                            isModal={isModal}
                                        />
                            detailsItemList.push(RANGE)       
                            return false
                        }                      
                    }
                }else{
                    const RANGE=<EditTableList               
                                    key={Math.random()}
                                    type={type}
                                    columns={item.fields}
                                    dataSource={dataSource} 
                                    haveTemplate={dialogSelectType && selectionTemplateId?true:false}
                                    cardTitle={item.title}
                                    handleAdd={()=>this.props.handleAdd(item.fields,true)}
                                    getTemplate={getTemplate}
                                    getFormTmpl={getFormTmpl}
                                    rabcTemplatecreatable={rabcTemplatecreatable}
                                    isModal={isModal}
                                />
                    detailsItemList.push(RANGE)

                }
                
                return false
            })
            return detailsItemList;
        }
        
    }
    render(){
        return(
            <div>
                {this.initDetailsList()}
            </div> 
        )
    }
}