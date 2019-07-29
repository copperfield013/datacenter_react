import React from 'react';
import ReactEcharts from 'echarts-for-react';

export default class BarEchart extends React.Component{
    getOptions(){
        const options = {
            title: {
                text    : '年龄分布图',
            },
            xAxis: {
                type: 'category',
                data: ['<20', '20-40', '40-60', '60-80', '>80']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [1000, 2000, 1500, 808, 300],
                type: 'bar'
            }]
        };
        return options;
    }
    getStyle(){
        return {height:'40vh', width:'100%'};
    }
    render(){
        return (
            <ReactEcharts option={this.getOptions()}
                style={this.getStyle()}
                className="react_for_echarts" />)
    }
}