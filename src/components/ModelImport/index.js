import React from 'react'
import Super from "./../../super"
import Units from "./../../units"
import {Button,Icon,Popover,Input,Table,Modal, message,Collapse} from 'antd'
import MyTag from './../MyTag'
//import DragTable from './../DragTable'
import './index.css'
const {confirm} = Modal
const {Panel}=Collapse

export default class ModelImport extends React.Component{

    state={
        modelList:[],
        title:"",
        visible:false,
        dataSource:[]
    }
    componentDidMount(){
        const {menuId}=this.props
        this.loadWords(menuId)
    }
    loadWords=(menuId)=>{
        Super.super({
            url:`api2/entity/import/dict/${menuId}`,        
        }).then((res)=>{
            console.log(res)
            let selectWords=res.fieldDictionary.composites
            selectWords.map((item)=>{
                if(item.fields.length>0){
                    item.fields.map((it)=>{
                        it.checked=false
                        it.key=it.name
                        return false
                    })
                }
                return false
            })
            this.setState({
                selectWords
            })
        })
    }
    switchTemplate=()=>{
        const {menuId}=this.props
        this.handleVisibleChange(true)
        Super.super({
            url:`api2/entity/import/tmpls/${menuId}`,        
        }).then((res)=>{
            if(res){
                this.setState({
                    modelList:res.tmpls,
                })
            }
        })
    }
    handelModel=(tmplId)=>{
        const {menuId}=this.props
        Super.super({
            url:`api2/entity/import/tmpl/${menuId}/${tmplId}`,        
        }).then((res)=>{
            console.log(res)
            if(res){
                let data=[]
                const fields=[]
                res.tmpl.fields.map((item)=>{
                    let list={
                        key:item.title,
                        name:item.title,
                        words:item.title
                    }
                    data.push(list)
                    let fieldsList={
                        fieldId:item.fieldId,
                        id:item.id
                    }
                    fields.push(fieldsList)
                    return false
                })
                this.setState({
                    tmplId:res.tmpl.id,
                    dataSource:data,
                    title:res.tmpl.title,
                    listLength:res.tmpl.fields.length,
                    fields
                })
                this.handleVisibleChange(false)
            }
        })
    }
    handleVisibleChange=(value)=>{
        this.setState({ visible:value });
    }
    handleSave=()=>{
        const {menuId}=this.props
        const {tmplId,title,fields}=this.state
        console.log(fields)
        const data=JSON.stringify({
                        tmplId,
                        title,
                        fields,
                    })                   
        Super.super({
            url:`api2/entity/import/save_tmpl/${menuId}`, 
            data
        },"json").then((res)=>{
            if(res){
                console.log(res)
                this.setState({
                    tmplId:res.tmplId
                })
            }
        })
    }
    handleDownload=()=>{       
        const { menuId }=this.props
        const { tmplId,title,fields,listLength }=this.state
        if(tmplId){
            confirm({
                title: `确认下载`,
                content: `当前模板[${title}]，模板内共有${listLength}个字段`,
                okText: '是的',
                cancelText: '取消',
                onOk() {
                    Super.super({
                        url:`api2/entity/import/save_tmpl/${menuId}`, 
                        data:{
                            tmplId,
                            title,
                            fields,
                        }     
                    },"json").then((res)=>{
                        if(res){
                            const tokenName=Units.getLocalStorge("tokenName")
                            Units.downloadFile(`api2/entity/import/t/download_tmpl/${res.tmplId}?@token=${tokenName}`)
                        }
                    })
                
                },
            }) 
        }else{
            message.info("请选择模板")
        }
    }
    setModelName=(e)=>{
        this.setState({
            title:e.target.value
        })
    }
    deleteRow=(record)=>{
        console.log(record)
        let {dataSource,selectWords}=this.state
        dataSource.map((item,i)=>{
            if(item.key===record.key){
                dataSource.splice(i,1)
            }
            return false
        })
        if(record.type==="normal"){           
            selectWords.map((item,i)=>{
                if(item.fields.length>0){
                    item.fields.map((it)=>{
                        if(it.key===record.key){
                            it.checked=false
                        }
                        return false
                    })
                }
                return false
            })
        }else{
            let len=[]
            let labelarr=[]
            let totalList=[]
            const recTotalName=record.key.split(".")[0]
            dataSource.map((item)=>{
                const itemTotalName=item.key.split(".")[0]
                if(item.id && recTotalName===itemTotalName){
                    totalList.push(item)
                }
                if(item.id===record.id){
                    len.push(item)
                }
                if(!item.id){
                    labelarr.push(item)
                }
                return false
            })
            len.map((item,i)=>{
                const NM=`${record.totalname}[${i}].${record.name.split(".")[1]}`
                item.key=NM
                item.name=NM
                item.words=NM
                return false
            })
            if(record.type==="relation"){ 
                if(totalList.length===0){
                    labelarr[labelarr.length-1].delete=true
                }
                if(len.length>0 && len.length<labelarr.length){
                    labelarr[labelarr.length-1].delete=true
                }
                dataSource.map((item,i)=>{
                    if(item.delete){
                        dataSource.splice(i,1)
                    }
                })
            }
        } 
        this.setState({
            dataSource,
            selectWords
        })
    }
    getWords=(list,type)=>{
        let {dataSource,selectWords}=this.state
        if(type==="normal"){
            dataSource.push(list)
            selectWords.map((item,i)=>{ //normal改变tag选中状态
                if(item.fields.length>0){
                    item.fields.map((it)=>{
                        if(it.key===list.key){
                            it.checked=true
                        }
                        return false
                    })
                }
                return false
            })
        }else{
            let len=[]
            dataSource.map((item)=>{
                if(item.id===list.id && !item.key.includes("label")){
                    len.push(item)
                }
                return false
            })
            const NM=`${list.totalname}[${len.length}].${list.name}`
            const res={
                id:list.id,
                key:NM,
                name:NM,
                words:NM,
                totalname:list.totalname,
                type:list.type,
            }
            if(type==="relation"){
                const NLabel=`${list.totalname}[${len.length}].$label$`
                const labelRes={
                    key:NLabel,
                    name:NLabel,
                    words:NLabel,
                    totalname:list.totalname,
                }   
                dataSource.push(labelRes)
            }
            dataSource.push(res)
        }
        
        this.setState({
            dataSource:Units.uniq(dataSource,"key"),
            selectWords
        })
    }
    render(){
        const { visible,title,dataSource,selectWords,modelList,tmplId }=this.state
        //console.log(selectWords)
        const content = (
            <div>
                {modelList.map((item)=>{
                        return  <div key={item.id} className="modelList" onClick={()=>this.handelModel(item.id)}>
                                    <span className={tmplId===item.id?"light":""}><Icon type="bulb" style={{color:"#fff",fontSize:20}}/></span>
                                    <p className="tit">{item.title}</p>
                                    <p>{Units.formateDate(item.createTime)}</p>
                                </div>
                    })}
            </div>
        );
        const columns = [{
            title: '表头',
            key: 'name',
            width: 200,
            dataIndex:"name"
          }, {
            title: '字段',
            key: 'words',
            width: 200,
            dataIndex:"words"
          }, {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <Button 
                    style={{display:record.key.includes("label")?'none':'block'}} 
                    size='small' type="danger"
                     onClick={()=>this.deleteRow(record)}>
                    <Icon type="delete"/>
                </Button>
            ),
          }, ]
        return (
            <div className="selectModal">
                <h3>
                    导入模板配置
                    <p className="fr">
                        <Button className="hoverbig" title="新建模板"><Icon type="file-add" /></Button>                                                
                        <Button className="hoverbig" title="下载导入模板" onClick={this.handleDownload}><Icon type="download" /></Button>
                        <Button className="hoverbig" title="保存模板" onClick={this.handleSave}><Icon type="save" /></Button>
                        <Popover 
                            content={content} 
                            placement="bottomRight" 
                            trigger="click" 
                            visible={visible} 
                            onVisibleChange={this.handleVisibleChange}>
                            <Button 
                                className="hoverbig" 
                                title="切换模板" 
                                onClick={this.switchTemplate}
                                >
                                    <Icon type="snippets" />
                            </Button>
                        </Popover> 
                    </p>
                </h3>
                <div style={{marginBottom:20}}>
                    模板名称：
                    <Input placeholder="输入导入模板名称" style={{ width: 200 }} value={title} onChange={this.setModelName}/>
                </div>
                <div className="table">                   
                    <Table
                        bordered
                        columns={columns}
                        dataSource={dataSource}
                        size="small"
                        pagination={false}
                    />
                    {/* <DragTable
                        columns={columns}
                        dataSource={dataSource}
                        size="small"
                    
                    /> */}
                </div>
                {
                    selectWords?<Collapse accordion style={{float:"right"}}>
                                    {selectWords.map((item)=>{
                                        if(item.fields.length>0){
                                            return <Panel header={item.name} key={item.id}>
                                                        {item.fields.map((it)=>{
                                                            return <MyTag 
                                                                        key={it.name} 
                                                                        id={it.id}
                                                                        name={it.name}
                                                                        checked={it.checked}
                                                                        getwords={this.getWords}
                                                                        type={item.type}
                                                                        totalname={item.name}
                                                                        >{it.name}</MyTag>
                                                        })}
                                                    </Panel>
                                            
                                        }
                                        return false
                                    })}
                                </Collapse>:""
                }
            </div>
        )
    }
}
    