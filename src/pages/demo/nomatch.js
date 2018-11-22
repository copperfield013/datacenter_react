import React from "react"

export default class Nomatch extends React.Component{
    render(){
        const style={
            height:"calc(61vh)",
            background:"#fff",
            textAlign:"center",
            paddingTop:"100px",
            fontSize:"24px"

        }
        return (
            <div style={style}>
                网页找不到了 404
            </div>
        )
    }
}