import superagent from 'superagent'
import { message } from 'antd';
import Units from './../units'

const api="http://47.100.187.235:7080/datacenter_api2"
export default class Superagent{
    static super(options){
        const tokenName=Units.getLocalStorge("tokenName")
        let loading;
        if(options.data && options.data.isShowLoading!==false){
            loading=document.getElementById('ajaxLoading')
            loading.style.display="block"
        }
        return new Promise((resolve,reject)=>{
            superagent
                .post(api+options.url)
                .type('form')
                .set("datacenter-token",tokenName)
                .query(options.query||'')
                .send(options.data||'')
                .end((req,res)=>{
                    if(options.data && options.data.isShowLoading!==false){
                        loading=document.getElementById('ajaxLoading')
                        loading.style.display="none"
                    } 
                    //console.log(res.body)
                    if(res.status===200){
                        resolve(res.body)
                    }else if(res.status===403){
                        message.info("请求权限不足,可能是token已经超时")
                        window.location.href="/#/login";
                    }else if(res.status===404||res.status===504){
                        message.info("服务器未开···")
                    }else if(res.status===500){
                        message.info("后台处理错误。")
                    }else{
                        reject(res.body)
                    }
                })              
        })
    }
}