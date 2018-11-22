import React from "react"
import { Layout } from 'antd';
const { Header, Footer, Sider, Content } = Layout;


export default class Topic extends React.Component{
    render(){
        return (
            <div>
                <Layout>
                    <Header theme="light">Header</Header>
                    <Content>Content</Content>
                    <Footer>Footer</Footer>
                </Layout>
            </div>
        )
    }
}