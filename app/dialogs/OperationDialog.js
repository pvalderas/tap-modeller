import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import Dialog from './Dialog.js';
import './loader.css';

export let showOperationDialog = function(device, iot, event){
    window.operationDialog.show(device, iot, event);
};

export let hideOperationDialog = function(device){
    window.operationDialog.hide();
};

export default class OperationDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      operations: [],
      user:null,
      device:null,
      error:null,
      type:"operationList",
      title:"Thing Actions",
      id:"operationDialog",
      loader:"operationLoader"
    };

    window.operationDialog=this;

    this.show=this.show.bind(this);

  }

  hide(){
      document.getElementById(this.state.id).style.display = "none";
  }

  show(device, iot, event){
    if(device!==this.state.device || sessionStorage.getItem("user")!==this.state.user){
      this.loadOperations(device);
    }
    document.getElementById(this.state.id).style.display = "block";
    let x=event.clientX;
    document.getElementById(this.state.id).style.left = (x-400)+"px";
  }

  loadOperations(device) {
    document.getElementById(this.state.loader).style.display = "block";

    device=device.replaceAll("[","").replaceAll("]","");

    let urls=JSON.parse(sessionStorage.getItem("urls"));
    let user=sessionStorage.getItem("user");
    let url=urls[device].replace("{user}",user);

    fetch(url)
      .then(function (response) {
        return response.json()
      })
      .then(ops => {
        this.setState({ operations: ops, device: device, error:null, user:sessionStorage.getItem("user") });
        document.getElementById(this.state.loader).style.display = "none";
      })
      .catch(error => {
          this.setState({error:error});
        }
      )    
  }

  updateInput(value){
    let input=document.getElementById('eventOp');

    let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(input, value);

    let inputEvent = new Event('input', { bubbles: true});
    input.dispatchEvent(inputEvent);

  }

  addOperation(name){
    this.updateInput(name);
    document.getElementById(this.state.id).style.display = "none";
  }


  render(){
  		let content;
  		if(this.state.error==null) {
        let style={
                color:"blue"
              }
              
	  		const operations = this.state.operations.map(operation => 
	  			<li key={operation.ID} className="list-group-item"><a href="#" onClick={this.addOperation.bind(this,operation.ID,operation.URL,operation.METHOD,operation.path)} style={style}>{operation.ID}</a></li>
	  		);
	  		content=<ul className="list-group">{operations}</ul>;
  		}else{
  			content=this.state.error;
  		}
  		return (
  			<Dialog type={this.state.type} title={this.state.title} id={this.state.id} loader={this.state.loader} content={content} />
  		);
  }

}