import React from 'react'
import {Select,Radio,message} from 'antd'
const Option = Select.Option;

export default {
    formateDate(time){
        if(!time) return '';
        const date=new Date(time);
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    },
    pagination(data,callback){
        const page={
            onchange:(current)=>{
                callback(current)
            },
            current:data.pageInfo.pageNo,
            pageSize:data.pageInfo.pageSize,
            total:data.pageInfo.count,
            showTotal:()=>{
                return `共${data.pageInfo.count}条`
            },
            showQuickIumper:true
        }
        return page
    },
    getSelectList(data){
        if(!data){
            return [];
        } 
        const options=[]
        data.map((item)=>{
            options.push(<Option value={item.value} key={item.title}>{item.title}</Option>)
            return false
        })
        return options
    },
    getRadioList(data){
        if(!data){
            return [];
        } 
        const options=[]
        data.map((item)=>{
            options.push(<Radio value={item.id} key={item.id}>{item.name}</Radio>)
            return false
        })
        return options
    },
    downloadFile(url) {   
        try{ 
            let elemIF = document.createElement("iframe");   
            elemIF.src = url;   
            elemIF.style.display = "none";   
            document.body.appendChild(elemIF);   
        }catch(e){ 
            message.error(e)
        } 
    }
}