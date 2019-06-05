import React from 'react'
import { Modal, message } from 'antd';
import Super from './../../super'
import Detail from './../../pages/detail'

export default class EditAddTemplate extends React.Component{
    state={

    }
    onRef=(ref)=>{
		this.child=ref
    }
    handleOk=()=>{

    }
    render(){
        const {visibleEditAddTemplate,handleCancel,type,title,menuId,editAddGroupId,code}=this.props
        return (
            <div>               
                <Modal
                    title={title}
                    visible={visibleEditAddTemplate}
                    okText={"保存"}
                    cancelText="取消"
                    centered
                    onOk={()=>this.templatehandleSave()}
                    onCancel={handleCancel}
                    destroyOnClose
                    width={900}
                    >
                    <Detail
                        menuId={menuId}
                        fieldGroupId={editAddGroupId}
                        type={type}
                        code={code}
                    />                                  
                </Modal>
                            
            </div>
        )
    }
}