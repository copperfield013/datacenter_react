import React from 'react'
import {Card,Table,Form,Input} from 'antd'
import './index.css'
const FormItem=Form.Item


class Detail extends React.Component{
    
    initDetailsList=()=>{
       
        const { getFieldDecorator } = this.props.form;
        let type=this.props.type
        const detailsList=this.props.detailsList;
        const detailsItemList=[];
        if(detailsList && detailsList.length>0){
            detailsList.forEach((item)=>{
                let cardTitle=item.title;
                if(item.fields){
                    const INPUT=<Card title={cardTitle}>
                    {
                        item.fields.map((item)=>{      
                        let fieldName=item.fieldName;
                        let fieldValue=item.value;
                        return <FormItem label={fieldName} key={item.fieldId} className='labelcss'>
                                    {
                                        type=="detail"?<span style={{width:165,display:"inline-block"}}>{fieldValue}</span>:
                                        getFieldDecorator([fieldName],{
                                        initialValue:fieldValue
                                    })(
                                        <Input type="text" style={{width:165}}/>
                                    )}
                                </FormItem> 
                        })    
                    }                   
                    </Card>
                    detailsItemList.push(INPUT)
                }else if(item.descs){
                    const RANGE=<Card title={cardTitle}>
                        <Table 
                            bordered
                            columns={this.renderColumns(item.descs)}
                            //dataSource={}
                        />                  
                    </Card>
                    detailsItemList.push(RANGE)
                    //console.log(this.renderColumns(item.descs))
                }
            })
            
        }
        return detailsItemList;
    }
    renderColumns=(data)=>{
		if(data){
			data.map((item)=>{
				let key="dataIndex";
				let value=item.title;
                item[key]=value;								
			})
			// var act={
			// 	title: '操作',
			// 	key: 'action',
			// 	render: (text, record) => (
			// 	  <span>
			// 		<Button type="primary" icon="align-left" size="small"onClick={()=>this.handleOperate("detail",record)}>详情</Button>
			// 		<Button type="dashed" icon="edit" size="small">修改</Button>
			// 		<Button type="danger" icon="delete" size="small" onClick={()=>this.handleOperate("delete",record)}>删除</Button>
			// 	  </span>
			// 	),
			//   }
			//   data.push(act)
			  return data
		}		
	}
    render(){
        return(
            <div>
                <h3>{this.props.detailsTitle}</h3>
                <Card>
                    <Form layout="inline">
                        {this.initDetailsList()}
                    </Form>
                </Card>
            </div>
        )
    }
}
export default Form.create()(Detail)