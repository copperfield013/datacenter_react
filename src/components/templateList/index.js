import React from 'react'
import { Modal,Table,Pagination, message } from 'antd';
import Super from './../../super'
import BaseForm from './../BaseForm'
import FormCard from './../FormCard'

export default class TemplateList extends React.Component{
    state={
        selectedRowKeys: [],
        isSeeTotal:false,
        currentPage:1,
        pageCount:0,

    }
    handleOk=()=>{
        const {selectCodes}=this.state
        this.props.TemplatehandleOk(selectCodes,null)
        this.setState({selectedRowKeys:[]})     
    }
    seeTotal=()=>{
        const {isSeeTotal}=this.state
        const {queryKey}=this.props.templateData
        if(!isSeeTotal){
            Super.super({
                url:`api2/entity/curd/get_entities_count/${queryKey}`,                
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
    templatehandleSave=()=>{
        this.child.handleBaseInfoSubmit()
    }
    baseInfo=(result)=>{
        console.log(result)
        const {menuId,templateDtmpl,formTmplGroupId}=this.props
        const code=templateDtmpl[0].code
        const formData = new FormData(); 
        if(code){ //有code是修改，没有是新增实体模板
            formData.append('唯一编码',code)
        }
        for(let k in result){
            formData.append(k, result[k])
        }
        Super.super({
            url:`api2/entity/curd/save/rabc/${menuId}/${formTmplGroupId}`,    
            data:formData       
        },'formdata').then((res)=>{
            if(res.status==="suc"){
                this.props.TemplatehandleOk(res.code,formTmplGroupId,code?false:true) //为了后面新增的push
            }else{
                message.error("操作失败")
            }
        })
    }
    render(){
        const {templateDtmpl,visibleTemplateList,handleCancel,width,templateData,menuId,getFormTmpl,type,title,options}=this.props
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
        let columns=[]
        let dataSource=[]
        if(!getFormTmpl){            
            columns=templateDtmpl?templateDtmpl.config.columns:[]          
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
        }
        
        return (
                <Modal
                    title={title}
                    visible={visibleTemplateList}
                    okText={getFormTmpl?"保存":"确认"}
                    cancelText="取消"
                    width={width}
                    centered
                    onOk={getFormTmpl?()=>this.templatehandleSave():()=>this.handleOk()}
                    onCancel={handleCancel}
                    destroyOnClose
                    >
                    {getFormTmpl?<FormCard
                        formList={templateDtmpl}
                        type={type}
                        baseInfo={this.baseInfo}
                        onRef={this.onRef}
                        getOptions={this.props.getOptions}
                        options={options}
                    />:
                    <div>
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
                    </div>}
                    
                    
                </Modal>
        )
    }
}