//Action类型
export const type={
    Switch_Menu:'Switch_Menu'
}

//返回一个对象
export function switchMenu(menuName){
    return{
        type:type.Switch_Menu,
        menuName
    }
}