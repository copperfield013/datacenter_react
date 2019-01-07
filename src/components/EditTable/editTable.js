import React from 'react'
import {Card,Form} from 'antd'
import EditTableList from './editTableList'


export default class EditTable extends React.Component{
    callbackdatasource=(datasource)=>{
        this.props.callbackdatasource(datasource)
    }
    deleSource=(deleKey)=>{
        this.props.deleSource(deleKey)
    }
    uploadChange=(file,name)=>{
        this.props.uploadChange(file,name)
    }
    initDetailsList=()=>{
        const detailsList=this.props.detailsList;
        const detailsItemList=[];
        const flag=this.props.flag
        if(detailsList && detailsList.length>0){
            this.props.itemDescs.map((item,index)=>{
                const cardTitle=this.props.cardTitle[index]
                const RANGE=<Card title={cardTitle} 
                                key={cardTitle} 
                                id={cardTitle} 
                                className="hoverable" 
                                headStyle={{background:"#f2f4f5"}}
                                >
                                <EditTableList 
                                    type={this.props.type}
                                    pagination={false}
                                    bordered
                                    columns={this.props.columns[index]}
                                    dataSource={flag?null:this.props.dataSource[index]} //判断是否是创建记录
                                    item={item}
                                    count={this.props.dataSource[index].length}
                                    deleSource={this.deleSource}
                                    uploadChange={this.uploadChange}
                                    callbackdatasource={this.callbackdatasource}
                                />
                            </Card>
                detailsItemList.push(RANGE)         
                return false            
            })          
        }
        return detailsItemList;
    }
    render(){
        return(
            <Form layout="inline">
                {this.initDetailsList()}
            </Form> 
        )
    }
}