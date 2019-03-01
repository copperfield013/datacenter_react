import React from 'react'
import { Modal,Table,Pagination, message } from 'antd';
import Super from './../../super'

export default class TemplateList extends React.Component{
    state={
        selectedRowKeys: [],
    }
    handleOk=()=>{
        const {menuId,stmplId,fields}=this.props
        const {selectCodes}=this.state
        Super.super({
            url:`/api/entity/curd/load_entities/${menuId}/${stmplId}`,  
            data:{
                codes:selectCodes,
                fields,
            }                
        }).then((res)=>{
            this.props.handleCancel()
            if(res.status==="suc"){
                this.props.TemplatehandleOk(res.entities)
                this.setState({selectedRowKeys:[]})
            }else{
                message.error(res.status)
            }
        })
    }
    changePagination=(stmplId,params)=>{
        this.props.getTemplate(stmplId,"",params)
        this.setState({selectedRowKeys:[]})
    }
    render(){
        const {templateData,visibleTemplateList,handleCancel,width,stmplId}=this.props
        const {selectedRowKeys}=this.state
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                let selectCodes=""
                selectedRows.map((item)=>{
                    selectCodes+=item.code+","
                    return false
                })
                this.setState({selectCodes,selectedRowKeys})
            },
          };
        const columns=[]
        const dataSource=[]
        let pageCount=0
        if(templateData){
            pageCount=templateData.pageInfo.count
            templateData.entities[0].fields.map((item)=>{
                const value=item.title;
                item["dataIndex"]=value;
                columns.push(item)	
                return false
            })
            const order={
                title: '序号',
                key: 'order',
                render: (text, record,index) => (
                    <label>{index+1}</label>
                    ),
            } 
            columns.unshift(order)
            templateData.entities.map((item,index)=>{
                const list={}
                list['key']=index;
                list['code']=item.code;
                item.fields.map((it)=>{
                    const key=it.title
                    const value=it.value
                    list[key]=value
                    return false
                })
                dataSource.push(list)
                return false
            })
        }
        return (
                <Modal
                    title="选择"
                    visible={visibleTemplateList}
                    okText="确认"
                    cancelText="取消"
                    width={width}
                    centered
                    onOk={this.handleOk}
                    onCancel={handleCancel}
                    destroyOnClose
                    >
                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={dataSource}
                        bordered
                        pagination={false}
                    >
                    </Table>
                    <Pagination 
                        showQuickJumper 
                        defaultCurrent={1} 
                        total={pageCount} 
                        onChange={(params)=>this.changePagination(stmplId,params)} 
                        hideOnSinglePage={true}
                        showTotal={()=>`共 ${pageCount} 条`}
                        />
                </Modal>
        )
    }
}