import React from 'react'
import { Radio, Input, Button,Checkbox ,Form,Select,DatePicker } from 'antd'
import Units from "../../units/unit";
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
const FormItem=Form.Item
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const {RangePicker} = DatePicker;

class BaseForm extends React.Component{
    handleFilterSubmit=()=>{
        let fieldsValue=this.props.form.getFieldsValue();
        this.props.filterSubmit(fieldsValue);
    }
    // reset=()=>{
    //     this.props.form.resetFields()
    // }
    initFormList=()=>{
        const { getFieldDecorator } = this.props.form;
        const formList=this.props.formList;
        const formItemList=[];
        if(formList && formList.length>0){
            formList.forEach((item)=>{
                let label=item.title;
                let field=`criteria_${item.id}`;
                let placeholder=item.placeholder || '';
                let initialValue=item.defaultValue || '';
                if(item.inputType==="daterange"){
                    const TIMEPICKER= <FormItem label={label} key={field}>
                        {getFieldDecorator([field])(
                            <RangePicker locale={locale} style={{width:225}}/>
                        )}
                    </FormItem>   
                    formItemList.push(TIMEPICKER)                
                }else if(item.inputType==="text"){
                    const INPUT= <FormItem label={label} key={field}>
                        {getFieldDecorator([field])(
                            <Input type="text" placeholder={placeholder} style={{width:165}} />
                        )}
                    </FormItem>   
                    formItemList.push(INPUT)                
                }else if(item.inputType==="select"){
                    const SELECT= <FormItem label={label} key={field}>
                        {getFieldDecorator([field],{
                            initialValue:initialValue
                        })(
                            <Select placeholder={placeholder} style={{width:120}}>
                                {Units.getSelectList(item.list)}
                            </Select>
                        )}
                    </FormItem>
                    formItemList.push(SELECT)    
                }else if(item.inputType==="CHECKBOX"){
                    const CHECKBOX= <FormItem label={label} key={field}>
                        {getFieldDecorator([field],{
                            valuePropName:'checked',
                            initialValue:initialValue
                        })(
                            <CheckboxGroup options={item.list} />
                        )}
                    </FormItem>
                    formItemList.push(CHECKBOX)   
                }else if(item.inputType==="RADIO"){
                    const CHECKBOX= <FormItem label={label} key={field}>
                        {getFieldDecorator([field],{
                            initialValue:initialValue
                        })(
                            <RadioGroup>
                                {Units.getRadioList(item.list)}
                            </RadioGroup>
                        )}
                    </FormItem>
                    formItemList.push(CHECKBOX)   
                }
            })
        }
        return formItemList;
    }
    render(){
        return(
            <Form layout="inline">
                {this.initFormList()}
                <FormItem>
                    <Button type="primary" onClick={this.handleFilterSubmit}>查询</Button>
                    {/* <Button type="danger"  onClick={this.reset}>重置</Button> */}
                </FormItem>
            </Form>
        )
    }
}
export default Form.create()(BaseForm);