import React from 'react'
import './index.css'
import { Row, Col } from 'antd';
import BarEchart from "./BarEchart";
import LineEchart from "./LineEchart";
import AniEchart from "./AniEchart";
import HomePage from "../customPage/HomePage";

const HOME_CONFIG = {
    component       : HomePage,
    blockIds        : null,
    excludeBlockIds : null
};

export default class Home extends React.Component{
    render(){
        return (
            <div >
                <Row>
                    <Col span={12}>
                        <BarEchart />
                    </Col>
                    <Col span={12}>
                        <LineEchart />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <AniEchart />
                    </Col>
                </Row>
            </div>
        );
    }
}