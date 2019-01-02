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
    },
    setCookie(cname,cvalue,exdays){
        const d = new Date();
        d.setTime(d.getTime()+(exdays*24*60*60*1000));
        const expires = "expires="+d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    },
    getCookie(cname){
        const name = cname + "=";
        const ca = document.cookie.split(';');
        for(let i=0; i<ca.length; i++){
            const c = ca[i].trim();
            if (c.indexOf(name)===0) return c.substring(name.length,c.length);
        }
        return "";
    },
    delCookie(cname){ 
        const exp = new Date(); 
        exp.setTime(exp.getTime() - 1); 
        const cval=this.getCookie(cname); 
        if(cval!=null) 
            document.cookie= cname + "="+cval+";expires="+exp.toGMTString(); 
    },
    //随机数
    RndNum(n){   
        let rnd="";
        for(let i=0;i<n;i++)
            rnd+=Math.floor(Math.random()*10);
        return rnd;
    }
}