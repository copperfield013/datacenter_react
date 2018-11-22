import React from 'react'
import { Radio,Input,Checkbox,Form,Select,DatePicker } from 'antd'
import Units from "../../units/unit";
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
const FormItem=Form.Item
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const {RangePicker} = DatePicker;
const { TextArea } = Input;

class ModalForm extends React.Component{
    state={
        result:[],
    } 
    initFormList=()=>{
        let type=this.props.type
        //编辑状态，取数据，其他状态，不取数据
        if(type=="edit" || type=="detail"){
            var userInfo=this.props.userInfo || ''
        }else{
            var userInfo=''
        }
        const formItemLayout = {
            labelCol: {
              sm: { span: 4 },
            },
            wrapperCol: {
              sm: { span: 16 },
            },
          };
        const { getFieldDecorator } = this.props.form;
        const formList=this.props.addFormList;
        const formItemList=[];
        
        if(formList && formList.length>0){
            formList.forEach((item)=>{
                let label=item.label;
                let field=item.field;
                let placeholder=item.placeholder || '';
                if(item.type=="TIMEPICKER"){
                    const TIMEPICKER= <FormItem label={label} key={field} {...formItemLayout}>
                        {
                            type=="detail"?userInfo[field]:
                            getFieldDecorator([field],{
                            initialValue:userInfo[field] 
                        })(
                            <RangePicker locale={locale}/>
                        )}
                    </FormItem>   
                    formItemList.push(TIMEPICKER)                
                }else if(item.type=="INPUT"){
                    const INPUT= <FormItem label={label} key={field} {...formItemLayout}>
                        {
                            type=="detail"?userInfo[field]:
                            getFieldDecorator([field],{
                            initialValue:userInfo[field] 
                        })(
                            <Input type="text" placeholder={placeholder} style={{width:item.width}}/>
                        )}
                    </FormItem>   
                    formItemList.push(INPUT)                
                }else if(item.type=="SELECT"){
                    const SELECT= <FormItem label={label} key={field} {...formItemLayout}>
                        {
                            type=="detail"?userInfo[field]:
                            getFieldDecorator([field],{
                            initialValue:userInfo[field] 
                        })(
                            <Select placeholder={placeholder} style={{width:item.width}}>
                                {Units.getSelectList(item.list)}
                            </Select>
                        )}
                    </FormItem>
                    formItemList.push(SELECT)    
                }else if(item.type=="CHECKBOX"){
                    const CHECKBOX= <FormItem label={label} key={field} {...formItemLayout}>
                        {
                            type=="detail"?userInfo[field]:
                            getFieldDecorator([field],{
                            valuePropName:'checked',
                            initialValue:userInfo[field]==1?"1":"2"
                        })(
                            <CheckboxGroup options={item.list} />
                        )}
                    </FormItem>
                    formItemList.push(CHECKBOX)   
                }else if(item.type=="RADIO"){
                    const CHECKBOX= <FormItem label={label} key={field} {...formItemLayout}>
                        {
                            type=="detail"?userInfo[field]=="1"?"男":"女":
                            getFieldDecorator([field],{
                            initialValue:userInfo[field]==2?"2":"1"
                        })(
                            <RadioGroup>
                                {Units.getRadioList(item.list)}
                            </RadioGroup>
                        )}
                    </FormItem>
                    formItemList.push(CHECKBOX)   
                }else if(item.type=="TEXTAREA"){
                    const TEXTAREA= <FormItem label={label} key={field} {...formItemLayout}>
                        {
                            type=="detail"?userInfo[field]:
                            getFieldDecorator([field],{
                            initialValue:userInfo[field] 
                        })(
                            <TextArea autosize={{ minRows: 2, maxRows: 6 }} style={{resize:'none'}} placeholder={placeholder}/>
                        )}
                    </FormItem>
                    formItemList.push(TEXTAREA)   
                }
            })
        }
        return formItemList;
    }
    render(){
       
        return(         
            <Form>
                {this.initFormList()}
            </Form>
        )
    }
}
export default Form.create()(ModalForm)