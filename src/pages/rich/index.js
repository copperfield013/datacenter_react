import React from 'react'
import { Card,Button,Modal} from 'antd';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftjs from 'draftjs-to-html';

export default class Rich extends React.Component{

    state={
        editorState:'',
        isShow:false
    }

    onEditorStateChange=(editorState) => {
        this.setState({
          editorState,
        });
      };
    
    resetRich=()=>{
        this.setState({
            editorState:'',
            contentState:''
        });
    }  
    showHtml=()=>{
        this.setState({
            isShow:true,           
        });
    }
    onEditorChange=(contentState)=>{
        this.setState({
            contentState,
          });
    }
    render(){
        const {editorState}=this.state
        return (
            <div>
                 <Card>
                     <Button type="primary" onClick={this.resetRich}>清空内容</Button>
                     <Button type="primary" onClick={this.showHtml}>获取HTML文本</Button>
                </Card>
                <Card title="富文本编辑器">
                    <Editor
                        editorState={editorState}
                        onContentStateChange={this.onEditorChange}
                        onEditorStateChange={this.onEditorStateChange}
                        />
                </Card>
                <Modal
                    title="富文本"
                    visible={this.state.isShow}
                    onCancel={()=>{
                        this.setState({
                            isShow:false,           
                        });
                    }}
                    footer={null}
                >
                    {draftjs(this.state.contentState)}
                </Modal>
            </div>
        )
    }
}