import React from 'react'
import Super from './../../super'
import {Tree,Card,Icon, } from 'antd'
import BaseForm from './../../components/BaseForm'
import './index.css'
const { TreeNode } = Tree;

export default class ActTree extends React.Component{
    state={
        treeTitle:'',
        formList:[],
        treeData:[]
    }
    componentDidMount(){
        this.loadTree()
    }
    loadTree=()=>{
        const menuId=this.props.match.params.menuId;
        Super.super({
            url:`/api2/entity/curd/tree/${menuId}`, 
        }).then((res)=>{
            console.log(res)
            const fieldIds=[]
            if(res){
                res.ltmpl.criterias.map((item)=>{
                    if(item.inputType==="select"){
                        fieldIds.push(item.fieldId)
                    }
                    return false
                })
                this.requestSelect(fieldIds)
                this.bulidTree(res)
                this.setState({
                    menuId,
                    treeTitle:res.menu.title+"-树形视图",
                    formList:res.ltmpl.criterias,
                    queryKey:res.queryKey,
                    nodeTmpl:res.nodeTmpl
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
                res.entities.map((item)=>{
                    item.title=item.text
                    item.isLeaf=true
                    item.selectable=false
                    return false
                })
                treeData.map((item)=>{
                    if(item.code===code){
                        item.children.map((it)=>{
                            if(it.id===id){
                                it.children.splice(it.children.length-1,1)
                                it.children.push(...res.entities)
                                it.children.map((i,index)=>{
                                    i.key=it.key+"-"+index
                                })
                            }
                            return false
                        })
                    }
                    return false
                })
                this.setState(treeData)
            }else{//最外面列表的加载更多
                const {nodeTmpl}=this.state
                res.entities.map((item,index)=>{
                    item.title=item.text
                    item.key=(pageNo-1)*10+index
                    item.children=[];
                    nodeTmpl.relations.map((it,i)=>{
                        const copyRel = Object.assign({}, it);
                        copyRel.code = item.code;
                        copyRel.key = index+"-"+i
                        item.children.push(copyRel);
                        return false
                    });
                    return false
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
        console.log('selected', selectedKeys, info)
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
                        resq.entities.map((item,index)=>{
                            item.title=item.text
                            item.key=treeNode.props.dataRef.key+"-"+index
                            item.isLeaf=true
                            return false
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
    renderTreeNodes = data =>
        data.map(item => {
          if (item.children) {
            return (
                    <TreeNode 
                        title={<span onMouseEnter={()=>alert(item.title)}>{item.title}</span>} 
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
                    dataRef={item} 
                    selectable={item.selectable?true:false} 
                    icon={item.nodeColor?<Icon type="paper-clip" style={{color:item.nodeColor}}/>:""} 
                    />
    });
    render(){
        const {treeTitle,formList,menuId,optionsMap,treeData}=this.state
        console.log(treeData)
        return (
            <div className="detailPage tree">
                 <h3>
                    {treeTitle}
                </h3>
                <Card className="hoverable" style={{display:formList?"block":"none"}} headStyle={{background:"#f2f4f5"}}>
                    <BaseForm 
                        formList={formList} 
                        // filterSubmit={this.searchList} 
                        // handleOperate={this.handleOperate}
                        // actions={tmplGroup?tmplGroup.actions:""}
                        // handleActions={this.handleActions}
                        // disabled={selectedRowKeys.length>0?false:true}
                        menuId={menuId}
                        hideDelete={true}
                        // hideQuery={hideQuery}
                        onRef={this.onRef}
                        optionsMap={optionsMap}
                        // //reset={this.reset}
                        />
                    </Card>
                <Tree 
                    showLine
                    showIcon={true}
                    loadData={this.onLoadData} 
                    onSelect={this.onSelect}
                    >{this.renderTreeNodes(treeData)}
                    </Tree>
            </div>
        );
    }
}