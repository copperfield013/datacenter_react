import React from 'react'
import './index.css'

export default class RightBar extends React.Component{
    
    scrollToAnchor = (anchorName) => {
        if (anchorName) {
            let anchorElement = document.getElementById(anchorName);
            if(anchorElement) { anchorElement.scrollIntoView({behavior: "smooth", block: "center"})}
        }
      }
    scroll=(e)=>{
        e.preventDefault()
        e.stopPropagation()
        const list=document.getElementsByClassName("rightBar")[0]
        if(list){
            const ul=list.getElementsByTagName("ul")[0]
            ul.style.marginTop=""
        }
    }
    render(){
        const {list}=this.props
        return (
            <div className="rightBar" onScroll={this.scroll}>
                <ul>              
                    {
                        list?list.map(item=>
                            <li onClick={()=>this.scrollToAnchor(item)} key={item}>{item}</li>
                        ):""
                    }
                </ul>
            </div>
        )
    }
}
