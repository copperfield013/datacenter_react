import React from 'react'
import {Input,Form,Select,DatePicker,Avatar,Icon,InputNumber} from 'antd'
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
                const title=item.title;
                const field=item.fieldId
                const fieldValue=flag?null:item.value;
                if(item.type==="date"){
                    const DATE= <FormItem label={title} key={field} className='labelcss'>
                                    {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(title,{
                                            initialValue:!fieldValue||fieldValue===""?null:moment(fieldValue,'YYYY-MM-DD'),
                                            rules:item.validators==="required"?[{
                                                    required: true, message: `请选择${title}`,
                                                  }]:"",
                                        })(
                                            <DatePicker 
                                                style={{width:width}} 
                                                locale={locale} 
                                                placeholder={`请选择${title}`}
                                                getCalendarContainer={trigger => trigger.parentNode}
                                                />
                                    )}
                                </FormItem>
                    formItemList.push(DATE)                
                }else if(item.type==="text"){
                    const TEXT= <FormItem label={title} key={field} className='labelcss'>
                                    {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(title,{
                                        initialValue:fieldValue,
                                        rules:item.validators==="required"?[{
                                                required: true, message: `请输入${title}`,
                                              }]:"",
                                    })(
                                        <Input 
                                            type="text" 
                                            style={{width:width}}
                                            placeholder={`请输入${title}`}
                                            />
                                    )}
                                </FormItem>   
                    formItemList.push(TEXT)                
                }else if(item.type==="select"){
                    const SELECT= <FormItem label={title} key={[field]} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                            getFieldDecorator(title,{
                                                initialValue:fieldValue,
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请选择${title}`,
                                                      }]:"",
                                        })(
                                            <Select 
                                                style={{width:width}} 
                                                onMouseEnter={()=>this.props.getOptions(field)}
                                                placeholder={`请选择${title}`}
                                                getPopupContainer={trigger => trigger.parentNode}
                                                >
                                                    {Units.getSelectList(this.props.options)}
                                            </Select>
                                        )}
                                    </FormItem> 
                    formItemList.push(SELECT)    
                }else if(item.type==="relation"){ //modelForm里面的关系下拉框
                    const SELECT= <FormItem label={title} key={[field]} className='labelcss'>
                                        {getFieldDecorator(title,{
                                                initialValue:fieldValue,
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请选择${title}`,
                                                      }]:"",
                                        })(
                                            <Select 
                                                style={{width:width}}
                                                placeholder={`请选择${title}`}
                                                getPopupContainer={trigger => trigger.parentNode}
                                                >
                                                    {Units.getSelectList(item.options)}
                                            </Select>)}
                                    </FormItem> 
                    formItemList.push(SELECT)    
                }else if(item.type==="label"){
                    const result=fieldValue?fieldValue.split(','):[];                    
                    const LABEL= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                            getFieldDecorator(fieldName,{
                                                initialValue:result,
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请选择${title}`,
                                                      }]:"",
                                            })(
                                            <Select 
                                                mode="multiple" 
                                                style={{width:width}} 
                                                onMouseEnter={()=>this.props.getOptions(field)}
                                                placeholder={`请选择${title}`}
                                                getPopupContainer={trigger => trigger.parentNode}
                                                >
                                                    {Units.getSelectList(this.props.options)}
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
                                            {this.state.visiCascader==="inline-block"?getFieldDecorator(fieldName,{
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${title}`,
                                                        }]:"",
                                            })(
                                                <NewCascader
                                                    optionKey={item.optionKey}
                                                    fieldName={fieldName}
                                                />
                                            ):""}
                                            </div>:
                                            getFieldDecorator(fieldName,{
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${title}`,
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
                    const FILE= <FormItem label={title} key={field} className='labelcss'>
                                        {type==="detail"?
                                            fieldValue?<span className="downAvatar">
                                                <Avatar shape="square" src={`/file-server/${fieldValue}`}/>
                                                <a href={`/file-server/${fieldValue}`} download="logo.png"><Icon type="download"/></a>
                                                </span>:<span className="downAvatar">无文件</span>
                                        :
                                        getFieldDecorator(title)(
                                            <NewUpload
                                                fieldValue={fieldValue}
                                                width={width}
                                            />
                                        )}
                                </FormItem>
                    formItemList.push(FILE)   
                }else if(item.type==="decimal"){
                    const decimal= <FormItem label={title} key={field} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(title,{
                                            initialValue:fieldValue,
                                        })(
                                            <InputNumber 
                                                placeholder={`请输入${title}`}  
                                                style={{width:width}} 
                                                min={0}/>
                                        )}
                                    </FormItem>
                    formItemList.push(decimal)   
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