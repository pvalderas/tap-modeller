import ReactDOM from 'react-dom';
import React from 'react';
import './UploadDialog.css';
//import { systemReload } from './ConfigDialog.js';
import { showMessage } from './MessageDialog.js';
import {loadDevices} from './IoTDeviceDialog.js';

import './loader.css';

export var showODRLUploadDialog = function(){
  window.ODRLUploadDialog.showDialog();
};

export default class ODRLUploadDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state={
      systemName:""
    }

    this.id="odrl-composition-dialog";
    this.loader="odrl-loader";
    this.title="Select ODRL files";

    this.url="https://pedvalar.webs.upv.es/microservicesEmu/wot/insertODRLDescription.php";

    this.uploadPolicies=this.uploadPolicies.bind(this);
    this.close=this.close.bind(this);
    this.fileHandler=this.fileHandler.bind(this);
    this.sendODRLPolicies=this.sendODRLPolicies.bind(this);
    this.systemNameHandler=this.systemNameHandler.bind(this);

    window.ODRLUploadDialog=this;

    this.files=[];
  }

  showDialog(){
    $("#"+this.id).modal();
  }


  close(){
    document.getElementById(this.loader).style.display = "none";
    $("#"+this.id).modal('hide');
  }

  systemNameHandler(event){
    this.setState({"systemName":event.target.value})
  }

  fileHandler(file){

    let _this=this;
    
    for(let oneFile of file.target.files){
        let fileReader=new FileReader();
        
        fileReader.onloadend=function(e){
            _this.files.push(fileReader.result);
        }

        fileReader.readAsText(oneFile);
    }

  }

  uploadPolicies(){
    for(let file of this.files){
      this.sendODRLPolicies(file);
    }
    this.close();
  }


  sendODRLPolicies(odrlDescription){
    fetch(this.url,
          {
            method:"POST",
            body: odrlDescription
          }
    )
    .then(function (response) {
        return response.json();
    })
    .then(result => {
        
        if(result.code==1){
          showMessage("Success","The policies have been registered in the system");
        }else if(result.code==-1){
           showMessage("Error",result.message);
        }else{
          showMessage("Error","An error occurred while parsing the ODRL descriptions. Please contact the person responsible for this tool.");
          console.log(result);
        }

    })
    .catch(error => {
        showMessage("Error","An error occurred while parsing the ODRL descriptions. Please contact the person responsible for this tool.");
        console.log(error);
      }
    )   

   
  }


 
  render(){
    return(
     <div className="modal" tabIndex="-1" role="dialog" id={this.id}>
        <div className="modal-dialog" role="document">
         <div className="loader_container" id={this.loader}>
              <div className="lds-hourglass"></div>
          </div>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.title}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
                <form method="post">
                      <div className="form-group files">
                        <input type="file" className="form-control" onChange={this.fileHandler} multiple/>
                      </div>
                      <div className="input-group mb-3">
                          <button className="btn btn-outline-primary" type="button" onClick={this.uploadPolicies}>Create</button>
                      </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

}