import React from 'react'
import {Input,Form,Select,DatePicker,Icon,InputNumber,Button} from 'antd'
import Units from "../../units";
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
import NewUpload from './../NewUpload'
import NewCascader from './../NewCascader'
moment.locale('zh-cn');
const FormItem=Form.Item
const { TextArea } = Input;

export default class BaseInfoForm extends React.Component{
    state={
        fileList:[],
        visiCascader:"none"
    }
    changeCascader=(e,available)=>{
        if(available){
            e.target.style.display="none"
            this.setState({
                visiCascader:"inline-block"
            })
        }
    }
    changeFile=(e)=>{
        this.setState({
            close:"none"
        })
    }
    changePass=(e,fieldValue)=>{
        e.target.value=fieldValue
        this.props.setPassword(fieldValue)
    }
    changeInt=(e)=>{ //只允许输入整数
        if(e.target.value && !isNaN(e.target.value)){
            e.target.value=parseInt(e.target.value)
        }else{
            e.target.value=""
        }
    }
    initFormList=()=>{
        const { getFieldDecorator } = this.props.form?this.props.form:"";
        const { formList,width,type }=this.props
        const formItemList=[]; 
        //console.log(formList)
        if(formList && formList.length>0){
            formList.forEach((item,index)=>{
                const title=item.title;
                const field=item.code?item.code+index:item.fieldId
                const fieldValue=item.value;
                const available=item.fieldAvailable
                const fieldName=item.name
                if(item.type==="date"){
                    const DATE= <FormItem label={title} key={field} className='labelcss'>
                                    {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:fieldValue?moment(fieldValue,'YYYY-MM-DD'):null,
                                            rules:item.validators?[{
                                                    required: true, message: `请选择${title}`,
                                                  }]:"",
                                        })(
                                            <DatePicker 
                                                style={{width:width}} 
                                                locale={locale} 
                                                placeholder={`请选择${title}`}
                                                getCalendarContainer={trigger => trigger.parentNode}
                                                disabled={!available}
                                                />
                                    )}
                                </FormItem>
                    formItemList.push(DATE)                
                }else if(item.type==="text"){
                    const TEXT= <FormItem label={title} key={field} className='labelcss'>
                                    {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:fieldValue,
                                            rules:item.validators?[{
                                                    required: true, message: `请输入${title}`,
                                                }]:"",
                                        })(
                                            <Input 
                                                type="text" 
                                                style={{width:width}}
                                                placeholder={`请输入${title}`}
                                                disabled={!available}
                                                />
                                    )}
                                </FormItem>   
                    formItemList.push(TEXT)                
                }else if(item.type==="password"){
                    const TEXT= <FormItem label={title} key={field} className='labelcss'>
                                    {type==="detail"?<span className="infoStyle">******</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:fieldValue,
                                            rules:item.validators?[{
                                                    required: true, message: `请输入${title}`,
                                                }]:"",
                                        })(
                                            <Input 
                                                type="password" 
                                                style={{width:width}}
                                                placeholder={`请输入${title}`}
                                                onChange={(e)=>this.changePass(e,fieldValue)}
                                                />
                                    )}
                                </FormItem> 
                    formItemList.push(TEXT)                
                }else if(item.type==="select"){
                    const SELECT= <FormItem label={title} key={field} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                            getFieldDecorator(fieldName,{
                                                initialValue:fieldValue?fieldValue:undefined,
                                                rules:item.validators?[{
                                                        required: true, message: `请选择${title}`,
                                                      }]:"",
                                        })(
                                            <Select 
                                                style={{width:width}} 
                                                onFocus={()=>this.props.getOptions(field)}
                                                placeholder={`请选择${title}`}
                                                getPopupContainer={trigger => trigger.parentNode}
                                                disabled={!available}                                              
                                                notFoundContent="暂无选项"
                                                allowClear={true}
                                                showSearch
                                                >
                                                    {Units.getSelectList(this.props.options)}
                                            </Select>
                                        )}
                                    </FormItem> 
                    formItemList.push(SELECT)    
                }else if(item.type==="relation"){ //modelForm里面的关系下拉框
                    const SELECT= <FormItem label={title} key={field} className='labelcss'>
                                        {getFieldDecorator("relation",{
                                            initialValue:fieldValue,
                                            rules:item.validators?[{
                                                    required: true, message: `请选择${title}`,
                                                    }]:"",
                                        })(
                                            <Select 
                                                style={{width:width}}
                                                placeholder={`请选择${title}`}
                                                getPopupContainer={trigger => trigger.parentNode}  
                                                notFoundContent="暂无选项"
                                                allowClear={true}
                                                >
                                                    {Units.getSelectList(item.options)}
                                            </Select>)}
                                    </FormItem> 
                    formItemList.push(SELECT)    
                }else if(item.type==="label"){            
                    const LABEL= <FormItem label={title} key={field} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                            getFieldDecorator(fieldName,{
                                                initialValue:fieldValue?fieldValue.split(','):[],
                                                rules:item.validators?[{
                                                        required: true, message: `请选择${title}`,
                                                      }]:"",
                                            })(
                                            <Select 
                                                mode="multiple" 
                                                style={{width:width}} 
                                                onMouseEnter={()=>this.props.getOptions(field)}
                                                placeholder={`请选择${title}`}
                                                getPopupContainer={trigger => trigger.parentNode}
                                                disabled={!available}                                               
                                                notFoundContent="暂无选项"
                                                allowClear={true}
                                                >
                                                    {Units.getSelectList(this.props.options)}
                                            </Select>
                                        )}
                                </FormItem>
                    formItemList.push(LABEL)   
                }else if(item.type==="caselect"){ 
                    const CASELECT= <FormItem label={title} key={field} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        fieldValue?<div>
                                            <Input style={{width:width}} value={fieldValue} onClick={(e)=>this.changeCascader(e,available)} readOnly/>
                                            {this.state.visiCascader==="inline-block"?getFieldDecorator(fieldName,{
                                                rules:item.validators?[{
                                                        required: true, message: `请输入${title}`,
                                                        }]:"",
                                            })(
                                                <NewCascader
                                                    optionGroupKey={item.optionGroupKey}
                                                    fieldName={fieldName}
                                                    disabled={!available}
                                                />
                                            ):""}
                                            </div>:
                                            getFieldDecorator(fieldName,{
                                                rules:item.validators?[{
                                                        required: true, message: `请输入${title}`,
                                                      }]:"",
                                            })(
                                                <NewCascader
                                                    optionGroupKey={item.optionGroupKey}
                                                    fieldName={fieldName}
                                                    disabled={!available}
                                                />
                                        )}
                                </FormItem>
                    formItemList.push(CASELECT)   
                }else if(item.type==="file"){
                    const url=fieldValue?fieldValue.props.src:""
                    const FILE= <FormItem label={title} key={field} className='labelcss'>
                                        {type==="detail"?
                                            fieldValue && fieldValue!=="无文件"?<span className="downAvatar">
                                                {fieldValue}
                                                <Button href={url} download="logo.png" size="small"><Icon type="download"/></Button>
                                                </span>:<span className="downAvatar">无文件</span>
                                        :
                                        fieldValue && fieldValue!=="无文件"?
                                        <div>
                                            <span className="downAvatar" style={{display:this.state.close}}>
                                               {fieldValue}
                                                <Button onClick={()=>this.setState({close:'none'})} size="small"><Icon type="close" /></Button>
                                            </span>
                                            {this.state.close==="none"?getFieldDecorator(fieldName,{
                                                    rules:item.validators?[{
                                                        required: true, message: `请输入${title}`,
                                                        }]:"",
                                                })(
                                                    <NewUpload
                                                        width={width}
                                                    />
                                                ):""}
                                        </div>
                                        :
                                        getFieldDecorator(fieldName)(
                                            <NewUpload
                                                width={width}
                                            />
                                        )}
                                </FormItem>
                    formItemList.push(FILE)   
                }else if(item.type==="decimal"){
                    const decimal= <FormItem label={title} key={field} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:fieldValue,
                                        })(
                                            <InputNumber 
                                                placeholder={`请输入${title}`}  
                                                style={{width:width}} 
                                                step={0.1}
                                                disabled={!available}
                                                min={0}/>
                                        )}
                                    </FormItem>
                    formItemList.push(decimal)   
                }else if(item.type==="int"){
                    const int= <FormItem label={title} key={field} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:fieldValue,
                                        })(
                                            <InputNumber 
                                                placeholder={`请输入${title}`}  
                                                style={{width:width}} 
                                                disabled={!available}
                                                onKeyUp={this.changeInt}
                                                min={0}/>
                                        )}
                                    </FormItem>
                    formItemList.push(int)   
                }else if(item.type==="textarea"){
                    const textarea= <FormItem label={title} key={field} className='labelcss'>
                                        {type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:fieldValue,
                                        })(
                                            <TextArea 
                                                placeholder={`请输入${title}`}  
                                                style={{width:width}} 
                                                disabled={!available}
                                                />
                                        )}
                                    </FormItem>
                    formItemList.push(textarea)   
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