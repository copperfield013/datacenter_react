import React from 'react'
import {Checkbox,Divider,Button } from 'antd';
const CheckboxGroup  = Checkbox.Group;


export default class DisableCols extends React.Component{
    state={
        checkedValues:[]
    }
    componentDidMount(){
        const {plainOptions}=this.props
        const checkedValues=[]
        if(plainOptions){
            plainOptions.forEach((item)=>{
                checkedValues.push(item.value)
            })
        }
        this.setState({
            checkedValues
        })
    }
    onChange=(checkedValues)=>{
        this.setState({
            checkedValues
        })        
    }
    handleChecked=()=>{
        let {plainOptions}=this.props
        let {checkedValues}=this.state
        const ids=[]
        plainOptions.forEach((item)=>{
            item.selecttd=false
            checkedValues.forEach((it,i)=>{
                if(item.value===it){
                    item.selecttd=true
                }
            })
        })
        plainOptions.forEach((item)=>{
            if(!item.selecttd){
                ids.push(item.value)
            }
        })
        this.props.handelDisableCols(ids.join(","))
    }
    render(){
        const {plainOptions}=this.props
        const {checkedValues}=this.state
        return (
            <div>
                <CheckboxGroup options={plainOptions} onChange={this.onChange} value={checkedValues}/>
                <Divider style={{margin:'10px 0'}}/>
                <div style={{textAlign:"center"}}>
                    <Button type="primary" onClick={this.handleChecked}>确定</Button>
                </div>
            </div>
            )
    }
}