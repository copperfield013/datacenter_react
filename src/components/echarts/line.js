import React from 'react'
import { Card } from 'antd';
import echartTheme from './echartTheme';
//import echarts from 'echarts'
//按需加载
import echarts from 'echarts/lib/echarts';
import "echarts/lib/chart/line"
import "echarts/lib/component/tooltip"
import "echarts/lib/component/title"
import "echarts/lib/component/legend"
import "echarts/lib/component/markPoint"
import ReactEcharts from 'echarts-for-react';

export default class Line extends React.Component{
    componentWillMount(){
        echarts.registerTheme("ichq",echartTheme)
    }
    getOption=()=>{
        let option = {
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line',
                areaStyle: {}
            }]
        };               
        return option
    }
    getOption2=()=>{
        let option = {
            title: {
                text: '动态数据',
                subtext: '纯属虚构'
            },
            legend: {
                data:['小明','小红','candy']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name:'小明',
                    data: [120, 200, 150, 80, 70, 110, 130],
                    type: 'line'
                },
                {
                    name:'小红',
                    data: [100, 150, 200, 190, 187, 219, 129],
                    type: 'line'
                },
                {
                    name:'candy',
                    data: [234, 532, 324, 24, 224, 122, 64],
                    type: 'line'
                }
        ]
        };
        
        return option
    }

    render(){
       
        return (
            <div>
                <Card title="柱形图1">
                    <ReactEcharts option={this.getOption()} theme="ichq"/>
                </Card>
                <Card title="柱形图2">
                    <ReactEcharts option={this.getOption2()} theme="ichq"/>
                </Card>
                
            </div>
            
        )
    }
}