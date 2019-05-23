import React from 'react'
import { Tag} from 'antd';
import './index.css'

const {CheckableTag}=Tag

export default class MyTag extends React.Component {
    
    handleChange = (id,name) => {
      const {type,totalName}=this.props
      const list={
        key:name,
        id:id,
        name:name,
        words:name,
        totalName,
        type,
      }
      this.props.getwords(list,type)
    };
    render() {
      const {name,id,checked}=this.props
      return (
        <CheckableTag {...this.props} checked={checked} onChange={()=>this.handleChange(id,name)} className={checked?"":"borderTag"}/>
      );
    }
  }