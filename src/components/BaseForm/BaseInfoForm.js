import React from 'react'
import {Input,Button,Cascader,Form,Select,DatePicker,Avatar,Upload,Icon} from 'antd'
import Super from "./../../super"
import Units from "../../units";
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
moment.locale('zh-cn');
const FormItem=Form.Item

let submits=[]
class BaseInfoForm extends React.Component{
    state={
        fileList:[],
        flag:false,
        visiCascader:"none"
    }   
    componentDidMount(){
        this.props.onRef(this)
    }
    handleBaseInfoSubmit=()=>{
        const fieldsValue=this.props.form.getFieldsValue()
        for(let k in fieldsValue){
            if(k.indexOf("日期")>-1 && fieldsValue[k]){ //日期格式转换
                fieldsValue[k]=moment(fieldsValue[k]).format("YYYY-MM-DD")
            }
        }
        for(let k in fieldsValue){
            if(k.indexOf("地址")>-1 && fieldsValue[k]){ //地址格式转换
                fieldsValue[k]= fieldsValue[k].join("->")
            }
        }
        submits.push(fieldsValue)
        console.log(submits)
        this.props.baseInfo(fieldsValue)
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
    onRemove=(file) => {
        this.setState({
            fileList: [],
            flag:true //为了防止重复添加defaultUpload
        });
    }
    beforeUpload=(file) => {
        this.setState(state => ({
            fileList: [file],
        }));
        return false;
    }
    handleChange=(info)=>{
        let fileList = info.fileList;
        fileList = fileList.slice(-1);
        console.log(fileList)
        this.setState({fileList})
    }
    handleUpload=(fieldValue,e)=>{//defaultFileList默认不在fileList里面
        if(fieldValue&&this.state.flag===false){
            let defaultUpload={}
            defaultUpload["uid"]="-1";
            defaultUpload["url"]=`/file-server/${fieldValue}`
            this.setState({
                fileList:[defaultUpload]
            })
        }
            
    }
    changeCascader=(optionKey,e)=>{
        this.requestLinkage(optionKey)
        e.target.style.display="none"
        this.setState({
            visiCascader:"inline-block"
        })
    }
    initFormList=()=>{
        const { getFieldDecorator } = this.props.form;
        const formList=this.props.formList;
        const formItemList=[];
        if(formList && formList.length>0){
            formList.forEach((item)=>{
                const fieldName=item.fieldName;
                const field=item.fieldId
                const fieldValue=this.props.flag?"":item.value;
                if(item.type==="date"){
                    const DATE= <FormItem label={fieldName} key={field} className='labelcss'>
                                    {this.props.type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:!fieldValue||fieldValue===""?null:moment(fieldValue,'YYYY-MM-DD'),
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
                                    {this.props.type==="detail"?<span className="infoStyle">{fieldValue}</span>:
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
                                        {this.props.type==="detail"?<span className="infoStyle">{fieldValue}</span>:
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
                                        {this.props.type==="detail"?<span className="infoStyle">{fieldValue}</span>:
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
                    // let arrVal=[]
                    // if(fieldValue){
                    //     arrVal=fieldValue.split("->")
                    // }
                    const CASELECT= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {this.props.type==="detail"?<span className="infoStyle">{fieldValue}</span>:
                                        fieldValue?<div>
                                            <Input style={{width:220}} value={fieldValue} onClick={(e)=>this.changeCascader(item.optionKey,e)} readOnly/>
                                            {
                                                this.state.visiCascader==="inline-block"?getFieldDecorator(fieldName,{
                                                    rules:item.validators==="required"?[{
                                                            required: true, message: `请输入${fieldName}`,
                                                          }]:"",
                                                })(
                                                    <Cascader
                                                        onClick={()=>this.requestLinkage(item.optionKey)}
                                                        placeholder={`请选择${fieldName}`}
                                                        style={{width:220}}
                                                        options={this.state.options}
                                                        loadData={this.loadData}
                                                        displayRender={label=>label.join('->')}
                                                        getPopupContainer={trigger => trigger.parentNode}
                                                    />
                                            ):""
                                            }
                                            </div>:
                                            getFieldDecorator(fieldName,{
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${fieldName}`,
                                                      }]:"",
                                            })(
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
                                        {this.props.type==="detail"?
                                            fieldValue?<span className="downAvatar">
                                                <Avatar shape="square" src={`/file-server/${fieldValue}`}/>
                                                <a href={`/file-server/${fieldValue}`} download="logo.png"><Icon type="download"/></a>
                                                </span>:<span className="downAvatar">无文件</span>
                                        :getFieldDecorator(fieldName)(
                                                <Upload
                                                    accept="image/*"
                                                    listType= 'picture'
                                                    onRemove={this.onRemove}
                                                    beforeUpload={this.beforeUpload}
                                                    defaultFileList={fieldValue?[{
                                                        uid:"-1",
                                                        name:`${item.fieldName}.png`,
                                                        status: 'done',
                                                        url: `/file-server/${fieldValue}`,
                                                    }]:""}
                                                    onChange={this.handleChange}
                                                >
                                                    <Button 
                                                        style={{width:220}} 
                                                        disabled={this.state.fileList.length===1?true:false} 
                                                        onMouseEnter={(e)=>this.handleUpload(fieldValue,e)}
                                                        >
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