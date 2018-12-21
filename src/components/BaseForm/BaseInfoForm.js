import React from 'react'
import {Input,Button,Cascader,Form,Select,DatePicker,Avatar,Upload,Icon} from 'antd'
import Super from "./../../super"
import Units from "../../units";
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
moment.locale('zh-cn');
const FormItem=Form.Item

const storage=window.sessionStorage;
class BaseInfoForm extends React.Component{
    state={
        fileList:[],
    }
    componentDidMount(){
        this.props.onRef(this)
    }
    reSet=()=>{
        this.props.form.resetFields();
    }
    handleBaseInfoSubmit=()=>{
        let fieldsValue=this.props.form.getFieldsValue()
        console.log(fieldsValue)
        for(let k in fieldsValue){
            if(k.indexOf("日期")>-1){ //日期格式转换
                fieldsValue[k]=moment(fieldsValue[k]).format("YYYY-MM-DD")
            }
        }
        storage["baseInfo"]=JSON.stringify(fieldsValue)
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
    requestLinkage=(optionKey)=>{ //第一级联动
        const optGroupId=optionKey.split("@")[0]
        const time=optionKey.split("@")[1]
        Super.super({
			url:`/api/field/cas_ops/${optGroupId}`,                
		}).then((res)=>{
			const ops=[]
            res.options.map((item)=>{
                const op={}
                op["value"]=item.title
                op["label"]=item.title
                op["key"]=item.id
                op["isLeaf"]= false
                ops.push(op)
                return false
            })
            this.setState({
                options:ops,
                time
            })
		})
    }
    loadData = (selectedOptions) => { //子集联动
        const targetOption = selectedOptions[selectedOptions.length - 1]
        targetOption.loading = true
        this.setState({
            time:this.state.time-1
        })
        if(selectedOptions && this.state.time>=1){
            let id="";
            selectedOptions.map((item)=>{
                id=item.key
                return false
            })
            Super.super({
                url:`/api/field/cas_ops/${id}`,                
            }).then((res)=>{
                const ops=[]
                const time=this.state.time
                res.options.map((item)=>{
                    let op={}
                    op["value"]=item.title
                    op["label"]=item.title
                    op["key"]=item.id
                    if(time===1){
                        op["isLeaf"]= true
                    }else{
                        op["isLeaf"]= false
                    }
                    ops.push(op)
                    return false
                })
                setTimeout(() => {
                    targetOption.loading = false;
                    targetOption.children =ops
                    this.setState({
                        options: [...this.state.options],
                    });
                }, 300);
            })
        }       
      }
    initFormList=()=>{
        const { getFieldDecorator } = this.props.form;
        const formList=this.props.formList;
        const formItemList=[];
        const { fileList } = this.state;
        const props = {
            accept:"image/*",
            listType: 'picture',
            onRemove: (file) => {
                this.setState((state) => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: (file) => {
                this.setState(state => ({
                    fileList: [...state.fileList, file],
                }));
                return false;
            },
            defaultFileList: [...fileList],
        };
        if(formList && formList.length>0){
            formList.forEach((item)=>{
                const fieldName=item.fieldName;
                const field=item.fieldId
                const fieldValue=this.props.flag?"":item.value;
                if(item.type==="date"){
                    const DATE= <FormItem label={fieldName} key={field} className='labelcss'>
                                    {this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:fieldValue===""?null:moment(fieldValue,'YYYY-MM-DD'),
                                            rules:item.validators==="required"?[{
                                                    required: true, message: `请输入${fieldName}`,
                                                  }]:"",
                                        })(
                                            <DatePicker 
                                                style={{width:220}} 
                                                locale={locale} 
                                                getCalendarContainer={trigger => trigger.parentNode}
                                                />
                                    )}
                                </FormItem>
                    formItemList.push(DATE)                
                }else if(item.type==="text"){
                    const TEXT= <FormItem label={fieldName} key={field} className='labelcss'>
                                    {this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                        initialValue:fieldValue,
                                        rules:item.validators==="required"?[{
                                                required: true, message: `请输入${fieldName}`,
                                              }]:"",
                                    })(
                                        <Input type="text" style={{width:220}}/>
                                    )}
                                </FormItem>   
                    formItemList.push(TEXT)                
                }else if(item.type==="select"){
                    const SELECT= <FormItem label={fieldName} key={[field]} className='labelcss'>
                                        {this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                            getFieldDecorator(fieldName,{
                                                initialValue:fieldValue,
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${fieldName}`,
                                                      }]:"",
                                        })(
                                            <Select style={{width:220}} 
                                                    onMouseEnter={()=>this.requestSelectOptions(field)}
                                                    placeholder={`请输入${fieldName}`}
                                                    getPopupContainer={trigger => trigger.parentNode}
                                                    >
                                                    {Units.getSelectList(this.state.list)}
                                            </Select>
                                        )}
                                    </FormItem> 
                    formItemList.push(SELECT)    
                }else if(item.type==="label"){
                    const result=fieldValue?fieldValue.split(','):[];                    
                    const LABEL= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                            getFieldDecorator(fieldName,{
                                                initialValue:result,
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${fieldName}`,
                                                      }]:"",
                                            })(
                                            <Select mode="multiple" style={{width:220}} 
                                                    onMouseEnter={()=>this.requestSelectOptions(field)}
                                                    placeholder={`请输入${fieldName}`}
                                                    getPopupContainer={trigger => trigger.parentNode}
                                                    >
                                                {Units.getSelectList(this.state.list)}
                                            </Select>
                                        )}
                                </FormItem>
                    formItemList.push(LABEL)   
                }else if(item.type==="caselect"){
                    const CASELECT= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                            getFieldDecorator(fieldName)(
                                                <Cascader
                                                    onClick={()=>this.requestLinkage(item.optionKey)}
                                                    placeholder={`请选择${fieldName}`}
                                                    style={{width:220}}
                                                    options={this.state.options}
                                                    loadData={this.loadData}
                                                    displayRender={label=>label.join('->')}
                                                    getPopupContainer={trigger => trigger.parentNode}
                                                />
                                        )}
                                </FormItem>
                    formItemList.push(CASELECT)   
                }else if(item.type==="file"){
                    const FILE= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}><Avatar src={field}/></span>:
                                        getFieldDecorator(fieldName)(
                                            <Upload {...props}>
                                                <Button style={{width:220}}>
                                                    <Icon type="upload" /> 点击上传
                                                </Button>
                                            </Upload>
                                        )}
                                </FormItem>
                    formItemList.push(FILE)   
                }
                return false
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