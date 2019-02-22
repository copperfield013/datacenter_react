import React from 'react'
import { Pagination ,Card,Table,Button,Icon,Popover,Modal,message} from 'antd';
import BaseForm from "./../../components/BaseForm"
import ExportFrame from './../../components/exportFrame/exportFrame'
import Super from "./../../super"
import './index.css'
import moment from 'moment';
import { WSAEINVALIDPROVIDER } from 'constants';

const sessionStorage=window.sessionStorage
export default class actTable extends React.Component{
    state={
        loading: false,
        Loading:false,
        radioValue:1,
        currentPage:1,
        selectedRowKeys: [], 
        actions:[]
    }
    componentDidMount(){
        const {menuId}=this.props.match.params;
        this.setState({menuId})
        this.requestList(menuId)
    }
    componentWillReceiveProps(){
        const menuId=this.props.history.location.pathname.replace(/[^0-9]/ig,"");
        this.setState({menuId})
        this.requestList(menuId)
    }
    handleFilter=(params)=>{
        this.props.searchParams(params)
    }
    requestList=(menuId)=>{ 
        const loading=document.getElementById('ajaxLoading')
        if(sessionStorage.getItem(menuId)){
            let res= JSON.parse(sessionStorage.getItem(menuId))
            this.editList(res)         
            if(res.entities.length>0){
                this.setState({
                    pageNo:res.pageInfo.pageNo,
                    pageSize:res.pageInfo.pageSize,
                })
            }
        }else{
            Super.super({
                url:`/api/entity/curd/list/${menuId}`,                
            }).then((res)=>{
                loading.style.display="none"
                if(res){
                    sessionStorage.setItem(menuId,JSON.stringify(res))
                    this.editList(res)         
                    if(res.entities.length>0){
                        this.setState({
                            pageNo:res.pageInfo.pageNo,
                            pageSize:res.pageInfo.pageSize,
                        })
                    }
                }
            })
        }				
	}
    editList=(data)=>{
		const list=[]
        const codes=[]
        const {menuId}=this.state
        const moduleTitle=data.ltmpl.title
		if(data.entities && data.entities.length!==0){
            data.entities.map((item)=>{			
                codes.push(item.code)
                list.push(item.fields)
                return false
            })
			this.setState({
				columns:this.renderColumns(data.entities[0].fields),//之所以不用ltmpl.columns,因为后面渲染按钮
                formList:data.criterias,
                list:this.renderLists(list,menuId,codes),
				pageCount:data.pageInfo.count,
            })
		}else if(data.entities && data.entities.length===0){
			this.setState({
				columns:"",
				pageCount:'',
			})
        }
		this.setState({
            moduleTitle,
            actions:data.actions
		})
    }
	renderLists=(data,menuId,codes)=>{
        const result=[];
        data.map((item,index)=>{
            let list={};
            list['key']=index;//每一项添加key值
            list['code']=codes[index];//添加code
            list['menuId']=menuId;
            item.map((item)=>{
                let key=item.title
                let value=item.value
                list[key]=value
                return false
            })
            result.push(list)
            return false
        })
        return result
    }
    renderColumns=(data)=>{
        if(data){
            data.map((item)=>{
                const value=item.title;
                item["dataIndex"]=value;	
                return false						
            })
            const order={
                title: '序号',
                key: 'order',
                render: (text, record,index) => (
                    <label>{index+1}</label>
                    ),
            } 
            data.unshift(order) 
            const act={
                title: '操作',
                key: 'action',
                render: (text, record) => (
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
                ),
            }
            data.push(act)
            return data
        }		
    } 
    handleOperate=(type,record)=>{
        const { menuId,selectCodes }=this.state
        const code=record.code
        this.setState({loading:true,Loading:true})
        if(type==="delete"){
            Modal.confirm({
				title:"删除提示",
				content:`您确定删除这些数据吗？`,
				okText:"确认",
				cancelText:"取消",
				onOk:()=>{
					Super.super({
                        url:`/api/entity/curd/remove/${menuId}`,
                        data:{
                            codes:selectCodes
                        }            
					}).then((res)=>{
                        this.setState({loading:false,Loading:false})
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
    //搜索和页码
	searchList=(params)=>{
		const {menuId}=this.state
        let data="";
        this.setState({Loading:true})
		if(isNaN(params)){
            for(let k in params){
                if(typeof params[k]==="object"){ //日期格式转换
                    const arr=[]
                    params[k].map(item=>{
                        arr.push(moment(item).format("YYYY-MM-DD"))
                        return false
                    }) 
                    params[k]=arr.join("~")
                }
            }
            data={...params}
            console.log(data)
            this.setState({filterOptions:data})
            this.props.history.push({
                pathname:`/${menuId}`,
                query:{day:"jjj"}
            })
		}else{
			data={pageNo:params}
        }
		Super.super({
			url:`/api/entity/curd/list/${menuId}`,  
			data:{
				...data,
			}                 
		}).then((res)=>{
			const list=[]
			const code=[];	
			res.entities.map((item)=>{			
				code.push(item.code)
				list.push(item.fields)
				return false
            })
			this.setState({
                Loading:false,
				list:this.renderLists(list,menuId,code),
				code,
                pageCount:res.pageInfo.count,
                currentPage:res.pageInfo.pageNo,               
                pageNo:res.pageInfo.pageNo,
                pageSize:res.pageInfo.pageSize,
			})
		})			
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
            url:`/api/entity/curd/do_action/${menuId}/${actionId}`, 
            data:{
                codes:selectCodes
            }                 
        }).then((res)=>{
            this.setState({Loading:false,selectedRowKeys: [],})
            if(res && res.status==="suc"){
                this.fresh(res.msg)
            }else{
                message.error(res.status)
            }
        })
    }
    fresh=(msg)=>{
        const {menuId}=this.state
        this.setState({Loading:true})
        this.child.reset()//搜索栏重置
        Super.super({
            url:`/api/entity/curd/list/${menuId}`,                
        }).then((res)=>{
            if(res){
                this.setState({
                    currentPage:1,
                    Loading:false,
                    selectedRowKeys: [],
                })
                this.editList(res)
                message.success(msg)
            }
        })
    }
    onRef=(ref)=>{
		this.child=ref
    }
    render(){
        const {selectedRowKeys,pageNo,pageSize,filterOptions,moduleTitle,list,loading,
            formList,actions,columns,Loading,currentPage,pageCount,menuId } = this.state;
        const content = <ExportFrame //导出组件
                            menuId={menuId}
                            pageNo={pageNo}
                            pageSize={pageSize}
                            filterOptions={filterOptions}
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
        return(
            <div className="actTable">
                <h3>
                    {moduleTitle}
                    <p className="fr">
                        <Button 
                            className="hoverbig" 
                            title="创建" 
                            onClick={()=>this.handleNew(menuId)}>
                            <Icon type="plus"/>
                        </Button>
                        <Button 
                            className="hoverbig" 
                            title="导入" 
                            onClick={()=>this.handleImport(menuId)}>
                            <Icon type="download" />
                        </Button>
                        <Popover content={content} title="导出" placement="bottomRight" trigger="click">
                            <Button className="hoverbig" title="导出"><Icon type="upload" /></Button>
                        </Popover>                       
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
                        onRef={this.onRef}
                        />          
                </Card>
                <Table
                    rowSelection={rowSelection}
                    columns={columns?columns:[]}
                    dataSource={list}
                    bordered
                    pagination={false}
                    style={{display:columns?"block":"none"}}
                    loading={Loading}
                >
                </Table>
                <Pagination 
                    showQuickJumper 
                    defaultCurrent={1} 
                    current={currentPage}
                    total={pageCount?pageCount:0} 
                    onChange={this.searchList} 
                    hideOnSinglePage={true}
                    showTotal={()=>`共 ${pageCount} 条`}
                    />
            </div>
           
        )
    }
}