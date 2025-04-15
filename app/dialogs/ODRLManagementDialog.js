import React, { Component } from 'react';
import './loader.css';



export var showODRLManagementDialog = function(){
   window.odrlManagementDialog.show();
};

export var hideODRLManagementDialog = function(){
    window.odrlManagementDialog.hide();
};

export default class ODRLManagementDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      policies: []
    };

    this.title="ODRL Policies";
    this.id="odrlManagementDialog";
    this.loader="odrlManagementLoader";
    
    this.odrlId=null;
    this.odrlFileName=null;

    this.linkFile="https://pedvalar.webs.upv.es/microservicesEmu/wot/policies/";
    this.deleteUrl="https://pedvalar.webs.upv.es/microservicesEmu/wot/deleteODRLPolicy.php";
    this.getListUrl="https://pedvalar.webs.upv.es/microservicesEmu/wot/getODRLPolicies.php";

    window.odrlManagementDialog=this;

    this.loadODRLPolicies=this.loadODRLPolicies.bind(this);
    this.hide=this.hide.bind(this);
    this.deleteODRLPolicy=this.deleteODRLPolicy.bind(this);

  }


  show(){
      this.loadODRLPolicies();
      this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
      this.serviceServerType=localStorage.getItem("serviceServerType");
      document.getElementById(this.id).style.display = "block";
  }

  hide(){
     document.querySelector('#'+this.id).style.display = "none";
  }


  deleteODRLPolicy(){
    console.log(this.odrlId, this.odrlFileName);
      fetch(this.deleteUrl, 
            {
              method: "POST",
              body: JSON.stringify({ id: this.odrlId, fileName: this.odrlFileName })
            }
      ).then((response) => {
            return response.json()
      }).then((data) => {
          if(data.code==1){
            let policies=this.state.policies;
            policies=policies.filter((po) => po.id!=this.odrlId);
            this.setState({ policies: policies });
            $("#attention").modal('hide');
            //loadDevices();
          }else{
            console.log(data);
          }
      })
      .catch(error => {
        console.log(error);
      }
    );
  }

  loadODRLPolicies() {
      document.getElementById(this.loader).style.display = "block";
      this.setState({error:null});

      fetch(this.getListUrl)
      .then(function (response) {
        return response.json();
      })
      .then(policies => {
          if(policies!=null && policies.length>0) this.setState({ policies: policies });
          document.getElementById(this.loader).style.display = "none";
      })
      .catch(error => {
          console.log(error);
        }
      )

  }

  showAttention(id, fileName){
    $("#attention").modal();
    this.odrlId=id;
    this.odrlFileName=fileName;
  }


  render(){
  	let content;

    const policies = this.state.policies.map(policy =>{
        return <li className="list-group-item d-flex justify-content-between align-items-center" key={policy.id+"LI"}><a href={this.linkFile+policy.fileName+".odrl"} target="_blank">{policy.id}</a><a className="badge badge-primary badge-pill" style={{backgroundColor:"#e57f7d"}} href="#" onClick={this.showAttention.bind(this,policy.id,policy.fileName)}>X</a></li>;
    });

    if(policies.length>0)
        content=<ul className="list-group">{policies}</ul>;
    else
        content=<ul className="list-group">There are no ODRL policies yet.</ul>;
      

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
              Do you want to delete the selected ODRL policy?
              </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-primary button" data-dismiss="modal">No</button>
                <button type="button" className="btn btn-primary" onClick={this.deleteODRLPolicy}>Yes</button>
            </div>
            </div>
          </div>
      </div>

      </div>
      
  	);
  }

}