import React from 'react'
import EditTableList from './editTableList'

export default class EditTable extends React.Component{
    
    initDetailsList=()=>{
        const { type,dataSource,columns,getTemplate }=this.props
        const detailsItemList=[];
        if(columns){
            columns.map((item)=>{
                if(JSON.stringify(dataSource) !== "{}" && JSON.stringify(dataSource) !== "[]"){
                    for(let k in dataSource){
                        if(item.id.toString()===k){
                            const data=[]
                            dataSource[k].map((it,i)=>{
                                it.fieldMap["order"]=i+1
                                data.push(it.fieldMap)
                                return false
                            })
                            const selectionTemplateId=item.selectionTemplateId
                            const RANGE=<EditTableList               
                                            key={Math.random()}
                                            type={type}
                                            columns={item.fields}
                                            dataSource={data}
                                            haveTemplate={selectionTemplateId?true:false}
                                            cardTitle={item.title}
                                            handleAdd={()=>this.props.handleAdd(item.fields)}
                                            getTemplate={getTemplate}
                                        />
                            detailsItemList.push(RANGE)         
                            return false
                        }                      
                    }
                }else{
                    const selectionTemplateId=item.selectionTemplateId
                    const RANGE=<EditTableList               
                                    key={Math.random()}
                                    type={type}
                                    columns={item.fields}
                                    dataSource={dataSource} 
                                    haveTemplate={selectionTemplateId?true:false}
                                    cardTitle={item.title}
                                    handleAdd={()=>this.props.handleAdd(item.fields)}
                                    getTemplate={getTemplate}
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