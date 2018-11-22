//reducer数据处理

import {type} from "./../action"
const initialState={
    menuName:"首页"
}

export default (state=initialState,action)=>{
    switch (action) {
        case type.Switch_Menu:
            return{
               ...state,//保留原有状态的state里面的值
               menuName:action.menuName
            }
            break;
    
        default:
            break;
    }
}