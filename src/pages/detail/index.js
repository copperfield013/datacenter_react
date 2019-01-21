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
let newRecord=[]
export default class Detail extends React.Component{
    state={
        visibleModal: false,
        visibleDrawer:false,
        loading:false,
        visibleExport:false,
        fuseMode:false,
        searchText:"",
        scrollIds:[]
    }
    componentDidMount(){
        this.handleNav()
    }
    componentWillMount(){
        this.requestLists()
    }
    componentWillUnmount(){      
        records=[] //切换清空原有数据
        files=[]
        origData={}
        newRecord=[]
    }
    loadRequest=()=>{
        const { menuId,code,type }=this.props
        const typecode=type+code;
        this.setState({loading:true})
        Super.super({
            url:`/api/entity/curd/detail/${menuId}/${code}`,       
            data:{
                isShowLoading:true
            }          
        }).then((res)=>{
            storage[typecode]=JSON.stringify(res); //存储一条数据
            const detailsList=res.entity.fieldGroups; 
            this.detailTitle(res,type)
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
        const { code,type }=this.props
        const typecode=type+code;
        if(!storage[typecode]){//判断是否存储数据,tab切换减少请求
            //console.log("未存")
            this.loadRequest()          
        }else{  
            //console.log("已存") 
            const data=JSON.parse(storage[typecode]);
            const detailsList=data.entity.fieldGroups;
            this.renderList(detailsList)
            this.detailTitle(data,type) 
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
        const { menuId,code,type }=this.props
        this.setState({loading:true})
        const historyId=e.target.getAttribute("id");
        Super.super({
            url:`/api/entity/curd/detail/${menuId}/${code}`,  
            data:{
                historyId,
            }                 
        }).then((res)=>{
            const detailsList=res.entity.fieldGroups; 
            this.detailTitle(res,type)
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
            scrollIds
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
                const fieldName=item.fieldName;
                item["dataIndex"]=fieldName;	
                item["key"]=index;                
                if(this.props.type==="detail"){
                    if(fieldName.indexOf("价格")>-1 || fieldName.indexOf("工号")>-1){
                        item["sorter"]=(a, b) => parseInt(a[fieldName]) - parseInt(b[fieldName]); 
                    }else{
                        item["sorter"]=(a, b) => a[fieldName].length - b[fieldName].length; 
                    }
                }           
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
                width:65,
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
        this.setState({
            dataSource:newDataSource
        })
        records=[]
        newDataSource.map((item)=>{
            item.map((it)=>{
                records.push(it)
                return false
            })
            return false
        })
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
        const { menuId,code,flag,type,activeKey }=this.props       
        const { baseValue,fuseMode,cardTitle }=this.state
        formData.append('唯一编码', flag?"":code);
        formData.append('%fuseMode%',fuseMode);
        for(let k in baseValue){
            formData.append(k, baseValue[k]);
        }
        
        let res={}
        cardTitle.map((item)=>{ //添加$$flag$$
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
            }
            return false
        })
        newRecord.map((item)=>{
            for(let k in item){
                if(k!=="key" && item[k]){
                    formData.append(k, item[k]);
                }
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
                    const typecode=type+code;
                    storage.removeItem("edit"+code)//删除数据，这样再次进入页面会重新请求
                    storage.removeItem("detail"+code)
                    flag?this.props.remove(activeKey):this.props.remove(typecode) //保存成功，关闭页面
                    this.props.fresh("保存成功！") //保存成功，刷新列表页面，并提醒
                }else{
                    message.error(res.body.status)
                    this.loadRequest()
                }
            })
        this.setState({
            visibleModal: false,
            loading:false
        });
      }
    baseInfo=(baseValue)=>{
        //console.log(baseValue)
        if(baseValue){           
        this.setState({
                visibleModal: true,
            baseValue
        });
    }
    }
    exportDetail=()=>{
        const {menuId,code}=this.props
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
    newRecords=(dataSource)=>{
        dataSource.map((item)=>{            
            newRecord.push(item)
            return false
        })
    }
    handleMenuClick=(e)=>{
        console.log('click', e);
      }
    handleNav=()=>{
        const obj=document.getElementsByClassName("main")[0]		
		const scrollTop  = obj.scrollTop;  //页面滚动高度
        const clientHeight   = obj.clientHeight  ;
        const scrollIds=this.state.scrollIds;
		const mainTopArr = []; 
		let k=0;
		if(scrollIds){	//滑动锁定导航
			for(let i=0;i<scrollIds.length;i++){
                let node=document.getElementById(scrollIds[i])
				if(node){
					let top = Math.floor(node.offsetTop); 	
					mainTopArr.push(top);
				}		
			} 
			//console.log(mainTopArr)
			for(let i=0;i<mainTopArr.length;i++){ 
				if((scrollTop+clientHeight/2)>=mainTopArr[i]){ 
				k=i; 
				} 
			} 
			const list=document.getElementsByClassName("rightBar")[0]
			if(list){
				const lis=list.getElementsByTagName("li")
				for(let i=0;i<lis.length;i++){
					lis[i].style.backgroundColor="#fff"
				}
				lis[k].style.backgroundColor="#cfe3f5"
			}
        }
    } 
    render(){
        const { moduleTitle,detailsTitle,fuseMode,formTitle,formList,loading,detailsList,
            columns,dataSource,cardTitle,itemDescs,visibleModal,visibleDrawer,detailHistory }=this.state
        const { flag,type }=this.props
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
                        flag?moduleTitle+"--创建":detailsTitle
                    }   
                    {
                        type==="detail"?
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
                                style={{background:fuseMode===true?"#001529":""}}>
                                保存
                            </Button>
                            </div>
                            <Switch checkedChildren="开" unCheckedChildren="关" style={{marginRight:10}} title="融合模式" onChange={this.fuseMode}/>
                            <Button className="hoverbig" title="刷新" onClick={this.loadRequest}><Icon type="sync" /></Button>
                        </div>
                    }               
                    
                </h3>
                <FormCard 
                    title={formTitle} 
                    formList={formList}
                    type={type} 
                    flag={flag}
                    baseInfo={this.baseInfo}
                    loading={loading}
                    onRef={this.onRef}
                />
                <EditTable 
                    detailsList={detailsList}
                    type={type}
                    columns={columns}
                    dataSource={dataSource}
                    cardTitle={cardTitle}
                    itemDescs={itemDescs}
                    callbackdatasource={this.callbackdatasource}
                    flag={flag}
                    uploadChange={this.uploadChange}
                    newRecords={this.newRecords}
                />
                <Modal
                    visible={visibleModal}
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
                    visible={visibleDrawer}
                    width={400}
                    >
                    <Timeline mode="alternate" pending="没有更多了...">
                        {detailHistory}
                    </Timeline>
                </Drawer>
                {
                    !cardTitle||cardTitle.length<1?"":
                    <div className="rightBar">
                    <ul>
                        {
                            formTitle.map((item)=>{
                                return <li onClick={()=>this.scrollToAnchor(item)} key={item}>{item}</li>
                            })
                        }
                        {
                            cardTitle?cardTitle.map((item)=>{
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
