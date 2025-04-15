import React, { Component } from 'react';

export default class MenuOption extends Component {

  constructor(props) {
    super(props);
  }

  render() {
	  	if(this.props.items!=undefined){
	  		const subItems=this.props.items.map((item, index) => {

	  					if(item.id=="separator"){
	  						return (<div className="dropdown-divider" key={index} id={index}></div>)
						}else if(item.click!=undefined){
							let linkClasses="dropdown-item";
		    				if(item.disabled) linkClasses+=" disabled";
							return (<a className={linkClasses} href="#" key={item.id} id={item.id} onClick={item.click}>{item.label}</a>)
						}	
		        	}
		    );
		    let linkClasses="nav-link dropdown-toggle";
		    if(this.props.disabled) linkClasses+=" disabled";
		    return(
		  		<li className="nav-item dropdown" >
			        <a className={linkClasses} href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
			       		 id={this.props.id}>
			         {this.props.label}
			         </a>
			        <div className="dropdown-menu" aria-labelledby="navbarDropdown">{subItems}</div>
		     	</li>
		    );
	  	}else{
	  		if(this.props.id=="separator"){
	  			return (<li className="nav-item"><div style={{borderLeft:"2px solid lightgrey", height:"100%"}}></div></li>);
	  		}
			else if(this.props.id=="separatorSmall"){
				return (<li className="nav-item"><div style={{borderLeft:"2px solid lightgrey", height:"60%", marginTop:"10px"}}></div></li>);
			}
	  		else if(this.props.id=="separatorArrow"){
	  			return (<li className="nav-item"><div style={{borderLeft:"2px solid lightgrey", height:"100%", color:"lightgrey", paddingTop:"8px"}}>&#8594;</div></li>);
	  		}
	  		else{
	  			let linkClasses="nav-link";
			    if(this.props.disabled) linkClasses+=" disabled";
		  		return(
				  	<li className="nav-item" >
					    <a className={linkClasses} href="#"  
					    		onClick={this.props.click} id={this.props.id} key={this.props.id} >
					     {this.props.label}
					    </a>
				  	</li>
				);
	  		}
		  		
		}
	  }
 }