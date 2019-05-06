import React from 'react'
import { Pagination ,Card,Table,Button,Icon,Popover,Modal,message} from 'antd';
import BaseForm from "./../../components/BaseForm"
import ExportFrame from './../../components/exportFrame/exportFrame'
import Units from './../../units'
import Super from "./../../super"
import './index.css'
import moment from 'moment';
//import {HelloWorld} from 'datacenter_api2_resolver';

const sessionStorage=window.sessionStorage
export default class actTable extends React.Component{
    state={
        loading: false,
        Loading:false,
        radioValue:1,
        currentPage:1,
        selectedRowKeys: [], 
        actions:[],
        fieldIds:[]
    }
    componentDidMount(){
        const {menuId}=this.props.match.params;
        this.setState({menuId})
        this.requestLtmpl(menuId)
        // const url=decodeURI(this.props.history.location.search)//获取url参数，并解码
        // if(url){
        //    this.search(Units.urlToObj(url))//更新筛选列表
        // }
    }
    componentWillReceiveProps(){
        const menuId=this.props.history.location.pathname.replace(/[^0-9]/ig,"");
        this.setState({menuId,isSeeTotal:false})
        const url=decodeURI(this.props.history.location.search)//前进后退获取url参数
        if(!url){
            this.requestLtmpl(menuId)
            //this.child.reset()
        }else{
            this.searchList(Units.urlToObj(url))//更新筛选列表
        }
    }
    handleFilter=(params)=>{
        this.props.searchParams(params)
    }
    requestLtmpl=(menuId,data)=>{ 
        const {optionsMap}=this.state
        Super.super({
            url:`/api2/entity/curd/start_query/${menuId}`,     
            data           
        }).then((res)=>{
            this.queryList(res.queryKey)
            res.ltmpl.columns.map((item)=>{
                if(item.title==="序号"){
                    item['render']= (text, record,index) => (
                                        <label>{index+1}</label>
                                    )
                }
                if(item.title==="操作"){
                    item['render']= (text, record) => (
                                    <span>
                                        <Button 
                                            type="primary" 
                                            icon="align-left" 
                                            size="small" 
                                            onClick={()=>this.handleOperate("detail",record)}>
                                            详情
                                        </Button>
                                        <Button 
                                            type="dashed" 
                                            icon="edit" 
                                            size="small" 
                                            onClick={()=>this.handleOperate("edit",record)}>
                                            修改
                                        </Button>
                                    </span>
                                    )
                }
                item.dataIndex=item.id
                return false
            })
            res.ltmpl.columns.map((item)=>{
                item.dataIndex=item.id
                item.key=item.id
                return false
            })
            const fieldIds=[]
            if(!optionsMap){
                res.ltmpl.criterias.map((item)=>{
                    if(item.inputType==="select"){
                        fieldIds.push(item.fieldId)
                    }
                    return false
                })
                this.requestSelect(fieldIds)
            }
            const url=decodeURI(this.props.history.location.search)
            if(url){//将url参数填入搜索栏
                const obj=Units.urlToObj(url)
                res.ltmpl.criterias.map((item)=>{
                    for(let k in obj){
                        if(k.split("_")[1]===item.id.toString()){
                            item.value=obj[k] //更新表单筛选
                        }
                    }
                    return false
                })
            }
            this.setState({
                moduleTitle:res.ltmpl.title,
                columns:res.ltmpl.columns,
                queryKey:res.queryKey,
                formList:res.ltmpl.criterias,
            })
        })
    }
    requestSelect=(fieldIds)=>{
        Super.super({
            url:`/api2/meta/dict/field_options`,  
            data:{fieldIds}        
		}).then((res)=>{
            this.setState({
                optionsMap:res.optionsMap
            })
		})
    }
    queryList=(queryKey,data)=>{
        const dataSource=[]
        Super.super({
            url:`/api2/entity/curd/ask_for/${queryKey}`,     
            data           
        }).then((res)=>{
            res.entities.map((item,index)=>{
                item.cellMap.key=index
                dataSource.push(item.cellMap)
                return false
            })
            this.setState({
                list:dataSource,
                pageNo:res.pageInfo.pageNo,
                pageSize:res.pageInfo.pageSize,
                currentPage:res.pageInfo.pageNo,      
                pageCount:res.pageInfo.pageSize*res.pageInfo.virtualEndPageNo,
                Loading:false,
            })
        })
    }
    // requestList=(menuId,reset)=>{ 
    //     const loading=document.getElementById('ajaxLoading')
    //     if(sessionStorage.getItem(menuId)){
    //         let res= JSON.parse(sessionStorage.getItem(menuId))
    //         this.editList(res,reset)         
    //         if(res.entities.length>0){
    //             this.setState({
    //                 pageNo:res.pageInfo.pageNo,
    //                 pageSize:res.pageInfo.pageSize,
    //             })
    //         }
    //     }else{
    //         Super.super({
    //             url:`/api2/entity/curd/list/${menuId}`,                
    //         }).then((res)=>{
    //             loading.style.display="none"
    //             if(res){
    //                 sessionStorage.setItem(menuId,JSON.stringify(res))
    //                 this.editList(res,reset)         
    //                 if(res.entities.length>0){
    //                     this.setState({
    //                         pageNo:res.pageInfo.pageNo,
    //                         pageSize:res.pageInfo.pageSize,
    //                         buttons:res.buttons,
    //                     })
    //                 }
    //             }
    //         })
    //     }				
	// }
    // editList=(data,reset)=>{
	// 	const list=[]
    //     const codes=[]
    //     const {menuId}=this.state
    //     const moduleTitle=data.ltmpl.title;
    //     const url=reset?"":decodeURI(this.props.history.location.search)
    //     if(url&&data.criterias){//有筛选条件和数据时
    //         const obj=Units.urlToObj(url)
    //         data.criterias.map((item)=>{
    //             for(let k in obj){
    //                 if(k.split("_")[1]===item.id.toString()){
    //                     item.value=obj[k] //更新表单筛选
    //                 }
    //             }
    //             return false
    //         })
    //     }else{
    //         this.child.reset()//搜索栏重置
    //     }
	// 	if(data.entities && data.entities.length!==0){
    //         data.entities.map((item)=>{			
    //             codes.push(item.code)
    //             list.push(item.fields)
    //             return false
    //         })
	// 		this.setState({
	// 			columns:this.renderColumns(data.entities[0].fields),//之所以不用ltmpl.columns,因为后面渲染按钮
    //             formList:data.criterias,
    //             list:this.renderLists(list,menuId,codes),
	// 			pageCount:data.pageInfo.count,
    //         })
	// 	}else if(data.entities && data.entities.length===0){
	// 		this.setState({
	// 			columns:"",
	// 			pageCount:'',
	// 		})
    //     }
	// 	this.setState({
    //         moduleTitle,
    //         actions:data.actions
	// 	})
    // }
	// renderLists=(data,menuId,codes)=>{
    //     const result=[];
    //     data.map((item,index)=>{
    //         let list={};
    //         list['key']=index;//每一项添加key值
    //         list['code']=codes[index];//添加code
    //         list['menuId']=menuId;
    //         item.map((item)=>{
    //             const key=item.title
    //             const value=item.value
    //             list[key]=value
    //             return false
    //         })
    //         result.push(list)
    //         return false
    //     })
    //     return result
    // }
    // renderColumns=(data)=>{
    //     if(data){
    //         data.map((item)=>{
    //             const value=item.title;
    //             item["dataIndex"]=value;	
    //             return false						
    //         })
    //         const order={
    //             title: '序号',
    //             key: 'order',
    //             render: (text, record,index) => (
    //                 <label>{index+1}</label>
    //                 ),
    //         } 
    //         data.unshift(order) 
    //         const act={
    //             title: '操作',
    //             key: 'action',
    //             render: (text, record) => (
    //             <span>
    //                 <Button 
    //                     type="primary" 
    //                     icon="align-left" 
    //                     size="small" 
    //                     onClick={()=>this.handleOperate("detail",record)}>
    //                     详情
    //                 </Button>
    //                 <Button 
    //                     type="dashed" 
    //                     icon="edit" 
    //                     size="small" 
    //                     onClick={()=>this.handleOperate("edit",record)}>
    //                     修改
    //                 </Button>
    //             </span>
    //             ),
    //         }
    //         data.push(act)
    //         return data
    //     }		
    // } 
    handleOperate=(type,record)=>{
        const {menuId}=this.state
        const code=record.code
        this.setState({loading:true,Loading:true})
        this.props.history.push(`/${menuId}/${type}/${code}`)
        this.setState({loading:false,Loading:false})
    } 
    searchList=(params)=>{
        const {menuId}=this.state
        for(let k in params){
            if(typeof params[k] ==="object"){ //日期格式转换
                if(params[k] instanceof Array){
                    const arr=[]
                    params[k].map(item=>{
                        arr.push(moment(item).format("YYYY-MM-DD"))
                        return false
                    }) 
                    params[k]=arr.join("~")
                }else{
                    params[k]=moment(params[k]).format("YYYY-MM-DD")
                }
            }
        }
        this.setState({filterOptions:params})
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
            this.props.history.push(`/${menuId}/search?${str}`)
        }
        this.requestLtmpl(menuId,{...params})			
    }
    //页码
	pageTo=(pageNo)=>{       
        const {queryKey}=this.state
        const url=decodeURI(this.props.history.location.search)
        let data="";
        this.setState({Loading:true})
        data=url?Units.urlToObj(url):""
        this.queryList(queryKey,{...data,pageNo})			
    }
    handleNew=(menuId)=>{
        this.props.history.push(`/${menuId}/new`)
    }
    handleImport=(menuId)=>{
        this.props.history.push(`/${menuId}/import`)
    }
    // handleActions=(actionId)=>{
    //     const {menuId,selectCodes}=this.state;     
    //     this.setState({Loading:true})
    //     Super.super({
    //         url:`/api2/entity/curd/do_action/${menuId}/${actionId}`, 
    //         data:{
    //             codes:selectCodes
    //         }                 
    //     }).then((res)=>{
    //         this.setState({Loading:false,selectedRowKeys: [],})
    //         if(res && res.status==="suc"){
    //             this.fresh(res.msg)
    //         }else{
    //             message.error(res.status)
    //         }
    //     })
    // }
    fresh=(msg)=>{
        this.reset()
        message.info(msg)
    }
    seeTotal=()=>{
        const {queryKey,isSeeTotal}=this.state
        if(!isSeeTotal){
            Super.super({
                url:`/api2/entity/curd/get_entities_count/${queryKey}`,                
            }).then((res)=>{
                this.setState({
                    pageCount:res.count,
                    isSeeTotal:true
                })
            })
        }       
    }
    onRef=(ref)=>{
		this.child=ref
    }
    reset=()=>{
        const {menuId}=this.state
        this.child.reset()//搜索栏重置
        this.props.history.push(`/${menuId}`)
    }
    render(){
        const {selectedRowKeys,pageNo,pageSize,filterOptions,moduleTitle,list,loading,buttons,
            formList,actions,columns,Loading,currentPage,menuId,pageCount,isSeeTotal,optionsMap,queryKey } = this.state;
        const content = <ExportFrame //导出组件
                            menuId={menuId}
                            pageNo={pageNo}
                            pageSize={pageSize}
                            filterOptions={filterOptions}
                            queryKey={queryKey}
                            /> 
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                let selectCodes=""
                selectedRows.map((item)=>{
                    selectCodes+=item.code+","
                    return false
                })
                this.setState({selectCodes,selectedRowKeys})
            },
          };
        let hideCreate=false
        let hideDelete=false
        let hideExport=false
        let hideImport=false
        let hideQuery=false
        if(buttons){
            for(let k in buttons){
                if(k==="hideCreateButton" && buttons[k]===1){
                    hideCreate=true
                }else if(k==="hideDeleteButton" && buttons[k]===1){
                    hideDelete=true
                }else if(k==="hideExportButton" && buttons[k]===1){
                    hideExport=true
                }else if(k==="hideImportButton" && buttons[k]===1){
                    hideImport=true
                }else if(k==="hideQueryButton" && buttons[k]===1){
                    hideQuery=true
                }
            }
        }
        return(
            <div className="actTable">
                <h3>
                    {moduleTitle}
                    <p className="fr">
                        {hideCreate?"":<Button 
                            className="hoverbig" 
                            title="创建" 
                            onClick={()=>this.handleNew(menuId)}>
                            <Icon type="plus"/>
                        </Button>}
                        {hideImport?"":<Button 
                            className="hoverbig" 
                            title="导入" 
                            onClick={()=>this.handleImport(menuId)}>
                            <Icon type="download" />
                        </Button>}
                        {hideExport?"":<Popover content={content} title="导出" placement="bottomRight" trigger="click">
                            <Button className="hoverbig" title="导出"><Icon type="upload" /></Button>
                        </Popover> }                      
                        <Button 
                            className="hoverbig" 
                            title="刷新" 
                            onClick={()=>this.fresh("刷新成功！")}>
                            <Icon type="sync" />
                        </Button>
                    </p>
                </h3>
                <Card className="hoverable" style={{display:formList?"block":"none"}} headStyle={{background:"#f2f4f5"}} loading={loading}>
                    <BaseForm 
                        formList={formList} 
                        filterSubmit={this.searchList} 
                        handleOperate={this.handleOperate}
                        actions={actions}
                        handleActions={this.handleActions}
                        disabled={selectedRowKeys.length>0?false:true}
                        menuId={menuId}
                        hideDelete={hideDelete}
                        hideQuery={hideQuery}
                        onRef={this.onRef}
                        optionsMap={optionsMap}
                        reset={this.reset}
                        />          
                </Card>
                <Table
                    rowSelection={hideDelete?null:rowSelection}
                    columns={columns?columns:[]}
                    dataSource={list}
                    bordered
                    pagination={false}
                    style={{display:columns?"block":"none"}}
                    loading={Loading}
                >
                </Table>
                <div className='Pagination'>
                    <span className={isSeeTotal?'sewTotal':'seeTotal'} onClick={this.seeTotal}>{isSeeTotal?`共${pageCount}条`:'点击查看总数'}</span>
                    <Pagination 
                        style={{display:'inline-block'}}
                        showQuickJumper 
                        showSizeChanger 
                        defaultCurrent={1} 
                        current={currentPage}
                        onChange={(params)=>this.pageTo(params)} 
                        hideOnSinglePage={true}
                        total={pageCount}
                        />
                </div>
            </div>
           
        )
    }
}