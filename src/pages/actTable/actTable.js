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
    }
    componentDidMount(){
        this.props.onRef(this)
    }
    componentWillMount(){
        this.requestList()
    }
    handleFilter=(params)=>{
        //console.log(params)
        this.props.searchParams(params)
    }
    showTotal=(total)=>{
        return `共 ${total} 条`;
    }
    requestList=()=>{ 
        const menuId=this.props.menuId;
        this.setState({loading:true,Loading:true,})
		if(storage[menuId]){
			//console.log("已存储")
			const data=JSON.parse(storage[menuId])
            this.editList(data)
            this.setState({loading:false,Loading:false})
            if(data.entities.length>0){
                this.setState({
                    newRecordCode:data.entities[0].code
                })
            }
		}else{
			//console.log("未存储")
			Super.super({
				url:`/api/entity/list/${menuId}`,                
			}).then((res)=>{
				if(res){
                    this.setState({loading:false,Loading:false})
                    storage[menuId]=JSON.stringify(res); //存储一个列表数据
                    //console.log(res)
                    this.editList(res)
                    if(res.entities.length>0){
                        this.setState({
                            newRecordCode:res.entities[0].code
                        })
                    }
				}
			})
		}		
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
			moduleTitle:data.module.title,
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
            const act={
                title: '操作',
                key: 'action',
                render: (text, record) => (
                <span>
                    <Button type="primary" icon="align-left" size="small" onClick={()=>this.handleOperate("detail",record)}>详情</Button>
                    <Button type="dashed" icon="edit" size="small" onClick={()=>this.handleOperate("edit",record)}>修改</Button>
                    <Button type="danger" icon="delete" size="small" onClick={()=>this.handleOperate("delete",record)}>删除</Button>
                </span>
                ),
            }
            data.push(act)
            return data
        }		
    } 
    handleOperate=(type,record)=>{
		const menuId=this.props.menuId
		const code=record.code
        //console.log(code)
        this.setState({loading:true,Loading:true})
        if(type==="delete"){
            Modal.confirm({
				title:"删除提示",
				content:`您确定删除这些数据吗？`,
				okText:"确认",
				cancelText:"取消",
				onOk:()=>{
					Super.super({
						url:`/api/entity/remove/${menuId}/${code}`,               
					}).then((res)=>{
                        this.setState({loading:false,Loading:false})
						if(res.status==="suc"){
							message.success('删除成功！')  
							this.fresh()     //刷新列表，调用子组件方法                        
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
		const panes = this.props.panes;
		let flag = false;
        let dcode=type; 
        const code=record.code
        const menuId=record.menuId;
		dcode+=record.code;  //为了打开新页面，加入detail和eidt的code
		//console.log(record.code)
		for(let ops of panes){			
		  if(ops.key === dcode){
			flag = true;
			break;
		  }
		  continue;
		}
		let xqTitle="";
		if(type==="detail"){
			xqTitle=record["姓名"]?`详情-${record["姓名"]}`:"详情"
		}else{
			xqTitle=record["姓名"]?`修改-${record["姓名"]}`:"修改"
		}
		if(flag === false){
			panes.push({ title:xqTitle, key:dcode });
        }		
        this.setState({loading:false,Loading:false})
        this.props.actCallBackAdmin(panes,dcode,xqTitle,menuId,code,type)
		//console.log(record.code)
	} 
    //搜索和页码
	searchList=(params)=>{
		const menuId=storage.getItem("menuId");
        let data="";
        this.setState({Loading:true})
		if(isNaN(params)){
			data={...params}
		}else{
			data={pageNo:params}
		}
		Super.super({
			url:`/api/entity/list/${menuId}`,  
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
                currentPage:res.pageInfo.pageNo
			})
		})			
    }
    handleNew=(title,newRecordCode)=>{
		const panes = this.props.panes;
		let flag = false;
		const newcode=title+"--创建"
		const newK=title+","+newRecordCode
		for(let ops of panes){			
			if(ops.key === newK){
			  flag = true;
			  break;
			}
			continue;
          }
		if(flag === false){
			panes.push({ title:newcode, key:newK });
        }
        this.props.newRecordCallback(panes,newK,newcode,newRecordCode)
	}
    fresh=()=>{
        const menuId=this.props.menuId;
        this.setState({loading:true,Loading:true})
        Super.super({
            url:`/api/entity/list/${menuId}`,                
        }).then((res)=>{
            if(res){
                this.setState({loading:false,currentPage:1,Loading:false})
                storage[menuId]=JSON.stringify(res); //存储一个列表数据
                this.editList(res)
                message.success("刷新成功")
            }
        })
    }
    render(){
        const content = <ExportFrame /> //导出组件
        return(
            <div>
                <h3>
                    {this.state.moduleTitle}
                    <div className="fr">
                        <Button className="hoverbig" title="创建" onClick={()=>this.handleNew(this.state.moduleTitle,this.state.newRecordCode)}><Icon type="plus"/></Button>
                        <Button className="hoverbig" title="导入"><Icon type="download" /></Button>
                        <Popover content={content} title="导出" placement="bottomRight" trigger="click">
                            <Button className="hoverbig" title="导出"><Icon type="upload" /></Button>
                        </Popover>                       
                        <Button className="hoverbig" title="刷新" onClick={this.fresh}><Icon type="sync" /></Button>
                    </div>
                </h3>
                <Card className="hoverable" headStyle={{background:"#f2f4f5"}} loading={this.state.loading}>
                    <BaseForm formList={this.state.formList} filterSubmit={this.searchList}/>          
                </Card>
                <Table
                    columns={this.state.columns}
                    dataSource={this.state.list}
                    bordered
                    pagination={false}
                    style={{display:this.state.columns?"block":"none"}}
                    loading={this.state.Loading}
                >
                </Table>
                <Pagination 
                    showQuickJumper 
                    defaultCurrent={1} 
                    current={this.state.currentPage}
                    total={this.state.pageCount} 
                    onChange={this.searchList} 
                    hideOnSinglePage={true}
                    showTotal={()=>this.showTotal(this.state.pageCount)}
                    />
            </div>
           
        )
    }
}