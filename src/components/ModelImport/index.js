import React from 'react'
import {Button,Icon} from 'antd'

export default class ModelImport extends React.Component{

    render(){
        return (
            <div>
                <h3>
                    导入模板配置
                    <p className="fr">                        
                        <Button className="hoverbig" title="切换模板"><Icon type="snippets" /></Button>
                        <Button className="hoverbig" title="保存模板"><Icon type="save" /></Button>
                        <Button className="hoverbig" title="下载导入模板" ><Icon type="download" /></Button>
                    </p>
                </h3>
                
            </div>
        )
    }
}
    