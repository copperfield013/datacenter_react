import React from 'react'
import {Button,Radio,Divider,InputNumber,Checkbox,Progress} from 'antd';
import './index.css'
import Super from "./../../super"
import Units from "./../../units"
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
    onChangeRadio=(e)=>{
        this.setState({
            radioValue: e.target.value,
            v1:"",
            v2:""
        });
    }
    handleStart=()=>{
        const { menuId,pageNo,pageSize,filterOptions }=this.props
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
            url:`/api/entity/export/start/${menuId}`,    
            data:{
                scope,
                withDetail:withDetail,
                parameters:{
                    pageNo:pageNo.toString(),
                    pageSize:pageSize.toString(),
                    ...filterOptions,
                },               
                rangeStart:v1,
                rangeEnd:v2,
            }            
		},"json").then((res)=>{
			if(res.uuid){
                this.statusOut(res.uuid)
                this.timerID=setInterval(
                    () =>this.statusOut(res.uuid),
                    500
                  );
            }
		})
    }
    statusOut=(uuid)=>{
        Super.super({
            url:`/api/entity/export/status/${uuid}`,            
		}).then((res)=>{
            this.setState({
                statusMsg:res.statusMsg,
                percent:(res.current/res.totalCount)*100,
            })
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
        let uuid=this.state.uuid;
        Units.downloadFile(`/api/entity/export/download/${uuid}`)
    }
    handleCancel=()=>{
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
    onChange=(e)=>{
        this.setState({
            withDetail:e.target.checked,
        })
    }
    setValue1=(v1)=>{
        this.setState({
            v1,
        })
    }
    setValue2=(v2)=>{
        this.setState({
            v2,
        })
    }
    render(){
        const { radioValue,radioDisabled1,radioDisabled2,inputDisabled,
            isStart,started,isDisabled,percent,statusMsg }=this.state
        return (
            <div className="exportFrame">
                <RadioGroup onChange={this.onChangeRadio} value={radioValue}>
                    <Radio value={1} disabled={radioDisabled1} >导出当前页</Radio>
                    <Radio value={2} disabled={radioDisabled2}>导出所有</Radio>
                </RadioGroup>
                <Divider />
                {radioValue===2?
                    <div>
                        数据范围：
                        <InputNumber 
                            min={1} 
                            max={10} 
                            placeholder="开始序号" 
                            onChange={this.setValue1} 
                            disabled={inputDisabled}/>-
                        <InputNumber 
                            min={1} 
                            max={10} 
                            placeholder="结束序号" 
                            onChange={this.setValue2} 
                            disabled={inputDisabled}/>
                        <Divider />
                    </div>:"" }
                <div style={{textAlign:"center",display:isStart}}>
                    <Checkbox onChange={this.onChange}>
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