import React from 'react'
import EditTableList from './editTableList'

export default class EditTable extends React.Component{
    
    initDetailsList=()=>{
        const { detailsList,type,itemDescs,flag,cardTitle,dataSource,columns }=this.props
        const detailsItemList=[];
        if(detailsList && detailsList.length>0){
            itemDescs.map((item,index)=>{
                const RANGE=<EditTableList               
                                key={Math.random()}
                                type={type}
                                columns={columns[index]}
                                dataSource={flag?null:dataSource[index]} //判断是否是创建记录
                                item={item}
                                count={flag?null:dataSource[index].length}
                                cardTitle={cardTitle[index]}                                
                                getOptions={this.props.getOptions}
                                options={this.props.options}
                                handleAdd={()=>this.props.handleAdd(columns[index])}
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