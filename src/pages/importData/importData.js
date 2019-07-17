import React from 'react'
import {Card,Button,Upload,message,Icon,Progress,List,Checkbox,Row,Col,Modal,Popover,InputNumber } from 'antd'
import Super from "./../../super"
import Units from "./../../units"
import ModelImport from "./../../components/ModelImport"
import './index.css'

const CheckboxGroup = Checkbox.Group;
const checkedList = ['INFO', 'SUC', 'ERROR', 'WARN'];
let totalMSG=[]
export default class Import extends React.Component{
    state = {
        fileList:[],
        uploading: false,
        statusMsg:"",
        begin:true,
        importAgain:"none",
        importbtn:"block",
        checkedList,
        selectModulVisible:false,
        maxMsgCount:100,
        newsChangeVisible:false,
    }
    componentDidMount(){
        const menuId=this.props.match.params.menuId;
        this.setState({menuId})
    }
    handleUpload = () => {
        const { fileList,menuId } = this.state;
        const formData = new FormData();
        formData.append('file', ...fileList);
        this.setState({
            uploading: true,
        });
        Super.super({
            url:`api2/entity/import/start/${menuId}`,
            query:{
                exportFaildFile: 1
            },
            data:formData,   
		},"formdata").then((res)=>{
            //console.log(res)
            if(res.status==="suc"){
                this.timerID=setInterval(() =>this.handleStatus(res.uuid),500);
            }else{
                message.error('导入失败！'); 
                this.setState({
                    uploading: false,
                });                          
            }
            })
        }
    handleStatus=(uuid)=>{
        const {maxMsgCount}=this.state
        Super.super({
            url:`api2/entity/import/status`,  
            data:{
                uuid,
                msgIndex:0,
                maxMsgCount,
                interrupted: false,
            }          
        },"","none").then((res)=>{
            const MSG=[]
            res.messageSequence.messages.forEach((item)=>{
                const time=Units.formateDate(item.createTime)
                let color="";
                if(item.type==="SUC"){
                    color="green"
                }else if(item.type==="INFO"){
                    color="black"
                }else if(item.type==="ERROR"){
                    color="red"
                }else if(item.type==="WARN"){
                    color="rgb(250, 225, 4)"
                }
                const msg=<div type={item.type}><p>{time}</p><p style={{color:color}}>{item.text}</p></div>
                MSG.push(msg)
            })  
            totalMSG=MSG
            this.setState({
                statusMsg:res.message,
                percent:Math.floor((res.current/res.totalCount)*100),
                messages:MSG,
            })
            if(res.completed===true){
                clearInterval(this.timerID);                            
                message.success('导入完成！');
                this.setState({
                    uploading:false,
                    isDisabled:false,
                    uuid,
                    importAgain:"block",
                    importbtn:"none",
                    failedRowsFileUUID:res.failedRowsFileUUID
                });
            }
        })
    } 
    onChange = (checkedList) => { //日志checkbox选择
        const messages=totalMSG
        let newmesg=[]
        if(messages.length>0){
            messages.forEach((it)=>{              
                checkedList.forEach((item)=>{                 
                    if(item===it.props.type){
                        newmesg.push(it)
                    }      
                })
            })
        }
        this.setState({
            checkedList,
            messages:newmesg,
        });
    }
    handleCancel=()=>{
        this.setState({
            selectModulVisible:false,
        })
    }
    fresh=()=>{
        this.setState({
            fileList:[],
            uploading: false,
            statusMsg:"",
            begin:true,
            importAgain:"none",
            importbtn:"block",
            percent:0,
            messages:[]
        })
        message.success("刷新成功！")
    }
    downloadFile=(failedRowsFileUUID)=>{
        const tokenName=Units.getLocalStorge("tokenName")
        Units.downloadFile(`api2/entity/export/download/${failedRowsFileUUID}?@token=${tokenName}`)      
    }
    onChangeNews=()=>{
        const {inputValue}=this.state
        this.setState({
            maxMsgCount:inputValue,
            newsChangeVisible:false,
        })
        message.success("设置成功！")
    }
    handleVisibleChange = visible => {
        this.setState({ newsChangeVisible:visible });
      };
    render(){
        const { uploading, fileList,begin,importbtn,percent,importAgain,checkedList,failedRowsFileUUID,maxMsgCount,
            newsChangeVisible,statusMsg,messages,selectModulVisible,menuId } = this.state;
        const props = {
            accept:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.ms-excel",
            onChange : () => {
                fileList.slice(-1);
            },
            onRemove : (file) => {
                this.setState((state) => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                      fileList: newFileList,
                      begin:true,
                      percent:0,
                    };
                  });
            },
            beforeUpload: (file) => {
                this.setState(state => ({
                    fileList: [file],
                    begin:false
                  }));
                  return false;
            },
            fileList,
        }
        const content=(
            <div>
                <label>日志消息数上限：</label>
                <InputNumber 
                    defaultValue={maxMsgCount} 
                    onChange={(value)=>this.setState({inputValue:value})}
                    />
                <Button 
                    type="primary" 
                    style={{marginLeft:'10px'}} 
                    onClick={this.onChangeNews}
                    >确定</Button>
            </div>
        )
        return(
            <div className="importData">
                <h3>
                    导入
                    <p className="fr">                      
                        <Button 
                            className="hoverbig"
                            title="刷新"
                            onClick={this.fresh}>
                            <Icon type="sync" />
                        </Button>
                    </p>
                </h3>              
                <Row>
                    <Col span={14} offset={5}>
                        <Card style={{minWidth:600}}>
                            <Button style={{float:"right"}} onClick={()=>this.setState({selectModulVisible:true,})}>
                                <Icon type="snippets"/>选择导入模板
                            </Button>
                            <Upload {...props}>
                                <Button>
                                    <Icon type="upload"/>选择导入文件
                                </Button>
                            </Upload>
                            <Progress percent={percent} size="small" status="active" />
                            <div className="importBtns">
                                <Button
                                    type="primary"
                                    onClick={this.handleUpload}
                                    disabled={begin}
                                    loading={uploading}
                                    style={{display:importbtn}}
                                    >
                                    {uploading ? '正在导入' : '开始导入' }
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={this.handleUpload}
                                    disabled={begin}
                                    loading={uploading}
                                    style={{display:importAgain}}
                                    >
                                    {uploading ? '正在导入' : '重新导入' }
                                </Button>
                            </div>               
                            <List
                                header={
                                    <div className="listHeader">
                                        <h4>导入日志</h4>
                                        <div className="checks">              
                                            <CheckboxGroup value={checkedList} onChange={this.onChange}>
                                                <Checkbox value="INFO" className="infoColor">常规</Checkbox>
                                                <Checkbox value="SUC" className="sucColor">成功</Checkbox>
                                                <Checkbox value="ERROR"  className="errorColor">错误</Checkbox>
                                                <Checkbox value="WARN"  className="warnColor">警告</Checkbox>
                                            </CheckboxGroup>
                                            <div className="btns">
                                                {failedRowsFileUUID?
                                                <Button 
                                                    title="导入日志下载" 
                                                    type="primary" 
                                                    size="small"
                                                    onClick={()=>this.downloadFile(failedRowsFileUUID)}
                                                    >
                                                    <Icon type="copy"/>
                                                </Button>:""}
                                                <Popover 
                                                    content={content} 
                                                    title="导入日志设置" 
                                                    trigger="click" 
                                                    placement="top" 
                                                    visible={newsChangeVisible}
                                                    overlayStyle={{width:350}}
                                                    onVisibleChange={this.handleVisibleChange}
                                                    getPopupContainer={trigger => trigger.parentNode}
                                                    >
                                                    <Button title="导入日志设置" type="primary" size="small">
                                                        <Icon type="setting"/>
                                                    </Button>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>
                                }
                                footer={<div>{statusMsg}</div>}
                                bordered
                                dataSource={messages}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                                className="importList"
                                />
                        </Card>
                    </Col>
                </Row>
                <Modal
                    title="字段"
                    visible={selectModulVisible}
                    onCancel={this.handleCancel}
                    footer={null}
                    width={950}
                    style={{top:40}}
                    destroyOnClose
                    maskClosable={false}
                    >
                    <ModelImport 
                        menuId={menuId}
                    />
                </Modal>
            </div>
        )
    }
}
