import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import Dialog from './Dialog.js';
import './loader.css';
import {showLinkedLabel} from '../menu/Menu.js'


export let showMicroserviceDialog = function(event){
   window.iotDeviceDialog.show(event);
};

export let hideMicroserviceDialog = function(){
    window.iotDeviceDialog.hide();
};

export let loadDevices = function(){
    window.iotDeviceDialog.loadIoTDevices();
};

export default class IoTDeviceDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      error:null,
    };

    this.type="iotDeviceList";
    this.title="WoT Things";
    this.id="iotDeviceDialog";
    this.loader="iotDeviceLoader";

    this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
    this.serviceServerType=localStorage.getItem("serviceServerType");

    window.iotDeviceDialog=this;

    this.loadIoTDevices=this.loadIoTDevices.bind(this);

  }

  componentDidMount(){
        this.loadIoTDevices();
  }

  show(event){
      this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
      this.serviceServerType=localStorage.getItem("serviceServerType");
      document.getElementById(this.id).style.display = "block";
      let x=event.clientX;
      document.getElementById(this.id).style.left = x+"px";
  }

  hide(){
     document.querySelector('#'+this.id).style.display = "none";
  }

  loadIoTDevices() {
      document.getElementById(this.loader).style.display = "block";
      this.setState({error:null});

      if(this.serviceServerType=="eureka"){
        let url=this.serviceServerUrl+(this.serviceServerUrl.charAt(this.serviceServerUrl.length-1)=="/"?"":"/")+localStorage.getItem("selectedSystem")+"/eureka/apps";
  
        if(url!=null){
          fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(microservices => {
              let urls={};
              let devices = microservices.applications.application.reduce((devices,microservice) =>{
                  if(microservice.operations.length>0){
                    let id=microservice.id;
                    let name=microservice.name;
                    let host=microservice.instance[0].hostName;
                    let port=microservice.instance[0].port.$;

                     //urls[name]="http://"+host+":"+port+"/operations"; <-- With microservice architecture
                     if(port!=80)
                        urls[name]="http://"+host+":"+port+"/microservices/wot/"+id+"/user/{user}/operations"; //<-- With PHP emulator
                     else
                        urls[name]="https://"+host+"/microservices/wot/"+id+"/user/{user}/operations";

      
                      
                    devices.push({
                        id: microservice.id,
                        name: name,
                        iot:microservice.iot,
                        sensor:microservice.sensor
                      });
                  }
                  return devices;
              }, []);
              if(devices.length>0){
                this.setState({ devices: devices })
                /*if(sessionStorage.getItem("urls")!=null){
                  let existingUrls=JSON.parse(sessionStorage.getItem("urls"));
                  Object.keys(existingUrls).forEach(function(key){
                      urls[key]=existingUrls[key];
                  });
                }*/
                sessionStorage.setItem("urls",JSON.stringify(urls));
              }
              document.getElementById(this.loader).style.display = "none";
          })
          .catch(error => {
            console.log(error);
              this.setState({error:error});
            }
          )
        }   
      }
  }


  updateInput(id, value){
    let input=document.getElementById(id);

    let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(input, value);

    let inputEvent = new Event('input', { bubbles: true});
    input.dispatchEvent(inputEvent);

  }

  addIoTDevice(name, id){
    this.updateInput('eventDevID',id);
    this.updateInput('eventDev',name);
    

    if(document.getElementById('eventOp')){
      document.getElementById('eventOp').value="";
    }
    document.getElementById(this.id).style.display = "none";
    showLinkedLabel(true);
  }



  render(){
    //sessionStorage.removeItem("urls");
  	 let content;
  	 if(this.state.error==null) {
	  		const devices = this.state.devices.map(device =>{
            let img="actuator.png";
            let style={
              color:"blue"
            }
            if(device.sensor==1) img="sensor.png";
            if(device.iot==0){
              img="software.png";
              let style={
                color:"#000000"//"#b432be"
              }
            }
            return <li className="list-group-item" key={device.name+"LI"}><img src={"imgs/"+img} height="20px"/>&nbsp;&nbsp;&nbsp;<a href="#" onClick={this.addIoTDevice.bind(this,device.name,device.id)} style={style}>{device.name}</a></li>;
        });
        
	  		content=<ul className="list-group">{devices}</ul>;
  	 }else{
        let errorStyle={
          textAlign:"center",
          color:"red",
          paddingTop:"10px"
        }
  			content=<div style={errorStyle}>{this.state.error}</div>;
  	 }

  	return (
  		<Dialog type={this.type} title={this.title} id={this.id} loader={this.loader} content={content} />
  	);
  }

}