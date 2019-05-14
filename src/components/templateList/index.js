import React from 'react'
import { Modal,Table,Pagination, message } from 'antd';
import Super from './../../super'
import BaseForm from './../BaseForm'

export default class TemplateList extends React.Component{
    state={
        selectedRowKeys: [],
        isSeeTotal:false,
        currentPage:1,
        pageCount:0,

    }
    handleOk=()=>{
        const {selectCodes}=this.state
        this.props.TemplatehandleOk(selectCodes)
        this.setState({selectedRowKeys:[]})     
    }
    seeTotal=()=>{
        const {isSeeTotal}=this.state
        const {queryKey}=this.props.templateData
        if(!isSeeTotal){
            Super.super({
                url:`/api2/entity/curd/get_entities_count/${queryKey}`,                
            }).then((res)=>{
                this.setState({
                    isSeeTotal:res.count,
                })
            })
        }       
    }
    //页码
	pageTo=(pageNo, pageSize)=>{
        const {queryKey}=this.props.templateData
        this.setState({
            currentPage:pageNo
        })
        this.props.templatePageTo(queryKey,{pageNo,pageSize})			
    }
    onRef=(ref)=>{
		this.child=ref
    }
    render(){
        const {templateDtmpl,visibleTemplateList,handleCancel,width,templateData,menuId}=this.props
        let {selectedRowKeys,isSeeTotal,currentPage,pageCount,formList}=this.state
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                let selectCodes=""
                const arr=[]
                selectedRows.map((item)=>{
                    arr.push(item.code)
                    return false
                })
                selectCodes=arr.join(',')
                this.setState({selectCodes,selectedRowKeys})
            },
          };
        const columns=templateDtmpl?templateDtmpl.config.columns:[]
        const dataSource=[]
        if(templateDtmpl && templateData){
            formList=templateDtmpl.config.criterias
            pageCount=templateData.pageInfo.virtualEndPageNo*templateData.pageInfo.pageSize           
            columns.map((item)=>{
                item["dataIndex"]=item.id;
                if(item.title==="序号"){
                    item["dataIndex"]="order";
                }
                return false
            })
            templateData.entities.map((item,index)=>{
                const list={}
                list['key']=index;
                list['order']=index+1;
                list['code']=item.code;
                for(let k in item.cellMap){
                    list[k]=item.cellMap[k]
                }
                dataSource.push(list)
                return false
            })
        }
        return (
                <Modal
                    title="选择实体"
                    visible={visibleTemplateList}
                    okText="确认"
                    cancelText="取消"
                    width={width}
                    centered
                    onOk={this.handleOk}
                    onCancel={handleCancel}
                    destroyOnClose
                    >
                    <BaseForm 
                        formList={formList} 
                        filterSubmit={this.props.templateSearch} 
                        handleOperate={this.handleOperate}
                        handleActions={this.handleActions}
                        menuId={menuId}
                        hideDelete='true'
                        onRef={this.onRef}
                        />    
                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={dataSource}
                        bordered
                        pagination={false}
                    >
                    </Table>
                    <div className='Pagination'>
                        <span 
                            className={isSeeTotal?'sewTotal':'seeTotal'} 
                            onClick={this.seeTotal}
                            >
                            {isSeeTotal?`共${isSeeTotal}条`:'点击查看总数'}
                        </span>
                        <Pagination 
                            style={{display:'inline-block'}}
                            showQuickJumper 
                            showSizeChanger 
                            pageSizeOptions={['5','10','15','20']}
                            defaultCurrent={1} 
                            current={currentPage}
                            onChange={(page, pageSize)=>this.pageTo(page, pageSize)} 
                            onShowSizeChange={(current, size)=>this.pageTo(current, size)}
                            hideOnSinglePage={true}
                            total={pageCount}
                            />
                    </div>
                </Modal>
        )
    }
}