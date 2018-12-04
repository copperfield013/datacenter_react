import React from 'react'
import { Radio, Input, Button, Card,message,Checkbox ,Form,Select,DatePicker,Avatar,Upload,Icon} from 'antd'
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
                    const DATE= <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
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
                    const SELECT= <FormItem label={fieldName} key={[item.fieldId]} className='labelcss'>
                                                 {
                                                    this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                                    getFieldDecorator([fieldName])(
                                                            <Select style={{width:220}} >
                                                                <Option value="1">男</Option>
                                                                <Option value="2">女</Option>
                                                            </Select>
                                                )}
                                             </FormItem> 
                    formItemList.push(SELECT)    
                }else if(item.type=="label"){
                    const LABEL= <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                                 {
                                                    this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                                    getFieldDecorator([fieldName])(
                                                        <Select mode="multiple" style={{width:220}}>
                                                            <Option value="1">游泳</Option>
                                                            <Option value="2">唱歌</Option>
                                                            <Option value="3">旅游</Option>
                                                            <Option value="4">逛街</Option>
                                                            <Option value="5">跳舞</Option>
                                                            <Option value="6">爬山</Option>
                                                        </Select>
                                                )}
                                            </FormItem>
                    formItemList.push(LABEL)   
                }else if(item.type=="file"){
                    const FILE= <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                                 {
                                                    this.state.type=="detail"?<span style={{width:220,display:"inline-block"}}><Avatar src={item.fieldId}/></span>:
                                                    getFieldDecorator([fieldName])(
                                                        <Upload {...props}>
                                                            <Button style={{width:220}}>
                                                                <Icon type="upload" /> Click to Upload
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