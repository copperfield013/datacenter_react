import React from 'react'
import Super from "./../../super"
import Units from "./../../units"
import {Button,Icon,Popover,Input,Table,Modal, message,Collapse,Tag} from 'antd'
import './index.css'
const confirm = Modal.confirm;
const Panel=Collapse.Panel

export default class ModelImport extends React.Component{

    state={
        modelList:[],
        title:"",
        visible:false,
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
            this.setState({
                selectWords:res.fieldDictionary.composites
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
        const menuId=this.props.menuId;
        Super.super({
            url:`api2/entity/import/tmpl/${menuId}/${tmplId}`,        
        }).then((res)=>{
            console.log(res)
            if(res){
                let data=[]
                const fields=[]
                res.tmpl.fields.map((item)=>{
                    let list={
                        key:item.id,
                        name:item.title,
                        words:item.title
                    }
                    data.push(list)
                    let fieldsList={
                        fieldId:item.id,
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
        const api="http://47.100.187.235:7080/hydrocarbon-api/"
        const tokenName=Units.getLocalStorge("tokenName")
        fetch(api+`api2/entity/import/save_tmpl/${menuId}?@token=${tokenName}`, {
            method: 'PUT', // or 'PUT'
            body: data,
            mode: 'cors', 
            headers:{'Content-Type': 'application/json'}
        }).then((res)=>console.log(res));
                    
        // Super.super({
        //     url:`api2/entity/import/save_tmpl/${menuId}`, 
        //     data
        // },"json").then((res)=>{
        //     if(res){
        //         console.log(res)
        //         this.setState({
        //             uuid:res.uuid
        //         })
        //     }
        // })
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
        const {dataSource}=this.state
        dataSource.map((item,i)=>{
            if(item.key===record.key){
                dataSource.splice(i,1)
            }
        })
        this.setState({
            dataSource
        })
    }
    render(){
        const { visible,title,dataSource,selectWords,modelList,tmplId }=this.state
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
                <span>
                    <Icon type="delete" onClick={()=>this.deleteRow(record)}/>
                </span>
            ),
          }, ]
        return (
            <div style={{height:400}} className="selectModal">
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
                </div>
                {
                    selectWords?<Collapse accordion style={{float:"right"}}>
                                    {selectWords.map((item)=>{
                                        if(item.fields.length>0){
                                            return <Panel header={item.name} key={item.id}>
                                                    {item.fields.map((it)=>{
                                                        return <Tag key={it.id}>{it.name}</Tag>
                                                    })}
                                                    </Panel>
                                        }
                                    })}
                                </Collapse>:""
                }
            </div>
        )
    }
}
    