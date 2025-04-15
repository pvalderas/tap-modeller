import ReactDOM from 'react-dom';
import React from 'react';
import './UploadDialog.css';
import { showMessage } from '../dialogs/MessageDialog';

export var showUploadDialog = function(){
     $("#upload-composition-dialog").modal();
};

export default class UploadDialog extends React.Component {

  constructor(props) {
    super(props);

    this.modeler=this.props.modeler;
    this.systemUrl="http://pedvalar.webs.upv.es/microservices/systems/";

    this.state = {
      title:"Select the BPMN model of an IoT-Enhanced BP",
      id:"upload-composition-dialog"
    };

    this.fileReader=new FileReader();

    this.fileRead=this.fileRead.bind(this);
    this.fileHandler=this.fileHandler.bind(this);
  }

  async updateSystem(){
    //localStorage.setItem("selectedSystem",system);
    //localStorage.setItem("isFloWare",isFloWare);

    var system, isFloWare, isOntology;

    const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
      console.log(definitions);
    jQuery.each(definitions.rootElements, function(index, element){
        if (element.$type=="bpmn:Collaboration"){
          jQuery.each(element.participants, function(index, participant){
            if(participant.name!="PHYSICAL WORLD" && participant.extensionElements){
                jQuery.each(participant.extensionElements.values, function(index, field){
                  switch(field.name){
                    case "system": system=field.stringValue;break;
                    case "isFloWare": isFloWare= field.stringValue; break;
                    case "isOntology": isOntology= field.stringValue; break;
                  }
                });
            }
          });
        }
    });

    var response = await fetch(this.systemUrl+system);
    const iotSystem= await response.text();

    if(iotSystem!="-1"){ // The BPMN Model is associated to an exising system
      localStorage.setItem("selectedSystem",system);
      localStorage.setItem("isFloWare",isFloWare);
      localStorage.setItem("isOntology",isOntology);

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