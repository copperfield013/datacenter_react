import React from 'react'
import superagent from 'superagent'
import {Button,Modal,message,Icon,Drawer,Timeline,Switch,Popover} from 'antd'
import Super from "./../../super"
import Units from '../../units'
import './index.css'
import 'moment/locale/zh-cn';
import EditTable from './../../components/EditTable/editTable'
import FormCard from './../../components/FormCard'
import ModelForm from './../../components/ModelForm/modelForm'
import RightBar from './../../components/RightBar'
const confirm = Modal.confirm;

export default class Detail extends React.Component{
    state={
        visibleModal: false,
        visibleDrawer:false,
        loading:false,
        visibleExport:false,
        fuseMode:false,
        searchText:"",
        scrollIds:[],
        options:[],
        visibleForm:false,
        isNew:false,
        records:[],
        optArr:[],
    }
    componentWillMount(){
        const {menuId,code,type}=this.props.match.params
        this.setState({
            menuId,
            type,
            code,
        })
        this.loadRequest(menuId,type,code)
    }
    loadRequest=(menuId,type,code)=>{
        this.setState({loading:true})
        if(code){
            Super.super({
                url:`/api/entity/curd/detail/${menuId}/${code}`,       
                data:{
                    isShowLoading:true
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
        }else{
            Super.super({
                url:`/api/entity/curd/dtmpl/${menuId}`,       
                data:{
                    isShowLoading:true
                }          
            }).then((res)=>{
                const detailsList=res.entity.fieldGroups; 
                this.detailTitle(res,type)
                this.renderList(detailsList)
                this.setState({loading:false})
            })
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
        const { menuId,code,type }=this.state
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
		if(type==="detail"){
			detailsTitle=entityTitle?moduleTitle+"-"+entityTitle+"-详情":moduleTitle+"-详情";
		}else if(type==="edit"){
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
        const descsFlag=[]
        let scrollIds=[]
        detailsList.map((item)=>{
            if(item.descs){
                cardTitle.push(item.title)
                itemDescs.push(item)
                descsFlag.push(item.descs)
                columns.push(this.renderColumns(item))
                dataSource.push(this.requestTableList(item))
            }else if(item.fields){
                formList.push(item)
            }
            scrollIds.push(item.title)
            return false
        })
        this.requestSelect(formList,itemDescs)
        Units.setLocalStorge("scrollIds",scrollIds)
        this.setState({
            detailsList,
            formList,           
            itemDescs,
            columns,
            dataSource,
            cardTitle,
            descsFlag //为了加$$flag$$
        })
        this.handleNav(scrollIds)
    }
    renderColumns=(item)=>{
        const {type}=this.state        
		if(item.descs){
            const totalName=item.composite.relationKey
			item.descs.map((item,index)=>{
                const fieldName=item.fieldName;
                item["dataIndex"]=fieldName;	
                item["key"]=index;                
                if(type==="detail"){
                    if(fieldName.indexOf("价格")>-1 || fieldName.indexOf("工号")>-1){
                        item["sorter"]=(a, b) => parseInt(a[fieldName]) - parseInt(b[fieldName]); 
                    }else{
                        item["sorter"]=(a, b) => a[fieldName].length - b[fieldName].length; 
                    }
                }           
                return false      					
            })  
            if(item.composite && item.composite.addType===5){//判断是否有关系属性
                let rela={}
                rela["dataIndex"]=`${totalName}.关系` //为了在表格中显示
                rela["fieldName"]="关系"
                rela["title"]="关系"
                rela["type"]="relation"
                rela["options"]=item.composite.relationSubdomain
                item.descs.unshift(rela) 
            }      
            const order={
                title: '序号',
                key: 'order',
                width:65,
                render: (text, record,index) => (
                    <label>{index+1}</label>
                    ),
            } 
            item.descs.unshift(order)
            if(type==="edit"){
                const act={
                    title: '操作',
                    key: 'action',
                    render: (record) => (
                    <div className="editbtn">
                        <Button type='primary' icon="edit" size="small"  onClick={()=>this.visibleForm(item.descs,record)}></Button>
                        <Button type='danger' icon="delete" size="small" onClick={()=>this.removeList(record)}></Button>
                    </div>
                    ),
                }  
                item.descs.push(act) 
            }
            return item.descs
		}		
    }
    requestSelect=(formList,detailsList)=>{
        const { type }=this.state; 
        const tokenName=Units.getLocalStorge("tokenName")
        const selectId=[]
        const optArr=[]
        if(type==="edit" || type==="new"){
            formList.map((item)=>{
                item.fields.map((it)=>{
                    if(it.type==="select" || it.type==="label"){
                        selectId.push(it.fieldId)
                    }
                    return false
                })
                return false
            })
            detailsList.map((item)=>{ 
                item.descs.map((it)=>{
                    if(it.type==="select"){
                        selectId.push(it.fieldId)
                    }
                    return false
                })
                return false
            })
        if(selectId.length>0){  //有下拉框时，发送请求
            const formData = new FormData();
            selectId.map((item)=>{
                formData.append('fieldIds',item);
                return false
            })
            superagent
                .post(`/api/field/options`)
                .set({"datamobile-token":tokenName})
                .send(formData)
                .end((req,res)=>{
                    optArr.push(res.body.optionsMap)
                    this.setState({
                        optArr
                    })
                    //console.log(optArr)
                })
            }
        }
    }
    removeList=(record)=>{
        const deleKey=record.key
        const dataSource =[...this.state.dataSource];      
        const newDataSource=[]
        const records=[]
        dataSource.map((item)=>{
            const newData=[]
            item.map((it)=>{
                if(it.key!==deleKey){
                    newData.push(it)
                }
                return false
            })
            newData.map((item,index)=>{ //删除行，更改数字标签
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
        newDataSource.map((item)=>{
            item.map((it)=>{
                let list={}
                for(let k in it){
                    if(k.indexOf("[")>-1){ //去除key，total，object，fieldName
                        list[k]=it[k]
                    }
                }
                records.push(list)
                return false
            })
            return false
        })
        this.setState({
            dataSource:newDataSource,
            records,
        })
    }
    requestTableList=(data)=>{
        const {type}=this.state
        const res=[]    
        if(data.array && type!=="new"){
            data.array.map((item,index)=>{
                const list={};   
                const code=item.code;
                let fieldName=""
                list["key"]=code;    
                const relation=item.relation        
                if(data.composite.relationKey){
                    list["fieldName"]="关系";
                    list["title"]="关系";
                    list["type"]="relation";
                    list["value"]=relation;
                    list["options"]=data.composite.relationSubdomain
                }         
                item.fields.map((it)=>{
                    fieldName=it.fieldName
                    const fieldValue=it.value;     
                    const fieldType=it.type;                
                    const a=fieldName.split(".")[0]
                    const b=fieldName.split(".")[1];
                    if(fieldType==="file"){
                        list[fieldName]=fieldValue?
                        <span className="downEditPic">
                            <img style={{width:55}} src={`/file-server/${fieldValue}`} alt="图片加载失败"/>
                            <Button size="small" href={`/file-server/${fieldValue}`} download="logo.png"><Icon type="download"/></Button>
                        </span>
                        :"无文件"
                    }else{
                        list[fieldName]=fieldValue?fieldValue:"";
                    } 
                    list[a+`[${index}].唯一编码`]=code;
                    list[a+`[${index}].`+b]=fieldValue?fieldValue:"";
                    if(data.composite.relationKey){
                        list[a+`[${index}].$$label$$`]=item.relation;    
                        list[a+".关系"]=relation
                    }
                    return false
                })
                res.push(list) 
                return false             
            })        
        }
        return res
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
        const tokenName=Units.getLocalStorge("tokenName")
        const formData = new FormData();
        const { menuId,code,type,records,baseValue,fuseMode,descsFlag }=this.state
        formData.append('唯一编码', type==="new"?"":code);
        formData.append('%fuseMode%',fuseMode);
        for(let k in baseValue){
            formData.append(k, baseValue[k]?baseValue[k]:"");
        }
        descsFlag.map((item)=>{ //添加$$flag$$
            item.map((it)=>{
                const fieldName=it.fieldName;
                if(fieldName && fieldName!=="关系"){               
                    const list={}
                    const a=fieldName.split(".")[0]
                    list[`${a}.$$flag$$`]=true;
                    records.push(list)
                }
                return false
            })
            return false
        })
        let res={}
        records.map((item)=>{
            for(let k in item){
                res[k]=item[k] //去重
            }          
            return false
        })  
        if(res){
            for(let k in res){
                formData.append(k, res[k]);              
            }
        }
        const loading=document.getElementById('ajaxLoading')
        loading.style.display="block"
        superagent
            .post(`/api/entity/curd/update/${menuId}`)
            .set({"datamobile-token":tokenName})
            .send(formData)
            .end((req,res)=>{
                loading.style.display="none"
                if(res.body.status==="suc"){
                    message.info("保存成功！")
                    window.history.back(-1);
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
        if(baseValue){           
            this.setState({
                visibleModal: true,
                baseValue
            });
        }
    }
    exportDetail=()=>{
        const {menuId,code}=this.state
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
            visibleForm: false,
        });
    }
    getRecords=()=>{
        const dataSource =[...this.state.dataSource];
        const {records}=this.state
        dataSource.map((item)=>{
            item.map((it)=>{
                let list={}
                for(let k in it){
                    if(k.indexOf("[")>-1 && k.indexOf("关系")===-1){
                        if(typeof it[k]==="object"){ //图片，取自定义的owlner属性
                            if(it[k].props.owlner){
                                list[k]=it[k].props.owlner
                            }else{
                                delete it[k]
                            }
                        }else if(typeof it[k]==="string" && it[k].indexOf("download-files")>-1){
                            delete it[k]
                        }else{
                            list[k]=it[k]
                        }
                    }
                }
                records.push(list)
                return false
            })
            return false
        })
        this.setState({records})
    }
    showModal = () => {
        this.baseinfo.handleBaseInfoSubmit() //获取BaseInfo数据
        this.getRecords()
    }
    //调用子组件方法
	onRef=(ref)=>{
		this.baseinfo=ref
    }
    onRef2=(ref)=>{
		this.modelform=ref
    }
    fuseMode=(checked)=>{
        this.setState({
            fuseMode:checked
        })
    }
    handleNav=(scrollIds)=>{
        const list=document.getElementsByClassName("rightBar")[0]
        if(list){
            const lis=list.getElementsByTagName("li")
            for(let i=0;i<lis.length;i++){
                lis[i].style.backgroundColor="#fff"
            }
            lis[0].style.backgroundColor="#cfe3f5"
        }
    } 
    getOptions=(id)=>{  
        const {optArr}=this.state
        if(optArr){
            optArr.map((item)=>{
                for(let k in item){
                    if(k===`field_${id}`){      
                        this.setState({
                            options:item[k]
                        })
                    }
                }
                return false
            })
        }        
    }
    visibleForm=(data,record)=>{
        this.getForm(data,record)
        this.setState({
            visibleForm:true,
        })
    }
    modelhandleOk=(fieldsValue)=>{    
        const key=fieldsValue.key;
        const totalName=fieldsValue.totalName;
        let { dataSource,isNew,columns }=this.state;
        //console.log(fieldsValue)
        if(isNew){ //新增记录
            let i="";
            columns.map((item,index)=>{ //得知第几个数组新增
                item.map((it)=>{
                    for(let k in it){
                        if(typeof it[k]==="string" && it[k].indexOf(totalName)>-1){
                            i=index
                        }
                    }
                    return false
                })
                return false
            })
            const list={}
            list["key"]=key;
            for(let k in fieldsValue){
                if(k!=="key" && k!=="totalName"){
                    list[`${totalName}.${k}`]=fieldsValue[k];
                    list[`${totalName}[${dataSource[i].length}].${k}`]=fieldsValue[k];
                }
                if(k==="关系"){
                    list[`${totalName}[${dataSource[i].length}].$$label$$`]=fieldsValue[k];
                }
            }   
            dataSource[i].push(list)
        }else{     //修改记录  
            dataSource.map((item)=>{
                item.map((it)=>{
                    if(it.key===key){
                        for(let k in fieldsValue){                      
                            for(let ki in it){
                                if(ki.indexOf(k)>-1){
                                    it[ki]=fieldsValue[k]
                                }
                            }
                        }
                    }
                    return false
                })
                return false
            })
        }
        //console.log(dataSource)
        this.setState({
            dataSource,
            visibleForm:false
        })
    }
    getForm=(columns,record)=>{
        this.modelform.handleReset()
        let editFormList=[]
        columns.map((item)=>{
            if(item.type){
                const list={}
                list["title"]=item.title;
                list["fieldName"]=item.fieldName;
                if(record){
                    this.setState({
                        isNew:false,
                        title:"修改",
                    })
                    list["key"]=record["key"]
                    for(let k in record){
                        if(k.indexOf(item.fieldName)>-1){
                            let value=""
                            if(typeof record[k]==="object"){ 
                                if(record[k].props.children){                                               
                                    record[k].props.children.map((item)=>{ 
                                        if(item.props.src){
                                            value=item.props.src.split("/.")[1]//多了file-server/
                                        }
                                        return false
                                    })
                                }else{
                                     value=record[k].props.src
                                }
                                list["value"]=value
                            }else{
                                list["value"]=record[k]
                            }    
                        }
                    }
                }else{
                    this.setState({
                        isNew:true,
                        title:"新增",
                    })
                    list["value"]="";
                }
                list["type"]=item.type;
                list["fieldId"]=item.fieldId;
                if(item.type==="relation"){
                    const options=[]
                    item.options.map((it)=>{
                        const op={}
                        op["title"]=it
                        op["value"]=it
                        options.push(op)
                        return false
                    })
                    list["options"]=options
                }
                editFormList.push(list)
            }
            return false
        })
        //  console.log(editFormList)
        //  console.log(columns)
        this.setState({
            editFormList,
            visibleForm:true,
        })
    }
    render(){
        const { moduleTitle,detailsTitle,fuseMode,formList,loading,detailsList,visibleForm,editFormList,
            columns,dataSource,cardTitle,itemDescs,visibleModal,visibleDrawer,detailHistory,type,menuId,code }=this.state
        const content = (
            <div className="btns">
              <Button>Actions</Button>
              <Button>Actions</Button>
              <Button>Actions</Button>
              <Button>Actions</Button>
            </div>
          );
        const list=[]
        if(formList){
            formList.map((item)=>{
                list.push(item.title)
                return false
            })          
        }
        if(cardTitle){
            list.push(...cardTitle)
        }
        return(
            <div className="detailPage">
                <h3>
                    {
                        type==="new"&& moduleTitle ? moduleTitle+"--创建":detailsTitle
                    }   
                    {
                        type==="detail"?
                        <div className="fr pad">
                            <Button className="hoverbig" title="导出" onClick={this.exportDetail}><Icon type="upload" /></Button>
                            <Button className="hoverbig" title="查看历史" onClick={this.showHistory}><Icon type="schedule" /></Button>                                                      
                            <Button className="hoverbig" title="刷新" onClick={()=>this.loadRequest(menuId,type,code)}><Icon type="sync" /></Button>
                        </div>
                        :
                        <div className="fr pad">
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
                                key="btn" 
                                onClick={this.showModal} 
                                style={{background:fuseMode===true?"#001529":""}}>
                                保存
                            </Button>
                            </div>
                            <Switch checkedChildren="开" unCheckedChildren="关" style={{marginRight:10}} title="融合模式" onChange={this.fuseMode}/>
                            <Button className="hoverbig" title="刷新" onClick={()=>this.loadRequest(menuId,type,code)}><Icon type="sync" /></Button>
                        </div>
                    }               
                    
                </h3>
                <FormCard
                    formList={formList}
                    type={type}
                    baseInfo={this.baseInfo}
                    loading={loading}
                    onRef={this.onRef}
                    getOptions={this.getOptions}
                    options={this.state.options}
                />
                <EditTable 
                    detailsList={detailsList}
                    type={type}
                    columns={columns}
                    dataSource={dataSource}
                    cardTitle={cardTitle}
                    itemDescs={itemDescs}
                    handleAdd={this.getForm}
                    onRef3={this.onRef3}
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
                <ModelForm
                    handleCancel={this.handleCancel}
                    handleOk={this.modelhandleOk}
                    visibleForm={visibleForm}
                    formList={editFormList}
                    type="edit"                       
                    getOptions={this.getOptions}
                    options={this.state.options}
                    onRef2={this.onRef2}
                    title={this.state.title}
                />
                <Drawer
                    title="查看历史"
                    closable={false}
                    onClose={this.onClose}
                    visible={visibleDrawer}
                    width={400}
                    >
                    <Timeline mode="alternate">
                        {detailHistory}
                    </Timeline>
                </Drawer>
                {
                    !cardTitle||cardTitle.length<=3?"":
                    <RightBar 
                        list={list}
                    />
                }
                
            </div>
        )
    }
}
