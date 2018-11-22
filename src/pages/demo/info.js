import React from "react"

export default class Info extends React.Component{
    render(){
        return (
            <div>
                这里是文字
                {this.props.match.params.id}
            </div>
        )
    }
}