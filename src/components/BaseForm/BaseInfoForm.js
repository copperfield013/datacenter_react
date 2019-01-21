import React from 'react'
import {Input,Form,Select,DatePicker,Avatar,Icon} from 'antd'
import Super from "./../../super"
import Units from "../../units";
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
import NewUpload from './../NewUpload'
import NewCascader from './../NewCascader'
moment.locale('zh-cn');
const FormItem=Form.Item

export default class BaseInfoForm extends React.Component{
    state={
        fileList:[],
        flag:false,
        visiCascader:"none"
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
    changeCascader=(e)=>{
        e.target.style.display="none"
        this.setState({
            visiCascader:"inline-block"
        })
    }
    initFormList=()=>{
        const { getFieldDecorator } = this.props.form;
        const { formList,width,flag,type }=this.props
        const formItemList=[];
        if(formList && formList.length>0){
            formList.forEach((item)=>{
                const fieldName=item.fieldName;
                const field=item.fieldId
                const fieldValue=flag?null:item.value;
                if(item.type==="date"){
                    const DATE= <FormItem label={fieldName} key={field} className='labelcss'>
                                    {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:!fieldValue||fieldValue===""?null:moment(fieldValue,'YYYY-MM-DD'),
                                            rules:item.validators==="required"?[{
                                                    required: true, message: `请输入${fieldName}`,
                                                  }]:"",
                                        })(
                                            <DatePicker 
                                                style={{width:width}} 
                                                locale={locale} 
                                                getCalendarContainer={trigger => trigger.parentNode}
                                                />
                                    )}
                                </FormItem>
                    formItemList.push(DATE)                
                }else if(item.type==="text"){
                    const TEXT= <FormItem label={fieldName} key={field} className='labelcss'>
                                    {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                        initialValue:fieldValue,
                                        rules:item.validators==="required"?[{
                                                required: true, message: `请输入${fieldName}`,
                                              }]:"",
                                    })(
                                        <Input type="text" style={{width:width}}/>
                                    )}
                                </FormItem>   
                    formItemList.push(TEXT)                
                }else if(item.type==="select"){
                    const SELECT= <FormItem label={fieldName} key={[field]} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                            getFieldDecorator(fieldName,{
                                                initialValue:fieldValue,
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${fieldName}`,
                                                      }]:"",
                                        })(
                                            <Select style={{width:width}} 
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
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                            getFieldDecorator(fieldName,{
                                                initialValue:result,
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${fieldName}`,
                                                      }]:"",
                                            })(
                                            <Select mode="multiple" style={{width:width}} 
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
                    // let arrVal=[]
                    // if(fieldValue){
                    //     arrVal=fieldValue.split("->")
                    // }
                    const CASELECT= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        fieldValue?<div>
                                            <Input style={{width:width}} value={fieldValue} onClick={this.changeCascader} readOnly/>
                                            {
                                                this.state.visiCascader==="inline-block"?getFieldDecorator(fieldName,{
                                                    rules:item.validators==="required"?[{
                                                            required: true, message: `请输入${fieldName}`,
                                                          }]:"",
                                                })(
                                                    <NewCascader
                                                        optionKey={item.optionKey}
                                                        fieldName={fieldName}
                                                    />
                                            ):""
                                            }
                                            </div>:
                                            getFieldDecorator(fieldName,{
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${fieldName}`,
                                                      }]:"",
                                            })(
                                                <NewCascader
                                                    optionKey={item.optionKey}
                                                    fieldName={fieldName}
                                                />
                                        )}
                                </FormItem>
                    formItemList.push(CASELECT)   
                }else if(item.type==="file"){
                    const FILE= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {type==="detail"?
                                            fieldValue?<span className="downAvatar">
                                                <Avatar shape="square" src={`/file-server/${fieldValue}`}/>
                                                <a href={`/file-server/${fieldValue}`} download="logo.png"><Icon type="download"/></a>
                                                </span>:<span className="downAvatar">无文件</span>
                                        :
                                        getFieldDecorator(fieldName)(
                                            <NewUpload
                                                fieldValue={fieldValue}
                                                width={width}
                                            />
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
                this.initFormList()
            
        )
    }
}
//export default Form.create()(BaseInfoForm);