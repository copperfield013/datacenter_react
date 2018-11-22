import React from 'react'
import { Card,Table, Modal,Button,message,Form,Input,Icon,Radio,AutoComplete,Select,DatePicker} from 'antd';
import axios from "./../../axios/index"
import moment from 'moment'
import Units from '../../units/unit'
import "./table.css"
const FormItem = Form.Item;
const RadioGroup=Radio.Group;
const Option = Select.Option;

export default class Tables extends React.Component{
    state={
        data:[],
        result:[],
        isShowModal:false
    }
    params={
        page:1,
    }
    componentWillMount(){
		this.request()
	}
    request=()=>{
        let _this=this
        axios.ajax({
            url:'/table/list',
            data:{
                params:{
                    page:this.params.page
                },
                //是否显示loading
                //isShowLoading:false
            }
        }).then((res)=>{
            if(res.code==0){
                //每条数据添加key
                res.result.list.map((item,index)=>{
                    item.key=index;
                })
                this.setState({
                    data:res.result.list,
                    selectedRowKeys:[], //删除之后清空选中状态
                    selectedRows:null,
                    pagination:Units.pagination(res,(current)=>{
                        this.params.page=current;
                        this.request()
                    })
                })
            }
        })
    }
    onSelect=(record,index)=>{
        let selectKey=[index];
        console.log(record)
        console.log(selectKey)
        // Modal.info({
        //     title:'信息',
        //     content:`用户名：${record.name},性别：${record.sex}`
        // })
        this.setState({
            selectedRowKeys:selectKey,
            selectedItem:record
        })
    }
   
