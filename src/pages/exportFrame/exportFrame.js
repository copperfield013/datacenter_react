import React from 'react'
import {Button,Radio,Divider,InputNumber,Checkbox,Progress} from 'antd';
import './index.css'
const RadioGroup = Radio.Group;

export default class ExportFrame extends React.Component{
    state={
        radioValue:1,
        started:"none",
        isDisabled:true,
    }
    
    onChangeRadio=(e)=>{
        this.setState({
            radioValue: e.target.value,
        });
    }
    handleStart=()=>{
        this.setState({
            started:"block",
            isStart:"none",
        });
    }
    handleCancel=()=>{
        this.setState({
            started:"none",
            isStart:"block",
        });
    }
    render(){
        return (
            <div>
                <RadioGroup onChange={this.onChangeRadio} value={this.state.radioValue}>
                    <Radio value={1}>导出当前页</Radio>
                    <Radio value={2}>导出所有</Radio>
                </RadioGroup>
                <Divider />
                {
                    this.state.radioValue===2?
                    <div>
                        数据范围：
                        <InputNumber min={1} max={10} placeholder="开始序号"/>-<InputNumber min={1} max={10} placeholder="结束序号"/>
                        <Divider />
                    </div>:""
                }
                <div style={{textAlign:"center",display:this.state.isStart}}>
                    <Checkbox>详情</Checkbox><Button type="primary" onClick={this.handleStart}>开始导出</Button>
                </div>
                <div style={{textAlign:"center",display:this.state.started}}>
                    <Button type="primary" disabled={this.state.isDisabled}>下载导出文件</Button><Button style={{marginLeft:10}} onClick={this.handleCancel}>取消导出</Button>
                    <Progress percent={50} size="small" status="active" />
                </div>
            </div>
        )
    }
}