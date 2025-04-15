import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import Dialog from './Dialog.js';
import './loader.css';
import {loadDevices} from './IoTDeviceDialog.js';



export var showWoTDescriptionsDialog = function(){
   window.wotDescriptionsDialog.show();
};

export var hideWoTDescriptionsDialog = function(){
    window.wotDescriptionsDialog.hide();
};

export default class WoTDescriptionsDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      error:null
    };

    this.title="WoT Descriptions";
    this.id="wotDescriptionsDialog";
    this.loader="wotDescriptionsLoader";
    
    this.wotId=null;
    this.wotName=null;

    this.linkFile="https://pedvalar.webs.upv.es/microservicesEmu/wot/descriptions/"

    this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
    this.serviceServerType=localStorage.getItem("serviceServerType");

    window.wotDescriptionsDialog=this;

    this.loadWoTDescriptions=this.loadWoTDescriptions.bind(this);
    this.hide=this.hide.bind(this);
    this.deleteWoTDescription=this.deleteWoTDescription.bind(this);

    this.deleteUrl="https://pedvalar.webs.upv.es/microservicesEmu/wot/deleteWoTDescription.php";

  }


  show(){
      this.loadWoTDescriptions();
      this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
      this.serviceServerType=localStorage.getItem("serviceServerType");
      document.getElementById(this.id).style.display = "block";
  }

  hide(){
     document.querySelector('#'+this.id).style.display = "none";
  }


  deleteWoTDescription(){
      fetch(this.deleteUrl, 
            {
              method: "POST",
              body: JSON.stringify({ id: this.wotId, name: this.wotName })
            }
      ).then((response) => {
            return response.json()
      }).then((data) => {
          if(data.code==1){
            let devices=this.state.devices;
            devices=devices.filter((dev) => dev.id!=this.wotId);
            this.setState({ devices: devices });
            $("#attention").modal('hide');
            loadDevices();
          }
      });
  }

  loadWoTDescriptions() {
      document.getElementById(this.loader).style.display = "block";
      this.setState({error:null});

      if(this.serviceServerType=="eureka"){
        var url=this.serviceServerUrl+(this.serviceServerUrl.charAt(this.serviceServerUrl.length-1)=="/"?"":"/")+"wot/eureka/apps";

        if(url!=null){
          fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(microservices => {
              let devices = microservices.applications.application.reduce((devices,microservice) =>{
                  if(microservice.operations.length>0){
                    var id=microservice.id;
                    var name=microservice.name;
                   
                    devices.push({
                        name: name,
                        id: id
                      });
                  }
                  return devices;
              }, []);

              if(devices.length>0) this.setState({ devices: devices });
              document.getElementById(this.loader).style.display = "none";
          })
          .catch(error => {
              this.setState({error:error});
            }
          )
        }   
      }
  }

  showAttention(id, name){
    $("#attention").modal();
    this.wotId=id;
    this.wotName=name;
  }


  render(){
  	 let content;
  	 if(this.state.error==null) {
	  		const devices = this.state.devices.map(device =>{
            return <li className="list-group-item d-flex justify-content-between align-items-center" key={device.name+"LI"}><a href={this.linkFile+device.name.replaceAll(" ","_")+".wot"} target="_blank">{device.name}</a><a className="badge badge-primary badge-pill" style={{backgroundColor:"#e57f7d"}} href="#" onClick={this.showAttention.bind(this,device.id,device.name)}>X</a></li>;
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

    let modalHeaderSticky ={
      position: "sticky",
      top: 0,
      backgroundColor: "inherit",
      zIndex: 1055
    }
  	return (
      <div>
  		  <div id={this.id} className="wot-dialog">
          <div className="loader_container" id={this.loader}>
              <div className="lds-hourglass"></div>
          </div>
          <div className="modal-content">
            <div className="modal-header" style={modalHeaderSticky}>
                <h5 className="modal-title">{this.title}</h5>
                <button type="button" className="close" onClick={this.hide}>
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>
              {content}
          </div>
        </div>

        <div className="modal" id="attention" tabIndex="-1" role="dialog" >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title title">Attention</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body content">
              Do you want to delete the selected WoT thing?
              </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-primary button" data-dismiss="modal">No</button>
                <button type="button" className="btn btn-primary" onClick={this.deleteWoTDescription}>Yes</button>
            </div>
            </div>
          </div>
      </div>

      </div>
      
  	);
  }

}