    handleDelete=()=>{
        let rows=this.state.selectedRowKeys;
        //console.log(rows)
        if(rows.length!=0){
            let ids=[];
            rows.map((rows)=>{
                ids.push(rows+1)
            })
            Modal.confirm({
                title:"删除提示",
                content:`您确定删除这些数据吗？${ids.join(',')}`,
                onOk:()=>{
                    message.success('删除成功！')
                    this.request();//刷新页面
                }
            })
         }else{
            message.info("请选择数据")
         }       
        
    }
    handleDel=(e)=>{ 
        const id=e.target.getAttribute('data-index')
        Modal.confirm({
            title:"删除提示",
            content:`您确定删除这些数据吗？${id}`,//es6模板语法，使用${}使用变量值
            onOk:()=>{
                message.success('删除成功！')
                this.request();//刷新页面
            }
        })      
        }
    handleAdd=()=>{
        this.setState({
            isShowModal:true
        })
    }
    handleSubmit=()=>{
        let userInfo=this.userForm.props.form.getFieldsValue();
        console.log(JSON.stringify(userInfo));
        axios.ajax({
            url:'/table/list',
            data:{
                parmas:userInfo
            }
        }).then((res)=>{
            if(res.code=="0"){
                message.success('新增成功')
                this.setState({
                    isShowModal:false
                })
                this.request();//刷新页面
            }
        })
    }
    handleSearch = (selectedKeys, confirm) => () => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    }
    handleReset = clearFilters => () => {
        clearFilters();
        this.setState({ searchText: '' });
    }
    render(){
        const selectedRowKeys=this.state.selectedRowKeys;
        const rowSelection={
            type:'checkbox',
            selectedRowKeys,
            onChange:(selectedRowKeys,selectedRows)=>{              
                this.setState({
                    selectedRowKeys,
                    selectedRows,
                })
                console.log(selectedRowKeys)
            }
        }
        const columns = [{
            title: '姓名',
            dataIndex: 'name',
            width: 80,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div className="custom-filter-dropdown">
                  <Input
                    ref={ele => this.searchInput = ele}
                    placeholder="搜索姓名"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={this.handleSearch(selectedKeys, confirm)}
                  />
                  <Button type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>搜索</Button>
                  <Button onClick={this.handleReset(clearFilters)}>重置</Button>
                </div>
              ),
              filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
              onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
              onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                  setTimeout(() => {
                    this.searchInput.focus();
                  });
                }
              },
              render: (text) => {
                const { searchText } = this.state;
                return searchText ? (
                  <span>
                    {text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
                      fragment.toLowerCase() === searchText.toLowerCase()
                        ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
                    ))}
                  </span>
                ) : text;
              },
          }, {
            title: 'id',
            dataIndex: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
          }, {
            title: '性别',
            dataIndex: 'sex',
            render(sex){
                return sex==1?'男':'女'
            },
            width: 80,
          }, {
            title: '邮箱',
            dataIndex: 'email',
            width: 180,
          }, {
            title: '城市',
            dataIndex: 'address',
            width: 100,
          }, {
            title: '生日',
            dataIndex: 'date',
            width: 100,
          }, {
            title: '操作',
            width: 100,
            render:(item)=>{
                return <Button size="small" data-index={item.id} onClick={this.handleDel}>删除</Button>
            }
          }];
        return(
            <div> 
                <Card title="动态数据表格">
                    <Table
                        columns={columns}
                        dataSource={this.state.data}
                        bordered
                        pagination={this.state.pagination}
                    />
                </Card>
                <Card title="多选表格和固定表头">
                    <Button style={{marginBottom:10}} type="danger" icon="delete" onClick={this.handleDelete}>删除</Button>
                    <Button style={{marginBottom:10}} type="primary" icon="plus" onClick={this.handleAdd}>新增</Button>
                    <Table
                        columns={columns}
                        dataSource={this.state.data}
                        bordered
                        pagination={this.state.pagination}
                        rowSelection={rowSelection}
                        scroll={{ y: 240}}
                        //onRow不能与筛选连用，不然会对不上数据
                        // onRow={(record,index) => {
                        //     return {
                        //       onClick: () => {
                        //         this.onRowClick(record,index);
                        //       }                              
                        //     };
                        // }}
                    />
                </Card>
                <Modal
                    title="新增记录"
                    visible={this.state.isShowModal}
                    onCancel={()=>{
                        this.setState({
                            isShowModal:false
                        })
                    }}
                    onOk={this.handleSubmit}
                >
                    <ModalForm wrappedComponentRef={(inst)=>{this.userForm=inst}}/>
                </Modal>
            </div>
        )
    }
}
class ModalForm extends React.Component{
    state={
        result:[],
    }
    handleSearch = (value) => {
        let result;
        if (!value || value.indexOf('@') >= 0) {
            result = [];
        } else {
            result = [ 'qq.com','gmail.com', '163.com','126.com','cloud.com'].map(domain => `${value}@${domain}`);
        }
        this.setState({ result });
    }
    render(){
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
              sm: { span: 4 },
            },
            wrapperCol: {
              sm: { span: 16 },
            },
          };
        const { result } = this.state;
        const children = result.map((email) => {
            return <Option key={email}>{email}</Option>;
        });
        return(
            <Form layout="horizontal">
                <FormItem label="姓名" {...formItemLayout}>
                    {getFieldDecorator('userName', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="姓名" />
                    )}
                </FormItem>
                <FormItem label="性别" {...formItemLayout}>
                    {getFieldDecorator('sex', {
                        initialValue:'1'
                        })(
                            <RadioGroup>
                                <Radio value="1">男</Radio>
                                <Radio value="2">女</Radio>
                            </RadioGroup>
                    )}      
                </FormItem>
                <FormItem label="邮箱" {...formItemLayout}>
                    {getFieldDecorator('mail')(
                        <AutoComplete
                            style={{ width: 200 }}
                            onSearch={this.handleSearch}
                            placeholder="邮箱"
                        >
                            {children}
                        </AutoComplete>
                    )}  
                </FormItem>
                <FormItem label="城市" {...formItemLayout}>
                    {getFieldDecorator('province', {
                        rules: [{ required: true, message: 'Please input your province!' }],
                    })(
                        <Input prefix={<Icon type="bank" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="城市" />
                    )}
                </FormItem>
                <FormItem label="生日" {...formItemLayout}>
                    { getFieldDecorator('birthday', {
                            initialValue:moment('2018-8-8')
                        })(
                            <DatePicker />
                        )
                    }      
                </FormItem>
            </Form>
        )
    }
}
ModalForm=Form.create()(ModalForm)
