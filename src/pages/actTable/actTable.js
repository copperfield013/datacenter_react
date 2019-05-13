import React from 'react'
import { Pagination ,Card,Table,Button,Icon,Popover,Modal,message} from 'antd';
import BaseForm from "./../../components/BaseForm"
import ExportFrame from './../../components/exportFrame/exportFrame'
import Units from './../../units'
import Super from "./../../super"
import './index.css'
import moment from 'moment';
import {HelloWorld} from 'datacenter_api2_resolver';

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
        HelloWorld.say()
        const {menuId}=this.props.match.params;
        this.setState({menuId})
        this.requestLtmpl(menuId)
        const url=decodeURI(this.props.history.location.search)//获取url参数，并解码
        if(!url){
            this.requestLtmpl(menuId)
        }else{
            this.searchList(Units.urlToObj(url),menuId)//更新筛选列表
        }
    }
    componentWillReceiveProps(){
        const menuId=this.props.history.location.pathname.replace(/[^0-9]/ig,"");
        this.setState({menuId,isSeeTotal:false})
        const url=decodeURI(this.props.history.location.search)//前进后退获取url参数
        if(!url){
            this.requestLtmpl(menuId)
        }else{
            this.searchList(Units.urlToObj(url),menuId)//更新筛选列表
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
            //console.log(res)
            this.queryList(res.queryKey)
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
            }else{
                this.child.reset()
            }
            this.setState({
                moduleTitle:res.ltmpl.title,
                columns:this.renderColumns(res.ltmpl.columns),
                queryKey:res.queryKey,
                formList:res.ltmpl.criterias,
                tmplGroup:res.tmplGroup,
            })
        })
    }
    renderColumns=(columns)=>{
        columns.map((item)=>{
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
            item.key=item.id
            return false
        })
        return columns
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
        const {isSeeTotal}=this.state
        const dataSource=[]
        Super.super({
            url:`/api2/entity/curd/ask_for/${queryKey}`,     
            data           
        }).then((res)=>{   
            sessionStorage.setItem(queryKey,JSON.stringify(res))
            res.entities.map((item,index)=>{
                item.cellMap.key=index
                item.cellMap.code=item.code //增加code,为了删除操作
                dataSource.push(item.cellMap)
                return false
            })
            const noSeeTotal=res.pageInfo.pageSize*res.pageInfo.virtualEndPageNo
            this.setState({
                list:dataSource,
                pageInfo:res.pageInfo,
                currentPage:res.pageInfo.pageNo,      
                pageCount:isSeeTotal?isSeeTotal:noSeeTotal,
                Loading:false,
            })
        })
    }
    handleOperate=(type,record)=>{
        const { menuId,selectCodes }=this.state
        const code=record.code
        this.setState({Loading:true})
        if(type==="delete"){
            Modal.confirm({
				title:"删除提示",
				content:`您确定删除这些数据吗？`,
				okText:"确认",
				cancelText:"取消",
				onOk:()=>{
					Super.super({
                        url:`/api2/entity/curd/remove/${menuId}`,
                        data:{
                            codes:selectCodes
                        }            
					}).then((res)=>{
                        this.setState({
                            Loading:false,
                            selectedRowKeys:[],
                        })
						if(res.status==="suc"){ 
							this.fresh("删除成功！")     //刷新列表       
						}else{
							message.info('删除失败！')  
						}
					})
                },
                onCancel:()=>{
                    this.setState({loading:false,Loading:false})
                }
			})
		}else{
            this.props.history.push(`/${menuId}/${type}/${code}`)
            this.setState({loading:false,Loading:false})
		}
    } 
    searchList=(params,menuId)=>{
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
    handleActions=(actionId)=>{
        const {menuId,selectCodes}=this.state;     
        this.setState({Loading:true})
        Super.super({
            url:`/api2/entity/curd/do_action/${menuId}/${actionId}`, 
            data:{
                codes:selectCodes
            }                 
        }).then((res)=>{
            this.setState({
                Loading:false,
                selectedRowKeys:[],
            })
            if(res && res.status==="suc"){
                this.fresh('操作成功!')
            }else{
                message.error(res.status)
            }
        })
    }
    fresh=(msg)=>{
        this.reset()
        message.success(msg)
    }
    seeTotal=()=>{
        const {queryKey,isSeeTotal}=this.state
        if(!isSeeTotal){
            Super.super({
                url:`/api2/entity/curd/get_entities_count/${queryKey}`,                
            }).then((res)=>{
                this.setState({
                    isSeeTotal:res.count
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
        const {selectedRowKeys,filterOptions,moduleTitle,list,loading,pageInfo,
            formList,tmplGroup,columns,Loading,currentPage,menuId,pageCount,isSeeTotal,optionsMap,queryKey } = this.state;
        const content = <ExportFrame //导出组件
                            menuId={menuId}
                            pageInfo={pageInfo}
                            filterOptions={filterOptions}
                            queryKey={queryKey}
                            /> 
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
        if(tmplGroup){
            for(let k in tmplGroup){
                if(k==="hideCreateButton" && tmplGroup[k]===1){
                    hideCreate=true
                }else if(k==="hideDeleteButton" && tmplGroup[k]===1){
                    hideDelete=true
                }else if(k==="hideExportButton" && tmplGroup[k]===1){
                    hideExport=true
                }else if(k==="hideImportButton" && tmplGroup[k]===1){
                    hideImport=true
                }else if(k==="hideQueryButton" && tmplGroup[k]===1){
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
                        actions={tmplGroup?tmplGroup.actions:""}
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
                    <span className={isSeeTotal?'sewTotal':'seeTotal'} onClick={this.seeTotal}>{isSeeTotal?`共${isSeeTotal}条`:'点击查看总数'}</span>
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