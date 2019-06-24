import React from 'react'
import {Modal,Input,Form,Icon,message} from 'antd'
import './index.css'

class SetPasswords extends React.Component{
    
    handleOk=()=>{
        const {oldPass}=this.props
        this.props.form.validateFields({ force: true }, (err, values) => { //提交再次验证
            if(!err){
                if(oldPass===values.oldpass){
                    this.props.setNewPass(values.newpass)
                }else{
                    message.error("原登录密码不正确！")
                }
            }
           
        })
    }
    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('newpass')) {
            callback('请输入相同的密码!');
        }else{
            callback();
        }
    }
    render(){
        const {showSetPass,handleCancel}=this.props
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="修改密码"
                visible={showSetPass}
                onOk={this.handleOk}
                destroyOnClose
                onCancel={handleCancel}
                className="setPass"
                maskClosable={false}
                >
                <Form style={{width:"100%"}}>
                    <Form.Item label={"原登录密码"}>
                        {getFieldDecorator('oldpass', {
                            rules: [{ required: true, message: '请输入原登录密码!' }],
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="请输入原登录密码"
                                type="password"
                                />,
                        )}
                    </Form.Item>
                    <Form.Item label={"新登录密码"}>
                        {getFieldDecorator('newpass', {
                            rules: [{ required: true, message: '请输入新登录密码!' }],
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="请输入新登录密码"
                                />,
                        )}
                    </Form.Item>
                    <Form.Item label={"确认密码"}>
                        {getFieldDecorator('apass', {
                            rules: [{ required: true, message: '确认密码!' },
                            { validator: this.compareToFirstPassword,}
                        ],
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="确认密码"
                                />,
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}
export default Form.create()(SetPasswords)
