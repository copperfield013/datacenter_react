import React from 'react'
import {Card,Table,Form,Input,Button,message,Modal,Avatar,Upload,Icon,Select,DatePicker,Popconfirm} from 'antd'
import axios from "./../../axios"
import './index.css'
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import EditTable from './../../pages/EditTable'
import BaseInfoForm from './../../components/BaseForm/BaseInfoForm'
const Option = Select.Option;
const FormItem=Form.Item

var storage=window.sessionStorage;
var totalcode=[]
export default class Detail extends React.Component{
    state={
        type:this.props.type,
        count:0,
        columns:[],
        dataSource:[],
        selectedRowKeys:[],
        visible: false,
        value:{},
    }
    componentWillMount(){
        this.requestLists()
        totalcode=[] //切换清空原有数据
    }
    requestLists=()=>{
        let typecode=this.props.type+this.props.code;
        if(!storage[typecode]){//判断是否存储数据
            //console.log("未存")
            let menuId=this.props.menuId;
            let code=this.props.code;
            axios.ajax({
                url:`/api/entity/detail/${menuId}/${code}`,
                data:{
                    isShowLoading:true
                }
            }).then((res)=>{
                let obj = eval(res); 
                storage[typecode]=JSON.stringify(obj); //存储一条数据
                let detailsList=res.entity.fieldGroups || "";          
                this.renderList(detailsList)
            })
        }else{  
            //console.log("已存") 
            let data=JSON.parse(storage[typecode]);
            let detailsList=data.entity.fieldGroups || "";
            this.renderList(detailsList)
        }     
    }
    renderList=(detailsList)=>{
        //console.log("渲染")       
        let itemDescs=[]
        let columns=[]
        let dataSource=[]
        let cardTitle=[]
        let formList=detailsList[0].fields;              
            detailsList.map((item)=>{
                if(item.descs){
                    cardTitle.push(item.title)
                    itemDescs.push(item.descs)
                    columns.push(this.renderColumns(item.descs))
                    dataSource.push(this.requestList(item))
                }
                this.setState({
                    itemDescs,
                    columns,
                    dataSource,
                    cardTitle
                })
            })           
            this.setState({
                detailsList,
                formList,
            })
    }
    initDetailsList=()=>{ 
        const detailsList=this.state.detailsList;
        const detailsItemList=[];
        if(this.props.type=="edit"){
            let btn=<Button type='primary' icon="cloud-upload" className="submitBtn" onClick={this.showModal} key="btn">提交</Button>
            detailsItemList.push(btn)
        }

        if(detailsList && detailsList.length>0){
            this.state.itemDescs.map((item,index)=>{
                let cardTitle=this.state.cardTitle[index]
                const RANGE=<Card title={cardTitle} key={cardTitle}>
                                <EditTable 
                                    type={this.props.type}
                                    pagination={false}
                                    bordered
                                    columns={this.state.columns[index]}
                                    dataSource={this.state.dataSource[index]}
                                    item={item}
                                    count={this.state.count}
                                />
                            </Card>
                detailsItemList.push(RANGE)
                let submitcode=[];
                this.state.dataSource[index].map((item)=>{
                    if(item.code){
                        submitcode.push(item.code);
                    }  
                    
                    submitcode.map((it)=>{
                        if(totalcode.indexOf(it)==-1){
                            totalcode.push(it)
                            storage[it]=JSON.stringify(item)
                        }
                    })  
                })
                              
            })         
        }
        return detailsItemList;
    }
    renderColumns=(data)=>{
		if(data){
			data.map((item,index)=>{
                let fieldName=item.fieldName;
                item["dataIndex"]=fieldName;	
                item["key"]=index;       					
            })
            //console.log(data)
            return data
		}		
    }
    requestList=(data)=>{
        let res=[]      
        const count = this.state.count;
        this.setState({
            count :this.state.count+data.array.length
        })
        if(data.array){
            data.array.map((item)=>{
                let code=item.code;
                let list={};              
                item.fields.map((it)=>{
                    let fieldName=it.fieldName;
                    let fieldValue=it.value;
                    let fieldId=it.fieldId;
                    list["key"]=count;
                    list["code"]=code;
                    list[fieldName]=fieldValue;
                })
                res.push(list) 
                //console.log(res)             
            })
            return res        
        }
    }
    handleOk = (e) => {
        e.preventDefault();
        this.child.handleBaseInfoSubmit()
        let result=[]
        let menuId=this.props.menuId;
        let code=this.props.code;
            // axios.ajax({
            //     url:`/api/entity/update/${menuId}`,
            //     data:{
            //         isShowLoading:true,
            //         "唯一编码":code,
            //         "实体字段":values			
            //     }
            // }).then((res)=>{
            //      console.log(res)
            //       message.success("提交成功！")
            // })

        let baseInfo=JSON.parse(storage.getItem("baseInfo"))
        if(baseInfo){
            result.push(baseInfo)
        }
        totalcode.map((item)=>{
        let record=JSON.parse(storage.getItem(item))
            if(record){
                result.push(record)
            }
        })
        let newRecord=JSON.parse(storage.getItem("newRecord"))
        if(newRecord){
            result.push(newRecord)
        }
        console.log(result)
        this.setState({
          visible: false,
        });
      }
    
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    //调用子组件方法
	onRef=(ref)=>{
		this.child=ref
    }
    render(){
        return(
            <div>
                <h3>{this.props.detailsTitle}</h3> 
                <Card title="基本信息">
                    <BaseInfoForm 
                        formList={this.state.formList} 
                        type={this.state.type} 
                        onRef={this.onRef}
                        />
                </Card>
                
                <div>
                    <Form layout="inline">
                        {this.initDetailsList()}
                    </Form>
                </div>
                <Modal
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="确认"
                    cancelText="取消"
                    >
                    <p>确认提交数据吗</p>
                </Modal>
            </div>
        )
    }
}
