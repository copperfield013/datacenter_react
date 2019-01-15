import React from 'react'
import {Card,Form,Input,Icon} from 'antd'
import EditTableList from './editTableList'

export default class EditTable extends React.Component{
    state={
        dataSource:this.props.dataSource
    }
    callbackdatasource=(datasource)=>{
        this.props.callbackdatasource(datasource)
    }
    uploadChange=(file,name)=>{
        this.props.uploadChange(file,name)
    }
    newRecords=(datasource)=>{
        this.props.newRecords(datasource)
    }
    searchValue=(e,index)=>{
        if(e.target.value!==""){
            this.props.columns[index].map((item)=>{
                if(item.fieldName){
                    let k=item.fieldName
                    let res=[]
                    this.props.dataSource[index].map((it)=>{
                        if(it[k].indexOf(e.target.value)>-1){
                            let key=it["key"]
                            if(it.key===key){
                                res.push(it)
                                console.log(this.props.dataSource)                    
                                this.setState({ 
                                    dataSource:this.props.dataSource.splice(index,1,res),
                                })
                            }
                        }
                        return false      
                    })
                }
                return false                    
            })
        }  
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
                const RANGE=<Card 
                                title={cardTitle} 
                                key={cardTitle} 
                                id={cardTitle} 
                                className="hoverable" 
                                headStyle={{background:"#f2f4f5"}}
                                extra={this.props.type==="detail"?<Input placeholder="关键字搜索"
                                                                        onChange={(e)=>this.searchValue(e,index)}
                                                                        addonBefore={<Icon type="search"/>}
                                                                        />:""}
                                >
                                <EditTableList
                                    type={this.props.type}
                                    pagination={false}
                                    bordered
                                    columns={columns}
                                    dataSource={flag?null:dataSource} //判断是否是创建记录
                                    item={item}
                                    count={flag?null:dataSource.length}
                                    uploadChange={this.uploadChange}
                                    callbackdatasource={this.callbackdatasource}
                                    newRecords={this.newRecords}
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