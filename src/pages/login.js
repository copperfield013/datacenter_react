import React from 'react'
import {Row,Col,Form, Icon, Input, Button,message,Checkbox } from 'antd'
import Super from "../super"
import Units from '../units'
const FormItem = Form.Item;

const storage=window.sessionStorage;
class Loginit extends React.Component{

    state={
        username:"",
        password:"",
        remember:true,
    }
    componentDidMount() {//组件渲染完成之后触发此函数
        this.loadAccountInfo();
        window.addEventListener('keydown', this.handleKeyDown)
    }
    handleKeyDown = (event) => { //按下enter键，触发login事件
        switch (event.keyCode) {
            case 13:
                this.handleSubmit();
                break;
            default:
            break;
        }
    };
    loadAccountInfo = () => {
        const accountInfo = Units.getCookie('accountInfo');
        if(Boolean(accountInfo) === false){
            return false;
        }else{
            let username = "";
            let password = "";
            let index = accountInfo.indexOf("&");
            username = accountInfo.substring(0,index);
            password = accountInfo.substring(index+1);
            this.setState({
                username,
                password,
                remember:true,
            })
        }
    };
	handleSubmit =()=>{       
        const {username,password,remember}=this.state
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
                                if(remember){
                                    const accountInfo = username+ '&' +password;
                                    Units.setCookie('accountInfo',accountInfo,30);
                                }else {
                                    Units.delCookie('accountInfo');
                                    this.setState({
                                        username:"",
                                        password:"",
                                    })
                                }
                                window.location.href="/#/admin/home";
                                storage.setItem("tokenName",res.token)
                                storage.setItem("name",values.username)
                            }else if(res.errorMsg){
                                message.info(res.errorMsg);
                            }
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
                                        {min:5,message:"输入大于5个字符"}
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
                            {getFieldDecorator('remember', {
                                    valuePropName: 'checked',
                                    initialValue: true
                                })(
                                    <Checkbox onChange={this.handleChecked}>记住密码</Checkbox>
                            )}
                            {/* <span style={{float:"right",cursor:"pointer"}}>忘记密码</span> */}
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