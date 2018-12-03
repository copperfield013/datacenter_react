import React from 'react'
import {Card,Table,Form,Input,Button,message,Modal,Avatar,Upload,Icon,Select,DatePicker,Popconfirm} from 'antd'
import axios from "./../../axios"
import './index.css'
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import EditTable from './../../pages/EditTable'
import BaseInfoForm from './../../components/BaseForm/BaseInfoForm'
const Option = Select.Option;
const FormItem=Form.Item

var storage=window.localStorage;
class Detail extends React.Component{
    state={
        type:this.props.type,
        count:0,
        columns:[],
        dataSource:[],
        selectedRowKeys:[],
        visible: false,
        value:{},
    }
    componentDidMount(){
        this.props.onRef(this)
    }
    componentWillMount(){
        this.requestLists()
    }
    requestLists=()=>{
        let menuId=this.props.menuId;
        let code=this.props.code;
        axios.ajax({
            url:`/api/entity/detail/${menuId}/${code}`,
            data:{
                isShowLoading:true
            }
        }).then((res)=>{
            let detailsList=res.entity.fieldGroups || "";          
            let formList=detailsList[0].fields
            //console.log(res)
            let itemDescs=[]
            let columns=[]
            let dataSource=[]
            let cardTitle=[]
            detailsList.map((item)=>{
                if(item.descs){
                    cardTitle.push(item.title)
                    itemDescs.push(item.descs)
                    columns.push(this.renderColumns(item.descs))
                    dataSource.push(this.requestList(item))
                }
                this.setState({
                    itemDescs,
                    columns,
                    dataSource,
                    cardTitle
                })
            })           
            this.setState({
                detailsList,
                formList,
            })
        })
      
    }
    initDetailsList=()=>{      
        const { getFieldDecorator } = this.props.form;
        const detailsList=this.state.detailsList;
        const detailsItemList=[];

        const rowSelection = {
            type: 'radio',
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
              this.setState({
                selectedRowKeys
              })
            },
          };
       
        if(detailsList && detailsList.length>0){
            this.state.itemDescs.map((item,index)=>{
                let cardTitle=this.state.cardTitle[index]
                const RANGE=<Card title={cardTitle} key={cardTitle}>
                        <EditTable 
                            type={this.props.type}
                            pagination={false}
                            bordered
                            columns={this.state.columns[index]}
                            dataSource={this.state.dataSource[index]}
                            item={item}
                            count={this.state.count}
                        
                        />
                    </Card>
                detailsItemList.push(RANGE)
            })         
        }
        if(this.state.type=="edit"){
            let btn=<Button type='primary' icon="cloud-upload" className="submitBtn" onClick={this.showModal} key="submitBtn" htmlType="submit">提交</Button>
            detailsItemList.push(btn)
        }
        return detailsItemList;
    }
    renderColumns=(data)=>{
		if(data){
			data.map((item,index)=>{
                let fieldName=item.fieldName;
                item["dataIndex"]=fieldName;	
                item["key"]=index;       					
            })
            //console.log(data)
            return data
		}		
    }
    requestList=(data)=>{
        let res=[]      
        const count = this.state.count;
        this.setState({
            count :this.state.count+data.array.length
        })
        const { getFieldDecorator } = this.props.form;
        if(data.array){
            data.array.map((item)=>{
                let code=item.code;
                let list={};              
                item.fields.map((it)=>{
                    let fieldName=it.fieldName;
                    let fieldValue=it.value;
                    let fieldId=it.fieldId;
                    list["key"]=count;
                    list["code"]=code;
                    list[fieldName]=fieldValue;
                })
                res.push(list) 
                //console.log(res)             
            })
            return res        
        }
    }
    handleOk = (e) => {
        e.preventDefault();
        this.child.handleBaseInfoSubmit()
        let menuId=this.props.menuId;
        let code=this.props.code;
        this.props.form.validateFields((err, values) => {
          if (!err) {
            // axios.ajax({
            //     url:`/api/entity/update/${menuId}`,
            //     data:{
            //         isShowLoading:true,
            //         "唯一编码":code,
            //         "实体字段":values			
            //     }
            // }).then((res)=>{
            //      console.log(res)
            //       message.success("提交成功！")
            // })
          }
        });
        let data=JSON.parse(storage["baseInfo"])
        console.log(data)
        this.setState({
          visible: false,
        });
      }
    
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    //调用子组件方法
	onRef=(ref)=>{
		this.child=ref
	}
    render(){
        return(
            <div>
                <h3>{this.props.detailsTitle}</h3> 
                <Card title="基本信息">
                    <BaseInfoForm 
                        formList={this.state.formList} 
                        type={this.state.type} 
                        onRef={this.onRef}
                        />
                </Card>
                
                <div>
                    <Form layout="inline">
                        {this.initDetailsList()}
                    </Form>
                </div>
                <Modal
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="确认"
                    cancelText="取消"
                    >
                    <p>确认提交数据吗</p>
                </Modal>
            </div>
        )
    }
}
export default Form.create()(Detail)