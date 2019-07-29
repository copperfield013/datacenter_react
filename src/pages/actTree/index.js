import React from 'react'
import Super from './../../super'
import {Tree,Card,Icon,Button,message } from 'antd'
import BaseForm from './../../components/BaseForm'
import {NavLink } from 'react-router-dom'
import moment from 'moment';
import './index.css'
import Units from './../../units'
const { TreeNode } = Tree;

export default class ActTree extends React.Component{
    state={
        treeTitle:'',
        formList:[],
        treeData:[]
    }
    componentDidMount(){
        const menuId=this.props.match.params.menuId;
        this.loadTree(menuId)
    }
    loadTree=(menuId,data)=>{
        Super.super({
            url:`/api2/entity/curd/tree/${menuId}`, 
            data,
        }).then((res)=>{
            const fieldIds=[]
            if(res){
                res.ltmpl.criterias.forEach((item)=>{
                    if(item.inputType==="select"){
                        fieldIds.push(item.fieldId)
                    }
                    const criteriaValueMap=res.criteriaValueMap
                    for(let k in criteriaValueMap){
                        if(k===item.id.toString()){
                            item.value=criteriaValueMap[k]
                        }
                    }
                })
                if(fieldIds.length>0){
                    this.requestSelect(fieldIds)
                }
                this.bulidTree(res)
                this.setState({
                    menuId,
                    treeTitle:res.menu.title+"-树形视图",
                    formList:res.ltmpl.criterias,
                    queryKey:res.queryKey,
                    nodeTmpl:res.nodeTmpl,
                })
            }
            
        })
    }
    bulidTree=(info)=>{
        const queryKey=info.node?info.node.props.queryKey:info.queryKey
        const pageNo=info.node?info.node.props.pageNo:1
        const code=info.node?info.node.props.code:null
        const id=info.node?info.node.props.id:null
        const {treeData}=this.state
        Super.super({
            url:`/api2/entity/curd/ask_for/${queryKey}`,
            data:{
                pageNo
            }       
		}).then((res)=>{
            if(code){ //最里面列表的加载更多
                res.entities.forEach((item)=>{
                    item.title=item.text
                    item.isLeaf=true
                    item.selectable=false
                })
                treeData.forEach((item)=>{
                    if(item.code===code){
                        item.children.forEach((it)=>{
                            if(it.id===id){
                                it.children.splice(it.children.length-1,1)
                                it.children.push(...res.entities)
                                it.children.forEach((i,index)=>{
                                    i.key=it.key+"-"+index
                                })
                            }
                        })
                    }
                })
                this.setState(treeData)
            }else{//最外面列表的加载更多
                const {nodeTmpl}=this.state
                res.entities.forEach((item,index)=>{
                    item.title=item.text
                    item.key=(pageNo-1)*10+index
                    item.nodeId = nodeTmpl.id;
                    item.id= nodeTmpl.relations.length===1?nodeTmpl.relations[0].id:null
                    if(nodeTmpl.relations.length>1){  
                        item.children=[]                   
                        nodeTmpl.relations.forEach((it,i)=>{
                            const copyRel = Object.assign({}, it);
                            copyRel.code = item.code;
                            copyRel.key = index+"-"+i
                            item.children.push(copyRel);
                        });
                    }
                })
                if(!res.isEndList){
                    const More={
                        key:"more",
                        title:"加载更多",
                        nodeColor:"#CCC",
                        selectable:true,
                        queryKey:res.queryKey,
                        pageNo:res.pageInfo.pageNo+1,
                        isLeaf:true,
                    }
                    res.entities.push(More)
                }
                if(treeData){
                    treeData.splice(treeData.length-1,1)
                }
                this.setState({
                    treeData:[...treeData,...res.entities]
                })
            }            
		})
    }
    requestSelect=(fieldIds)=>{
        Super.super({
            url:`api2/meta/dict/field_options`,  
            data:{fieldIds}        
		}).then((res)=>{
            this.setState({
                optionsMap:res.optionsMap
            })
		})
    }
    onSelect = (selectedKeys, info) => {
        //console.log('selected', selectedKeys, info)
        this.bulidTree(info)        
    };
    onRef=(ref)=>{
		this.child=ref
    }
    onLoadData = treeNode =>
        new Promise(resolve => {
            if (treeNode.props.children) {
                resolve();
                return;
            }
            console.log(treeNode)
            Super.super({
                url:`api2/entity/curd/start_query_rel/${this.state.menuId}/${treeNode.props.code}/${treeNode.props.id}`,        
            }).then((res)=>{
                if(res){
                    Super.super({
                        url:`api2/entity/curd/ask_for/${res.queryKey}`, 
                        data:{
                            pageNo:1
                        }       
                    }).then((resq)=>{
                        resq.entities.forEach((item,index)=>{
                            item.title=item.text
                            item.key=treeNode.props.dataRef.key+"-"+index
                            item.nodeId=res.nodeTmpl.id
                            item.id=treeNode.props.id
                        })
                        if(!resq.isEndList){
                            const More={
                                key:"more"+treeNode.props.id,
                                title:"加载更多",
                                nodeColor:"#CCC",
                                queryKey:resq.queryKey,
                                pageNo:resq.pageInfo.pageNo+1,
                                isLeaf:true,
                                selectable:true,
                                code:treeNode.props.code,
                                id:treeNode.props.id
                            }
                            resq.entities.push(More)
                        }
                        setTimeout(() => {
                            treeNode.props.dataRef.children =resq.entities
                            this.setState({
                                treeData: [...this.state.treeData]
                            });
                            resolve();
                        }, 300);
                    })
                }
            })
            
        })
    toDetail=(type,code,nodeId)=>{
        const {menuId}=this.state
        this.props.history.push(`/${menuId}/${type}/${code}/${nodeId}`)
    }
    renderTreeNodes = (data) =>{
        const {nodeTmpl,menuId}=this.state
        const hideDetail=nodeTmpl?nodeTmpl.hideDetailButton:""
        const hideUpdate=nodeTmpl?nodeTmpl.hideUpdateButton:""
        const templateGroupId=nodeTmpl?nodeTmpl.templateGroupId:""
        return data.map(item => {
          if (item.children) {
            return (
                    <TreeNode 
                        title={<div className="hoverBtn">
                                {item.title}
                                {item.title!=="加载更多"&&item.nodeColor?<span>
                                    {hideDetail===null&&templateGroupId?
                                    <NavLink to={`/${menuId}/detail/${item.code}/${item.nodeId}`} target="_blank">
                                        <Icon type="read" title="打开详情页"/>
                                    </NavLink>:""}&nbsp;
                                    {hideUpdate===null&&templateGroupId?
                                    <NavLink to={`/${menuId}/edit/${item.code}/${item.nodeId}`} target="_blank">
                                        <Icon type="edit" title="打开修改页"/>
                                    </NavLink>:""}
                                </span>:""}
                                </div>} 
                        key={item.key} 
                        dataRef={item} 
                        selectable={item.selectable?true:false} 
                        icon={item.nodeColor?<Icon type="paper-clip" style={{color:item.nodeColor}}/>:""}
                        >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
            );
          }
          return <TreeNode 
                    {...item}
                    title={<div className="hoverBtn">
                            {item.title}
                            {item.title!=="加载更多"&&item.nodeColor?<span>
                                {hideDetail===null&&templateGroupId?
                                <NavLink to={`/${menuId}/detail/${item.code}/${item.nodeId}`} target="_blank">
                                    <Icon type="read" title="打开详情页"/>
                                </NavLink>:""
                                }&nbsp;
                                {hideUpdate===null&&templateGroupId?
                                <NavLink to={`/${menuId}/edit/${item.code}/${item.nodeId}`} target="_blank">
                                    <Icon type="edit" title="打开修改页"/>
                                </NavLink>:""}
                            </span>:""}
                            </div>}  
                    dataRef={item} 
                    selectable={item.selectable?true:false} 
                    icon={item.nodeColor?<Icon type="paper-clip" style={{color:item.nodeColor}}/>:""} 
                    />
    });}
    searchList=(params,menuId)=>{
        for(let k in params){
            if(typeof params[k] ==="object"){ //日期格式转换
                if(params[k] instanceof Array){
                    const arr=[]
                    params[k].forEach(item=>{
                        arr.push(moment(item).format("YYYY-MM-DD"))
                    }) 
                    params[k]=arr.join("~")
                }else{
                    params[k]=moment(params[k]).format("YYYY-MM-DD")
                }
            }
        }
        this.setState({filterOptions:params,treeData:[]})
        const oldfliter=this.props.history.location.search.slice(1)
        const newfliter=Units.queryParams(params)
        const url=decodeURI(this.props.history.location.search)
        let flag=false
        if(oldfliter!==newfliter){ //查询条件更新时
            flag=true
        }
        if(!url){ //没有查询条件时
            flag=true
        }
        if(flag){
            const str=Units.queryParams(params)
            this.props.history.push(`/${menuId}/ActTree?${str}`)
        }
        this.loadTree(menuId,{...params})			
    }
    fresh=(msg)=>{
        const {menuId}=this.state
        this.setState({treeData:[]})
        this.child.reset()
        this.loadTree(menuId)
        message.success(msg)
    }
    render(){
        const {treeTitle,formList,menuId,optionsMap,treeData}=this.state
        //console.log(treeData)
        return (
            <div className="detailPage tree">
                 <h3>
                    {treeTitle?treeTitle:null}
                    <p className="fr pad">
                        <Button 
                            className="hoverbig" 
                            title="创建" 
                            onClick={()=>this.props.history.goBack()}>
                            <Icon type="rollback"/>
                        </Button>
                        <Button 
                            className="hoverbig" 
                            title="刷新" 
                            onClick={()=>this.fresh("刷新成功!")}>
                            <Icon type="sync" />
                        </Button>
                    </p>
                </h3>
                <Card className="hoverable" style={{display:formList?"block":"none"}} headStyle={{background:"#f2f4f5"}}>
                    <BaseForm 
                        formList={formList} 
                        filterSubmit={this.searchList}
                        menuId={menuId}
                        hideDelete={true}
                        onRef={this.onRef}
                        optionsMap={optionsMap}
                        />
                    </Card>
                {treeData&&treeData.length!==0?<Tree 
                    showLine
                    showIcon={true}
                    loadData={this.onLoadData} 
                    onSelect={this.onSelect}
                    >
                    {this.renderTreeNodes(treeData)}
                </Tree>:<p>暂无实体</p>}
            </div>
        );
    }
}