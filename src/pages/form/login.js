import React from 'react'
import { Form, Icon, Input, Button, Card,message,Checkbox } from 'antd';
const FormItem = Form.Item;

class Login extends React.Component{
    handleSubmit =()=>{
        this.props.form.validateFields((err,values)=>{
            if(!err){
                message.success(`登录成功！用户名是${values.userName}，密码是${values.password}`)
                this.props.form.setFieldsValue({
                    userName:"",
                    password:""
                })
            }
        })
    }
    render(){
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Card title="行内表单">
                    <Form layout="inline">
                        <FormItem>
                            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="用户名"/>
                        </FormItem>
                        <FormItem>
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="密码"/>
                        </FormItem>
                        <FormItem>
                            <Button type="primary">登录</Button>
                        </FormItem>
                    </Form>
                </Card>
                <Card title="水平表单">
                    <Form style={{width:300}}>
                        <FormItem>
                            {
                                getFieldDecorator('userName', {
                                    rules: [
                                        {required: true, message: '请输入用户名!' },
                                        {max:5,min:0,message:'输入0-5个字符'}
                                    ],
                                })(
                                    <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="用户名"/>
                                )
                            }                        
                        </FormItem>
                        <FormItem>
                            {
                                getFieldDecorator('password', {
                                    rules: [
                                        {required: true, message: '请输入密码!' },
                                        {min:5,message:"输入大于5个字符"}
                                    ],
                                })(
                                    <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="密码"/>
                                )
                            }                             
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('remember', {
                                    valuePropName: 'checked',
                                    initialValue: true
                                })(
                                    <Checkbox>记住密码</Checkbox>
                            )}
                            <a style={{float:'right'}} href="#">忘记密码</a> 
                            <Button style={{width:'100%'}} type="primary" onClick={this.handleSubmit}>登录</Button>
                        </FormItem>

                    </Form>
                </Card>
            </div>
        )
    }
}
export default Form.create()(Login);