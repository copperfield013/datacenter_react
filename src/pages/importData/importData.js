import React from 'react'
import superagent from 'superagent'
import {Card,Button,Upload,message,Icon,Progress,List} from 'antd'
import Super from "./../../super"
import Units from "./../../units"

const storage=window.sessionStorage;
export default class Detail extends React.Component{
    state = {
        file: "",
        uploading: false,
        statusMsg:"",
        begin:true,
    }
    
    handleUpload = () => {
        const { file } = this.state;
        const formData = new FormData();
        const menuId=this.props.menuId;
        const tokenName=storage.getItem('tokenName')
        formData.append('file', file);
        this.setState({
            uploading: true,
        });
        superagent
            .post(`/api/entity/import/start/${menuId}`)
            .set("datamobile-token",tokenName)
            .send(formData)
            .end((req,res)=>{
                if(res.body.status==="suc"){
                    message.success('导入成功！');
                    this.setState({
                        file: "",
                        uploading: false,
                    });
                    this.handleStatus(res.body.uuid)
                    this.timerID=setInterval(
                        () =>this.handleStatus(res.body.uuid),
                        1000
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
                if(res.completed===true){
                    clearInterval(this.timerID);
                    let Msg=[]
                    res.messageSequeue.messages.map((item,index)=>{
                        let time=Units.formateDate(item.createTime)
                        Msg[index]=<p style={{color:"green"}}>{time} {item.text}</p>
                        return false
                    })
                    this.setState({
                        isDisabled:false,
                        uuid,
                        messages:Msg,
                    });
                }
            })
        } 
    
    render(){
        const { uploading, file } = this.state;
        const props = {
            onRemove: (file) => {
                this.setState(state => ({
                    file:"",
                    begin:true,
                }));
            },
            beforeUpload: (file) => {
                this.setState(state => ({
                    file,
                    begin:false,
                }));
                return false;
            },
            file,
        };
        return(
            <div>
                <h3>{this.props.importCode}</h3>
                <Card style={{width:500}}>
                    <Upload {...props}>
                    <Button>
                        <Icon type="upload" /> 选择导入文件
                    </Button>
                    </Upload>
                    <Progress percent={this.state.percent} size="small" status="active" />
                    <Button
                        type="primary"
                        onClick={this.handleUpload}
                        disabled={this.state.begin}
                        loading={uploading}
                        style={{ marginTop: 16 }}
                        >
                        {uploading ? '正在导入' : '开始导入' }
                    </Button>
                    <List
                        header={<div>导入日志</div>}
                        footer={<div>导入完成</div>}
                        bordered
                        dataSource={this.state.messages}
                        renderItem={item => (<List.Item>{item}</List.Item>)}
                        />
                </Card>
            </div>
        )
    }
}