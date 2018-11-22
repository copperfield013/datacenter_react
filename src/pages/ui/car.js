import React from 'react'
import { Card,Carousel,Row,Col } from 'antd';
import './index.css'

export default class Car extends React.Component{

    render(){
        return(
            <div>
                <Card title="基础用法和自动切换">
                    <Row>
                        <Col span={12}>
                            <Card style={{width:500}} hoverable={true}>
                                <Carousel>
                                    <div><h3>1</h3></div>
                                    <div><h3>2</h3></div>
                                    <div><h3>3</h3></div>
                                    <div><h3>4</h3></div>
                                </Carousel>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card style={{width:500}} hoverable={true}>
                                <Carousel autoplay>
                                    <div><h3>1</h3></div>
                                    <div><h3>2</h3></div>
                                    <div><h3>3</h3></div>
                                    <div><h3>4</h3></div>
                                </Carousel>
                            </Card>
                        </Col>
                    </Row>  
                </Card>  
                <Card title="垂直显示和渐显">
                    <Row>
                        <Col span={12}>
                            <Card style={{width:500}} hoverable={true}>
                                <Carousel vertical>
                                    <div><h3>1</h3></div>
                                    <div><h3>2</h3></div>
                                    <div><h3>3</h3></div>
                                    <div><h3>4</h3></div>
                                </Carousel>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card style={{width:500}} hoverable={true}>
                                <Carousel  effect="fade">
                                    <div><h3>1</h3></div>
                                    <div><h3>2</h3></div>
                                    <div><h3>3</h3></div>
                                    <div><h3>4</h3></div>
                                </Carousel>
                            </Card>
                        </Col>
                    </Row>  
                </Card>                            
            </div>
        )
    }
}