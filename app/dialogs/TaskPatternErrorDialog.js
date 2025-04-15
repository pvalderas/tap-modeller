import React, { Component } from 'react';

export var showTaskPatternErrorDialog = function(){
   window.taskPatternErrorDialog.show();
};

export var hideTaskPatternErrorDialog = function(){
   window.taskPatternErrorDialog.hide();
};

export default class TaskPatternErrorDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state={
    	css: {
    		display: "none",
    		right: "320px",
        bottom: "200px" 
    	}
    }

    this.id="taskPatternErrorDialog";
    this.message="The 'only one' option can be selected when only one action is added";

  	window.taskPatternErrorDialog=this;
  }

  show(){
   	this.setState({css:{display:"block", right: "320px", bottom: "200px", borderColor: "red"}});
  }

  hide(){
     	this.setState({css:{display:"none"}});
  }


  render(){
  	let modalHeaderSticky ={
      position: "sticky",
      top: 0,
      backgroundColor: "inherit",
      zIndex: 1055
    }
    return(
      <div id={this.id} className="eventError-dialog" style={this.state.css}>
         <div className="modal-header" style={modalHeaderSticky}>
            <div className="row">
              <div style={{width:"98%"}}><h5 className="modal-title">{this.message}</h5></div>
              <div style={{width:"2%",paddingTop:"30px"}}><img src="imgs/rightArrow.jpeg" height="32px"/></div>
            </div>
            
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.hide.bind(this)}>
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    </div>
    )
  }
}