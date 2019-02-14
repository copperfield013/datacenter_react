import React from 'react'
import EditTableList from './editTableList'

export default class EditTable extends React.Component{
    
    initDetailsList=()=>{
        const { detailsList,type,itemDescs,cardTitle,dataSource,columns }=this.props
        const detailsItemList=[];
        if(detailsList && detailsList.length>0){
            itemDescs.map((item,index)=>{
                const RANGE=<EditTableList               
                                key={Math.random()}
                                type={type}
                                columns={columns[index]}
                                dataSource={dataSource[index]} //判断是否是创建记录
                                item={item}
                                count={type==="new"?null:dataSource[index].length}
                                cardTitle={cardTitle[index]}
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