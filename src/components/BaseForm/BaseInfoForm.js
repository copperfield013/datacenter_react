import React from 'react'
import { Radio, Input, Button, Card,message,Checkbox ,Form,Select,DatePicker,Avatar,Upload,Icon} from 'antd'
import axios from "./../../axios"
import Units from "../../units/unit";
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import "./index.css"
const FormItem=Form.Item
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const {RangePicker} = DatePicker;
const Option = Select.Option;

var storage=window.localStorage;
class BaseInfoForm extends React.Component{
    state={
        type:this.props.type,
    }
    componentDidMount(){
        this.props.onRef(this)
    }
    handleBaseInfoSubmit=()=>{
        let fieldsValue=this.props.form.getFieldsValue();
        storage["baseInfo"]=JSON.stringify(fieldsValue);
    }
    requestSelectOptions=(id)=>{
        axios.ajax({
            url:`/api/field/options?fieldIds=${id}`,
            data:{
                isShowLoading:false,
            }
        }).then((res)=>{
            let key=res.keyPrefix+id;
            this.setState({
                list:res.optionsMap[key]
            })
        })
    }
    requestLinkage=(optionKey)=>{
        let optGroupId=optionKey.split("@")[0]
        axios.ajax({
            url:`/api/field/cas_ops/${optGroupId}`,
            data:{
                isShowLoading:false,
            }
        }).then((res)=>{
            console.log(res)
        })
    }
    initFormList=()=>{
        const { getFieldDecorator } = this.props.form;
        const formList=this.props.formList;
        //console.log(formList)
        const formItemList=[];
        const props = {
            name: 'file',
            action: '//jsonplaceholder.typicode.com/posts/',
            headers: {
                authorization: 'authorization-text',
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
                }
            },
        };
        if(formList && formList.length>0){
            formList.forEach((item)=>{
                let label=item.title;
                let fieldName=item.fieldName;
                let field=item.fieldId
                let placeholder=item.placeholder || '';
                let fieldValue=item.value;
                if(item.type=="date"){
                    const DATE= <FormItem label={fieldName} key={field} className='labelcss'>
                                    {
                                        this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                        getFieldDecorator([fieldName])(
                                            <DatePicker style={{width:220}} locale={locale}/>
                                    )}
                                </FormItem>
                    formItemList.push(DATE)                
                }else if(item.type=="text"){
                    const TEXT= <FormItem label={fieldName} key={field} className='labelcss'>
                                    {
                                        this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                        getFieldDecorator([fieldName],{
                                        initialValue:fieldValue
                                    })(
                                        <Input type="text" style={{width:220}}/>
                                    )}
                                </FormItem>   
                    formItemList.push(TEXT)                
                }else if(item.type=="select"){
                    const SELECT= <FormItem label={fieldName} key={[field]} className='labelcss'>
                                        {
                                        this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                        getFieldDecorator([fieldName])(
                                                <Select style={{width:220}} onMouseEnter={()=>this.requestSelectOptions(field)}>
                                                     {Units.getSelectList(this.state.list)}
                                                </Select>
                                        )}
                                    </FormItem> 
                    formItemList.push(SELECT)    
                }else if(item.type=="label"){
                    const LABEL= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {
                                            this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                            getFieldDecorator([fieldName])(
                                                <Select mode="multiple" style={{width:220}} onMouseEnter={()=>this.requestSelectOptions(field)}>
                                                    
                                                </Select>
                                        )}
                                </FormItem>
                    formItemList.push(LABEL)   
                }else if(item.type=="caselect"){
                    const CASELECT= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {
                                            this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                            getFieldDecorator([fieldName])(
                                                <Select mode="multiple" style={{width:220}} onMouseEnter={()=>this.requestLinkage(item.optionKey)}>
                                                    {Units.getSelectList(this.state.list)}
                                                </Select>
                                        )}
                                </FormItem>
                    formItemList.push(CASELECT)   
                }else if(item.type=="file"){
                    const FILE= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {
                                        this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}><Avatar src={field}/></span>:
                                        getFieldDecorator([fieldName])(
                                            <Upload {...props}>
                                                <Button style={{width:220}}>
                                                    <Icon type="upload" /> 点击上传
                                                </Button>
                                            </Upload>
                                        )}
                                </FormItem>
                    formItemList.push(FILE)   
                }
            })
        }
        return formItemList;
    }
    render(){
        return(
            <Form layout="inline">
                {this.initFormList()}
            </Form>
        )
    }
}
export default Form.create()(BaseInfoForm);