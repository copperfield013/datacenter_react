import React from 'react'
import Super from './../../super'
import {Tree,Card,Icon} from 'antd'
import BaseForm from './../../components/BaseForm'
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
                this.askFor(res.queryKey)
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
    askFor=(queryKey,pageNumber)=>{
        const pageNo=pageNumber?pageNumber:1
        Super.super({
            url:`/api2/entity/curd/ask_for/${queryKey}`,
            data:{
                pageNo
            }       
		}).then((res)=>{
            this.setState({
                treeData:this.bulidTree(res.entities)
            })
		})
    }
    bulidTree=(data)=>{
        const {nodeTmpl}=this.state
        data.map((item,index)=>{
            item.title=item.text
            item.key=index
            item.children=[];
            nodeTmpl.relations.map((it,i)=>{
                const copyRel = Object.assign({}, it);
                copyRel.code = item.code;
                copyRel.key = index+"-"+i
                item.children.push(copyRel);
            });
        })
        return data
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
        console.log('selected', selectedKeys, info);
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
                    }).then((res)=>{
                        res.entities.map((item,index)=>{
                            item.title=item.text
                            item.key=treeNode.props.dataRef.key+"-"+index
                            if(res.isEndList){
                                item.isLeaf=true
                            }
                        })
                        setTimeout(() => {
                            treeNode.props.dataRef.children =res.entities
                                this.setState({
                                    treeData: [...this.state.treeData],
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
                <TreeNode title={item.title} key={item.key} dataRef={item} selectable={false} icon={<Icon type="smile-o" />}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
          }
          return <TreeNode {...item} dataRef={item} selectable={false} icon={<Icon type="smile-o" />}/>;
    });
    render(){
        const {treeTitle,formList,menuId,optionsMap,treeData}=this.state
        console.log(treeData)
        return (
            <div className="detailPage">
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
                    showIcon='true'
                    loadData={this.onLoadData} 
                    onSelect={this.onSelect}
                    >{this.renderTreeNodes(treeData)}
                    </Tree>
            </div>
        );
    }
}