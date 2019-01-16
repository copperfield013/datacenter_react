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
        const detailsList=this.props.detailsList;
        const detailsItemList=[];
        const flag=this.props.flag
        if(detailsList && detailsList.length>0){
            this.props.itemDescs.map((item,index)=>{
                const cardTitle=this.props.cardTitle[index]
                const dataSource=this.props.dataSource[index]
                const columns=this.props.columns[index]
                const RANGE=<EditTableList               
                                key={cardTitle} 
                                type={this.props.type}
                                columns={columns}
                                dataSource={flag?null:dataSource} //判断是否是创建记录
                                item={item}
                                count={flag?null:dataSource.length}
                                uploadChange={this.uploadChange}
                                callbackdatasource={this.callbackdatasource}
                                newRecords={this.newRecords}
                                cardTitle={cardTitle}
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