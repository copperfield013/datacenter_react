import React from 'react'
import {Button,Upload,Icon} from 'antd'

export default class NewUpload extends React.Component{

    state={
        fileList:[]
    }
    componentDidMount(){
        const fieldValue=this.props.fieldValue;
        const fieldName=this.props.fieldName;
        if(fieldValue){
            this.setState({
                fileList:[{
                    uid:"-1",
                    name:`${fieldName}.png`,
                    status: 'done',
                    url: `/file-server/${fieldValue}`,
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
                this.triggerChange(item.originFileObj);
                return false
            })
        }
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange;
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
        return (
            <div>                                           
                <Upload
                    accept="image/*"
                    listType= 'picture'
                    beforeUpload={this.beforeUpload}
                    defaultFileList={fieldValue?[{
                        uid:"-1",
                        status: 'done',
                        url: `/file-server/${fieldValue}`,
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