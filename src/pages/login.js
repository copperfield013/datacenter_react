import React from 'react'
import {Row,Col,Form, Icon, Input, Button,message } from 'antd'
import Super from "../super"
import Units from '../units'
const FormItem = Form.Item;

class Loginit extends React.Component{
    state={
        username:"",
        password:"",
    }
    componentDidMount(){
        window.removeEventListener('keydown', this.handleKeyDown)
    }
    handleKeyDown = (event) => { //按下enter键，触发login事件
        switch (event.keyCode) {
            case 13:
                this.handleSubmit();
                break;
            default:
            break;
        }
    }
	handleSubmit =()=>{
        this.props.form.validateFields((err,values)=>{            
            if(!err){
                Super.super({
                    url:'api2/auth/token',  
                    query:{
                        username:values.username,
                        password:values.password
                    }                  
                }).then((res)=>{
                    if(res.status === 'suc'){
                        window.location.hash="#/home";
                        Units.setLocalStorge("tokenName",res.token)
                    }else if(res.errorMsg){
                        message.info(res.errorMsg);
                    }
                })
            }
        })
    }
    handleChange = name => (event) => {
        this.setState({[name]: event.target.value})
    };
    handleChecked = (event) => {
        this.setState({remember: event.target.checked });
    };
	render(){
        const {username,password}=this.state
        const { getFieldDecorator } = this.props.form;
		return(
			<Row className="container login">
				<Col>
					<Form style={{width:350}}>
					    <h3>欢迎登录</h3>
                        <FormItem>
                            {getFieldDecorator('username', {
                                    initialValue:username,
                                    rules: [
                                        { required: true, message: '请输入用户名!' },
                                        {max:5,min:0,message:'输入0-5个字符'},
                                    ],
                                })(
                                    <Input 
                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                        placeholder="用户名" 
                                        onChange={this.handleChange("username")}
                                        />
                                )}                        
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('password', {
                                    initialValue:password,
                                    rules: [
                                        { required: true, message: '请输入密码!' },
                                    ],
                                })(
                                    <Input 
                                        type="password" 
                                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                        placeholder="密码"
                                        onChange={this.handleChange("password")}
                                        />
                                )}                             
                        </FormItem>
                        <FormItem>
                            <Button 
                                style={{width:'100%'}} 
                                type="primary" 
                                onClick={this.handleSubmit}
                                >
                                登录
                            </Button>
                        </FormItem>

                    </Form>
				</Col>
			</Row>
		)
	}
}
export default Form.create()(Loginit);