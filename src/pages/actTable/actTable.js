import React from 'react'
import { Pagination ,Card,Table,Button,Icon,Popover,Modal,message} from 'antd';
import BaseForm from "./../../components/BaseForm"
import Super from "./../../super"
import './index.css'
import ExportFrame from './../../components/exportFrame/exportFrame'

const storage=window.sessionStorage;
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
        const menuId=this.props.match.params.menuId;
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
    showTotal=(total)=>{
        return `共 ${total} 条`;
    }
    requestList=(menuId)=>{ 
        const loading=document.getElementById('ajaxLoading')
        Super.super({
            url:`/api/entity/curd/list/${menuId}`,                
        }).then((res)=>{
            loading.style.display="none"
            if(res){
                this.setState({
                    pageNo:res.pageInfo.pageNo,
                    pageSize:res.pageInfo.pageSize,
                })
                //storage[menuId]=JSON.stringify(res); //存储一个列表数据              
                this.editList(res)
                if(res.entities.length>0){
                    this.setState({
                        newRecordCode:res.entities[0].code
                    })
                }
            }
        })				
	}
    editList=(data)=>{
		const list=[]
        const codes=[];
		if(data.entities && data.entities.length!==0){
			this.setState({
				columns:this.renderColumns(data.entities[0].fields),
				pageCount:data.pageInfo.count,
            })
            data.entities.map((item)=>{			
                codes.push(item.code)
                list.push(item.fields)
                return false
            })
		}else if(data.entities && data.entities.length===0){
			this.setState({
				columns:'',
				pageCount:'',
			})
        }
		this.setState({
			formList:data.criterias,
			list:this.renderLists(list,storage.getItem("menuId"),codes),
            moduleTitle:data.ltmpl.title,
            actions:data.actions
		})
    }
    //list数据转换
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
                let value=item.title;
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
                        onClick={(e)=>this.handleOperate("detail",record,e)}>
                        详情
                    </Button>
                    <Button 
                        type="dashed" 
                        icon="edit" 
                        size="small" 
                        onClick={(e)=>this.handleOperate("edit",record,e)}>
                        修改
                    </Button>
                </span>
                ),
            }
            data.push(act)
            return data
        }		
    } 
    handleOperate=(type,record,e)=>{
        e.stopPropagation();//阻止事件冒泡，防止点击按钮选中整行
		const menuId=storage.getItem("menuId")
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
                            codes:this.state.selectCodes
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
		}else if(type==="detail"){	
			this.handleDetail({record},"detail")
		}else if(type==="edit"){
			this.handleDetail({record},"edit")
		}
    }   
    handleDetail=({record},type)=>{
        const menuId=record.menuId
        const code=record.code	
        this.props.history.push(`/${menuId}/${type}/${code}`)	
        console.log(record)
        this.setState({loading:false,Loading:false})
	} 
    //搜索和页码
	searchList=(params)=>{
		const menuId=storage.getItem("menuId");
        let data="";
        this.setState({Loading:true})
		if(isNaN(params)){
            data={...params}
            this.setState({filterOptions:data})
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
				list:this.renderLists(list,storage.getItem("menuId"),code),
				code,
                pageCount:res.pageInfo.count,
                currentPage:res.pageInfo.pageNo,               
                pageNo:res.pageInfo.pageNo,
                pageSize:res.pageInfo.pageSize,
			})
		})			
    }
    handleNew=()=>{
        const {menuId,newRecordCode}=this.state
        this.props.history.push(`/${menuId}/new/${newRecordCode}`)
    }
    handleImport=()=>{
        const {menuId}=this.state
        this.props.history.push(`/${menuId}/import`)
    }
    handleActions=(actionId)=>{
        const menuId=storage.getItem("menuId");
        this.setState({Loading:true})
        Super.super({
            url:`/api/entity/curd/do_action/${menuId}/${actionId}`, 
            data:{
                codes:this.state.selectCodes
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
        const menuId=storage.getItem("menuId");
        this.setState({Loading:true})
        this.child.reset()
        Super.super({
            url:`/api/entity/curd/list/${menuId}`,                
        }).then((res)=>{
            if(res){
                this.setState({
                    currentPage:1,
                    Loading:false,
                    selectedRowKeys: [],
                })
                storage[menuId]=JSON.stringify(res); //存储一个列表数据
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
                            onClick={()=>this.handleNew()}>
                            <Icon type="plus"/>
                        </Button>
                        <Button 
                            className="hoverbig" 
                            title="导入" 
                            onClick={()=>this.handleImport()}>
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
                <Card className="hoverable" headStyle={{background:"#f2f4f5"}} loading={loading}>
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
                    columns={columns}
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
                    total={pageCount} 
                    onChange={this.searchList} 
                    hideOnSinglePage={true}
                    showTotal={()=>this.showTotal(pageCount)}
                    />
            </div>
           
        )
    }
}