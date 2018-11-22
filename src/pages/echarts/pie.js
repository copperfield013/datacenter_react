import React from 'react'
import { Card } from 'antd';
import echartTheme from './themeLight';
//import echarts from 'echarts'
//按需加载
import echarts from 'echarts/lib/echarts';
import "echarts/lib/chart/pie"
import "echarts/lib/component/tooltip"
import "echarts/lib/component/title"
import "echarts/lib/component/legend"
import "echarts/lib/component/markPoint"
import ReactEcharts from 'echarts-for-react';

export default class Pie extends React.Component{
    componentWillMount(){
        echarts.registerTheme("ichq",echartTheme)
    }
    getOption=()=>{
        let option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data:['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
            },
            series: [
                {
                    name:'访问来源',
                    type:'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:[
                        {value:335, name:'直接访问'},
                        {value:310, name:'邮件营销'},
                        {value:234, name:'联盟广告'},
                        {value:435, name:'视频广告'},
                        {value:548, name:'搜索引擎'}
                    ]
                }
            ]
        };
        
        
        return option
    }

    getOption2=()=>{
        let option = {
            title : {
                text: '某站点用户访问来源',
                subtext: '纯属虚构',
                x:'center',
                textStyle:{
                    color:"#333",
                    fontWeight: "normal"
                },
                subtextStyle:{
                    color:"#aaa",
                }
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                top:50,
                right:100,
                data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
            },
            series : [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data:[
                        {value:335, name:'直接访问'},
                        {value:310, name:'邮件营销'},
                        {value:234, name:'联盟广告'},
                        {value:735, name:'视频广告'},
                        {value:1548, name:'搜索引擎'}
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        
        
        return option
    }
    getOption3=()=>{
        let option = { 
            roseType: 'radius',
            title : {
                text: '某站点用户访问来源',
                subtext: '纯属虚构',
                x:'center',
                textStyle:{
                    color:"#333",
                    fontWeight: "normal"
                },
                subtextStyle:{
                    color:"#aaa",
                }
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                top:50,
                right:100,
                data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
            },
            series : [
                {
                    name: '访问来源',
                    type: 'pie',
                    data:[
                        {value:635, name:'直接访问'},
                        {value:410, name:'邮件营销'},
                        {value:734, name:'联盟广告'},
                        {value:735, name:'视频广告'},
                        {value:1548, name:'搜索引擎'}
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        
        
        return option
    }
    render(){
       
        return (
            <div>
                <Card title="饼图1">
                    <ReactEcharts option={this.getOption()} theme="ichq"/>
                </Card>
                <Card title="饼图2">
                    <ReactEcharts option={this.getOption2()} theme="ichq" style={{height:400}}/>
                </Card>
                <Card title="饼图2">
                    <ReactEcharts option={this.getOption3()} theme="ichq" style={{height:400}}/>
                </Card>
            </div>
            
        )
    }
}