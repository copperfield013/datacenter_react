import React from 'react'
import EditTableList from './editTableList'

export default class EditTable extends React.Component{
    
    callbackdatasource=(datasource)=>{
        this.props.callbackdatasource(datasource)
    }
    uploadChange=(file,name)=>{
        this.props.uploadChange(file,name)
    }
    newRecords=(datasource)=>{
        this.props.newRecords(datasource)
    }
    
    initDetailsList=()=>{
        const { detailsList,type,itemDescs,flag,cardTitle,dataSource,columns }=this.props
        const detailsItemList=[];
        if(detailsList && detailsList.length>0){
            itemDescs.map((item,index)=>{
                const RANGE=<EditTableList               
                                key={cardTitle[index]} 
                                type={type}
                                columns={columns[index]}
                                dataSource={flag?null:dataSource[index]} //判断是否是创建记录
                                item={item}
                                count={flag?null:dataSource[index].length}
                                uploadChange={this.uploadChange}
                                callbackdatasource={this.callbackdatasource}
                                newRecords={this.newRecords}
                                cardTitle={cardTitle[index]}
                            />
                detailsItemList.push(RANGE)         
                return false                  
            })          
        }
        return detailsItemList;
    }
    render(){
        return(
            <div>
                {this.initDetailsList()}
            </div> 
        )
    }
}