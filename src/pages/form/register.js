import React from 'react'
import {Card,Form,Button,Input,Checkbox,Radio,Switch,Select,Upload,AutoComplete ,InputNumber,DatePicker,TimePicker,Icon ,message} from "antd"
import moment from 'moment'
const FormItem=Form.Item;
const RadioGroup=Radio.Group;
const Option = Select.Option;
const TextArea=Input.TextArea

 class Register extends React.Component{
    state={
        result: []
    }
    getBase64=(img, callback)=> {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
      }
    handleChange = (info) => {
    if (info.file.status === 'uploading') {
        this.setState({ loading: true });
        return;
    }
    if (info.file.status === 'done') {
        // Get this url from response in real world.
        this.getBase64(info.file.originFileObj, imageUrl => this.setState({
            imageUrl,
            loading: false
        }));
    }
    }
    handleSubmit = () => {
        let info=this.props.form.getFieldsValue()
        console.log(JSON.stringify(info))
        this.props.form.validateFields((err,values)=>{
            if(!err){
                message.success(`注册成功！用户名是${values.userName}，密码是${values.password}`)
                this.props.form.resetFields();
            }
        })
        }
    handleResubmit = () => {
        this.props.form.resetFields()
         }
    handleSearch = (value) => {
        let result;
        if (!value || value.indexOf('@') >= 0) {
            result = [];
        } else {
            result = [ 'qq.com','gmail.com', '163.com','126.com','cloud.com'].map(domain => `${value}@${domain}`);
        }
        this.setState({ result });
    }
    render(){
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 4 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 10 },
            },
        };
        const offsetLayout = {
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 10,offset:4 },
        },
        };
        const { result } = this.state;
        const children = result.map((email) => {
        return <Option key={email}>{email}</Option>;
        });
        return (
            <div>
                <Card title="注册表单">
                    <Form layout="horizontal">
                        <FormItem label="用户名" {...formItemLayout}>
                            {
                                getFieldDecorator('userName', {
                                    rules: [
                                        {required: true, message: '请输入用户名!' },
                                        {max:5,min:0,message:'输入0-5个字符'}
                                    ],
                                })(
                                    <Input placeholder="用户名"/>
                                )
                            }   
                        </FormItem>
                        <FormItem label="密码" {...formItemLayout}>
                            {
                                getFieldDecorator('password', {
                                    rules: [
                                        { required: true, message: '请输入密码!' },
                                        {min:5,message:"输入大于5个字符"}
                                    ],
                                })(
                                    <Input type="password" placeholder="密码"/>
                                )
                            }      
                        </FormItem>
                        <FormItem label="邮箱" {...formItemLayout}>
                            {
                                getFieldDecorator('mail',{
                                    rules: [
                                        { required: true, message: '请输入邮箱!' }
                                    ],
                                })(
                                    <AutoComplete
                                        style={{ width: 200 }}
                                        onSearch={this.handleSearch}
                                        placeholder="邮箱"
                                    >
                                        {children}
                                    </AutoComplete>
                                )
                            }      
                        </FormItem>
                        <FormItem label="性别" {...formItemLayout}>
                            {
                                getFieldDecorator('sex', {
                                   initialValue:'1'
                                })(
                                    <RadioGroup>
                                        <Radio value="1">男</Radio>
                                        <Radio value="2">女</Radio>
                                    </RadioGroup>
                                )
                            }      
                        </FormItem>
                        <FormItem label="年龄" {...formItemLayout}>
                            {
                                getFieldDecorator('age', {
                                   initialValue:18,
                                   rules: [
                                    { required: true, message: '请输入年龄!' }
                                ],
                                })(
                                    <InputNumber />
                                )
                            }      
                        </FormItem>
                        <FormItem label="职业" {...formItemLayout}>
                            {
                                getFieldDecorator('state', {
                                   initialValue:"2"
                                })(
                                    <Select>
                                        <Option value="1">记者</Option>
                                        <Option value="2">律师</Option>
                                        <Option value="3">FE</Option>
                                        <Option value="4">创业者</Option>
                                    </Select>
                                )
                            }      
                        </FormItem>
                        <FormItem label="爱好" {...formItemLayout}>
                            {
                                getFieldDecorator('hobby', {
                                    initialValue:['2','3']
                                })(
                                    <Select mode="multiple">
                                        <Option value="1">游泳</Option>
                                        <Option value="2">唱歌</Option>
                                        <Option value="3">旅游</Option>
                                        <Option value="4">逛街</Option>
                                        <Option value="5">跳舞</Option>
                                        <Option value="6">爬山</Option>
                                    </Select>
                                )
                            }      
                        </FormItem>
                        <FormItem label="是否已婚" {...formItemLayout}>
                            {
                                getFieldDecorator('married', {
                                    valuePropName:'checked',
                                    initialValue:false
                                })(
                                    <Switch />
                                )
                            }      
                        </FormItem>
                        <FormItem label="生日" {...formItemLayout}>
                            {
                                getFieldDecorator('birthday', {
                                    initialValue:moment('2018-8-8')
                                })(
                                    <DatePicker />
                                )
                            }      
                        </FormItem>
                        <FormItem label="联系地址" {...formItemLayout}>
                            {
                                getFieldDecorator('address',{
                                    initialValue:"杭州市西湖区"
                                })(
                                    <TextArea autosize={{ minRows: 2, maxRows: 6 }} style={{resize:'none'}}/>
                                )
                            }    
                        </FormItem>
                        <FormItem label="起床时间" {...formItemLayout}>
                            {
                                getFieldDecorator('time')(
                                    <TimePicker />
                                )
                            }      
                        </FormItem>
                        <FormItem label="头像" {...formItemLayout}>
                            {
                                getFieldDecorator('userImg')(
                                    <Upload
                                        listType="picture-card"
                                        action="//jsonplaceholder.typicode.com/posts/"
                                        onChange={this.handleChange}

                                    >
                                        {this.state.userImg?<img src={this.state.userImg} alt=""/>:<Icon type="plus" />}
                                    </Upload>
                                )
                            }      
                        </FormItem>
                        <FormItem {...offsetLayout}>
                            {
                                getFieldDecorator('protocol')(
                                    <Checkbox>我以阅读<a>协议</a></Checkbox>
                                )
                            }      
                        </FormItem>
                        <FormItem {...offsetLayout}>
                            {
                                getFieldDecorator('protocol')(
                                    <div>
                                        <Button type="primary" onClick={this.handleSubmit}>注册</Button>
                                        <Button type="danger" onClick={this.handleResubmit}>重置</Button>
                                    </div>                                   
                                )
                            }      
                        </FormItem>
                    </Form>
                </Card>
            </div>
        )
    }
}
export default Form.create()(Register);