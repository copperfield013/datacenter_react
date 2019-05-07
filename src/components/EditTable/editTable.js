import React from 'react'
import EditTableList from './editTableList'

export default class EditTable extends React.Component{
    
    initDetailsList=()=>{
        const { detailsList,type,itemDescs,cardTitle,dataSource,columns }=this.props
        const detailsItemList=[];   
        if(columns){
            console.log(columns) 
            console.log(dataSource)
            columns.map((item,index)=>{
                for(let k in dataSource){
                    if(item.id.toString()===k){
                        const data=[]
                        dataSource[k].map((it)=>{
                            data.push(it.fieldMap)
                        })
                        const stmplId=item.stmplId
                        const RANGE=<EditTableList               
                                        key={Math.random()}
                                        type={type}
                                        columns={item.fields}
                                        dataSource={data} 
                                        itemDescs={item.fields}
                                        stmplId={stmplId}
                                        //count={type==="new"?null:dataSource[index].length}
                                        cardTitle={cardTitle[index]}
                                        handleAdd={()=>this.props.handleAdd(columns[index])}
                                        getTemplate={this.props.getTemplate}
                                    />
                        detailsItemList.push(RANGE)         
                        return false
                    }
                        
                }
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