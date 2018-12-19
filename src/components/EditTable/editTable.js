import React from 'react'
import {Card,Form} from 'antd'
import EditTableList from './editTableList'

const storage=window.sessionStorage;
const totalcode=[]
export default class EditTable extends React.Component{
    componentDidMount(){
        this.props.callback(totalcode)
    }
    initDetailsList=()=>{
        const detailsList=this.props.detailsList;
        const detailsItemList=[];
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
                                    dataSource={this.props.dataSource[index]}
                                    item={item}
                                    count={this.props.count}
                                />
                            </Card>
                detailsItemList.push(RANGE)
                const submitcode=[];
                if(this.props.dataSource.length>1){
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