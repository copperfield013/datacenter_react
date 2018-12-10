import axios from 'axios'
import { message } from 'antd';

let storage=window.sessionStorage;
export default class Axios{
    static ajax(options){
        let tokenName=storage.getItem('tokenName')
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
                if(response.status===200){
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