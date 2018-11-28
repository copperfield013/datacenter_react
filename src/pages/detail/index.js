import React from 'react'
import {Card,Table,Form,Input,Button} from 'antd'
import './index.css'
const FormItem=Form.Item


class Detail extends React.Component{
    state={
        type:this.props.type,
        count:0,
        columns:[],
        dataSource:[],
    }
    initDetailsList=()=>{      
        const { getFieldDecorator } = this.props.form;
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
                                        this.state.type=="detail"?<span style={{width:165,display:"inline-block"}}>{fieldValue}</span>:
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
                    const columns=this.renderColumns(item.descs)
                    const RANGE=<Card title={cardTitle}>
                                    {
                                        this.state.type=="edit"?<Button type='primary' onClick={this.handleAdd} style={{marginBottom:10}}>新增记录</Button>:""
                                    }
                                    <Table 
                                        pagination={false}
                                        bordered
                                        columns={columns}
                                        dataSource={this.state.dataSource}
                                    />                  
                                </Card>
                    detailsItemList.push(RANGE)
                    //console.log(columns)
                }
            })          
        }
        if(this.state.type=="edit"){
            let btn=<Button type='primary' className="submitBtn" onClick={this.handleSubmit}>提交</Button>
            detailsItemList.push(btn)
        }
        return detailsItemList;
    }
    renderColumns=(data,index)=>{
		if(data){
			data.map((item)=>{
				let key="dataIndex";
				let value=item.fieldName;
                item[key]=value;	
                item["key"]=index;
                item["render"]=() => <Input placeholder="hh" />					
            })
            var act={
				title: '操作',
				key: 'action',
				render: (text, record) => (
				  <span>
					<Button type="primary" icon="align-left">详情</Button>
				  </span>
				),
              }
            if(this.state.type=="edit"){
               data.push(act)            
            }
            console.log(data)
            return data
		}		
    }
    handleSubmit=()=>{
        let data=this.props.form.getFieldsValue();
        console.log(data)
    }
    handleAdd=()=> {
        const newDataSource = this.state.dataSource;
        const { count } = this.state;
        newDataSource.push({
            key: count,
            "拥有书籍.书名": "",
            "拥有书籍.价格": "",
            "拥有书籍.ISBN": "",
            "拥有书籍.封面":"",
        });
        this.setState({
            dataSource: newDataSource,
            count: count + 1,
        });
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