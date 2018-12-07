import React from 'react'
import { Pagination ,Card,Table} from 'antd';
import BaseForm from "./../../components/BaseForm"
import './index.css'

export default class actTable extends React.Component{
    state={
        loading: false,
    }   
    handleFilter=(params)=>{
        //console.log(params)
        this.props.searchParams(params)
    }
    onChange=(pageNumber)=> {
        this.props.callbackPage(pageNumber)
    }
    showTotal=(total)=>{
        return `共 ${total} 条`;
      }
    render(){
        return(
            <div>
                <h3>{this.props.moduleTitle}</h3>
                <Card>
                    <BaseForm formList={this.props.formList} filterSubmit={this.handleFilter}/>          
                </Card>
                <div>
                    <Table
                        columns={this.props.columns}
                        dataSource={this.props.list}
                        bordered
                        pagination={false}
                        style={{display:this.props.columns?"block":"none"}}
                    >
                    </Table>
                    <Pagination 
                        showQuickJumper 
                        defaultCurrent={1} 
                        total={this.props.pageCount} 
                        onChange={this.onChange} 
                        hideOnSinglePage={true}
                        showTotal={()=>this.showTotal(this.props.pageCount)}
                        />
                </div>
            </div>
           
        )
    }
}