import React from 'react'
import superagent from 'superagent'
import {Card,Button,Upload,message,Icon,Progress,List,Checkbox,Row,Col,Modal} from 'antd'
import Super from "./../../super"
import Units from "./../../units"
import ModelImport from "./../../components/ModelImport"
import {CopyToClipboard} from 'react-copy-to-clipboard';
import './index.css'

const storage=window.sessionStorage;
const CheckboxGroup = Checkbox.Group;
let MSG=[];
const plainOptions = [
    { label: '常规', value: 'INFO' }, 
    { label: '成功', value: 'SUC' }, 
    { label: '错误', value: 'ERROR' }, 
    { label: '警告', value: 'WARN' }
];
const checkedList = ['INFO', 'SUC', 'ERROR', 'WARN'];
export default class Detail extends React.Component{
    state = {
        fileList:[],
        uploading: false,
        statusMsg:"",
        begin:true,
        importAgain:"none",
        importbtn:"block",
        checkedList,
        visible:false,
    }
    
    handleUpload = () => {
        const { fileList } = this.state;
        const formData = new FormData();
        const menuId=this.props.menuId;
        const tokenName=storage.getItem('tokenName')
        formData.append('file', ...fileList);
        this.setState({
            uploading: true,
        });
        superagent
            .post(`/api/entity/import/start/${menuId}`)
            .set("datamobile-token",tokenName)
            .send(formData)
            .end((req,res)=>{
                if(res.body.status==="suc"){                 
                    //this.handleStatus(res.body.uuid)
                    this.timerID=setInterval(
                        () =>this.handleStatus(res.body.uuid),
                        500
                      );
                }else{
                    message.error('导入失败！'); 
                    this.setState({
                        uploading: false,
                    });                          
                }
            })
        }
        handleStatus=(uuid)=>{
            Super.super({
                url:`/api/entity/import/status/${uuid}`,  
                data:{
                    msgIndex:0
                }          
            }).then((res)=>{
                this.setState({
                    statusMsg:res.message,
                    percent:(res.current/res.totalCount)*100,
                })
                let copyText=""
                if(res.completed===true){
                    clearInterval(this.timerID);
                    res.messageSequeue.messages.map((item)=>{
                        const time=Units.formateDate(item.createTime)
                        let color="";
                        if(item.type==="SUC"){
                            color="green"
                        }else if(item.type==="INFO"){
                            color="black"
                        }else if(item.type==="ERROR"){
                            color="red"
                        }else if(item.type==="WARN"){
                            color="yellow"
                        }
                        const msg=<div type={item.type}><p>{time}</p><p style={{color:color}}>{item.text}</p></div>
                        copyText+=time+item.text+"\n"
                        MSG.push(msg)
                        return false
                    })                  
                    message.success('导入完成！');
                    
                    this.setState({
                        uploading:false,
                        isDisabled:false,
                        uuid,
                        messages:MSG,
                        importAgain:"block",
                        importbtn:"none",
                        copyText
                    });
                }
            })
        } 
    onChange = (checkedList) => {
        const messages=MSG
        let newmesg=[]
        let newCopyText=""
        if(messages.length>0){
            messages.map((it)=>{              
                checkedList.map((item)=>{                 
                    if(item===it.props.type){
                        newmesg.push(it)
                    } 
                    return false       
                })
                return false
            })
        }
        newmesg.map((item)=>{
            if(item.props){
                item.props.children.map((it)=>{
                    if(it.props){
                        newCopyText+=it.props.children+"\n"
                    }else{
                        newCopyText+=it
                    }
                    return false
                })
            }
            return false
        })
        this.setState({
            checkedList,
            messages:newmesg,
            copyText:newCopyText,
        });
    }
    handleModal=()=>{
        this.setState({
            visible:true,
        })
    }
    handleCancel=()=>{
        this.setState({
            visible:false,
        })
    }
    render(){
        const { uploading, fileList } = this.state;
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
        };
        return(
            <div>
                <h3>
                    {this.props.importCode}
                    <p className="fr">                      
                        <Button className="hoverbig" title="刷新"><Icon type="sync" /></Button>
                    </p>
                </h3>              
                <Row>
                    <Col span={14} offset={5}>
                        <Card style={{minWidth:600}}>
                            <Button style={{float:"right"}} onClick={this.handleModal}>
                                <Icon type="snippets"/>选择导入模板
                            </Button>
                            <Upload {...props}>
                                <Button>
                                    <Icon type="upload"/>选择导入文件
                                </Button>
                            </Upload>
                            <Progress percent={this.state.percent} size="small" status="active" />
                            <div className="importBtns">
                                <Button
                                    type="primary"
                                    onClick={this.handleUpload}
                                    disabled={this.state.begin}
                                    loading={uploading}
                                    style={{display:this.state.importbtn}}
                                    >
                                    {uploading ? '正在导入' : '开始导入' }
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={this.handleUpload}
                                    disabled={this.state.begin}
                                    loading={uploading}
                                    style={{display:this.state.importAgain}}
                                    >
                                    {uploading ? '正在导入' : '重新导入' }
                                </Button>
                            </div>                    
                            <List
                                header={
                                        <div className="listHeader">
                                            <h3>导入日志</h3>
                                            <div className="checks">                                     
                                                <CheckboxGroup options={plainOptions} value={this.state.checkedList} onChange={this.onChange}/>                                  
                                                <CopyToClipboard 
                                                    text={this.state.copyText}
                                                    onCopy={() => {
                                                        this.setState({copied: true})
                                                        message.success("复制成功！")
                                                    }}>
                                                    <Button title="复制" type="primary" size="small"><Icon type="copy" style={{cursor:"pointer"}}/></Button>
                                                </CopyToClipboard>
                                            </div>
                                        </div>
                                        }
                                footer={<div>导入完成</div>}
                                bordered
                                dataSource={this.state.messages}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                                className="importList"
                                />
                        </Card>
                    </Col>
                </Row>
                <Modal
                    title="字段"
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    footer={null}
                    >
                    <ModelImport />
                </Modal>
            </div>
        )
    }
}
