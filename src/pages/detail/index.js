import React from 'react'
import {Button,Modal,message,Icon,Drawer,Timeline,Switch,Popover,Card,Form} from 'antd'
import Super from "./../../super"
import Units from '../../units'
import './index.css'
import 'moment/locale/zh-cn';
import EditTable from './../../components/EditTable/editTable'
import FormCard from './../../components/FormCard'
import ModelForm from './../../components/ModelForm/modelForm'
import RightBar from './../../components/RightBar'
import BaseInfoForm from './../../components/BaseForm/BaseInfoForm'
import TemplateList from '../../components/templateList';
const confirm = Modal.confirm;

const api="http://47.100.187.235:7080/datacenter_api2/"
export default class Detail extends React.Component{
    state={
        visibleDrawer:false,
        loading:false,
        visibleExport:false,
        fuseMode:false,
        searchText:"",
        options:[],
        visibleForm:false,
        visibleTemplateList:false,
        isNew:false,
    }
    componentDidMount(){
        const {menuId,code,type,nodeId}=this.props.match.params
        this.setState({
            menuId,
            type,
            code,
            nodeId
        })
        //console.log(nodeId)
        this.loadltmpl(menuId,code,"",nodeId)
    }
    loadltmpl=(menuId,code,versionCode,nodeId)=>{
        const url=nodeId?`api2/meta/tmpl/dtmpl_config/node/${menuId}/${nodeId}`:`api2/meta/tmpl/dtmpl_config/normal/${menuId}/`
        Super.super({url}).then((res)=>{     
            const formltmpl=[]
            const editformltmpl=[]
            const rightNav=[]
            const premises=res.config.premises
            const actions=res.config.actions
            const menuTitle=menuId==="user"?"用户":res.menu.title
            res.config.dtmpl.groups.map((item)=>{
                rightNav.push(item.title)
                if(item.composite===null){
                    formltmpl.push(item)
                }else{
                    editformltmpl.push(item)
                }
                return false
            })
            //console.log(res)
            //console.log(rightNav)
            this.requestSelect(formltmpl,editformltmpl)
            if(code && code!=='new'){
                this.loadRequest(formltmpl,editformltmpl,versionCode)
            }else{
                this.setState({
                    editformltmpl,
                    columns:this.renderColumns(editformltmpl),
                    dataSource:[],
                })
            }
            if(premises && premises.length>0){
                const result=[]
                rightNav.unshift("默认字段")
                premises.map((item)=>{
                    let list={}
                    for(let k in item){
                        list[k]=item[k]
                    }
                    list["title"]=item["fieldTitle"]
                    list["type"]="text"                    
                    list["value"]=item["fieldValue"]         
                    list["available"]=false
                    result.push(list)
                    return false
                })
                this.setState({
                    premises:result
                })  
            }
            Units.setLocalStorge("rightNav",rightNav)
            this.setState({
                menuTitle,
                actions,
                formltmpl,
                rightNav
            })
        })  
    }
    loadRequest=(formltmpl,editformltmpl,versionCode)=>{
        const {menuId,type,code,nodeId}=this.props.match.params
        Super.super({
            url:`api2/entity/curd/detail/${menuId}/${code}`, 
            data:{
                versionCode,
                nodeId
            }          
        }).then((res)=>{  
            const arrayMap=res.entity.arrayMap
            const fieldMap=this.forPic(res.entity.fieldMap)
            const descsFlag=[]           
            formltmpl.map((item)=>{
                item.fields.map((item)=>{
                    for(let k in fieldMap){
                        if(item.id.toString()===k){
                            item.value=fieldMap[k]
                        }
                    }
                    return false
                })
                return false
            })
            this.detailTitle(res.entity.title,type)
            for(let k in arrayMap){
                let totalName
                editformltmpl.map((item)=>{
                    if(item.id.toString()===k){
                        totalName=item.composite.name
                        descsFlag.push(item.composite.name)
                    }
                    return false
                })
                arrayMap[k].map((item)=>{
                    const fieldMap=this.forPic(item.fieldMap) //有图片，转化为图片
                    fieldMap["code"]=item.code //为了后面操作修改
                    fieldMap["key"]=item.code
                    fieldMap["groupId"]=k
                    fieldMap["totalName"]=totalName
                    if(item.relationLabel){
                        fieldMap["10000"]=item.relationLabel
                    }
                    return false
                })
            }
            //console.log(editformltmpl)
            //console.log(arrayMap)
            this.setState({
                formltmpl,
                editformltmpl,
                descsFlag,
                columns:this.renderColumns(editformltmpl),
                dataSource:arrayMap,
            })          
        })
    }
    forPic=(fieldMap)=>{
        for(let i in fieldMap){
            if(fieldMap[i] && fieldMap[i].includes("download-files")){
                const url=api+ fieldMap[i]
                fieldMap[i]=<img 
                                style={{width:55}} 
                                src={url} 
                                alt="" />
            }
        }
        return fieldMap
    }
    renderHistoryList=(versionCode)=>{
        const {menuId,code,nodeId}=this.state
        Super.super({
            url:`api2/entity/curd/history/${menuId}/${code}/1`,     
            data:{
                versionCode,
                nodeId
            }           
        }).then((res)=>{
            let detailHistory
            if(res.history.length>0){
                detailHistory= res.history.map((item,index)=>{
                    const color=item.current?"red":"blue";
                    return <Timeline.Item color={color} key={index}>
                                {Units.formateDate(item.time)}<br/>
                                {`操作人`+item.userName}
                                {item.current?"":<Button 
                                                    style={{marginLeft:10}} 
                                                    code={item.code} 
                                                    type="primary" 
                                                    size="small" 
                                                    onClick={this.toHistory}
                                                    >查看</Button>
                                }                   
                            </Timeline.Item>
                    })
            }
            this.setState({
                detailHistory,
                visibleDrawer: true,
            })
        })
    }
    toHistory=(e)=>{
        const {menuId,code}=this.state
        const versionCode=e.target.getAttribute("code");
        this.renderHistoryList(versionCode)
        this.loadltmpl(menuId,code,versionCode)
    }
    detailTitle=(dataTitle,type)=>{
        const {menuTitle}=this.state
		let detailsTitle="";
		if(type==="detail"){
			detailsTitle=menuTitle+"-"+dataTitle+"-详情"
		}else if(type==="edit"){
			detailsTitle=menuTitle+"-"+dataTitle+"-修改"
		}			        		
		this.setState({ 
            detailsTitle,
            menuTitle,
		});
	}
    renderColumns=(editformltmpl)=>{
        const {type}=this.state 
        const columns=[]
        editformltmpl.map((item)=>{
			item.fields.map((item,index)=>{
                const id=item.id
                item["dataIndex"]=id               
                if(type==="detail"){
                    if(item.type==="decimal"){
                        item["sorter"]=(a, b) => a[id] - b[id]; 
                    }else{
                        item["sorter"]=(a, b) =>{ 
                            if(a[id]&&b[id]){
                                return a[id].length - b[id].length;
                            }
                        }
                    }
                }           
                return false      					
            })  
            if(item.composite && item.composite.addType===5){//判断是否有关系属性
                let rela={
                    dataIndex:"10000",
                    name:"relation",
                    title:"关系",
                    type:"relation",
                    fieldAvailable:true,
                    id:10000,//随机5位数
                    options:item.composite.relationSubdomain
                }
                item.fields.unshift(rela) 
            }      
            const order={
                title: '序号',
                width:65,
                dataIndex:'order',
                render: (text, record,index) => (
                    <label>{index+1}</label>
                    ),
            } 
            item.fields.unshift(order)
            if(type!=="detail"){
                const act={
                    title: '操作',
                    key: 'action',
                    render: (record) => (
                    <div className="editbtn">
                        <Button 
                            type='primary' 
                            title="编辑当前行" 
                            icon="edit" 
                            size="small"  
                            onClick={()=>this.getForm(record)}
                            ></Button>
                        <Button 
                            type='danger' 
                            icon="delete" 
                            size="small" 
                            onClick={()=>this.visibleModal(record,'removeList','确定要删除这条记录吗')}
                            ></Button>
                        {item.rabcTemplateGroupId && item.rabcUnupdatable===null?
                            <Button 
                                title="编辑当前实体" 
                                type='primary' 
                                icon="form" 
                                size="small"  
                                onClick={()=>this.getFormTmpl(record)}
                                ></Button>:""}
                    </div>
                    ),
                }  
                item.fields.push(act) 
            }
            columns.push(item)
            return false
        })   
        return columns
    }
    visibleModal=(record,name,string)=>{
        const _this=this
        confirm({
            title: string,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                _this[name](record)
            },
          });
    }
    requestSelect=(formltmpl,editformltmpl)=>{
        const { type }=this.state; 
        const selectId=[]
        if(type==="edit" || type==="new"){
            formltmpl.map((item)=>{
                item.fields.map((it)=>{
                    if(it.type==="select" || it.type==="label"){
                        selectId.push(it.fieldId)
                    }
                    return false
                })
                return false
            })
            editformltmpl.map((item)=>{ 
                item.fields.map((it)=>{
                    if(it.type==="select"){
                        selectId.push(it.fieldId)
                    }
                    return false
                })
                return false
            })
        if(selectId.length>0){  //有下拉框时，发送请求
            let fieldIds = ""
            selectId.map((item)=>{
                fieldIds+=item+","
                return false
            })
            Super.super({
                url:`api2/meta/dict/field_options`,       
                data:{
                    fieldIds
                },
            }).then((res)=>{
                this.setState({
                    optionsMap:res.optionsMap
                })
            })
            }
        }
    }
    removeList=(record)=>{
        const deleKey=record.key
        const {dataSource}=this.state
        for(let k in dataSource){
            if(k===record.groupId.toString()){
                dataSource[k].map((item,index)=>{
                    if(item.fieldMap.key===deleKey){
                        dataSource[k].splice(index,1); 
                    }
                    return false
                })
            }
        }
        this.setState({
            dataSource
        })
    }
    handleOk = (actionId) => {
        const { menuId,code,type,baseValue,fuseMode,dataSource,descsFlag }=this.state       
        const formData = new FormData(); 
        if(actionId){
            formData.append("%actionId%", actionId)
        }
        for(let k in baseValue){
            formData.append(k, baseValue[k]);
        }       
        descsFlag.map((item)=>{
            formData.append(`${item}.$$flag$$`, true);
            return false
        })
        console.log(dataSource)
        if(dataSource.constructor===Object){
            for(let k in dataSource){
                dataSource[k].map((item)=>{
                    const fieldMap=item.fieldMap
                    const totalName=fieldMap.totalName
                    const order=fieldMap.order-1
                    const key=fieldMap.key
                    if(key && key.length>9){ //有key证明数据本来就有,没有修改
                        formData.append(`${totalName}[${order}].唯一编码`,fieldMap.code);
                    }
                    for(let i in fieldMap){
                        if(i.includes("*") && fieldMap[i]){
                            const name=i.split("*")[0];
                            if(fieldMap[i].constructor===Object){ //上传图片
                                formData.append(`${totalName}[${order}].${name}`,fieldMap[i].props.owlner);
                            }else{
                                formData.append(`${totalName}[${order}].${name}`,fieldMap[i]); 
                            }                          
                        }                           
                    }                       
                    for(let i in fieldMap){
                        if(i==="10000"){
                            formData.append(`${totalName}[${order}].$$label$$`,fieldMap[i]);
                        }
                    }  
                    return false                                  
                })
            }
        }
        if(type!=="new"){
            formData.append('唯一编码', type==="new"?"":code);
            formData.append('%fuseMode%',fuseMode);
        }
        Super.super({
            url:`api2/entity/curd/save/normal/${menuId}`, 
            data:formData
        },'formdata').then((res)=>{
            if(res && res.status==="suc"){
                message.success("保存成功!")
                sessionStorage.setItem(menuId,"")
                window.history.back(-1);
            }else{
                message.error("保存失败!")
            }
        })
      }
    exportDetail=()=>{
        const {menuId,code}=this.state
        confirm({
            title: '确认导出当前详情页？',            
            okText: "确认",
            cancelText: "取消",
            onOk() {
                Super.super({
                    url:`api2/entity/export/detail/${menuId}/${code}`,                 
                }).then((res)=>{
                    if(res.status==="suc"){
                        const tokenName=Units.getLocalStorge("tokenName")
                        Units.downloadFile(`api2/entity/export/download/${res.uuid}?@token=${tokenName}`)
                    }else{
                        message.error(res.status)
                    }
                })
            },
        });          
    }
    handleCancel = () => {
        this.setState({
            visibleForm: false,
            visibleTemplateList:false,
            visibleDrawer: false,
        });
    }
    showModal = () => {
        this.baseinfo.handleBaseInfoSubmit() //获取BaseInfo数据
    }
    baseInfo=(baseValue)=>{  
        this.visibleModal(null,'handleOk','确定要保存修改吗')//弹出确认框    
        this.setState({
            baseValue,
        });
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
    getOptions=(id)=>{  
        const {optionsMap}=this.state
        if(optionsMap){
            for(let k in optionsMap){
                if(k===id.toString()){      
                    this.setState({
                        options:optionsMap[k]
                    })
                }
            }
        }        
    }
    getFormTmpl=(record)=>{ //创建实体（新增实体）
        const {menuId,columns}=this.state
        const formTmplGroupId=record.groupId.toString()
        const arr=[]
        console.log(record)
        columns.map((item)=>{
            if(item.id.toString()===formTmplGroupId){
                item.fields.map((it)=>{
                    if(it.groupId){
                        arr.push(it.id)
                    }
                    return false
                })
            }
            return false
        })
        Super.super({
            url:`api2/meta/tmpl/dtmpl_config/rabc/${menuId}/${formTmplGroupId}`,                 
        }).then((res)=>{
            let templateDtmpl=res.config.dtmpl.groups
            const moduleTitle=res.config.module.title
            if(record.code){
                Super.super({
                    url:`api2/entity/curd/detail/${menuId}/${record.code}`, 
                    data:{
                        fieldGroupId: formTmplGroupId
                    }         
                }).then((resi)=>{ 
                    const entityTitle=resi.entity.title
                    const fieldMap=this.forPic(resi.entity.fieldMap)
                    templateDtmpl.map((item)=>{
                        item.code=resi.entity.code
                        item.fields.map((it)=>{
                            for(let k in fieldMap){
                                if(k===it.id.toString()){
                                    it.value=fieldMap[k]
                                }
                            }
                            return false
                        })
                        return false
                    })           
                    this.setState({
                        getFormTmpl:true,
                        templateDtmpl,
                        title:moduleTitle+"-"+entityTitle+"-修改",
                        visibleTemplateList:true,
                        formTmplGroupId, //修改实体模板groupId
                        dfieldIds:arr.join(',')
                    })   
                 })
            }else{
                console.log(arr)
                this.setState({
                    getFormTmpl:true,
                    templateDtmpl,
                    title:"创建实体",
                    visibleTemplateList:true,
                    formTmplGroupId, //修改实体模板groupId
                    dfieldIds:arr.join(',')
                })   
            }
            
        })
    }
    getForm=(record,isNew)=>{
        let {columns}=this.state
        this.modelform.handleReset()
        let editFormList=[]
        if(!isNew){
            columns.map((item)=>{
                if(item.id.toString()===record.groupId){
                    columns=item.fields
                }
                return false
            })
        }else{
            columns=record
        }
        console.log(columns)
        const code=Units.RndNum(9)
        columns.map((item)=>{
            if(item.type){
                const list={
                    title:item.title,
                    name:item.name,
                    fieldAvailable:item.fieldAvailable,
                    type:item.type,
                    groupId:item.groupId,
                    id:item.id,
                    code:isNew?code:record.code,
                    key:item.key
                }
                if(record){
                    for(let k in record){
                        if(k===item.id.toString()){
                            list["value"]=record[k]
                        }
                    }
                }else{
                    list["value"]="";
                }
                if(item.type==="relation"){
                    const options=[]
                    item.options.map((it)=>{
                        const op={
                            title:it,
                            value:it
                        }
                        options.push(op)
                        return false
                    })
                    list["options"]=options
                }
                editFormList.push(list)
            }
            return false
        })
        console.log(editFormList)
        this.setState({
            editFormList,
            isNew,
            title:isNew?"新增":"修改",
            visibleForm:true,
        })
    }
    modelhandleOk=(fieldsValue)=>{
        const Code=fieldsValue.code;
        const groupId=fieldsValue.groupId.toString()
        let { dataSource,isNew,columns }=this.state;
        const data={}
        columns.map((item)=>{
            data[item.id]=[]
            return false
        })
        for(let k in data){
            for(let i in dataSource){
                if(i===k){
                    data[k]=dataSource[i]
                }
            }
        }
        dataSource=data
        if(isNew){ //新增记录
            const list={
                fieldMap:fieldsValue
            }
            dataSource[groupId].unshift(list)
        }else{     //修改记录  
            for(let k in dataSource){
                if(k===groupId){
                    dataSource[k].map((item)=>{
                        const fildcode=item.fieldMap.code.toString()
                        if(fildcode===Code){
                            item.fieldMap=fieldsValue
                        }else{
                            
                        }
                        return false
                    })
                }
            }
        }
        //console.log(dataSource)
        this.setState({
            dataSource,
            visibleForm:false
        })
    }
    getTemplate=(templateGroupId,excepts,dfieldIds,searchParams)=>{
        let {menuId}=this.state;
        Super.super({
            url:`api2/meta/tmpl/select_config/${menuId}/${templateGroupId}`,               
        }).then((res)=>{
            this.setState({
                templateDtmpl:res,
                templateGroupId, //选择模板groupId
                dfieldIds,
                getFormTmpl:false,
                excepts,
            })
        })
        Super.super({
            url:`/api2/entity/curd/query_select_entities/${menuId}/${templateGroupId}`, 
            data:{
                excepts,
                ...searchParams,
            }              
        }).then((res)=>{
            if(res){
                this.templatePageTo(res.queryKey)
            }
        })
    }
    templatePageTo=(queryKey,data)=>{
        Super.super({
            url:`api2/entity/curd/ask_for/${queryKey}`, 
            data,              
        }).then((res)=>{
            this.setState({
                templateData:res,
                visibleTemplateList:true,
                title:'选择实体'
            })
        })
    }
    templateSearch=(params)=>{
        let {templateGroupId,excepts,dfieldIds}=this.state;
        this.getTemplate(templateGroupId,excepts,dfieldIds,params)
    }
    TemplatehandleOk=(codes,formTmplGroupId,isPush)=>{
        console.log(isPush)
        let {menuId,dfieldIds,templateGroupId,dataSource,columns}=this.state
        if(formTmplGroupId){
            templateGroupId=formTmplGroupId
        }
        Super.super({
            url:`api2/entity/curd/load_entities/${menuId}/${templateGroupId}`,  
            data:{
                codes,
                dfieldIds,
            }                
        }).then((res)=>{
            console.log(res)
            console.log(columns)
            let relationSubdomain=[]
            let totalName
            columns.map((item)=>{
                if(item.id.toString()===templateGroupId.toString()){
                    relationSubdomain=item.relationSubdomain
                    totalName=item.composite.name
                }
                return false
            })
            res.entities.map((item)=>{
                const byDfieldIds=item.byDfieldIds
                byDfieldIds.key=item['唯一编码']
                byDfieldIds.code=item['唯一编码']
                byDfieldIds.groupId=templateGroupId.toString()
                byDfieldIds.totalName=totalName
                for(let k in byDfieldIds){
                    if(byDfieldIds[k]&&byDfieldIds[k].includes("download-files")){
                        const url=api+byDfieldIds[k]
                        byDfieldIds[k]=<img 
                                            style={{width:55}} 
                                            src={url} 
                                            alt="" />
                    }
                }
                if(relationSubdomain.length===1){ //默认关系只有一个选项时，自动添加
                    item.byDfieldIds['10000']=relationSubdomain[0]
                }
                let list={
                    code:item['唯一编码'],
                    fieldMap:item.byDfieldIds,                   
                }               
                for(let k in dataSource){
                    if(k===templateGroupId.toString()){
                        if(!isPush){
                            dataSource[k].map((it,index)=>{
                                if(it.code===item['唯一编码']){
                                    dataSource[k].splice(index,1,list); 
                                }
                                return false
                            })
                        }else{
                            dataSource[k].push(list)
                        }
                        
                    }
                }
                return false
            })
            console.log(dataSource)
            this.setState({
                visibleTemplateList:false,
            })
        })
    }
    render(){
        const { menuTitle,detailsTitle,fuseMode,formltmpl,loading,visibleForm,editFormList,actions,premises,templateDtmpl,rightNav,getFormTmpl,
            columns,dataSource,visibleDrawer,detailHistory,type,menuId,code,visibleTemplateList,dfieldIds,title,options,templateData,formTmplGroupId}=this.state;
        const premisestitle=type==="detail"?"默认字段":"默认字段（不可修改）"
        let content
        if(actions && actions.length>0){
            content = (
                <div className="btns">
                    {actions.map((item)=>{
                            return <Button 
                                        key={item.id} 
                                        type="primary" 
                                        onClick={()=>this.visibleModal(item.id,'handleOk','确实要执行这项操作吗？')}
                                        >{item.title}</Button>
                        })}
                </div>
            );
        }
        return(
            <div className="detailPage">
                <h3>
                    {type==="new"&& menuTitle ? menuTitle+"--创建":detailsTitle }   
                    {type==="detail"?
                        <div className="fr pad">
                            <Button className="hoverbig" title="导出" onClick={this.exportDetail}><Icon type="upload" /></Button>
                            <Button className="hoverbig" title="查看历史" onClick={()=>this.renderHistoryList(null)}><Icon type="schedule" /></Button>                                                      
                            <Button className="hoverbig" title="刷新" onClick={()=>this.loadltmpl(menuId,code)}><Icon type="sync" /></Button>
                        </div>:
                        <div className="fr pad">
                            <div className="buttonGroup">
                            {actions&&actions.length>0?
                                <Popover placement="leftTop" content={content} trigger="click">
                                    <Button>
                                        <Icon type="swap" />
                                    </Button>
                                </Popover>:""}
                            <Button 
                                type='primary' 
                                icon="cloud-upload" 
                                className="submitBtn" 
                                key="btn" 
                                onClick={this.showModal} 
                                style={{backgroundColor:fuseMode===true?"#001529":""}}
                                >保存
                            </Button>
                            </div>
                            {code?<Switch 
                                    checkedChildren="开" 
                                    unCheckedChildren="关" 
                                    style={{marginRight:10}} 
                                    title="融合模式" 
                                    onChange={this.fuseMode}/>
                                :""}
                            <Button 
                                className="hoverbig" 
                                title="刷新" 
                                onClick={()=>this.loadltmpl(menuId,type,code)}
                                ><Icon type="sync" /></Button>
                        </div>}                                  
                </h3>
                { premises?<Form layout="inline" autoComplete="off">  
                                <Card 
                                    title={premisestitle} 
                                    key={premisestitle} 
                                    id={premisestitle}
                                    className="hoverable" 
                                    headStyle={{background:"#f2f4f5"}}
                                    loading={loading}
                                    >
                                    <BaseInfoForm 
                                        key={111}
                                        formList={premises} 
                                        type="detail"
                                        width={220}
                                        />
                                </Card>
                            </Form>
                                :"" }
                <FormCard
                    formList={formltmpl}
                    type={type}
                    baseInfo={this.baseInfo}
                    loading={loading}
                    onRef={this.onRef}
                    getOptions={this.getOptions}
                    options={this.state.options}
                />
                <EditTable 
                    type={type}
                    columns={columns}
                    dataSource={dataSource}
                    handleAdd={this.getForm}
                    onRef3={this.onRef3}
                    getTemplate={this.getTemplate} //新增选择实体模板
                    getFormTmpl={this.getFormTmpl}//新增修改实体模板
                />               
                <ModelForm
                    handleCancel={this.handleCancel}
                    handleOk={this.modelhandleOk}
                    visibleForm={visibleForm}
                    formList={editFormList}
                    type="edit"            
                    getOptions={this.getOptions}
                    options={options}
                    onRef2={this.onRef2}
                    title={title}
                />
                <Drawer
                    title="查看历史"
                    closable={false}
                    onClose={this.handleCancel}
                    visible={visibleDrawer}
                    width={400}
                    >
                    {detailHistory?<Timeline mode="alternate">
                        {detailHistory}
                    </Timeline>:"暂无历史记录"}
                </Drawer>
                <TemplateList 
                    visibleTemplateList={visibleTemplateList}
                    handleCancel={this.handleCancel}
                    templateDtmpl={templateDtmpl}
                    templateData={templateData}
                    width={900}
                    menuId={menuId}
                    getFormTmpl={getFormTmpl}
                    formTmplGroupId={formTmplGroupId}
                    type="edit"
                    getTemplate={this.getTemplate}
                    templateSearch={this.templateSearch}
                    dfieldIds={dfieldIds}
                    TemplatehandleOk={this.TemplatehandleOk}
                    templatePageTo={this.templatePageTo}
                    title={title}
                    getOptions={this.getOptions}
                    options={options}
                />
                {!rightNav||rightNav.length<=3?"":
                    <RightBar 
                        list={rightNav}
                    />}              
            </div>
        )
    }
}
