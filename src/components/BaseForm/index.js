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
        this.props.filterSubmit(fieldsValue,this.props.menuId);
    }
    selectOptions=(id)=>{//下拉框
        const {optionsMap}=this.props
        this.setState({
            list:optionsMap[id]
        })
    }
    reset=()=>{
        this.props.form.resetFields()
    }
    changeInt=(e)=>{ //只允许输入整数
        if(e.target.value && !isNaN(e.target.value)){
            e.target.value=parseInt(e.target.value)
        }else{
            e.target.value=""
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
                const value=item.value
                const dateFormat = 'YYYY-MM-DD';
                if(item.inputType==="daterange"){
                    const v1=value?value.split("~")[0]:null
                    const v2=value?value.split("~")[1]:null
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
                }else if(item.inputType==="decimal" ){
                    const decimal= <FormItem label={label} key={field}>
                        {getFieldDecorator(field,{initialValue:value?value:""})(
                            <InputNumber placeholder={`请输入${label}`} style={{width:160}} min={0} step={0.1}/>
                        )}
                    </FormItem>   
                    formItemList.push(decimal)                
                }else if(item.inputType==="int"){
                    const int= <FormItem label={label} key={field}>
                        {getFieldDecorator(field,{
                            initialValue:value?value:""})(
                            <InputNumber placeholder={`请输入${label}`} style={{width:160}} min={0} onKeyUp={this.changeInt}/>
                        )}
                    </FormItem>   
                    formItemList.push(int)                
                }else if(item.inputType==="text"){
                    const INPUT= <FormItem label={label} key={field}>
                        {getFieldDecorator(field,{initialValue:value?value:""})(
                            <Input type="text" placeholder={`请输入${label}`} style={{width:160}} onPressEnter={this.handleFilterSubmit}/>
                        )}
                    </FormItem>   
                    formItemList.push(INPUT)                
                }else if(item.inputType==="select"){
                    const SELECT= <FormItem label={label} key={field}>
                        {getFieldDecorator(field,{initialValue:value?value:undefined})(
                            <Select style={{width:120}} 
                                    onFocus={()=>this.selectOptions(item.fieldId)}
                                    placeholder={`请输入${label}`} 
                                    notFoundContent="暂无选项"
                                    allowClear={true}
                                    showSearch
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
                        actions && actions.length>0?
                        actions.map(item =>
                            <Button type="primary" key={item.id} onClick={()=>this.props.handleActions(item.id)}  disabled={this.props.disabled}>{item.title}</Button>
                        ):""
                    }
                    {/* <Button type="primary" onClick={this.props.reset}>清空</Button> */}
                </FormItem>
            </Form>
        )
    }
}
export default Form.create()(BaseForm);