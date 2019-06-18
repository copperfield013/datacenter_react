import React from 'react'
import { Modal} from 'antd';
import Detail from './../../pages/detail'

export default class EditAddTemplate extends React.Component{
    state={

    }
    handleOk=()=>{
        const {code,editAddGroupId,columns}=this.props
        //console.log(columns)
        const arr=[]
        columns.map((item)=>{
            if(item.id.toString()===editAddGroupId){
                item.fields.map((it)=>{
                    if(it.additionAccess){
                        arr.push(it.id)
                    }
                    return false
                })
            }
            return false
        })
        //console.log(arr)
        let dfieldIds=arr.join(',')
        this.detail.showModal()
        if(code){
            this.detail.TemplatehandleOk(code,editAddGroupId,false,dfieldIds)
        }
    }
    onRef3=(ref)=>{
		this.detail=ref
    }
    render(){
        const {visibleEditAddTemplate,handleCancel,type,title,menuId,editAddGroupId,code,fresh,TemplatehandleOk}=this.props
        return (
            <div>               
                <Modal
                    title={title}
                    visible={visibleEditAddTemplate}
                    okText={"保存"}
                    cancelText="取消"
                    centered
                    onOk={this.handleOk}
                    onCancel={handleCancel}
                    destroyOnClose
                    width={930}
                    bodyStyle={{height:430,overflow:'auto'}}
                    >
                    <Detail
                        menuId={menuId}
                        fieldGroupId={editAddGroupId}
                        type={type}
                        code={code}
                        onRef3={this.onRef3}
                        handleCancel={handleCancel}
                        fresh={fresh}
                        TemplatehandleOk={TemplatehandleOk}
                    />                                  
                </Modal>
                            
            </div>
        )
    }
}