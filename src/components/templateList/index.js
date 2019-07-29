import React from 'react'
import { Modal,Table,Pagination, message,Tree,Icon } from 'antd';
import Super from './../../super'
import BaseForm from './../BaseForm'
const { TreeNode } = Tree;

export default class TemplateList extends React.Component{
    state={
        selectedRowKeys: [],
        isSeeTotal:false,
        currentPage:1,
        pageCount:0,
        treeData:[],
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.fileType==="ttmpl" && nextProps.templateData){
            const id=nextProps.templateDtmpl.config?nextProps.templateDtmpl.config.nodeTmpl.relations[0].id:null
            nextProps.templateData.entities.forEach((item)=>{
                item.key=item.code
                item.id=id
            })
            if(!nextProps.templateData.isEndList){
                const More={
                    key:"more",
                    text:"加载更多",
                    nodeColor:"#CCC",
                    selectable:true,
                    queryKey:nextProps.templateData.queryKey,
                    pageNo:nextProps.templateData.pageInfo.pageNo+1,
                    isLeaf:true,
                }
                nextProps.templateData.entities.push(More)
            }
            console.log(nextProps.templateData.entities)
            this.setState({
                menuId:nextProps.menuId,
                treeData:nextProps.templateData.entities,
                nodeTmpl:nextProps.templateDtmpl.config.nodeTmpl,
            })
        }
    }
    handleOk=()=>{
        const {selectCodes}=this.state
        this.props.TemplatehandleOk(selectCodes,null,true)
        this.setState({selectedRowKeys:[]})     
    }
    seeTotal=()=>{
        const {isSeeTotal}=this.state
        const {queryKey}=this.props.templateData
        if(!isSeeTotal){
            Super.super({
                url:`api2/entity/curd/get_entities_count/${queryKey}`,                
            }).then((res)=>{
                this.setState({
                    isSeeTotal:res.count,
                })
            })
        }       
    }
    //页码
	pageTo=(pageNo, pageSize)=>{
        const {queryKey}=this.props.templateData
        this.setState({
            currentPage:pageNo
        })
        this.props.templatePageTo(queryKey,{pageNo,pageSize})			
    }
    onRef=(ref)=>{
		this.child=ref
    }
    templatehandleSave=()=>{
        this.child.handleBaseInfoSubmit()
    }
    baseInfo=(result)=>{
        const {menuId,templateDtmpl,formTmplGroupId}=this.props
        const code=templateDtmpl[0].code
        const formData = new FormData(); 
        if(code){ //有code是修改，没有是新增实体模板
            formData.append('唯一编码',code)
        }
        for(let k in result){
            formData.append(k, result[k])
        }
        Super.super({
            url:`api2/entity/curd/save/rabc/${menuId}/${formTmplGroupId}`,    
            data:formData       
        },'formdata').then((res)=>{
            if(res.status==="suc"){
                this.props.TemplatehandleOk(res.code,formTmplGroupId,code?false:true) //为了后面新增的push
            }else{
                message.error("操作失败")
            }
        })
    }
    renderTreeNodes = (data) =>{
        //console.log(data)
        return data?data.map(item => {
         if (item.children) {
            return (
                    <TreeNode 
                        title={<div className="hoverBtn">{item.text}</div>} 
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
                    title={<div className="hoverBtn">{item.text}</div>}  
                    dataRef={item} 
                    selectable={item.selectable?true:false} 
                    icon={item.nodeColor?<Icon type="paper-clip" style={{color:item.nodeColor}}/>:""} 
                    />
    }):""
}
    onLoadData = treeNode =>
        new Promise(resolve => {
            if (treeNode.props.children) {
                resolve();
                return;
            }
            const nodeId=treeNode.props.dataRef.nodeId
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
                        resq.entities.forEach((item)=>{
                            item.title=item.text
                            item.key=item.code
                            item.id=treeNode.props.id
                            item.nodeId=nodeId
                        })
                        if(!resq.isEndList){
                            const More={
                                key:"more"+treeNode.props.id,
                                text:"加载更多",
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
                        console.log(resq.entities)
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
            console.log(res)
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
                    item.nodeId=nodeTmpl.id
                    item.children=[];
                    nodeTmpl.relations.forEach((it,i)=>{
                        const copyRel = Object.assign({}, it);
                        copyRel.code = item.code;
                        copyRel.key = index+"-"+i
                        item.children.push(copyRel);
                    })
                })
                if(!res.isEndList){
                    const More={
                        key:"more",
                        text:"加载更多",
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
    onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info)
        this.bulidTree(info)        
    };
    handleTreeCodes = (checkedKeys, info) => {
        console.log(checkedKeys,info)
        this.setState({
            selectedTreeCodes:checkedKeys.checked
        })
    };
    handleTreeOk=()=>{
        const {selectedTreeCodes}=this.state       
        this.props.TemplatehandleOk(selectedTreeCodes,null,true)
        console.log(selectedTreeCodes)
    }
    render(){
        const {templateDtmpl,visibleTemplateList,handleCancel,templateData,menuId,title,maskClosable}=this.props
        let {selectedRowKeys,isSeeTotal,currentPage,pageCount,formList,treeData}=this.state
        let columns=templateDtmpl&&templateDtmpl.config?templateDtmpl.config.columns:[] 
        //console.log(templateDtmpl)
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                let selectCodes=""
                const arr=[]
                selectedRows.forEach((item)=>{
                    arr.push(item.code)
                })
                selectCodes=arr.join(',')
                this.setState({selectCodes,selectedRowKeys})
            },
        }
        let dataSource=[]                  
        if(templateDtmpl && templateData &&columns){
            formList=templateDtmpl.config?templateDtmpl.config.criterias:null
            pageCount=templateData.pageInfo.virtualEndPageNo*templateData.pageInfo.pageSize           
            columns.forEach((item)=>{
                item["dataIndex"]=item.id;
                if(item.title==="序号"){
                    item["dataIndex"]="order";
                }
            })
            templateData.entities.forEach((item,index)=>{
                const list={}
                list['key']=index;
                list['order']=index+1;
                list['code']=item.code;
                for(let k in item.cellMap){
                    list[k]=item.cellMap[k]
                }
                dataSource.push(list)
            })
        }
        
        return (
            <div>
                {templateDtmpl&&templateDtmpl.config&&templateDtmpl.config.type==="ttmpl"?// 弹出树的模态框
                    <Modal
                        title={title}
                        visible={visibleTemplateList}
                        okText={"确认"}
                        cancelText="取消"
                        centered
                        onOk={this.handleTreeOk}
                        onCancel={handleCancel}
                        width={900}
                        maskClosable={maskClosable}
                        bodyStyle={{height:400,overflow:'auto'}}
                        destroyOnClose={true}>
                            {treeData&&treeData.length!==0?
                                <Tree 
                                    checkable
                                    showLine
                                    checkStrictly
                                    showIcon={true}
                                    loadData={this.onLoadData} 
                                    onSelect={this.onSelect}
                                    onCheck={this.handleTreeCodes}
                                    >
                                    {this.renderTreeNodes(treeData)}
                                </Tree>:<p>暂无实体</p>}
                    </Modal>
                    :
                    <Modal
                        title={title}
                        visible={visibleTemplateList}
                        okText={"保存"}
                        cancelText="取消"
                        centered
                        onOk={this.handleOk}
                        onCancel={handleCancel}
                        destroyOnClose
                        width={900}
                        maskClosable={maskClosable}
                        >
                            <div> 
                                <BaseForm 
                                    formList={formList} 
                                    filterSubmit={this.props.templateSearch} 
                                    handleOperate={this.handleOperate}
                                    handleActions={this.handleActions}
                                    menuId={menuId}
                                    hideDelete='true'
                                    onRef={this.onRef}
                                    />    
                                <Table
                                    rowSelection={rowSelection}
                                    columns={columns}
                                    dataSource={dataSource}
                                    bordered
                                    pagination={false}
                                >
                                </Table>
                                <div className='Pagination'>
                                    <span 
                                        className={isSeeTotal?'sewTotal':'seeTotal'} 
                                        onClick={this.seeTotal}
                                        >
                                        {isSeeTotal?`共${isSeeTotal}条`:'点击查看总数'}
                                    </span>
                                    <Pagination 
                                        style={{display:'inline-block'}}
                                        showQuickJumper 
                                        showSizeChanger 
                                        pageSizeOptions={['5','10','15','20']}
                                        defaultCurrent={1} 
                                        current={currentPage}
                                        onChange={(page, pageSize)=>this.pageTo(page, pageSize)} 
                                        onShowSizeChange={(current, size)=>this.pageTo(current, size)}
                                        hideOnSinglePage={true}
                                        total={pageCount}
                                        />
                                </div>
                            </div>                                     
                    </Modal>
                }
        </div>
        )
    }
}