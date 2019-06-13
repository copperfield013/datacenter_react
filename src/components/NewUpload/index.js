import React from 'react'
import Units from './../../units'
import {Button,Upload,Icon,message} from 'antd'

export default class NewUpload extends React.Component{

    state={
        fileList:[]
    }
    componentDidMount(){
        const {fieldValue,fieldName}=this.props
        if(fieldValue){
            const url=Units.api()+fieldValue
            this.setState({
                fileList:[{
                    uid:"-1",
                    name:`${fieldName}`,
                    status: 'done',
                    url: url,
                }]
            })
        }
    }
    handleChange=(info)=>{
        let fileList = info.fileList;
        fileList = fileList.slice(-1);
        //this.setState({fileList})
        if(fileList.length>=1){
            fileList.map((item)=>{
                this.triggerChange(item);
                return false
            })
        }
    }
    triggerChange = (changedValue) => {
        const {onChange} = this.props
        if (onChange) {
          onChange(changedValue);
        }
      }
    beforeUpload=(file)=>{
        console.log(file)
        const isJPG = file.type === 'image/jpeg';
        const isPNG = file.type === 'image/png';
        let isChecked=true
        if (!(isJPG || isPNG)) {
            message.error('只能上传JPG 、JPEG 、PNG格式的图片~')
            isChecked=false
        }
        const isLt5M = file.size / 1024 / 1024 < 1;
        if (!isLt5M) {
            message.error('超过5M限制 不允许上传~')
            isChecked=false
        }
        console.log(isChecked)
        if(isChecked){
            console.log(isChecked)
            this.setState(state => ({
                //fileList: [file],
            }));
        }
    }
    render(){
        const {fieldValue,width}=this.props
        const url=Units.api()+fieldValue
        return (
            <div>                                           
                <Upload
                    accept="image/*"
                    listType= 'picture'
                    beforeUpload={this.beforeUpload}
                    defaultFileList={fieldValue?[{
                        uid:"-1",
                        status: 'done',
                        url: url,
                    }]:""}
                    onChange={this.handleChange}
                >    
                {
                    this.state.fileList.length>=1?"":<Button style={{width:width}}>
                                                        <Icon type="upload" /> 点击上传
                                                    </Button>
                }                                           
                                                                                                            
                </Upload>                                               
            </div>
        )
    }
}