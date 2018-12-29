import React from 'react'
import {Card,Form} from 'antd'
import EditTableList from './editTableList'


export default class EditTable extends React.Component{
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