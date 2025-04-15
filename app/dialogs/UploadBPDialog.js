import ReactDOM from 'react-dom';
import React from 'react';
import './UploadDialog.css';
import { showMessage } from '../dialogs/MessageDialog';

export var showBPUploadDialog = function(){
     window.BPUploadDialog.show();
};

export default class UploadBPDialog extends React.Component {

  constructor(props) {
    super(props);

    this.modeler=this.props.modeler;
    this.systemUrl="http://pedvalar.webs.upv.es/microservices/systems/wot";

    this.state = {
      title:"Select a BPMN model",
      id:"upload-bp-dialog"
    };

    this.fileReader=new FileReader();

    this.fileRead=this.fileRead.bind(this);
    this.fileHandler=this.fileHandler.bind(this);
    this.show=this.show.bind(this);

    window.BPUploadDialog=this;
  }

  show(){
		$("#"+this.state.id).modal();
  }

  async updateSystem(){

    const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;

    var response = await fetch(this.systemUrl);
    const iotSystem= await response.text();

    if(iotSystem!="-1"){ // The BPMN Model is associated to an exising system
      localStorage.setItem("selectedSystem","wot");
    }else{
       showMessage("Attention","This BPMN model has not been created with this tool or is associated to a system that is no longer registered in the server");
    }
  }

  async fileRead(e){
    const result = await this.modeler.importXML(this.fileReader.result);
    this.updateSystem();
    $("#"+this.state.id).modal('hide');
  }

  fileHandler(file){
    this.fileReader.onloadend=this.fileRead;
    this.fileReader.readAsText(file.target.files[0]);
  }

  render(){
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
                <form method="post">
                      <div className="form-group files">
                        <input type="file" className="form-control" onChange={this.fileHandler}/>
                      </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

}