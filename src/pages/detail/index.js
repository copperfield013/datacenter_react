import React from 'react'
import superagent from 'superagent'
import {Button,Modal,message,Icon,Drawer,Timeline,Switch,Select,InputNumber,Input} from 'antd'
import Super from "./../../super"
import Units from '../../units'
import './index.css'
import 'moment/locale/zh-cn';
import EditTable from './../../components/EditTable/editTable'
import FormCard from './../../components/FormCard'
import NewUpload from './../../components/NewUpload'
const confirm = Modal.confirm;
const Option = Select.Option;

const storage=window.sessionStorage;
let records=[]
export default class Detail extends React.Component{
    state={
        visibleModal: false,
        visibleDrawer:false,
        loading:false,
        visibleExport:false,
        fuseMode:false,
    }
    componentWillMount(){
        this.requestLists()
        records=[] //切换清空原有数据
    }
    requestLists=()=>{
        this.setState({loading:true})
        const typecode=this.props.type+this.props.code;	
        const menuId=this.props.menuId;
        const code=this.props.code;
        Super.super({
            url:`/api/entity/curd/detail/${menuId}/${code}`,       
            data:{
                isShowLoading:true
            }          
        }).then((res)=>{
            //console.log(res)
            storage[typecode]=JSON.stringify(res); //存储一条数据
            const detailsList=res.entity.fieldGroups; 
            this.toDetails(res,this.props.type)
            this.renderList(detailsList)
            if(res.history){                   
                const detailHistory=this.renderHistoryList(res.history);
                this.setState({
                    detailHistory
                }) 
            }
            this.setState({loading:false})
        })             
    }
    renderHistoryList=(data)=>{
		return data.map((item,index)=>{
            const color=item.current?"red":"blue";
			return <Timeline.Item color={color} key={index}>
                        {Units.formateDate(item.time)}<br/>
                        {`操作人`+item.userName}
                        {
                          item.current?"":<Button style={{marginLeft:10}} id={item.id} type="primary" size="small" onClick={this.toHistory}>查看</Button>
                        }                   
				    </Timeline.Item>
		})
    }
    toHistory=(e)=>{
        this.setState({loading:true})
        const historyId=e.target.getAttribute("id");
        const menuId=this.props.menuId;
        const code=this.props.code;
        Super.super({
            url:`/api/entity/curd/detail/${menuId}/${code}`,  
            data:{
                historyId,
            }                 
        }).then((res)=>{
            const detailsList=res.entity.fieldGroups; 
            this.toDetails(res,this.props.type)
            this.renderList(detailsList)
            if(res.history){                   
                const detailHistory=this.renderHistoryList(res.history);
                this.setState({
                    detailHistory
                }) 
            }
            this.setState({loading:false})
        })

    }
    toDetails=(data,type)=>{
		let detailsTitle="";
		const moduleTitle=data.module.title;
		const entityTitle=data.entity.title;
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
        const itemDescs=[]
        const columns=[]
        const dataSource=[]
        const cardTitle=[]
        const formList=[]  
        const formTitle=[]  
        detailsList.map((item)=>{
            if(item.descs){
                cardTitle.push(item.title)
                itemDescs.push(item)
                columns.push(this.renderColumns(item.descs,item.array))
                dataSource.push(this.requestTableList(item))
            }else if(item.fields){
                formList.push(item.fields)
                formTitle.push(item.title)
            }     
            return false
        }) 
        let scrollIds=[]
        scrollIds.push(...formTitle)
        scrollIds.push(...cardTitle)
        this.props.scrollIds(scrollIds)
        this.setState({
            detailsList,
            formList,           
            itemDescs,
            columns,
            dataSource:this.props.flag?[]:dataSource,
            cardTitle,
            formTitle,
        })
    }
    renderColumns=(data,array)=>{
        let isRelation=false;
        if(array){
            array.map((item)=>{
                if(item.relation){
                    isRelation=true;
                }
                return false
            })
        }
		if(data){
			data.map((item,index)=>{
                let fieldName=item.fieldName;
                item["dataIndex"]=fieldName;	
                item["key"]=index; 
                return false      					
            })           
            if(isRelation===true){           
                let rela={}
                rela["dataIndex"]="关系"
                rela["title"]="关系"
                data.unshift(rela)
            }
            return data
		}		
    }
    handleChange = () =>{

    }
    requestTableList=(data)=>{
        const res=[]
        if(data.array){
            data.array.map((item,index)=>{
                const code=item.code;
                const list={};  
                const modelType=this.props.type;
                list[data.title+".$$flag$$"]=true;  
                list[data.title+`[${index}].唯一编码`]=code;      
                if(data.composite.relationKey){
                    list[data.title+".$$label$$"]=item.relation;    
                    list["关系"]=modelType==="edit"?<Select defaultValue={data.composite.relationSubdomain[0]}>                                   
                                    {data.composite.relationSubdomain.map((item,index)=>{
                                            return <Option value={item} key={index}>{item}</Option>
                                        })}
                                </Select>:item.relation
                }     
                item.fields.map((it)=>{
                    const title=it.title;
                    const fieldName=it.fieldName
                    const fieldValue=it.value;     
                    const fieldType=it.type;
                    if(modelType==="detail"){
                        if(fieldType==="file"){
                            list[fieldName]=fieldValue?<span className="downEditPic"><img style={{width:55}} src={`/file-server/${fieldValue}`} alt="图片加载失败"/>
                            <a href={`/file-server/${fieldValue}`} download="logo.png"><Icon type="download"/></a></span>
                            :"无文件"
                        }else{
                            list[fieldName]=fieldValue?fieldValue:"";
                        }                        
                    }else{
                        if(fieldType==="text"){
                            list[fieldName]=<Input defaultValue={fieldValue} onChange={this.handleChange}/>;
                        }else if(fieldType==="file"){
                            list[fieldName]=<div className="editPic"><NewUpload fieldValue={fieldValue} fieldName={fieldName}/> </div>                                          
                        }else if(fieldType==="decimal"){
                            list[fieldName]=<InputNumber defaultValue={fieldValue}/>
                        }
                    }
                    list[data.title+`[${index}].`+title]=fieldValue?fieldValue:"";
                    list["key"]=code;
                    return false
                })
                res.push(list) 
                //console.log(res)
                return false             
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
        this.requestLists()
    }
    handleOk = (e) => {
        e.preventDefault();
        this.setState({loading:true})
        const tokenName=storage.getItem('tokenName')
        const formData = new FormData();
        const menuId=this.props.menuId;
        const code=this.props.code;          
        const baseInfo=this.state.baseValue;

        formData.append('唯一编码', code);
        formData.append('%fuseMode%', this.state.fuseMode);
        for(let k in baseInfo){
            formData.append(k, baseInfo[k]);
        }
        records.map((item)=>{
            for(let k in item){
                if(k!=="key" && k!=="关系" && typeof item[k]!=="object"){ //删除无意义的key值
                    formData.append(k, item[k]);
                }
            }
            return false
        })
        superagent
            .post(`/api/entity/curd/update/${menuId}`)
            .set({"datamobile-token":tokenName})
            .send(formData)
            .end((req,res)=>{
                if(res.body.status==="suc"){
                    message.success("保存成功！")
                }else{
                    message.success(res.body.status)
                }
            })
        this.setState({
            visibleModal: false,
            loading:false
        });
      }
    baseInfo=(baseValue)=>{
        //console.log(baseValue)
        this.setState({
            baseValue
        });
    }
    exportDetail=()=>{
        const menuId=this.props.menuId;
        const code=this.props.code;  
        confirm({
            title: '确认导出当前详情页？',            
            okText: "确认",
            cancelText: "取消",
            onOk() {
                Super.super({
                    url:`/api/entity/export/export_detail/${menuId}/${code}`,                 
                }).then((res)=>{
                    if(res.status==="suc"){
                        Units.downloadFile(`/api/entity/export/download/${res.uuid}`)
                    }
                })
            },
          });  
        
    }
    handleCancel = () => {
        this.setState({
            visibleModal: false,
        });
    }
    showModal = () => {
        this.child.handleBaseInfoSubmit()
        this.setState({
            visibleModal: true,
        });
    }
    //调用子组件方法
	onRef=(ref)=>{
		this.child=ref
    }
    callbackRecords=(data)=>{
        console.log(data)
        this.setState({
            totalcode:data
        });
    }
    scrollToAnchor = (anchorName) => {
        if (anchorName) {
            let anchorElement = document.getElementById(anchorName);
            if(anchorElement) { anchorElement.scrollIntoView({behavior: 'smooth'})}
        }
      }
    fuseMode=(checked)=>{
        this.setState({
            fuseMode:checked
        })
    }
    callbackdatasource=(dataSource)=>{
        dataSource.map((item)=>{
            records.push(item)
            return false
        })
    }
    deleSource=(deleKey)=>{
        records.map((item)=>{
            let index=records.indexOf(item)
            if(item.key===deleKey){
                records.splice(index, 1); 
            }
            return false
        })
        //console.log(records)
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
                            <Button className="hoverbig" title="导出" onClick={this.exportDetail}><Icon type="upload" /></Button>
                            <Button className="hoverbig" title="查看历史" onClick={this.showHistory}><Icon type="schedule" /></Button>                                                      
                            <Button className="hoverbig" title="刷新" onClick={this.fresh}><Icon type="sync" /></Button>
                        </div>
                        :
                        <div className="fr">
                            <Button type='primary' icon="cloud-upload" className="submitBtn" onClick={this.showModal} key="btn" style={{background:this.state.fuseMode===true?"#001529":""}}>保存</Button>
                            <Switch checkedChildren="开" unCheckedChildren="关" style={{marginRight:10}} title="融合模式" onChange={this.fuseMode}/>
                            <Button className="hoverbig" title="刷新" onClick={this.fresh}><Icon type="sync" /></Button>
                        </div>
                    }               
                    
                </h3>
                <FormCard 
                    title={this.state.formTitle} 
                    formList={this.state.formList}
                    type={this.props.type} 
                    flag={this.props.flag}
                    baseInfo={this.baseInfo}
                    loading={this.state.loading}
                    onRef={this.onRef}
                />
                <EditTable 
                    detailsList={this.state.detailsList}
                    type={this.props.type}
                    columns={this.state.columns}
                    dataSource={this.state.dataSource}
                    cardTitle={this.state.cardTitle}
                    itemDescs={this.state.itemDescs}
                    callbackdatasource={this.callbackdatasource}
                    deleSource={this.deleSource}
                />
                <Modal
                    visible={this.state.visibleModal}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="确认"
                    cancelText="取消"
                    >
                    <p>确认提交数据吗？</p>
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
                {
                    !this.state.cardTitle||this.state.cardTitle.length<1?"":
                    <div className="rightBar">
                    <ul>
                        {
                            this.state.formTitle.map((item)=>{
                                return <li onClick={()=>this.scrollToAnchor(item)} key={item}>{item}</li>
                            })
                        }
                        {
                            this.state.cardTitle?
                            this.state.cardTitle.map((item)=>{
                                return <li onClick={()=>this.scrollToAnchor(item)} key={item}>{item}</li>
                            }):""
                        }
                    </ul>
                </div>
                }
                
            </div>
        )
    }
}
