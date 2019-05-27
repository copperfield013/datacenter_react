import React from 'react'
import Super from "./../../super"
import Units from "./../../units"
import {Button,Icon,Popover,Input,Table,Modal, message,Collapse,Tag} from 'antd'
//import DragTable from './../DragTable'
import './index.css'
const {confirm} = Modal
const {Panel}=Collapse
const {CheckableTag}=Tag

export default class ModelImport extends React.Component{

    state={
        modelList:[],
        title:"",
        visible:false,
        dataSource:[],
        fields:[],
    }
    componentDidMount(){
        const {menuId}=this.props
        this.loadWords(menuId)
    }
    loadWords=(menuId)=>{
        Super.super({
            url:`api2/entity/import/dict/${menuId}`,        
        }).then((res)=>{
            let selectWords=res.fieldDictionary.composites
            //console.log(selectWords)
            const forType=[]
            selectWords.map((item)=>{
                if(item.fields.length>0){
                    item.fields.map((it)=>{
                        it.checked=false
                        it.key=it.name
                        if(item.type==="relation"){
                            it.compositeId=item.id
                        }
                        const list={
                            type:item.type,
                            fieldId:it.id,
                        }
                        forType.push(list)
                        return false
                    })
                }
                return false
            })
            this.setState({
                selectWords,
                forType
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
        const {forType,selectWords}=this.state
        const fields=[]
        Super.super({
            url:`api2/entity/import/tmpl/${menuId}/${tmplId}`,        
        }).then((res)=>{
            console.log(res.tmpl.fields)
            if(res){
                selectWords.map((item)=>{
                    if(item.type==="normal"){
                        item.fields.map((it)=>{
                            let check=false
                            res.tmpl.fields.map((i)=>{
                                if(i.fieldId===it.id){
                                    check=true
                                }
                                return false
                            })
                            it.checked=check
                            return false
                        })
                    }
                    return false
                })
                let data=[]
                let type=""
                res.tmpl.fields.map((item)=>{
                    forType.map((it)=>{  //选择模板数据，添加type值
                        if(item.fieldId===it.fieldId){
                            type=it.type
                        }
                        return false
                    })
                    let list={
                        key:item.title,
                        name:item.title,
                        words:item.title,
                        fieldId:item.fieldId,
                        type,
                    }
                    data.push(list)
                    let fieldsList={}
                    if(item.fieldId){
                        fieldsList={
                            fieldId:item.fieldId,
                            id:item.id,
                        }
                    }else{
                        fieldsList={
                            compositeId:item.compositeId,
                        }
                    }
                    if(item.fieldIndex!==null){
                        fieldsList.fieldIndex=item.fieldIndex
                    }
                    fields.push(fieldsList)
                    return false
                })
                //console.log(fields)
                this.setState({
                    tmplId:res.tmpl.id,
                    dataSource:data,
                    title:res.tmpl.title,
                    listLength:res.tmpl.fields.length,
                    fields,
                    selectWords
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
        const {tmplId,title,fields,dataSource}=this.state
        //console.log(dataSource)
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
                //console.log(res.tmplId)
                this.setState({
                    tmplId:res.tmplId,
                    listLength:dataSource.length,
                })
            }
        })
    }
    handleDownload=()=>{       
        const { tmplId,title,listLength,dataSource }=this.state
        if(dataSource.length!==listLength){
            message.info("请保存模板")
            return
        }
        const tokenName=Units.getLocalStorge("tokenName")
        if(tmplId){
            confirm({
                title: `确认下载`,
                content: `当前模板[${title}]，模板内共有${listLength}个字段`,
                okText: '是的',
                cancelText: '取消',
                onOk() {
                    return Units.downloadFile(`api2/entity/import/download_tmpl/${tmplId}?@token=${tokenName}`)               
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
        //console.log(record)
        let {dataSource,selectWords,fields}=this.state
        dataSource.map((item,i)=>{
            if(item.key===record.key){
                dataSource.splice(i,1)
            }
            return false
        })
        fields.map((item,i)=>{
            if(item.fieldId===record.fieldId){
                fields.splice(i,1)
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
            let data=[]
            console.log(record)
            console.log(dataSource)  
            dataSource.map((item)=>{
                if(item.fieldId===record.fieldId && !item.key.includes("label")){ 
                    len.push(item)
                }
                if(item.key.includes("label")){  
                    labelarr.push(item)
                }
                if(item.fieldId && !item.key.includes("label")){
                    data.push(item)
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
                let dele=true
                data.map((item)=>{
                    const dataTotal=item.key.split(".")[0]
                    const labelLastTotal=labelarr[labelarr.length-1].key.split(".")[0]                    
                    if(dataTotal===labelLastTotal){
                        dele=false
                    }
                    labelarr[labelarr.length-1].delete=dele
                    return false
                }) 
                if(data.length===0){
                    labelarr[labelarr.length-1].delete=true
                }      
                console.log(dataSource)      
                dataSource.map((item,i)=>{
                    if(item.delete){
                        dataSource.splice(i,1)
                    }
                    return false
                })
            }
        } 
        console.log(fields)
        this.setState({
            dataSource:Units.uniq(dataSource,"key"),
            selectWords,
            fields,
        })
    }
    getWords=(list,type)=>{
        let {dataSource,selectWords,fields}=this.state      
        if(type==="normal"){
            const getlist={
                fieldId:list.fieldId
            }
            fields.push(getlist)//添加提交的fieldId
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
            // console.log(list)
            // console.log(dataSource)
            let len=[]
            dataSource.map((item)=>{
                if(item.fieldId===list.fieldId && !item.key.includes("label")){
                    len.push(item)
                }
                return false
            })
            const NM=`${list.totalname}[${len.length}].${list.name}`
            const res={
                fieldId:list.fieldId,
                key:NM,
                name:NM,
                words:NM,
                totalname:list.totalname,
                type:list.type,
            }
            if(type==="relation"){
                const NLabel=`${list.totalname}[${len.length}].$$label$$`
                const labelRes={
                    key:NLabel,
                    name:NLabel,
                    words:NLabel,
                    totalname:list.totalname,
                }   
                dataSource.push(labelRes)
            }
            dataSource.push(res)
            if(dataSource.length===Units.uniq(dataSource,"key").length){  //判断是否新增label
                fields.push({compositeId:list.compositeId,fieldIndex:len.length})
            }
            fields.push({fieldId:list.fieldId,fieldIndex:len.length})
        }
        //console.log(fields)
        this.setState({
            dataSource:Units.uniq(dataSource,"key"),
            selectWords,
            fields
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
                                                                        compositeid={it.compositeId}
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

class MyTag extends React.Component {
    
    handleChange = (id,name) => {
      const {type,totalname,compositeid}=this.props
      const list={
        key:name,
        fieldId:id,
        name:name,
        words:name,
        totalname,
        type,
        compositeId:compositeid
      }
      this.props.getwords(list,type)
    };
    render() {
      const {name,id,checked}=this.props
      return (
        <CheckableTag {...this.props} onChange={()=>this.handleChange(id,name)} className={checked?"":"borderTag"}/>
      );
    }
  }