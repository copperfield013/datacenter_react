import React from 'react'
import {Card,Form,Button,Modal,message,Icon,Drawer,Timeline} from 'antd'
import Super from "./../../super"
import Units from './../../units/unit'
import './index.css'
import 'moment/locale/zh-cn';
import EditTable from './../../pages/EditTable'
import BaseInfoForm from './../../components/BaseForm/BaseInfoForm'

let storage=window.sessionStorage;
let totalcode=[]
export default class Detail extends React.Component{
    state={
        count:0,
        visibleModal: false,
        visibleDrawer:false,
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
                //console.log(res)
                let obj = eval(res); 
                storage[typecode]=JSON.stringify(obj); //存储一条数据
                let detailsList=res.entity.fieldGroups; 
                this.toDetails(res,this.props.type)
                this.renderList(detailsList)
                if(res.history){                   
                    let detailHistory=this.renderHistoryList(res.history);
                    this.setState({
                        detailHistory
                    }) 
                }
            })
        }else{  
            //console.log("已存") 
            let data=JSON.parse(storage[typecode]);
            let detailsList=data.entity.fieldGroups;
            this.renderList(detailsList)
            this.toDetails(data,this.props.type) 
            if(data.history){
                let detailHistory=this.renderHistoryList(data.history);
                this.setState({
                    detailHistory
                })
            }          
        }               
    }
    renderHistoryList=(data)=>{
		return data.map((item)=>{
            let color=item.current?"red":"blue";
			return <Timeline.Item color={color}>
                        {Units.formateDate(item.time)}<br/>
                        {`操作人`+item.userName}
                        {
                          item.current?"":<Button style={{marginLeft:10}} id={item.id} type="primary" size="small" onClick={this.toHistory}>查看</Button>
                        }                   
				    </Timeline.Item>
		})
    }
    toHistory=(e)=>{
        let historyId=e.target.getAttribute("id");
        let menuId=this.props.menuId;
        let code=this.props.code;
        Super.super({
            url:`/api/entity/detail/${menuId}/${code}`,  
            data:{
                isShowLoading:true,
                historyId,
            }                 
        }).then((res)=>{
            let detailsList=res.entity.fieldGroups; 
            this.toDetails(res,this.props.type)
            this.renderList(detailsList)
            if(res.history){                   
                let detailHistory=this.renderHistoryList(res.history);
                this.setState({
                    detailHistory
                }) 
            }
        })

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
            moduleTitle,
		});
	}
    renderList=(detailsList)=>{
        //console.log("渲染")       
        let itemDescs=[]
        let columns=[]
        let dataSource=[]
        let cardTitle=[]
        let formList=detailsList[0].fields;    
        let firstCard=""          
        detailsList.map((item)=>{
            if(item.descs){
                cardTitle.push(item.title)
                itemDescs.push(item.descs)
                columns.push(this.renderColumns(item.descs))
                dataSource.push(this.requestList(item))
            }else if(item.fields){
                firstCard=item.title
            }
            return false
        })        
        this.setState({
            detailsList,
            formList,           
            itemDescs,
            columns,
            dataSource:this.props.flag?"":dataSource,
            cardTitle,
            firstCard,
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
                if(this.state.dataSource){
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
                }               
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
        this.setState({
            count :this.state.count+data.array.length
        })
        if(data.array){
            data.array.map((item)=>{
                let code=item.code;
                let list={};              
                item.fields.map((it,index)=>{
                    let fieldName=it.fieldName;
                    let fieldValue=it.value;
                    list["key"]=index;
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
    showHistory=()=>{
        this.setState({
            visibleDrawer: true,
        });
    }
    onClose = () => {
        this.setState({
            visibleDrawer: false,
        });
    }
    fresh=()=>{
        
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
        console.log(values)
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
            visibleModal: false,
        });
      }
    
    handleCancel = (e) => {
        this.setState({
            visibleModal: false,
        });
    }
    showModal = () => {
        this.setState({
            visibleModal: true,
        });
    }
    //调用子组件方法
	onRef=(ref)=>{
		this.child=ref
    }
    render(){
        return(
            <div>
                <h3>
                    {
                        this.props.flag?this.state.moduleTitle+"--创建":this.state.detailsTitle
                    }   
                    {
                        this.props.type==="detail"?
                        <div className="fr">
                            <Button className="hoverbig" title="导出"><Icon type="upload" /></Button>
                            <Button className="hoverbig" title="查看历史" onClick={this.showHistory}><Icon type="schedule" /></Button>                                                      
                            <Button className="hoverbig" title="刷新" onClick={this.fresh}><Icon type="sync" /></Button>
                        </div>
                        :
                        <div className="fr">
                            <Button className="hoverbig" title="融合模式"><Icon type="bulb" /></Button>
                            <Button className="hoverbig" title="刷新"><Icon type="sync" /></Button>
                        </div>
                    }               
                    
                </h3> 
                <Card title={this.state.firstCard}>
                    <BaseInfoForm 
                        formList={this.state.formList} 
                        type={this.props.type} 
                        onRef={this.onRef}
                        flag={this.props.flag}
                        />
                </Card>
                
                <div>
                    <Form layout="inline">
                        {this.initDetailsList()}
                    </Form>
                </div>
                <Modal
                    visible={this.state.visibleModal}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="确认"
                    cancelText="取消"
                    >
                    <p>确认提交数据吗</p>
                </Modal>
                <Drawer
                    title="查看历史"
                    closable={false}
                    onClose={this.onClose}
                    visible={this.state.visibleDrawer}
                    width={400}
                    >
                    <Timeline mode="alternate" pending="没有更多了...">
                        {this.state.detailHistory}
                    </Timeline>
                </Drawer>
            </div>
        )
    }
}
