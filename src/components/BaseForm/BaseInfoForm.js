import React from 'react'
import {Input,Button,Cascader,Form,Select,DatePicker,Avatar,Upload,Icon} from 'antd'
import axios from "./../../axios"
import Units from "../../units/unit";
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
const FormItem=Form.Item

var storage=window.sessionStorage;
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
        let fieldsValue=this.props.form.getFieldsValue();
        storage["baseInfo"]=JSON.stringify(fieldsValue);
    }
    requestSelectOptions=(id)=>{//下拉框
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
    requestLinkage=(optionKey)=>{ //第一级联动
        let optGroupId=optionKey.split("@")[0]
        let time=optionKey.split("@")[1]
        axios.ajax({
            url:`/api/field/cas_ops/${optGroupId}`,
        }).then((res)=>{
            let ops=[]
            res.options.map((item)=>{
                let op={}
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
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        //console.log(selectedOptions)
        // load options lazily
        this.setState({
            time:this.state.time-1
        })
        if(selectedOptions && this.state.time>=1){
            let id="";
            selectedOptions.map((item)=>{
                id=item.key
                return false
            })
            axios.ajax({
                url:`/api/field/cas_ops/${id}`,
            }).then((res)=>{
                let ops=[]
                let time=this.state.time
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
                //let label=item.title;
                let fieldName=item.fieldName;
                let field=item.fieldId
                //let placeholder=item.placeholder || '';
                let fieldValue=this.props.flag?"":item.value;
                if(item.type==="date"){
                    const DATE= <FormItem label={fieldName} key={field} className='labelcss'>
                                    {
                                        this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                            initialValue:fieldValue===""?moment([], 'YYYY-MM-DD'):moment(fieldValue, 'YYYY-MM-DD'),
                                            rules:item.validators==="required"?[{
                                                    required: true, message: `请输入${item.title}`,
                                                  }]:"",
                                        })(
                                            <DatePicker style={{width:220}} locale={locale}/>
                                    )}
                                </FormItem>
                    formItemList.push(DATE)                
                }else if(item.type==="text"){
                    const TEXT= <FormItem label={fieldName} key={field} className='labelcss'>
                                    {
                                        this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                        getFieldDecorator(fieldName,{
                                        initialValue:fieldValue,
                                        rules:item.validators==="required"?[{
                                                required: true, message: `请输入${item.title}`,
                                              }]:"",
                                    })(
                                        <Input type="text" style={{width:220}}/>
                                    )}
                                </FormItem>   
                    formItemList.push(TEXT)                
                }else if(item.type==="select"){
                    const SELECT= <FormItem label={fieldName} key={[field]} className='labelcss'>
                                        {
                                            this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                            getFieldDecorator(fieldName,{
                                                initialValue:fieldValue,
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${item.title}`,
                                                      }]:"",
                                        })(
                                            <Select style={{width:220}} onMouseEnter={()=>this.requestSelectOptions(field)}>
                                                    {Units.getSelectList(this.state.list)}
                                            </Select>
                                        )}
                                    </FormItem> 
                    formItemList.push(SELECT)    
                }else if(item.type==="label"){
                    let result=fieldValue?fieldValue.split(','):[];                    
                    const LABEL= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {
                                            this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                            getFieldDecorator(fieldName,{
                                                initialValue:result,
                                                rules:item.validators==="required"?[{
                                                        required: true, message: `请输入${item.title}`,
                                                      }]:"",
                                            })(
                                            <Select mode="multiple" style={{width:220}} onMouseEnter={()=>this.requestSelectOptions(field)}>
                                                {Units.getSelectList(this.state.list)}
                                            </Select>
                                        )}
                                </FormItem>
                    formItemList.push(LABEL)   
                }else if(item.type==="caselect"){
                    const CASELECT= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {
                                            this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}>{fieldValue}</span>:
                                            getFieldDecorator(fieldName)(
                                                <Cascader
                                                    onClick={()=>this.requestLinkage(item.optionKey)}
                                                    placeholder="请选择"
                                                    style={{width:220}}
                                                    options={this.state.options}
                                                    loadData={this.loadData}
                                                    displayRender={label=>label.join('->')}
                                                />
                                        )}
                                </FormItem>
                    formItemList.push(CASELECT)   
                }else if(item.type==="file"){
                    const FILE= <FormItem label={fieldName} key={field} className='labelcss'>
                                        {
                                        this.props.type==="detail"?<span style={{width:220,display:"inline-block"}}><Avatar src={field}/></span>:
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