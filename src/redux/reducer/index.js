//reducer数据处理

import {type} from "./../action"
const initialState={
    menuName:""
}

export default (state=initialState,action)=>{
    switch (action) {
        case type.Switch_Menu:
            return{
               ...state,//保留原有状态的state里面的值
               menuName:action.menuName
            }
    
        default:
            break;
    }
}