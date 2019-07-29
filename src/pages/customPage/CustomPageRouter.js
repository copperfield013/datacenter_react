import React from 'react';
import DefCustomPage from "./DefCustomPage";
import CustomPage from "./CustomPage";

/**
 * 返回的对象是自定义页面的名称映射到对应的自定义页面对象
 * 只有在这里定义后，对应的页面才可以被页面渲染
 * 对象的key即自定义页面的名称
 * value是自定义页面的对象类名（需要继承CustomPage类）
 */
const CUSTOM_PAGE_MAP = {
    '/def'  : DefCustomPage
}

/**
 * 自定义页面的路径映射
 */
export default class CustomPageRouter extends React.Component{
    render(){
        let pageName = this.props.match.params.pageName;
        let Page = CUSTOM_PAGE_MAP[pageName] || CustomPage;
        return React.createElement(Page);

    }
}