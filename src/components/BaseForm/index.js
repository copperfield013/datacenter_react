import React from 'react'
import {Input,Button,Form,Select,DatePicker,InputNumber} from 'antd'
import Units from "../../units/unit";
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
const FormItem=Form.Item
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
                let initialValue=item.defaultValue;
                if(item.inputType==="daterange"){
                    const TIMEPICKER= <FormItem label={label} key={field}>
                        {getFieldDecorator(field)(
                            <RangePicker placeholder={`请输入${label}`} locale={locale} style={{width:225}}/>
                        )}
                    </FormItem>   
                    formItemList.push(TIMEPICKER)                
                }else if(item.inputType==="date"){
                    const TIMEPICKER= <FormItem label={label} key={field}>
                        {getFieldDecorator(field)(
                            <DatePicker locale={locale} style={{width:225}}/>
                        )}
                    </FormItem>   
                    formItemList.push(TIMEPICKER)                
                }else if(item.inputType==="decimal"){
                    const TIMEPICKER= <FormItem label={label} key={field}>
                        {getFieldDecorator(field)(
                            <InputNumber placeholder={`请输入${label}`} style={{width:160}} min={0}/>
                        )}
                    </FormItem>   
                    formItemList.push(TIMEPICKER)                
                }else if(item.inputType==="text"){
                    const INPUT= <FormItem label={label} key={field}>
                        {getFieldDecorator(field)(
                            <Input type="text" placeholder={`请输入${label}`} style={{width:160}} />
                        )}
                    </FormItem>   
                    formItemList.push(INPUT)                
                }else if(item.inputType==="select"){
                    const SELECT= <FormItem label={label} key={field}>
                        {getFieldDecorator(field,{
                            initialValue:initialValue
                        })(
                            <Select style={{width:120}} placeholder={`请输入${label}`}>
                                {Units.getSelectList(item.list)}
                            </Select>
                        )}
                    </FormItem>
                    formItemList.push(SELECT)    
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