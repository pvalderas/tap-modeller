import React from 'react';
import {showMessage} from './MessageDialog.js'
import {updateMenuTitle,showLinkedLabel} from "../menu/Menu.js";
import './loader.css';

export var showBPRemoteDialog = function(){
     window.showBPRemoteDialog.show();
};

export var loadBP = function(compo){
     window.showBPRemoteDialog.loadBPMN(compo);
};

export default class BPRemoteDialog extends React.Component {

  constructor(props) {
    super(props);

    this.modeler=this.props.modeler;

    this.state = {
      title:"Select an existing BP from the Server",
      id:"load-bp-remote-dialog",
      userLabel:"Introduce a user ID and click Load",
      compositions:null,
      userID:"default",
      loaderID:"remoteLoader"
    };

    this.loadBPMN=this.loadBPMN.bind(this);
    this.loadCompos=this.loadCompos.bind(this);
    this.userIdHandler=this.userIdHandler.bind(this);

    window.showBPRemoteDialog=this;

  }

  show(){
    $("#"+this.state.id).modal();
  }


  loadBPMN(compo){
    let user=this.state.userID;

    localStorage.setItem("selectedSystem","wot");
   
    if(compo.processId!=null)
      sessionStorage.setItem("processId",compo.processId);
    else 
      sessionStorage.removeItem("processId");

    var url=localStorage.getItem("managerUrl")+(localStorage.getItem("managerUrl").charAt(localStorage.getItem("managerUrl").length-1)=="/"?"":"/");
    updateMenuTitle(compo.id);

    fetch(url+"wot/bps/"+user+"/"+compo.id)
      .then(function (response) {
        return response.text();
      })
      .then(compoBPMN => {
         this.modeler.importXML(compoBPMN);
         $("#"+this.state.id).modal('hide');
         sessionStorage.setItem("user",user);
         sessionStorage.setItem("bpName",compo.id);
         showLinkedLabel(false);
      })
      .catch(error => {
          showMessage("Error","Error Loading the selected BP");
        }
      )   
    
  }

  loadCompos(){
     
     let user=this.state.userID;

      document.getElementById(this.state.loaderID).style.display = "block";

      var url=localStorage.getItem("managerUrl")+(localStorage.getItem("managerUrl").charAt(localStorage.getItem("managerUrl").length-1)=="/"?"":"/");

      fetch(url+"wot/bps/user/"+user)
        .then(function (response) {
          return response.json();
        })
        .then(compositions => {
            this.setState({ compositions: compositions });
            document.getElementById(this.state.loaderID).style.display = "none";
        })
        .catch(error => {
           showMessage("Error","Error Loading the list of BPs");
          }
        ) 

      //}
  }

  userIdHandler(event){
    if(event.target.value.length>0)
      this.setState({"userID":event.target.value})
    else
       this.setState({"userID":"default"})
  }

  render(){

    var compoDivs="";
    if(this.state.compositions!=null){
        compoDivs=this.state.compositions.map(compo => 
          <li className="list-group-item" key={compo.id+"LI"}><a href="#" onClick={this.loadBPMN.bind(this,compo)} >{compo.id}</a></li>
        );
    }

    var titleStyle={
      fontSize:18,
      fontWeight:'bold'
    };

    return(
     <div className="modal" tabIndex="-1" role="dialog" id={this.state.id}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.state.title}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
                <div className="loader_container" id="remoteLoader">
                    <div className="lds-hourglass"></div>
                </div>
                    <div className="form-group">
                      <div style={titleStyle}>{this.state.userLabel}</div>
                      <div className="input-group mb-3">
                        <input type="text" className="form-control" value={this.state.userID!="default"?this.state.userID:""} onChange={this.userIdHandler} placeholder="default"/>
                        <div className="input-group-append">
                          <button className="btn btn-outline-primary" type="button" onClick={this.loadCompos}>Load</button>
                        </div>
                      </div>
                    </div>
                    <div className="loader_container" id={this.state.loaderID}>
                      <div className="lds-hourglass"></div>
                  </div>
                    <ul className="list-group">{compoDivs}</ul>
              </div>
          </div>
        </div>
      </div>
    );
  }

}