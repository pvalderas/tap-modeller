import React,  { useState } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';
//import { getDi } from 'bpmn-js/lib/util/ModelUtil';
import {showMicroserviceDialog, hideMicroserviceDialog} from '../dialogs/IoTDeviceDialog';
import {showOperationDialog, hideOperationDialog} from '../dialogs/OperationDialog';
import {showEventDialog, hideEventDialog} from '../dialogs/EventDialog';
import {showEventErrorDialog, hideEventErrorDialog} from '../dialogs/EventErrorDialog';
import {showSensorDialog, hideSensorDialog, loadSensors} from '../dialogs/SensorDialog';
import {showTaskOperationsListDialog,hideTaskOperationsListDialog} from '../dialogs/TaskOperationsListDialog';
import { showMessage } from '../dialogs/MessageDialog';

export default function ElementProperties(props) {
  
  let {
    element,
    modeler
  } = props;

  let numActions=0;

  let configLabel={
    marginTop: "20px",
    width: "100%",
    textAlign: "center",
    color: "gray",
    fontSize: "20px"
  }

  const activeClass={
    color: "#fff",
    backgroundColor: "#86b7ff",
    borderColor: "#005cbf"
  }




  //For Events
  const [device, setDevice] = useState("");
  const [operation, setOperation] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");

 

  //if(device.length>0) loadSensors();

  if(isMessageEvent() && (operation=="" || getEventField("operation")!=operation)){
    setDevice(getEventField("device"));
    setOperation(getEventField("operation"));
    setCondition(getEventField("condition"));
  }else if(!isMessageEvent() && condition!="-1"){
    setDevice("");
    setOperation("");
    setCondition("-1");
  }

 

  function enableAddOperation(){
    setSensorSelected(true);
  }

  function updateName(name) {
    const modeling = modeler.get('modeling');
    //modeling.updateLabel(element, name);
    modeling.updateProperties(element, {'name':name});
    setLaneName(name);
  }

  function updateEventName(name) {
    const modeling = modeler.get('modeling');
    modeling.updateProperties(element, {'name':name});
  }

  function updateOperation(operation) {
    const modeling = modeler.get('modeling');

    modeling.updateProperties(element, {
      'custom:operation': operation
    });

    modeling.updateLabel(element, operation);
  }



  function showEventList(){
    //var sensorID=element.businessObject.name.split(".")[0];
    if(device){
    	var sensorID=document.getElementById('eventDev').value;//element.businessObject.name.substring(1,element.businessObject.name.length-1);
    	showEventDialog(sensorID);
    }else{
      showEventErrorDialog("device");
    }
  }

  function showSensorList(){
    let path="{id}/operations";
    if(eventType=="data"){
         path="sensor/{id}/observations";
    }

  	showSensorDialog(path);

  }

  

  function showOperationList(event){
      
      if(device ){
        showOperationDialog(device,1,event);
      }else{
        showEventErrorDialog("device",true);
      }

  }


  function showDevicesList(){
      showMicroserviceDialog();
  }



  function toggleSensor(e){
        const camundaNs = 'http://camunda.org/schema/1.0/bpmn';
        const modeling = modeler.get('modeling');
        const moddle= modeler.get('moddle');

        let extensionElements=element.businessObject.extensionElements;
        let isSensor=e.target.value=="sensor"?true:false;

        let exists=false;
        extensionElements.values.forEach(function(field){
          if(field.name=="iotSensor"){
            exists=true;
            field.stringValue=isSensor;
          }
        });
        if(!exists){
          let field=moddle.createAny('camunda:field',camundaNs, {name:"iotSensor", stringValue:isSensor});
          extensionElements.get('values').push(field);
        }   
        modeling.updateProperties(element, {'extensionElements':extensionElements});

        setRedraw(!redraw);

  }


  function getEventInputLabel(){

      if(element.businessObject.targetRef && element.businessObject.targetRef.name){
        return element.businessObject.name +"."+element.businessObject.targetRef.name;
      }
      else if(element.businessObject.name){
          return element.businessObject.name;
      }
      else return '';
  }

  function connectedToMessageFlow(){
    var connected=false
    if(element.incoming){
      element.incoming.forEach(function(edge){
          if(edge.businessObject.$type=='bpmn:MessageFlow' && edge.businessObject.sourceRef.name=="PHYSICAL WORLD") connected=true;
      });
    }
    return connected; 
  }

  function getTaskOperations(){
      let things=[];
      if(element.businessObject.extensionElements && element.businessObject.extensionElements.values){
        let all=element.businessObject.extensionElements.values;
        let deviceField=all.filter(field => field.name=="device");
        let deviceIDField=all.filter(field => field.name=="deviceID");
        let operationField=all.filter(field => field.name=="operation");

        
        
        if(deviceField.length>0 && deviceIDField.length>0 && operationField.length>0){
          let deviceValue="";
          let deviceIDValue="";
          let operationValue="";

          deviceValue=deviceField[0].stringValue;
          deviceIDValue=deviceIDField[0].stringValue;
          operationValue=operationField[0].stringValue;

          let devices=deviceValue.split(";");
          let deviceIDs=deviceIDValue.split(";");
          let operations=operationValue.split(";");
       
          for(let i=1;i<devices.length;i++){
            if(devices[i]!==undefined && operations[i]!==undefined){
              things.push(
                    {
                      id: deviceIDs[i],
                      name: devices[i],
                      operation: operations[i]
                    }
                );
            }
          }

        } 
      }

      numActions=things.length;

      return things;
  }



  function getEventField(fieldName){
      if(element.businessObject.extensionElements && element.businessObject.extensionElements.values){
        let field=element.businessObject.extensionElements.values.find(f=>{
          return f.name==fieldName;
        });
        if(field!=null) return field.stringValue;
      }
      return null;
  }


  function drawInColor(element, color){
    modeler.get('modeling').setColor(element, {
          stroke: color
      });
  }


  function addThingOperation(){
    const moddle= modeler.get('moddle');
    
    let extensionElements=element.businessObject.extensionElements;
    if(!extensionElements){
      extensionElements = moddle.create('bpmn:ExtensionElements');
    }

    let all=extensionElements.get('values');
    
    let toReturn=all.filter(field => field.name!="device" && field.name!="deviceID" && field.name!="operation");
    let camundaNs = 'http://camunda.org/schema/1.0/bpmn';


    let deviceField=all.filter(field => field.name=="device");
    let deviceIDField=all.filter(field => field.name=="deviceID");
    let operationField=all.filter(field => field.name=="operation");

    let deviceValue="";
    let deviceIDValue="";
    let operationValue="";
    
    if(deviceField.length>0) deviceValue=deviceField[0].stringValue;
    if(deviceIDField.length>0) deviceIDValue=deviceIDField[0].stringValue;
    if(operationField.length>0) operationValue=operationField[0].stringValue;

    deviceValue=deviceValue+";"+document.getElementById('eventDev').value;
    deviceIDValue=deviceIDValue+";"+document.getElementById('eventDevID').value;
    operationValue=operationValue+";"+document.getElementById('eventOp').value;

    let field1=moddle.createAny('camunda:field',camundaNs, {name:"device", stringValue:deviceValue});
    let field2=moddle.createAny('camunda:field',camundaNs, {name:"deviceID", stringValue:deviceIDValue});
    let field3=moddle.createAny('camunda:field',camundaNs, {name:"operation", stringValue:operationValue});
    
    toReturn.push(field1);
    toReturn.push(field2);
    toReturn.push(field3);

    if(deviceField.length==0){
      let field4=moddle.createAny('camunda:field',camundaNs, {name:"operationPattern", stringValue:document.getElementById('operationPatternSelect').value});
      toReturn.push(field4);
    }

    extensionElements.values=toReturn;
    element.businessObject.extensionElements=extensionElements;


    drawInColor(element, "#0000BB");


    setDevice("");
    setOperation("");
  }



  function setEventField(fieldName, value){

    if((fieldName!="operation" && fieldName!="device") || isMessageEvent()){

      const moddle= modeler.get('moddle');
      
      let extensionElements=element.businessObject.extensionElements;
      if(!extensionElements){
        extensionElements = moddle.create('bpmn:ExtensionElements');
      }

      let all=extensionElements.get('values');
      
      let toReturn=all.filter(field => field.name!=fieldName);
      let camundaNs = 'http://camunda.org/schema/1.0/bpmn';

      let field=moddle.createAny('camunda:field',camundaNs, {name:fieldName, stringValue:value});
      toReturn.push(field);
    
      extensionElements.values=toReturn;

      element.businessObject.extensionElements=extensionElements;

    }

    switch(fieldName){
      case "device": 
                     setDevice(value);
                     setOperation("");
                      break;
      case "operation": setOperation(value);
                        if(isMessageEvent()) drawInColor(element, "#0000BB");
                        break;
      case "condition": setCondition(value);break;
      case "description": setDescription(value);break;
    }
    
  }

  function cleanEventInputs(){
    var dev=document.getElementById('eventDev');
    var event=document.getElementById('eventOp');

    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(dev, "");
    nativeInputValueSetter.call(event, "");

    var inputEvent = new Event('input', { bubbles: true});
    dev.dispatchEvent(inputEvent);
    event.dispatchEvent(inputEvent);

  }

  function eventTypeHandler(input){

    setEventType(input.value);

    const moddle= modeler.get('moddle');
    var extensionElements=element.businessObject.extensionElements;
    if(!extensionElements){
      extensionElements = moddle.create('bpmn:ExtensionElements');
    }

    let values=extensionElements.get('values').filter(field => field.name!="eventType");
    let camundaNs = 'http://camunda.org/schema/1.0/bpmn';
    let field=moddle.createAny('camunda:field',camundaNs, {name:"eventType", stringValue:input.value});
    values.push(field);

    extensionElements.values=values;
    element.businessObject.extensionElements=extensionElements;
    
    cleanEventInputs()
    
  }

  function isMessageEvent(){
    if(element.businessObject.eventDefinitions && element.businessObject.eventDefinitions.length>0 && connectedToMessageFlow()) return true;
    return false;
  }


  function isAddingActionDisabled(){
      let taskPattern=document.getElementById("operationPatternSelect").value;
      if(numActions==1 && taskPattern=="one") return true;
      else return false;
  }


  function taskCanBeLinked(){
    let hasImplementation= !(element.businessObject.class==undefined || element.businessObject.class.includes("WoTServiceClass"));
    if((is(element, 'bpmn:ServiceTask')  && !hasImplementation) || is(element, 'bpmn:UserTask')) return true;
    else return false;
  }


  if(isMessageEvent()){ 
       var eventTypeField="data";
       if(element.businessObject.extensionElements!=null){

          element.businessObject.extensionElements.values.forEach(function(field){
 
            if(field.name=="eventType"){
              eventTypeField=field.stringValue;
            }
            if(field.name=="description" && field.stringValue!=description){
               setDescription(field.stringValue);
            }
          });

        }

  }

  const [eventType, setEventType] = useState(eventTypeField);
  if(eventTypeField && eventType!=eventTypeField) setEventType(eventTypeField);

  if (element.labelTarget) {
    element = element.labelTarget;
  }


  if(taskCanBeLinked()){
     showTaskOperationsListDialog(getTaskOperations(),element);
  }else{
    hideTaskOperationsListDialog();
  }


  return (

    <div className="element-properties" key={ element.id }>
      {
        taskCanBeLinked() &&
           <form className="form-inline" >
            <div className="row" style={{width:"100%", marginTop:"1px"}}>
                 <div className="mb-3 col-6" style={{paddingRight:"0px"}}>
                    <label htmlFor="eventDev" className="form-label" style={{display:"inherit"}}>WoT Thing</label>
                    <div className="input-group" >
                      <input type="text" className="form-control" id="eventDev" value={device} disabled={true} onChange={ (event) => {
                    setEventField("device", event.target.value)  }} style={{width:"40%"}}/>
                     <input type="hidden" id="eventDevID" />
                      <button type="button" className="btn btn-outline-secondary" id="addThing" onClick={ showMicroserviceDialog } disabled={isAddingActionDisabled()}>+</button>
                    </div>
                  </div>

                 <div className="mb-3 col-5" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventOp" className="form-label" style={{display:"inherit"}}>Action</label>
                  <div className="input-group" >
                      <input type="text" className="form-control" id="eventOp" value={operation} disabled={true} onChange={ (event) => {
                    setEventField("operation", event.target.value) } } style={{width:"40%"}}/>
                      <button type="button" className="btn btn-outline-secondary" id="addOperation" onClick={ showOperationList } disabled={isAddingActionDisabled()}>+</button>
                    </div>
                </div>

                <div className="mb-3 col-1" style={{paddingRight:"0px"}}>
                  <br/>
                   <button type="button" className="btn btn-outline-secondary" id="addOperationThing" onClick={ addThingOperation } disabled={isAddingActionDisabled()}>Add&nbsp;&uarr;</button>
                </div>
                 
              </div>
          </form>
      }
      {
        isMessageEvent() &&
           <form className="form-inline">
             {/*
              <u>Event Type</u>:&nbsp;&nbsp;
              <input type="radio" name="eventType" value="data" checked={eventType=="data"} onChange={(event) => {eventTypeHandler(event.target)} }/> 
                  Thing Event&nbsp;&nbsp;
              <input type="radio" name="eventType" value="atomic" checked={eventType=="atomic"} onChange={(event) => {eventTypeHandler(event.target)} }/> 
                  Condition&nbsp;&nbsp;
              <input type="radio" name="eventType" value="complex" checked={eventType=="complex"} onChange={(event) => {eventTypeHandler(event.target)} }/> 
                  Complex
             */}
              {eventType=="data" && 
              <div className="row" style={{width:"100%", marginTop:"1px"}}>
                 <div className="mb-3 col-6" style={{paddingRight:"0px"}}>
                    <label htmlFor="eventDev" className="form-label" style={{display:"inherit"}}>Thing</label>
                    <div className="input-group" >
                      <input type="text" className="form-control" id="eventDev" value={device} disabled={true} onChange={ (event) => {
                    setEventField("device", event.target.value)  }} style={{width:"40%"}}/>
                    <input type="hidden" id="eventDevID" />
                      <a className="btn btn-outline-secondary" id="addDev" onClick={ showSensorList }>+</a>
                    </div>
                  </div>

                 <div className="mb-3 col-6" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventOp" className="form-label" style={{display:"inherit"}}>Event</label>
                  <div className="input-group" >
                      <input type="text" className="form-control" id="eventOp" value={operation} disabled={true} onChange={ (event) => {
                    setEventField("operation", event.target.value) } } style={{width:"40%"}}/>
                      <a className="btn btn-outline-secondary" id="addDev" onClick={ showEventList }>+</a>
                    </div>
                </div>
                 
              </div>
              }

              {eventType=="atomic" &&
              <div className="row" style={{width:"100%", marginTop:"1px"}}>
                <div className="mb-3 col-2" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventName" className="form-label" style={{display:"inherit"}}>Name</label>
                  <input id="eventName" className="form-control" value={ element.businessObject.name || '' } onChange={ (event) => {
                  updateEventName(event.target.value)  } } style={{width:"100%"}}/>
                </div>
                
                <div className="mb-3 col-4" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventDev" className="form-label" style={{display:"inherit"}}>Device</label>
                  <div className="input-group" >
                    <input type="text" className="form-control" id="eventDev" value={device} disabled={true} onChange={ (event) => {
                  setEventField("device", event.target.value)  } }/>
                    <a className="btn btn-outline-secondary" id="addDev" onClick={ showSensorList }>+</a>
                  </div>
                </div>

                <div className="mb-3 col-4" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventOp" className="form-label" style={{display:"inherit"}}>Operation</label>
                  <div className="input-group" >
                    <input type="text" className="form-control" id="eventOp" value={operation} disabled={true} onChange={ (event) => {
                  setEventField("operation", event.target.value)  } }/>
                    <a className="btn btn-outline-secondary" id="addOp" onClick={ showEventList } disabled={device.length==0} >+</a>
                  </div>
                </div>

                <div className="mb-3 col-2" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventCondition" className="form-label" style={{display:"inherit"}}>Condition</label>
                  <input id="eventCondition" className="form-control" value={condition} onChange={ (event) => {
                  setEventField("condition", event.target.value) }} style={{width:"100%"}}/>
                </div>
              </div>
            }
            {eventType=="complex" && 
            <div className="row" style={{width:"100%", marginTop:"1px"}}>
                <div className="mb-3 col-2" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventName" className="form-label" style={{display:"inherit"}}>Name</label>
                  <input id="eventName" className="form-control" value={ element.businessObject.name || '' } onChange={ (event) => {
                  updateName(event.target.value)  } } style={{width:"100%"}}/>
                </div>
                <div className="mb-3 col-10" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventDescription" className="form-label" style={{display:"inherit"}}>Description</label>
                  <input id="eventDescription" placeholder="Define the complex event in natural language" className="form-control" value={description} onChange={ (event) => {
                  setEventField("description", event.target.value) }} style={{width:"100%"}}/>
                </div>
            </div>  
            }
          </form>
      }
      {
          !(taskCanBeLinked()) && 
          !(isMessageEvent()) &&  
          <div style={configLabel}>IoT Configuration Panel</div>
      }

    </div>
  );
}