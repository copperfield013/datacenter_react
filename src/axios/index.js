import axios from 'axios'
import { message } from 'antd';
import JsonP from 'jsonp'
const proxy = require('http-proxy-middleware');

var storage=window.localStorage;
export default class Axios{
    static requestList(_this,url,params){
        var data={
            params:params
        }
        this.ajax({
            url,
            data
        }).then((data)=>{
            if(data){
                if(data.result && data.pageId==params.pageId){
                    let list=data.result.list.map((item,index)=>{
                        item.key=index;
                        return item;
                    });
                    let columns=data.columns
                    let tabWidth=data.tabWidth
                    _this.setState({
                        list,
                        columns,
                        tabWidth
                    })
                }else if(data.criterias){
                    let baseForm=data.baseForm;
                    let formList=data.formList;
                    _this.setState({
                        formList,
                        baseForm
                    })
                }else if(data.modalFormList && data.pageId==params.pageId){
                    let modalFormList=data.modalFormList
                    _this.setState({
                        modalFormList
                    })
                }
                
            }
        })
    }
    static ajax(options){
        let tokenName=storage.getItem('tokenName')
		let datamobileTokenName = 'datamobile-token';
        let loading;
        if(options.data && options.data.isShowLoading!==false){
            loading=document.getElementById('ajaxLoading')
            loading.style.display="block"
        }
        return new Promise((resolve,reject)=>{
            axios({
                method: 'post',
                url: options.url,
                headers:{
                    "datamobile-token":tokenName,
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" 
                },
                timeout:10000,
                data:options.data|| ''
            }).then((response)=>{
                if(options.data && options.data.isShowLoading!==false){
                    loading=document.getElementById('ajaxLoading')
                    loading.style.display="none"
                }               
                if(response.status=='200'){
                    let res=response.data;
                    resolve(res)
                }else{
                    reject(response.data)
                }
            }).catch((error)=>{
                console.log(error)
                if(options.data && options.data.isShowLoading!==false){
                    loading=document.getElementById('ajaxLoading')
                    loading.style.display="none"
                } 
                message.info("请求超时")
            })
        })
    }

}