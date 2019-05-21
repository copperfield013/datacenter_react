import React from 'react'
import {Button,Upload,Icon} from 'antd'

export default class NewUpload extends React.Component{

    state={
        fileList:[]
    }
    componentDidMount(){
        const {fieldValue,fieldName}=this.props
        if(fieldValue){
            const url="http://47.100.187.235:7080/datacenter_api2/"+fieldValue
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
        this.setState({fileList})
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
        this.setState(state => ({
            fileList: [file],
        }));
        return false;
    }
    render(){
        const {fieldValue,width}=this.props
        const url="http://47.100.187.235:7080/hydrocarbon-api/"+fieldValue
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