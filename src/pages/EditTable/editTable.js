import React from 'react'
import {Card,Form} from 'antd'
import EditTableList from './editTableList'

let storage=window.sessionStorage;
let totalcode=[]
export default class EditTable extends React.Component{

    componentDidMount(){
        this.props.callback(totalcode)
    }
    initDetailsList=()=>{ 
        const detailsList=this.props.detailsList;
        const detailsItemList=[];
        if(detailsList && detailsList.length>0){
            this.props.itemDescs.map((item,index)=>{
                let cardTitle=this.props.cardTitle[index]
                const RANGE=<Card title={cardTitle} key={cardTitle}>
                                <EditTableList 
                                    type={this.props.type}
                                    pagination={false}
                                    bordered
                                    columns={this.props.columns[index]}
                                    dataSource={this.props.dataSource[index]}
                                    item={item}
                                    count={this.props.count}
                                />
                            </Card>
                detailsItemList.push(RANGE)
                let submitcode=[];
                if(this.props.dataSource){
                    this.props.dataSource[index].map((item)=>{
                        if(item.code){
                            submitcode.push(item.code);
                        }  
                        submitcode.map((it)=>{
                            if(totalcode.indexOf(it)===-1){
                                storage[it]=JSON.stringify(item)
                                totalcode.push(it)
                            }                           
                            return false
                        })
                        return false
                    })
                }             
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