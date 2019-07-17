import React from 'react'
import {Button,Upload,Icon,message} from 'antd'

export default class NewUpload extends React.Component{

    state={
        fileList:[]
    }
    handleChange=(info)=>{
        let fileList = info.fileList.slice(-1)
        this.setState({
            fileList,
        });
        this.triggerChange(fileList[0]);
    }
    triggerChange = (changedValue) => {
        const {onChange} = this.props
        if (onChange) {
          onChange(changedValue);
        }
      }
    beforeUpload=(file)=>{
        const isJPG = file.type === 'image/jpeg';
        const isPNG = file.type === 'image/png';
        if (!(isJPG || isPNG)) {
            message.error('只能上传JPG 、JPEG 、PNG格式的图片~')
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('超过5M限制 不允许上传~')
        }
    }
    render(){
        const {width}=this.props
        const {fileList}=this.state
        return (
            <div>                                           
                <Upload    
                    action="image/*"               
                    listType= 'picture'
                    beforeUpload={this.beforeUpload}
                    onChange={this.handleChange}
                >    
                {fileList.length>=1?"":
                    <Button style={{width:width}}>
                        <Icon type="upload" /> 点击上传
                    </Button>}                                                                                                                                                   
                </Upload>                                               
            </div>
        )
    }
}