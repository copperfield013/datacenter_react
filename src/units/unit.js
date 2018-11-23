import React from 'react'
import {Select,Radio} from 'antd'
const Option = Select.Option;

export default {
    formateDate(time){
        if(!time) return '';
        let date=new Date(time);
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    },
    pagination(data,callback){
        let page={
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
        let options=[]
        data.map((item)=>{
            options.push(<Option value={item.id} key={item.id}>{item.name}</Option>)
        })
        return options
    },
    getRadioList(data){
        if(!data){
            return [];
        } 
        let options=[]
        data.map((item)=>{
            options.push(<Radio value={item.id} key={item.id}>{item.name}</Radio>)
        })
        return options
    },
    /**
     * ETable 行点击通用函数
     * @param {*选中行的索引} selectedRowKeys
     * @param {*选中行对象} selectedItem
     */
    updateSelectedItem(selectedRowKeys, selectedRows, selectedIds) {
        if (selectedIds) {
            this.setState({
                selectedRowKeys,
                selectedIds: selectedIds,
                selectedItem: selectedRows
            })
        } else {
            this.setState({
                selectedRowKeys,
                selectedItem: selectedRows
            })
        }
    },
}