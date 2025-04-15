import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import './ListDialog.css';
import TaskPatternErrorDialog from "./TaskPatternErrorDialog.js";
import {showTaskPatternErrorDialog} from "./TaskPatternErrorDialog.js";


export let showTaskOperationsListDialog = function(list, element){
   window.taskOperationsListDialog.show(list, element);
};

export let hideTaskOperationsListDialog = function(){
    window.taskOperationsListDialog.hide();
};

export default class TaskOperationsListDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pattern:"one",
      things: [],
      type:"taskOperationsList",
      title:"Thing Operations",
      id:"taskOperationsListDialog"
    };

    this.element=null;

   
    window.taskOperationsListDialog=this;

    this.addThing=this.addThing.bind(this);
    this.changePatternListener=this.changePatternListener.bind(this);
    this.removeThing=this.removeThing.bind(this);
    this.show=this.show.bind(this);
  }


  show(list, element){
    document.getElementById(this.state.id).style.display = "block";
    this.element=element;

    let extensionElements = this.element.businessObject.extensionElements;

    if(extensionElements!=undefined && extensionElements.values!=undefined){
      let all=extensionElements.values;
      let operationPatternField=all.filter(field => field.name=="operationPattern")[0];
      if(operationPatternField!=undefined)
        this.setState({things:list, pattern:operationPatternField.stringValue});
      else
        this.setState({things:list, pattern:"one"});
    }else{
      this.setState({things:list, pattern:"one"});
    }

   
  }

  hide(){
     document.querySelector('#'+this.state.id).style.display = "none";
  }

  addThing(thing, operation){
    let list=this.state.things;
    list.push({
      "name":thing,
      "operation":operation
    })
    this.setState({things:list});
  }

  drawInColor(color){
    this.props.modeler.get('modeling').setColor(this.element, {
          stroke: color
      });
  }

  removeThing(id, thing, operation){
    let list=this.state.things;
    list = list.filter(t => (t.id!=id || t.name!=thing || t.operation!=operation));
    this.setState({things:list});

    let extensionElements = this.element.businessObject.extensionElements;
    let all=extensionElements.values;
    let toReturn=all.filter(field => field.name!="device" && field.name!="deviceID" && field.name!="operation" && field.name!="operationPattern");
    
    let deviceField=all.filter(field => field.name=="device")[0];
    let deviceIDField=all.filter(field => field.name=="deviceID")[0];
    let operationField=all.filter(field => field.name=="operation")[0];
    let operationPatternField=all.filter(field => field.name=="operationPattern")[0];

    let deviceValue="";
    let deviceIDValue=""
    let operationValue="";
 
    if(list.length>0){

      for(let i=0;i<list.length;i++){
          deviceValue+=";"+list[i].name;
          deviceIDValue+=";"+list[i].id;
          operationValue+=";"+list[i].operation;
      }

      deviceField.stringValue=deviceValue;
      deviceIDField.stringValue=deviceIDValue;
      operationField.stringValue=operationValue;

      toReturn.push(deviceField);
      toReturn.push(deviceIDField);
      toReturn.push(operationField);
      toReturn.push(operationPatternField);

    }else{
        this.drawInColor("#000000");
    }

    extensionElements.values=toReturn;
    this.element.businessObject.extensionElements=extensionElements;
    this.props.refreshProperties();
  }

  changePatternListener(pattern){

    if(pattern=="one" && this.state.things.length>1) showTaskPatternErrorDialog();
    else{

      let extensionElements = this.element.businessObject.extensionElements;

      if(extensionElements){
        let all=extensionElements.values;
        let toReturn=all.filter(field => field.name!="operationPattern");
        let operationPatternField=all.filter(field => field.name=="operationPattern")[0];
        if(operationPatternField!=undefined){
          operationPatternField.stringValue=pattern;
          toReturn.push(operationPatternField);
          extensionElements.values=toReturn;
          this.element.businessObject.extensionElements=extensionElements;
        }
      }

      this.setState({pattern:pattern});
      this.props.refreshProperties();

    }
  }


  render(){
		const things = this.state.things.map(thing =>{
        return <li className="list-group-item d-flex justify-content-between align-items-center" key={thing.name+thing.operation+"LI"}>{thing.name+"."+thing.operation}<a className="badge badge-primary badge-pill actionAdded" style={{backgroundColor:"#e57f7d"}} href="#" onClick={this.removeThing.bind(this, thing.id, thing.name, thing.operation)}>X</a></li>;
    });
    
		let content=<ul className="list-group">{things}</ul>;

    let modalHeaderSticky ={
      position: "sticky",
      top: 0,
      backgroundColor: "inherit",
      zIndex: 1055
    }

    return(
    <div>
      <TaskPatternErrorDialog />
      <div id={this.state.id} className="task-operations-dialog">
         <div className="modal-header" style={modalHeaderSticky}>
            <p className="modal-title" style={{display:"block-inline",fontWeight:"bold"}}>{this.state.title}</p>
            <select id="operationPatternSelect" onChange={(event) => {this.changePatternListener(event.target.value)}} value={this.state.pattern} disabled={things.length==0}> 
              <option value="one">Only One</option>
              <option value="oneormore">At least One</option>
              <option value="all">All</option>
            </select>
        </div>
        {content}
      </div>
    </div>
    );

  }

}