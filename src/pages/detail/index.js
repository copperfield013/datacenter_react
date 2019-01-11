import React from 'react'
import superagent from 'superagent'
import {Button,Modal,message,Icon,Drawer,Timeline,Switch,Select,InputNumber,Input,Popover} from 'antd'
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
let files=[]
let origData={}
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
    }
    componentWillUnmount(){      
        records=[] //切换清空原有数据
        files=[]
        origData={}
    }
    loadRequest=()=>{
        const typecode=this.props.type+this.props.code;
        this.setState({loading:true})
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
            this.detailTitle(res,this.props.type)
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
    requestLists=()=>{
        const typecode=this.props.type+this.props.code;	
        if(!storage[typecode]){//判断是否存储数据,tab切换减少请求
            //console.log("未存")
            this.loadRequest()          
        }else{  
            //console.log("已存") 
            const data=JSON.parse(storage[typecode]);
            const detailsList=data.entity.fieldGroups;
            this.renderList(detailsList)
            this.detailTitle(data,this.props.type) 
            if(data.history){
                const detailHistory=this.renderHistoryList(data.history);
                this.setState({
                    detailHistory
                })
            }
            this.setState({loading:false})          
        }              
    }
    renderHistoryList=(data)=>{
		return data.map((item,index)=>{
            const color=item.current?"red":"blue";
			return <Timeline.Item color={color} key={index}>
                        {Units.formateDate(item.time)}<br/>
                        {`操作人`+item.userName}
                        {
                          item.current?"":<Button 
                                                style={{marginLeft:10}} 
                                                id={item.id} 
                                                type="primary" 
                                                size="small" 
                                                onClick={this.toHistory}
                                                >查看</Button>
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
            this.detailTitle(res,this.props.type)
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
    detailTitle=(data,type)=>{
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
                columns.push(this.renderColumns(item.descs,item.composite))
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
            dataSource,
            cardTitle,
            formTitle,
        })
    }
    renderColumns=(data,obj)=>{
        let isRelation=false;
        const type=this.props.type
        if(obj && obj.addType===5){//判断是否有关系属性
            isRelation=true; 
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
            const order={
                title: '序号',
                key: 'order',
                render: (text, record,index) => (
                    <label>{index+1}</label>
                    ),
            } 
            data.unshift(order)
            if(type==="edit"){
                const act={
                    title: '操作',
                    key: 'action',
                    render: (record) => (
                    <label><Button type='danger' icon="delete" size="small" onClick={()=>this.removeList(record)}></Button></label>
                    ),
                }  
                data.push(act) 
            }
            return data
		}		
    }
    removeList=(record)=>{
        const deleKey=record.key
        const dataSource =[...this.state.dataSource];      
        const newDataSource=[]
        dataSource.map((item)=>{
            const newData=[]
            item.map((it)=>{
                if(it.key!==deleKey){
                    newData.push(it)
                }
                return false
            })
            newData.map((item,index)=>{
                let list={}
                let ins=newData.indexOf(item)
                for(let k in item){
                    let nk=k.replace(/\[.*?\]/g,`[${index}]`)
                    list[nk]=item[k]
                }
                newData.splice(ins, 1,list)
                return false
            })
            newDataSource.push(newData)           
            return false
        })
        // for(let i=0;i<dataSource.length;i++){
        //         let list={}
        //         let ins=records.indexOf(item[i])
        //         for(let k in item[i]){
        //             let nk=k.replace(/\[.*?\]/g,`[${i}]`)
        //             list[nk]=item[i][k]
        //         }
        //         records.splice(ins, 1,list)
        //         console.log(i)
        // }
        this.setState({
            dataSource:newDataSource
        })
        records.map((item)=>{
            let ins=records.indexOf(item)
            if(item.key===deleKey){
                records.splice(ins, 1); 
            }        
            return false
        })
        //console.log(records)
    }
    handleChange = (name,e) =>{ //更改原来有值的datasource
        origData[name]=e.target.value
        this.removeOrivalue()  
    }
    handlleNumber=(name,value)=>{
        origData[name]=value;
        this.removeOrivalue()
    }
    removeOrivalue=()=>{
        records.map((item)=>{
            for(let k in item){
                for(let key in origData){
                    if(k===key){
                        item[k]=origData[key]
                    }
                }
            }
            return false
        }) 
    }
    requestTableList=(data)=>{
        const res=[]  
        const modelType=this.props.type;    
        if(data.array){
            data.array.map((item,index)=>{  
                const list={};   
                const code=item.code;
                list["key"]=code;        
                list[data.title+`[${index}].唯一编码`]=code;      
                if(data.composite.relationKey){
                    list[data.title+`[${index}].$$label$$`]=item.relation;    
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
                            list[fieldName]=<Input defaultValue={fieldValue} onChange={(e)=>this.handleChange(data.title+`[${index}].`+title,e)}/>;
                        }else if(fieldType==="file"){
                            list[fieldName]=<div className="editPic"><NewUpload fieldValue={fieldValue} onChange={(file)=>this.uploadChange(file,[data.title+`[${index}].`+title])}/> </div>                                          
                        }else if(fieldType==="decimal"){
                            list[fieldName]=<InputNumber defaultValue={fieldValue} onChange={(e)=>this.handlleNumber(data.title+`[${index}].`+title,e)}/>
                        }
                    }
                    list[data.title+`[${index}].`+title]=fieldValue?fieldValue:"";
                    return false
                })
                res.push(list) 
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
    handleOk = (e) => {
        e.preventDefault();
        this.setState({loading:true})
        const tokenName=storage.getItem('tokenName')
        const formData = new FormData();
        const menuId=this.props.menuId;
        const code=this.props.code;          
        const baseInfo=this.state.baseValue;

        formData.append('唯一编码', this.props.flag?"":code);
        formData.append('%fuseMode%', this.state.fuseMode);
        for(let k in baseInfo){
            formData.append(k, baseInfo[k]);
        }
        
        let res={}
        this.state.cardTitle.map((item)=>{ //添加$$flag$$
            const list={}
            list[`${item}.$$flag$$`]=true;
            records.push(list)
            return false
        })
        records.map((item)=>{
            for(let k in item){
                if(item[k]){
                    res[k]=item[k] //去重
                }
            }          
            return false
        })  
        if(res){
            for(let k in res){
                if(k!=="key" && k!=="关系" && typeof res[k]!=="object"){ //删除无意义的值
                    formData.append(k, res[k]);
                }
            }
        }
        files.map((item)=>{
            for(let k in item){
                if(item[k]){
                    formData.append(k, item[k]);
                }
                //console.log(item[k])
            }
            return false
        })
        const loading=document.getElementById('ajaxLoading')
        loading.style.display="block"
        superagent
            .post(`/api/entity/curd/update/${menuId}`)
            .set({"datamobile-token":tokenName})
            .send(formData)
            .end((req,res)=>{
                loading.style.display="none"
                if(res.body.status==="suc"){
                    message.success("保存成功！")
                    const code=this.props.code;	
                    storage.removeItem("edit"+code)//删除数据，这样再次进入页面会重新请求
                    storage.removeItem("detail"+code)
                    const typecode=this.props.type+this.props.code;
                    this.props.remove(typecode)
                }else{
                    message.error(res.body.status)
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
                const loading=document.getElementById('ajaxLoading')
                loading.style.display="block"
                Super.super({
                    url:`/api/entity/export/export_detail/${menuId}/${code}`,                 
                }).then((res)=>{
                    loading.style.display="none"
                    if(res.status==="suc"){
                        Units.downloadFile(`/api/entity/export/download/${res.uuid}`)
                    }else{
                        message.error(res.status)
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
        this.child.handleBaseInfoSubmit() //获取BaseInfo数据
        //console.log(records)
        this.setState({
            visibleModal: true,
        });
    }
    //调用子组件方法
	onRef=(ref)=>{
		this.child=ref
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
    uploadChange=(file,name)=>{
        if(file){
            const tip={}
            tip[name]=file
            files.push(tip)
        }
    }
    callbackdatasource=(dataSource)=>{
        dataSource.map((item)=>{            
            records.push(item)
            return false
        })
    }
    handleMenuClick=(e)=>{
        console.log('click', e);
      }
      
    render(){
        const content = (
            <div className="btns">
              <Button>Actions</Button>
              <Button>Actions</Button>
              <Button>Actions</Button>
              <Button>Actions</Button>
            </div>
          );
        return(
            <div className="detailPage">
                <h3>
                    {
                        this.props.flag?this.state.moduleTitle+"--创建":this.state.detailsTitle
                    }   
                    {
                        this.props.type==="detail"?
                        <div className="fr">
                            <Button className="hoverbig" title="导出" onClick={this.exportDetail}><Icon type="upload" /></Button>
                            <Button className="hoverbig" title="查看历史" onClick={this.showHistory}><Icon type="schedule" /></Button>                                                      
                            <Button className="hoverbig" title="刷新" onClick={this.loadRequest}><Icon type="sync" /></Button>
                        </div>
                        :
                        <div className="fr">
                            <div className="buttonGroup">
                            <Button>Actions</Button>
                            <Popover placement="leftTop" content={content} trigger="click">
                                <Button>
                                    <Icon type="swap" />Actions
                                </Button>
                            </Popover>
                            <Button 
                                type='primary' 
                                icon="cloud-upload" 
                                className="submitBtn" 
                                onClick={this.showModal} key="btn" 
                                style={{background:this.state.fuseMode===true?"#001529":""}}
                                >保存</Button>

                            </div>
                            <Switch checkedChildren="开" unCheckedChildren="关" style={{marginRight:10}} title="融合模式" onChange={this.fuseMode}/>
                            <Button className="hoverbig" title="刷新" onClick={this.loadRequest}><Icon type="sync" /></Button>
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
                    flag={this.props.flag}
                    uploadChange={this.uploadChange}
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
