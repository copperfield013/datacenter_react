import React from 'react'
import {Row,Col,Form, Icon, Input, Button,message,Checkbox } from 'antd'
import "antd/dist/antd.css"
import "./../style/common.css"
import Super from "./../super"
const FormItem = Form.Item;

const storage=window.sessionStorage;
class Loginit extends React.Component{
	handleSubmit =()=>{       
        this.props.form.validateFields((err,values)=>{            
            if(!err){
                Super.super({
                    url:'/api/auth/token',  
                    query:{
                        username:values.username,
                        password:values.password
                    }                  
                }).then((res)=>{
                        if(res.status === "504"){
                            message.info('服务器连接失败');
                        }else{
                            if(res.status === 'suc'){ 
                                window.location.href="/#/admin/home";
                                storage.setItem("tokenName",res.token)
                                storage.setItem("name",values.username)
                            }else if(res.errorMsg){
                                this.setState({errorMsg: res.errorMsg});
                                message.info(res.errorMsg);
                            }
                        }
                })
            }
        })
    }
	render(){
        const { getFieldDecorator } = this.props.form;
		return(
			<Row className="container login">
				<Col>
					<Form style={{width:350}}>
					    <h3>欢迎登录</h3>
                        <FormItem>
                            {
                                getFieldDecorator('username', {
                                    initialValue: 'admin',
                                    rules: [
                                        { required: true, message: '请输入用户名!' },
                                        {max:5,min:0,message:'输入0-5个字符'},
                                    ],
                                })(
                                    <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="用户名" />
                                )
                            }                        
                        </FormItem>
                        <FormItem>
                            {
                                getFieldDecorator('password', {
                                    initialValue: '123456',
                                    rules: [
                                        { required: true, message: '请输入密码!' },
                                        {min:5,message:"输入大于5个字符"}
                                    ],
                                })(
                                    <Input type="password" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="密码"/>
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
                            <span>忘记密码</span>
                            <Button style={{width:'100%'}} type="primary" onClick={this.handleSubmit}>登录</Button>
                        </FormItem>

                    </Form>
				</Col>
			</Row>
		)
	}
}
export default Form.create()(Loginit);