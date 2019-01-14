import React from 'react'
import Super from "./../../super"
import Units from "./../../units"
import {Button,Icon,Popover,Input,Table,Modal, message} from 'antd'
import './index.css'
const confirm = Modal.confirm;

const storage=window.sessionStorage;
export default class ModelImport extends React.Component{

    state={
        modelList:[],
        modelName:"",
        visible:false,
    }
    switchTemplate=()=>{
        const menuId=this.props.menuId;
        this.handleVisibleChange(true)
        Super.super({
            url:`/api/entity/import/tmpls/${menuId}`,        
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
            url:`/api/entity/import/tmpl/${menuId}/${tmplId}`,        
        }).then((res)=>{
            if(res){
                let data=[]
                res.tmpl.fields.map((item)=>{
                    let list={}
                    list["key"]=item.id
                    list["name"]=item.title
                    list["words"]=item.title
                    data.push(list)
                    return false
                })
                this.setState({
                    lightId:res.tmpl.id,
                    dataSource:data,
                    modelName:res.tmpl.title,
                    listLength:res.tmpl.fields.length,
                    fields:res.tmpl.fields
                })
                this.handleVisibleChange(false)
            }
        })
    }
    handleVisibleChange=(value)=>{
        this.setState({ visible:value });
    }
    // handleSave=()=>{
    //     const menuId=this.props.menuId;
    //     const tmplId=this.state.lightId;
    //     const title=this.state.modelName;
    //     const fields=this.state.fields
    //     Super.super({
    //         url:`/api/entity/import/save_tmpl/${menuId}`, 
    //         data:{
    //             tmplId,
    //             title,
    //             fields,
    //         }     
    //     },"json").then((res)=>{
    //         if(res){
    //             console.log(res)
    //             this.setState({
    //                 uuid:res.uuid
    //             })
    //         }
    //     })
    // }
    handleDownload=()=>{       
        const menuId=this.props.menuId;
        const tmplId=this.state.lightId;
        if(tmplId){         
            const title=this.state.modelName;
            const fields=this.state.fields
            const tokenName=storage.getItem('tokenName')
            confirm({
                title: `确认下载`,
                content: `当前模板[${this.state.modelName}]，模板内共有${this.state.listLength}个字段`,
                okText: '是的',
                cancelText: '取消',
                onOk() {
                    Super.super({
                        url:`/api/entity/import/save_tmpl/${menuId}`, 
                        data:{
                            tmplId,
                            title,
                            fields,
                        }     
                    },"json").then((res)=>{
                        if(res){
                            Units.downloadFile(`/api/entity/import/download_tmpl/${tokenName}/${res.uuid}`)
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
            modelName:e.target.value
        })
    }
    render(){
        const content = (
            <div>
                {this.state.modelList.map((item)=>{
                        return  <div key={item.id} className="modelList" onClick={()=>this.handelModel(item.id)}>
                                    <span className={this.state.lightId===item.id?"light":""}><Icon type="bulb" style={{color:"#fff",fontSize:20}}/></span>
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
                    <Icon type="delete" />
                </span>
            ),
          }, ]
        return (
            <div style={{height:400}}>
                <h3>
                    导入模板配置
                    <p className="fr">   
                        <Popover content={content} placement="bottomRight" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
                            <Button className="hoverbig" title="切换模板" onClick={this.switchTemplate}><Icon type="snippets" /></Button>
                        </Popover>                       
                        {/* <Button className="hoverbig" title="保存模板" onClick={this.handleSave}><Icon type="save" /></Button> */}
                        <Button className="hoverbig" title="下载导入模板" onClick={this.handleDownload}><Icon type="download" /></Button>
                    </p>
                </h3>
                <div style={{marginBottom:20}}>
                    模板名称：
                    <Input placeholder="输入导入模板名称" style={{ width: 200 }} value={this.state.modelName} onChange={this.setModelName}/>
                </div>
                <div style={{overflowY:"auto",height:300}}>                   
                    <Table
                        bordered
                        columns={columns}
                        dataSource={this.state.dataSource}
                        size="small"
                        pagination={false}
                    />
                </div> 
            </div>
        )
    }
}
    