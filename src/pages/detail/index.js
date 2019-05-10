import React from 'react'
import superagent from 'superagent'
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

const api="http://47.100.187.235:7080/datacenter_api2"
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
        visibleTemplateList:false,
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
        this.loadltmpl(menuId,code)
    }
    loadltmpl=(menuId,code)=>{
        Super.super({
            url:`/api2/meta/tmpl/dtmpl_config/normal/${menuId}/`,       
            data:{
                isShowLoading:true
            }          
        }).then((res)=>{     
            const formltmpl=[]
            const editformltmpl=[]
            const descsFlag=[]
            res.config.dtmpl.groups.map((item)=>{
                if(item.composite===null){
                    formltmpl.push(item)
                }else{
                    editformltmpl.push(item)
                    descsFlag.push(item.title)
                }
                return false
            })
             //console.log(res)
            //console.log(editformltmpl)
            this.requestSelect(formltmpl,editformltmpl)
            if(code && code!=='new'){
                this.loadRequest(formltmpl,editformltmpl)
            }else{
                this.setState({
                    editformltmpl,
                    columns:this.renderColumns(editformltmpl),
                    dataSource:[],
                })
            }
            if(res.config.premises && res.config.premises.length>0){
                const result=[]
                res.config.premises.map((item)=>{
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
            this.setState({
                menuTitle:res.menu.title,
                actions:res.config.actions,
                formltmpl,
                descsFlag
            })
        })  
    }
    loadRequest=(formltmpl,editformltmpl)=>{
        const {menuId,type,code}=this.props.match.params
        this.setState({loading:true})
        Super.super({
            url:`/api2/entity/curd/detail/${menuId}/${code}`,       
            data:{
                isShowLoading:true
            }          
        }).then((res)=>{  
            const arrayMap=res.entity.arrayMap
            const fieldMap=res.entity.fieldMap
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
                arrayMap[k].map((item,index)=>{
                    item.fieldMap["key"]=index //为了不报错
                    return item.relationLabel?item.fieldMap["关系"]=item.relationLabel:false
                })
            }
            //console.log(res)
            //console.log(arrayMap)
            this.setState({
                loading:false,
                formltmpl,
                editformltmpl,
                columns:this.renderColumns(editformltmpl),
                dataSource:arrayMap,
            })          
        })
    }
    renderHistoryList=()=>{
        const {menuId,code,}=this.state
        Super.super({
            url:`/api2/entity/curd/history/${menuId}/${code}/1`,                
        }).then((res)=>{
            let detailHistory
            //console.log(res)
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
                detailHistory
            })
        })
    }
    toHistory=(e)=>{
        const {menuId,type}=this.state
        const historyCode=e.target.getAttribute("code");
        this.props.history.push(`/${menuId}/${type}/${historyCode}`)       
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
                    dataIndex:"关系",
                    name:"关系",
                    title:"关系",
                    type:"relation",
                    fieldAvailable:true,
                    id:Units.RndNum(5),//随机5位数
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
                        <Button type='primary' icon="edit" size="small"  onClick={()=>this.visibleForm(editformltmpl,record)}></Button>
                        <Button type='danger' icon="delete" size="small" onClick={()=>this.removeList(record)}></Button>
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
                url:`/api2/meta/dict/field_options`,       
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
    showHistory=()=>{
        this.renderHistoryList();
        this.setState({
            visibleDrawer: true,
        });
    }
    handleOk = (actionId,e) => {
        e.preventDefault();
        const loading=document.getElementById('ajaxLoading')
        const tokenName=Units.getLocalStorge("tokenName")
        loading.style.display="block"
        const { menuId,code,type,baseValue,fuseMode,dataSource,descsFlag,columns }=this.state       
        const formData = new FormData();        
        for(let k in baseValue){
            formData.append(k, baseValue[k]);
        }       
        descsFlag.map((item)=>{
            formData.append(`${item}.$$flag$$`, true);
        })
        if(dataSource.constructor===Object){
            console.log(dataSource)
            for(let k in dataSource){
                dataSource[k].map((item)=>{
                    const fieldMap=item.fieldMap
                    const totalName=fieldMap.totalName
                    const order=fieldMap.order-1
                    console.log(fieldMap)
                    for(let i in fieldMap){
                        if(i.includes("*") && fieldMap[i]){
                            const name=i.split("*")[0];
                            formData.append(`${totalName}[${order}].${name}`,fieldMap[i]);
                        }
                        if(i==="关系"){
                            formData.append(`${totalName}[${order}].$$label$$`,fieldMap[i]);
                        }
                    }
                })
            }
        }
        if(type!=="new"){
            formData.append('唯一编码', type==="new"?"":code);
            formData.append('%fuseMode%',fuseMode);
        }
        Super.super({
            url:`/api2/entity/curd/save/normal/${menuId}`, 
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
        this.setState({
            visibleModal: false,
            loading:false
        });
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
                    url:`/api2/entity/export/detail/${menuId}/${code}`,                 
                }).then((res)=>{
                    loading.style.display="none"
                    if(res.status==="suc"){
                        Units.downloadFile(`/api2/entity/export/download/${res.uuid}`)
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
            visibleTemplateList:false,
            visibleDrawer: false,
        });
    }
    showModal = () => {
        this.baseinfo.handleBaseInfoSubmit() //获取BaseInfo数据
    }
    baseInfo=(baseValue)=>{         
        this.setState({
            baseValue,
            visibleModal: true,
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
    // handleNav=(scrollIds)=>{
    //     const list=document.getElementsByClassName("rightBar")[0]
    //     if(list){
    //         const lis=list.getElementsByTagName("li")
    //         for(let i=0;i<lis.length;i++){
    //             lis[i].style.backgroundColor="#fff"
    //         }
    //         lis[0].style.backgroundColor="#cfe3f5"
    //     }
    // } 
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
    modelhandleOk=(fieldsValue)=>{
            console.log(fieldsValue)
        const Key=fieldsValue.key;
        const groupId=fieldsValue.groupId
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
            dataSource[groupId].push(list)
        }else{     //修改记录  
            for(let k in dataSource){
                if(k===groupId.toString()){
                    dataSource[k].map((item)=>{
                        if(item.fieldMap.key===Key){
                            item.fieldMap=fieldsValue
                        }
                        return false
                    })
                }
            }
        }
        this.setState({
            dataSource,
            visibleForm:false
        })
    }
    visibleForm=(data,record)=>{
        this.getForm(data,record)
        this.setState({
            visibleForm:true,
        })
    }
    getForm=(columns,record)=>{
        this.modelform.handleReset()
        let editFormList=[]
        if(record){
            columns.map((item)=>{
                if(item.id===record.groupId){
                    columns=item.fields
                }
                return false
            })
        }
        columns.map((item)=>{
            if(item.type){
                const list={
                    title:item.title,
                    name:item.name,
                    fieldAvailable:item.fieldAvailable,
                    type:item.type,
                    groupId:item.groupId,
                    id:item.id
                }
                if(record){
                    for(let k in record){
                        if(k===item.title){
                            list["key"]=record.key
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
        //console.log(editFormList)
        //console.log(columns)
        this.setState({
            editFormList,
            visibleForm:true,
            isNew:record?false:true,
            title:record?"修改":"新增",
        })
    }
    // getTemplate=(stmplId,columns,pageNo,oexcepts,oopti)=>{
    //     let {menuId,fields,excepts,opti}=this.state;
    //     if(!excepts){
    //         excepts=oexcepts
    //     }        
    //     if(excepts && excepts!==oexcepts){
    //         excepts=oexcepts
    //     }
    //     if(!opti){
    //         opti=oopti
    //     }
    //     Super.super({
    //         url:`/api/entity/curd/selections/${menuId}/${stmplId}`,  
    //         data:{
    //             pageNo,
    //             excepts,
    //         }                
    //     }).then((res)=>{
    //         let newfields=""
    //         if(columns){
    //             columns.map((item)=>{
    //                 if(item.fieldId){
    //                     newfields+=item.fieldName+","
    //                 }
    //                 return false
    //             })
    //             if(!fields){
    //                 fields=newfields
    //             }
    //             if(fields && fields!==newfields){
    //                 fields=newfields
    //             }
    //         }
    //         if(res){
    //             this.setState({
    //                 visibleTemplateList:true,
    //                 templateData:res,
    //                 stmplId,
    //                 fields,
    //                 excepts,
    //                 opti,
    //             })
    //         }else{
    //             message.error("无数据")
    //         }
    //     })
    // }
    // TemplatehandleOk=(value)=>{
    //     let {fields,dataSource,columns,opti}=this.state
    //     const totalName=fields.split(".")[0];
    //     const key=[]
    //     for(let k in value){
    //         key.push(k)
    //     }
    //     let i="";
    //     columns.map((item,index)=>{ //得知第几个数组新增
    //         item.map((it)=>{
    //             for(let k in it){
    //                 if(typeof it[k]==="string" && it[k].indexOf(totalName)>-1){
    //                     i=index
    //                 }
    //             }
    //             return false
    //         })
    //         return false
    //     })
    //     key.map((item)=>{
    //         const list={}
    //         list["key"]=item;
    //         list[`${totalName}.关系`]=opti?opti:"";
    //         list[`${totalName}[${dataSource[i].length}].$$label$$`]=opti?opti:"";
    //         for(let k in value[item]){
    //             if(k!=="key" && k!=="唯一编码"){
    //                 const ssr1=k.split(".")[0]
    //                 const ssr2=k.split(".")[1]
    //                 list[k]=value[item][k];
    //                 list[`${ssr1}[${dataSource[i].length}].${ssr2}`]=value[item][k];
    //             }else if(k==="唯一编码"){
    //                 list[`${totalName}[${dataSource[i].length}].唯一编码`]=value[item][k];
    //             }
    //             if(value[item][k].indexOf("download-files")>-1){
    //                 list[k]=<img 
    //                             style={{width:55}} 
    //                             src={`/file-server/${value[item][k]}`} 
    //                             alt="" />
    //             }
    //         }
    //         dataSource[i].push(list)
    //         return false
    //     })
    //     // console.log(dataSource)  
    //     // console.log(value)        
    //     this.setState({
    //         dataSource,
    //     })
        
    // }
    render(){
        const { menuTitle,detailsTitle,fuseMode,formltmpl,loading,detailsList,visibleForm,editFormList,actions,premises,templateData,stmplId,
            columns,dataSource,itemDescs,visibleModal,visibleDrawer,detailHistory,type,menuId,code,visibleTemplateList,fields,}=this.state;
        let premisestitle=""
        if(premises && premises.length>0){
            premisestitle=type==="detail"?"默认字段":"默认字段（不可修改）"
            formltmpl.map((item)=>{
                item.fields.map((it)=>{
                    premises.map((i)=>{
                        if(i.fieldName===it.fieldName){
                            it.available=false
                            it["value"]= i["value"]
                        }
                        return false
                    })
                    return false
                })
                return false
            })
        }
        let content
        if(actions && actions.length>0){
            content = (
                <div className="btns">
                    {actions.map((item)=>{
                            return <Button 
                                        key={item.id} 
                                        type="primary" 
                                        onClick={(e)=>this.handleOk(item.id,e)}
                                        >{item.title}</Button>
                        })}
                </div>
            );
        } 
        const list=[]
        if(premises){
            list.push("默认字段")
        }
        if(formltmpl){
            formltmpl.map((item)=>{
                list.push(item.title)
                return false
            })          
        }
        return(
            <div className="detailPage">
                <h3>
                    {
                        type==="new"&& menuTitle ? menuTitle+"--创建":detailsTitle
                    }   
                    {
                        type==="detail"?
                        <div className="fr pad">
                            <Button className="hoverbig" title="导出" onClick={this.exportDetail}><Icon type="upload" /></Button>
                            <Button className="hoverbig" title="查看历史" onClick={this.showHistory}><Icon type="schedule" /></Button>                                                      
                            <Button className="hoverbig" title="刷新" onClick={()=>this.loadltmpl(menuId,code)}><Icon type="sync" /></Button>
                        </div>
                        :
                        <div className="fr pad">
                            <div className="buttonGroup">
                            {
                                actions?
                                <Popover placement="leftTop" content={content} trigger="click">
                                    <Button>
                                        <Icon type="swap" />
                                    </Button>
                                </Popover>:""
                            }
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
                        </div>
                    }               
                    
                </h3>
                {
                    premises && premises.length>0?<Form layout="inline" autoComplete="off">  
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
                                :""
                }
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
                    detailsList={detailsList}
                    type={type}
                    columns={columns}
                    dataSource={dataSource}
                    itemDescs={itemDescs}
                    handleAdd={this.getForm}
                    onRef3={this.onRef3}
                    getTemplate={this.getTemplate}
                />
                <Modal
                    visible={visibleModal}
                    onOk={(e)=>this.handleOk("",e)}
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
                    templateData={templateData}
                    width={680}
                    stmplId={stmplId}
                    menuId={menuId}
                    getTemplate={this.getTemplate}
                    fields={fields}
                    TemplatehandleOk={this.TemplatehandleOk}
                />
                {/* {
                    !cardTitle||cardTitle.length<=3?"":
                    <RightBar 
                        list={list}
                    />
                }
                 */}
            </div>
        )
    }
}
