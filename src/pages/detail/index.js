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
            const rightNav=[]
            const premises=res.config.premises
            const actions=res.config.actions
            const menuTitle=res.menu.title
            res.config.dtmpl.groups.map((item)=>{
                rightNav.push(item.title)
                if(item.composite===null){
                    formltmpl.push(item)
                }else{
                    editformltmpl.push(item)
                    descsFlag.push(item.title)
                }
                return false
            })
            //console.log(res)
            //console.log(rightNav)
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
                descsFlag,
                rightNav
            })
        })  
    }
    loadRequest=(formltmpl,editformltmpl)=>{
        const {menuId,type,code}=this.props.match.params
        Super.super({
            url:`/api2/entity/curd/detail/${menuId}/${code}`,          
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
                let totalName
                editformltmpl.map((item)=>{
                    if(item.id.toString()===k){
                        totalName=item.title 
                    }
                })
                arrayMap[k].map((item)=>{
                    item.fieldMap["code"]=item.code //为了后面操作修改
                    item.fieldMap["key"]=item.code
                    item.fieldMap["groupId"]=k
                    item.fieldMap["totalName"]=totalName
                    return item.relationLabel?item.fieldMap["10000"]=item.relationLabel:false
                })
            }
            //console.log(editformltmpl)
            //console.log(arrayMap)
            this.setState({
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
                        <Button type='primary' icon="edit" size="small"  onClick={()=>this.visibleForm(editformltmpl,record)}></Button>
                        <Button type='danger' icon="delete" size="small" onClick={()=>this.visibleModal(record)}></Button>
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
    visibleModal=(record)=>{
        const _this=this
        confirm({
            title: '确定要删除这条记录吗?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                _this.removeList(record)
            },
          });
    }
    visibleModal2=(id,title)=>{
        const _this=this
        confirm({
            title: `确定要执行【${title}】吗?`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                _this.handleOk(id)
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
        })
        console.log(dataSource)
        if(dataSource.constructor===Object){
            for(let k in dataSource){
                dataSource[k].map((item)=>{
                    const fieldMap=item.fieldMap
                    const totalName=fieldMap.totalName
                    const order=fieldMap.order-1
                    const key=fieldMap.key
                    if(key){ //有key证明数据本来就有,没有修改
                        formData.append(`${totalName}[${order}].唯一编码`,fieldMap.code);
                    }else{
                        for(let i in fieldMap){
                            if(i.includes("*") && fieldMap[i]){
                                const name=i.split("*")[0];
                                if(fieldMap[i].constructor===Object){ //上传图片
                                    formData.append(`${totalName}[${order}].${name}`,fieldMap[i].props.owlner);
                                }else{
                                    formData.append(`${totalName}[${order}].${name}`,fieldMap[i]); 
                                }                          
                            }
                            if(i==="relation"){
                                formData.append(`${totalName}[${order}].$$label$$`,fieldMap[i]);
                            }
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
      }
    exportDetail=()=>{
        const {menuId,code}=this.state
        confirm({
            title: '确认导出当前详情页？',            
            okText: "确认",
            cancelText: "取消",
            onOk() {
                Super.super({
                    url:`/api2/entity/export/detail/${menuId}/${code}`,                 
                }).then((res)=>{
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
            visibleForm: false,
            visibleTemplateList:false,
            visibleDrawer: false,
        });
    }
    showModal = () => {
        this.baseinfo.handleBaseInfoSubmit() //获取BaseInfo数据
    }
    baseInfo=(baseValue)=>{  
        const _this=this
        confirm({
            title: '确定要保存修改吗?',
            okText: '确定',
            cancelText: '取消',
            onOk() {
                _this.handleOk()
            },
          });    
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
                if(item.id.toString()===record.groupId){
                    columns=item.fields
                }
                return false
            })
        }
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
                    code:record?record.code:code
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
        // console.log(columns)
        // console.log(record)
        this.setState({
            editFormList,
            visibleForm:true,
            isNew:record?false:true,
            title:record?"修改":"新增",
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
            dataSource[groupId].push(list)
        }else{     //修改记录  
            for(let k in dataSource){
                if(k===groupId){
                    dataSource[k].map((item)=>{
                        const fildcode=item.fieldMap.code.toString()
                        console.log(fildcode)
                        console.log(Code)
                        if(fildcode===Code){
                            item.fieldMap=fieldsValue
                        }else{
                            
                        }
                        return false
                    })
                }
            }
        }
        console.log(dataSource)
        this.setState({
            dataSource,
            visibleForm:false
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
        const { menuTitle,detailsTitle,fuseMode,formltmpl,loading,visibleForm,editFormList,actions,premises,templateData,stmplId,rightNav,
            columns,dataSource,visibleDrawer,detailHistory,type,menuId,code,visibleTemplateList,fields,title,options}=this.state;
        const premisestitle=type==="detail"?"默认字段":"默认字段（不可修改）"
        let content
        if(actions && actions.length>0){
            content = (
                <div className="btns">
                    {actions.map((item)=>{
                            return <Button 
                                        key={item.id} 
                                        type="primary" 
                                        onClick={()=>this.visibleModal2(item.id,item.title)}
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
                            <Button className="hoverbig" title="查看历史" onClick={this.showHistory}><Icon type="schedule" /></Button>                                                      
                            <Button className="hoverbig" title="刷新" onClick={()=>this.loadltmpl(menuId,code)}><Icon type="sync" /></Button>
                        </div>:
                        <div className="fr pad">
                            <div className="buttonGroup">
                            {actions?
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
                                style={{background:fuseMode===true?"#001529":""}}
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
                    getTemplate={this.getTemplate}
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
                    templateData={templateData}
                    width={680}
                    stmplId={stmplId}
                    menuId={menuId}
                    getTemplate={this.getTemplate}
                    fields={fields}
                    TemplatehandleOk={this.TemplatehandleOk}
                />
                {!rightNav||rightNav.length<=3?"":
                    <RightBar 
                        list={rightNav}
                    />}              
            </div>
        )
    }
}
