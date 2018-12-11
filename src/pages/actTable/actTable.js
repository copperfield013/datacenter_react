import React from 'react'
import { Pagination ,Card,Table,Button,Icon,} from 'antd';
import BaseForm from "./../../components/BaseForm"
import Super from "./../../super"
import './index.css'

let storage=window.sessionStorage;
export default class actTable extends React.Component{
    state={
        loading: false,
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
        let key=this.props.activeKey
		if(storage[key]){
			//console.log("已存储")
			let data=JSON.parse(storage[key])
            this.editList(data)
            this.setState({
                newRecordCode:data.entities[0].code
            })
		}else{
			//console.log("未存储")
			Super.super({
				url:`/api/entity/list/${key}`,  
				data:{
					isShowLoading:true
				}                 
			}).then((res)=>{
				if(res){
					let obj = eval(res);
                    storage[key]=JSON.stringify(obj); //存储一个列表数据
                    //console.log(res)
                    this.editList(res)
                    this.setState({
                        newRecordCode:res.entities[0].code
                    })
				}
			})
		}		
	}
    editList=(data)=>{
		let list=[]
        let codes=[];
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
            let result=[];
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
            var act={
                title: '操作',
                key: 'action',
                render: (text, record) => (
                <span>
                    <Button type="primary" icon="align-left" size="small" onClick={()=>this.props.handleOperate("detail",record)}>详情</Button>
                    <Button type="dashed" icon="edit" size="small" onClick={()=>this.props.handleOperate("edit",record)}>修改</Button>
                    <Button type="danger" icon="delete" size="small" onClick={()=>this.props.handleOperate("delete",record)}>删除</Button>
                </span>
                ),
            }
            data.push(act)
            return data
        }		
    }   
    //搜索和页码
	searchList=(params)=>{
		let menuId=storage.getItem("menuId");
		let data=""
		if(isNaN(params)){
			data={...params}
		}else{
			data={pageNo:params}
		}
		Super.super({
			url:`/api/entity/list/${menuId}`,  
			data:{
				...data,
				isShowLoading:true
			}                 
		}).then((res)=>{
			let list=[]
			let code=[];	
			res.entities.map((item)=>{			
				code.push(item.code)
				list.push(item.fields)
				return false
			})
			this.setState({
				list:this.renderLists(list,storage.getItem("menuId"),code),
				code,
				pageCount:res.pageInfo.count,
			})
		})			
    }
    fresh=()=>{
        let key=this.props.activeKey
        Super.super({
            url:`/api/entity/list/${key}`,  
            data:{
                isShowLoading:true
            }                 
        }).then((res)=>{
            if(res){
                let obj = eval(res);
                storage[key]=JSON.stringify(obj); //存储一个列表数据
                //console.log(res)
                this.editList(res)
            }
        })
    }
    render(){
        return(
            <div>
                <h3>
                    {this.state.moduleTitle}
                    <div className="fr">
                        <Button className="hoverbig" title="创建" onClick={()=>this.props.handleNew(this.state.moduleTitle,this.state.newRecordCode)}><Icon type="plus"/></Button>
                        <Button className="hoverbig" title="导入"><Icon type="download" /></Button>
                        <Button className="hoverbig" title="导出"><Icon type="upload" /></Button>
                        <Button className="hoverbig" title="刷新" onClick={this.fresh}><Icon type="sync" /></Button>
                    </div>
                </h3>
                <Card>
                    <BaseForm formList={this.state.formList} filterSubmit={this.searchList}/>          
                </Card>
                <div>
                    <Table
                        columns={this.state.columns}
                        dataSource={this.state.list}
                        bordered
                        pagination={false}
                        style={{display:this.state.columns?"block":"none"}}
                    >
                    </Table>
                    <Pagination 
                        showQuickJumper 
                        defaultCurrent={1} 
                        total={this.state.pageCount} 
                        onChange={this.searchList} 
                        hideOnSinglePage={true}
                        showTotal={()=>this.showTotal(this.state.pageCount)}
                        />
                </div>
            </div>
           
        )
    }
}