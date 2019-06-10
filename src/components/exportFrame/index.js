import React from 'react'
import {Button,Radio,Divider,InputNumber,Checkbox,Progress} from 'antd';
import './index.css'
import Super from "../../super"
import Units from "../../units"
const RadioGroup = Radio.Group;

export default class ExportFrame extends React.Component{
    state={
        radioValue:1,
        started:"none",
        isDisabled:true,
        withDetail:false,
        statusMsg:"",
        inputDisabled:false,
        radioDisabled1:false,
        radioDisabled2:false,
    }
    componentWillUnmount(){
        console.log("销毁")
    }
    onChangeRadio=(e)=>{
        this.setState({
            radioValue: e.target.value,
            v1:"",
            v2:""
        });
    }
    handleStart=()=>{
        const { menuId,filterOptions,queryKey,pageInfo,moduleTitle }=this.props
        const { radioValue,withDetail,v1,v2 }=this.state
        this.setState({
            started:"block",
            isStart:"none",
        });
        let scope=""
        if(radioValue===1){
            scope="current";
            this.setState({
                radioDisabled2:true,
            });
        }else{
            scope="all";
            this.setState({
                radioDisabled1:true,
                inputDisabled:true,
            });
        }
        Super.super({
            url:`api2/entity/export/start/${menuId}/${queryKey}`,    
            data:{
                scope,
                withDetail:withDetail,
                parameters:{
                    pageNo:pageInfo.pageNo.toString(),
                    pageSize:pageInfo.pageSize.toString(),
                    ...filterOptions,
                },               
                rangeStart:v1,
                rangeEnd:v2,
            }            
		}).then((res)=>{
            console.log(moduleTitle)
            this.props.setDownloadTitle(moduleTitle)
			if(res.uuid){
                this.setState({
                    uuid:res.uuid
                })
                this.statusOut(res.uuid)
                this.timerID=setInterval(
                    () =>this.statusOut(res.uuid),
                    1000
                  );
            }
		})
    }
    statusOut=(uuid,interrupted)=>{
        Super.super({
            url:`api2/entity/export/status`,   
            data:{
                uuid,
                interrupted,
            }         
		},"","none").then((res)=>{
            this.setState({
                statusMsg:res.statusMsg,
                percent:Math.floor((res.current/res.totalCount)*100),
            })
            if(interrupted){
                clearInterval(this.timerID);               
            }
            if(res.completed===true){
                clearInterval(this.timerID);
                this.setState({
                    isDisabled:false,
                    uuid,
                });
            }
		})
    }
    download=()=>{
        let {uuid}=this.state;
        const tokenName=Units.getLocalStorge("tokenName")
        Units.downloadFile(`api2/entity/export/download/${uuid}?@token=${tokenName}`) 
    }
    handleCancel=()=>{
        const {uuid}=this.state
        this.statusOut(uuid,true) //中断导出
        this.props.setDownloadTitle(null) //恢复原本的导出的名称
        this.setState({
            started:"none",
            isStart:"block",
            percent:0,
            radioDisabled1:false,
            radioDisabled2:false,
            inputDisabled:false,
            isDisabled:true,
        });
    }
   
    render(){
        const { radioValue,radioDisabled1,radioDisabled2,inputDisabled,
            isStart,started,isDisabled,percent,statusMsg }=this.state
        return (
            <div className="exportFrame">
                <RadioGroup onChange={this.onChangeRadio} value={radioValue} defaultValue={1}>
                    <Radio value={1} disabled={radioDisabled1} >导出当前页</Radio>
                    <Radio value={2} disabled={radioDisabled2}>导出所有</Radio>
                </RadioGroup>
                <Divider />
                {radioValue===2?
                    <div>
                        数据范围：
                        <InputNumber 
                            min={0} 
                            placeholder="开始序号" 
                            onChange={(v1)=>this.setState({v1})} 
                            disabled={inputDisabled}/>-
                        <InputNumber 
                            min={1}  
                            placeholder="结束序号" 
                            onChange={(v2)=>this.setState({v2})} 
                            disabled={inputDisabled}/>
                        <Divider />
                    </div>:"" }
                <div style={{textAlign:"center",display:isStart}}>
                    <Checkbox onChange={(e)=>this.setState({
                                withDetail:e.target.checked,
                            })}>
                        详情
                    </Checkbox>
                    <Button type="primary" onClick={this.handleStart}>
                        开始导出
                    </Button>
                </div>
                <div style={{textAlign:"center",display:started}}>
                    <Button type="primary" 
                            disabled={isDisabled} 
                            onClick={this.download}>
                            下载导出文件
                    </Button>
                    <Button style={{marginLeft:10}} onClick={this.handleCancel}>取消导出</Button>
                    <Progress percent={percent} size="small" status="active" />
                    <p>{statusMsg}</p>
                </div>
            </div>
        )
    }
}