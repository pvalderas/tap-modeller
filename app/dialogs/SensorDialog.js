import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import Dialog from './Dialog.js';

import './loader.css';


export var showSensorDialog = function(path){
   window.sensorDialog.show(path);
};

export var hideSensorDialog = function(){
    window.sensorDialog.hide();
};

export var loadSensors = function(){
    window.sensorDialog.loadSensors();
};

export default class SensorDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      error:null,
      type:"iotDeviceList",
      title:"WoT Things",
      id:"sensorDialog",
      loader:"sensorLoader",
      path: undefined
    };

    this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
    this.serviceServerType=localStorage.getItem("serviceServerType");

    window.sensorDialog=this;

    this.loadSensors=this.loadSensors.bind(this);
    this.drawInColor=this.drawInColor.bind(this);

  }

  show(path){
    this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
    this.serviceServerType=localStorage.getItem("serviceServerType");
    this.setState({path:path})
    this.loadSensors();

    document.querySelector('#'+this.state.id).style.display = "block";
  }

  hide(){
     document.querySelector('#'+this.state.id).style.display = "none";
  }


  loadSensors() {
      document.querySelector('#'+this.state.loader).style.display = "block";

      if(this.serviceServerType=="eureka"){
        var url=this.serviceServerUrl+(this.serviceServerUrl.charAt(this.serviceServerUrl.length-1)=="/"?"":"/")+localStorage.getItem("selectedSystem")+"/eureka/apps";
        fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(microservices => {
              var urls={};
              const devices = microservices.applications.application.reduce((devices,microservice) =>{
     
                  if(microservice.sensor=="1"){
                    var id=microservice.id;
                    var name=microservice.name;
                    var host=microservice.instance[0].hostName;
                    var port=microservice.instance[0].port.$;
                    //urls[name]="http://"+host+":"+port+"/operations"; <-- With microservice architecture
                    //urls[name]="http://"+host+":"+port+"/microservices/sensor/"+id+"/events"; 
                    /*let path="sensor/"+id+"/events";
                    if(isFloware) path=id+"/operations";
                    if(isOntology || isWoT) path="sensor/"+id+"/observations";*/
                   
                    let path=this.state.path.replace("{id}",id);//"sensor/"+id+"/observations";//

                    if(port!=80)
                        urls[name]="http://"+host+":"+port+"/microservices/"+path;
                    else
                        urls[name]="https://"+host+"/microservices/"+path;
                    
                    devices.push({
                        name: name,
                        id: id,
                        iot:microservice.iot,
                        sensor:microservice.sensor
                    });
                  }

                  return devices;
              }, []);

              this.setState({ devices: devices })
              sessionStorage.setItem("eventUrls",JSON.stringify(urls));
          })
          .catch(error => {
              this.setState({error:error});
            }
          )   
      }
  }

  drawInColor(element, color){
    this.props.modeler.get('modeling').setColor(element, {
          stroke: color
      });
  }

  updateInput(value){
    var input=document.getElementById('eventDev');

    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(input, value);

    var inputEvent = new Event('input', { bubbles: true});
    input.dispatchEvent(inputEvent);

  }

  addSensor(name){
    this.updateInput(name);
    if(document.getElementById('eventOp')){
      document.getElementById('eventOp').value="";
    }
    document.getElementById(this.state.id).style.display = "none";
  }

  componentDidUpdate(){
    document.querySelector('#'+this.state.loader).style.display = "none";
  }


  render(){
    sessionStorage.removeItem("eventUrls");
  	 let content;
  	 if(this.state.error==null) {
        let style={
              color:"blue"
        }
        let floWareSystem="";
	  		let devices = [];
        this.state.devices.forEach(device =>{
            
            if(device.floWareSystem && device.floWareSystem!=floWareSystem){
              floWareSystem=device.floWareSystem;
              devices.push(<li key={floWareSystem}>{floWareSystem}</li>);
            }
            let image=(device.sensor=="1")?"imgs/sensor.png":"imgs/actuator.png";
            devices.push(<li className="list-group-item" key={device.name+"LI"}><img src={image} height="20px"/>&nbsp;&nbsp;&nbsp;<a href="#" onClick={this.addSensor.bind(this,device.name, device.id)} style={style}>{device.name}</a></li>);
        });
        
	  		content=<ul className="list-group">{devices}</ul>;
  	 }else{
  			content=this.state.error;
  	 }

  	return (
  		<Dialog type={this.state.type} title={this.state.title} id={this.state.id} loader={this.state.loader} content={content} />
  	);
  }

}