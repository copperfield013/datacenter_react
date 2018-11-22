import React from 'react'

export default class Child extends React.Component{
	constructor(props) {
	    super(props);
	    this.state = {
	    	count:0
	    };
	  }
	render(){
		return <div>
		   <p>子组件</p>
		   <p>{this.props.name}</p>
		</div>
	}
}