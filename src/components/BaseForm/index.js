import React from 'react'
import {Input,Button,Form,Select,DatePicker,InputNumber} from 'antd'
import Units from "../../units";
import 'moment/locale/zh-cn';
import moment from 'moment';
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
        for(let k in fieldsValue){
            if(!fieldsValue[k]){
                delete fieldsValue[k]
            }
        }
        this.props.filterSubmit(fieldsValue);
    }
    selectOptions=(id)=>{//下拉框
        const {optionsMap}=this.props
        this.setState({
            list:optionsMap[id]
        })
    }
    handleEnterKey=(e)=>{
        if(e.nativeEvent.keyCode === 13){ //e.nativeEvent获取原生的事件对像
            this.handleFilterSubmit()
       }
    }
    reset=()=>{
        this.props.form.resetFields()
    }
    initFormList=()=>{
        const { getFieldDecorator } = this.props.form;
        const formList=this.props.formList;
        const formItemList=[];
        if(formList && formList.length>0){
            formList.forEach((item)=>{
                const label=item.title;
                const field=`criteria_${item.id}`;
                const value=item.value
                const dateFormat = 'YYYY-MM-DD';
                if(item.inputType==="daterange"){
                    const v1=value.split("~")[0]
                    const v2=value.split("~")[1]
                    const TIMEPICKER= <FormItem label={label} key={field}>
                        {getFieldDecorator(field,{initialValue:v1?[moment(v1,dateFormat),moment(v2,dateFormat)]:undefined})(
                            <RangePicker locale={locale} style={{width:225}}/>
                        )}
                    </FormItem>   
                    formItemList.push(TIMEPICKER)                
                }else if(item.inputType==="date"){
                    const TIMEPICKER= <FormItem label={label} key={field}>
                        {getFieldDecorator(field,{initialValue:value?moment(value,dateFormat):undefined})(
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
                        {getFieldDecorator(field,{initialValue:value?value:""})(
                            <InputNumber placeholder={`请输入${label}`} style={{width:160}} min={0}/>
                        )}
                    </FormItem>   
                    formItemList.push(TIMEPICKER)                
                }else if(item.inputType==="text"){
                    const INPUT= <FormItem label={label} key={field}>
                        {getFieldDecorator(field,{initialValue:value?value:""})(
                            <Input type="text" placeholder={`请输入${label}`} style={{width:160}} onKeyPress={this.handleEnterKey}/>
                        )}
                    </FormItem>   
                    formItemList.push(INPUT)                
                }else if(item.inputType==="select"){
                    const SELECT= <FormItem label={label} key={field}>
                        {getFieldDecorator(field,{initialValue:value?value:undefined})(
                            <Select style={{width:120}} 
                                    onMouseEnter={()=>this.selectOptions(item.fieldId)}
                                    placeholder={`请输入${label}`} 
                                    notFoundContent="暂无选项"
                                    allowClear={true}
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
        const {actions,hideDelete,hideQuery}=this.props
        return(
            <Form layout="inline">
                {this.initFormList()}
                <FormItem className="btns">
                    {hideQuery?"":<Button type="primary" onClick={this.handleFilterSubmit}>查询</Button>}
                    {hideDelete?"":<Button type="danger" disabled={this.props.disabled} onClick={(e)=>this.props.handleOperate("delete","",e)}>删除选中</Button>}
                    {
                        actions.length>0?
                        actions.map((item)=>{
                            return <Button type="primary" key={item.id} onClick={()=>this.props.handleActions(item.id)}  disabled={this.props.disabled}>{item.title}</Button>
                        }):""
                    }
                    <Button type="primary" onClick={this.props.reset}>清空</Button>
                </FormItem>
            </Form>
        )
    }
}
export default Form.create()(BaseForm);