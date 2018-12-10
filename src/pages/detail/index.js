import React from 'react'
import {Card,Form,Button,Modal,message} from 'antd'
import Super from "./../../super"
import './index.css'
import 'moment/locale/zh-cn';
import EditTable from './../../pages/EditTable'
import BaseInfoForm from './../../components/BaseForm/BaseInfoForm'

let storage=window.sessionStorage;
let totalcode=[]
export default class Detail extends React.Component{
    state={
        type:this.props.type,
        visible: false,
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
            Super.super({
                url:`/api/entity/detail/${menuId}/${code}`,  
                data:{
                    isShowLoading:true
                }                 
            }).then((res)=>{
                let obj = eval(res); 
                storage[typecode]=JSON.stringify(obj); //存储一条数据
                let detailsList=res.entity.fieldGroups; 
                this.toDetails(res,this.props.type)
                this.renderList(detailsList)
            })
        }else{  
            //console.log("已存") 
            let data=JSON.parse(storage[typecode]);
            let detailsList=data.entity.fieldGroups;
            this.renderList(detailsList)
            this.toDetails(data,this.props.type)
        }     
    }
    toDetails=(data,type)=>{
		let detailsTitle="";
		let moduleTitle=data.module.title;
		let entityTitle=data.entity.title;
		//console.log(detailsList)
		if(type==="detail"){
			detailsTitle=entityTitle?moduleTitle+"-"+entityTitle+"-详情":moduleTitle+"-详情";
		}else{
			detailsTitle=entityTitle?moduleTitle+"-修改-"+entityTitle:moduleTitle+"-修改";
		}			
		this.setState({ 
			detailsTitle,
		});
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
            return false
        })           
        this.setState({
            detailsList,
            formList,           
            itemDescs,
            columns,
            dataSource,
            cardTitle
        })
    }
    initDetailsList=()=>{ 
        const detailsList=this.state.detailsList;
        const detailsItemList=[];
        if(this.props.type==="edit"){
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
                        if(totalcode.indexOf(it)===-1){
                            storage[it]=JSON.stringify(item)
                            totalcode.push(it)
                        }
                        return false
                    })
                    return false
                })
                return false            
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
                return false      					
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
                    list["key"]=count;
                    list["code"]=code;
                    list[fieldName]=fieldValue;
                    return false
                })
                res.push(list) 
                return false
                //console.log(res)             
            })
            return res        
        }
    }
    handleOk = (e) => {
        e.preventDefault();
        this.child.handleBaseInfoSubmit()
        let records=[]
        let menuId=this.props.menuId;
        let code=this.props.code;          
        let baseInfo={}
        let newRecord={}
        if(storage.getItem("baseInfo")){
            baseInfo=JSON.parse(storage.getItem("baseInfo"))
        }
        totalcode.map((item)=>{
            if(storage.getItem(item)){
                let record=JSON.parse(storage.getItem(item))
                records.push(record)
            }
            return false
        })
        if(storage.getItem("newRecord")){
            newRecord=JSON.parse(storage.getItem("newRecord"))
        }
        let values=Object.assign(baseInfo, ...records, newRecord)
        //console.log(values)
        Super.super({
            url:`/api/entity/update/${menuId}`,  
            data:{
                isShowLoading:true,
                "唯一编码":code,
                ...values,
            }                 
        }).then((res)=>{
            console.log(res)
            message.success("提交成功！")
        })
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
                <h3>{this.state.detailsTitle}</h3> 
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
