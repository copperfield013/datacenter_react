import React from 'react'
import {Input,Button,Form,Select,DatePicker,InputNumber} from 'antd'
import Units from "../../units";
import Super from "./../../super"
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import './index.css'
const FormItem=Form.Item
const {RangePicker} = DatePicker;

class BaseForm extends React.Component{

    state={
        list:[]
    }
    componentDidMount(){
        this.props.onRef(this)
    }
    handleFilterSubmit=()=>{
        const fieldsValue=this.props.form.getFieldsValue();
        this.props.filterSubmit(fieldsValue);
    }
    reset=()=>{
        this.props.form.resetFields()
    }
    requestSelectOptions=(id)=>{//下拉框
        Super.super({
			url:`/api/field/options?fieldIds=${id}`,                
		}).then((res)=>{
			const key=res.keyPrefix+id
            this.setState({
                list:res.optionsMap[key]
            })
		})
    }
    handleEnterKey=(e)=>{
        if(e.nativeEvent.keyCode === 13){ //e.nativeEvent获取原生的事件对像
            this.handleFilterSubmit()
       }
    }
    initFormList=()=>{
        const { getFieldDecorator } = this.props.form;
        const formList=this.props.formList;
        const formItemList=[];
        if(formList && formList.length>0){
            formList.forEach((item)=>{
                const label=item.title;
                const field=`criteria_${item.id}`;
                const initialValue=item.defaultValue;
                if(item.inputType==="daterange"){
                    const TIMEPICKER= <FormItem label={label} key={field}>
                        {getFieldDecorator(field)(
                            <RangePicker locale={locale} style={{width:225}}/>
                        )}
                    </FormItem>   
                    formItemList.push(TIMEPICKER)                
                }else if(item.inputType==="date"){
                    const TIMEPICKER= <FormItem label={label} key={field}>
                        {getFieldDecorator(field)(
                            <DatePicker 
                                locale={locale} 
                                placeholder={`请输入${label}`}
                                style={{width:225}} 
                                getCalendarContainer={trigger => trigger.parentNode}
                                />
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
                        {getFieldDecorator(field,{
                            initialValue:initialValue
                        })(
                            <Input type="text" placeholder={`请输入${label}`} style={{width:160}} onKeyPress={this.handleEnterKey}/>
                        )}
                    </FormItem>   
                    formItemList.push(INPUT)                
                }else if(item.inputType==="select"){
                    const SELECT= <FormItem label={label} key={field}>
                        {getFieldDecorator(field)(
                            <Select style={{width:120}} 
                                    onMouseEnter={()=>this.requestSelectOptions(item.fieldId)}
                                    placeholder={`请输入${label}`} 
                                    getPopupContainer={trigger => trigger.parentNode}>
                                {Units.getSelectList(this.state.list)}
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
        const actions=this.props.actions
        return(
            <Form layout="inline">
                {this.initFormList()}
                <FormItem className="btns">
                    <Button type="primary" onClick={this.handleFilterSubmit}>查询</Button>
                    <Button type="danger" disabled={this.props.disabled} onClick={(e)=>this.props.handleOperate("delete","",e)}>删除选中</Button>
                    {
                        actions.length>0?
                        actions.map((item)=>{
                            return <Button type="primary" key={item.id} onClick={()=>this.props.handleActions(item.id)}  disabled={this.props.disabled}>{item.title}</Button>
                        }):""
                    }
                    {/* <Button type="danger"  onClick={this.reset}>重置</Button> */}
                </FormItem>
            </Form>
        )
    }
}
export default Form.create()(BaseForm);