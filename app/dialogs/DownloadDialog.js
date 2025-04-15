import ReactDOM from 'react-dom';
import React from 'react';

export var showDownloadDialog = function(){
     window.downloadDialog.show();
};

export default class DownloadDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      type:"modal",
      title:"Download BPMN-based TaP Model",
      idLabel:"File Name",
      idCompo:sessionStorage.getItem("compoName")?sessionStorage.getItem("compoName"):"",
      downloadButtonLabel:"Download",
      id:"download-composition-dialog",
      loader:"sending-loader"
    };

    this.downloadComposition=this.downloadComposition.bind(this);
    this.idCompoHandler=this.idCompoHandler.bind(this);
    this.show=this.show.bind(this);

    window.downloadDialog=this;
  }

  show(){
    $("#download-composition-dialog").modal();
    this.setState({idCompo:sessionStorage.getItem("compoName")?sessionStorage.getItem("compoName"):""});
  }

  idCompoHandler(event){
    this.setState({idCompo:event.target.value});
  }


  downloadComposition(){
        var id= $("#download-composition-id").val();
        this.props.bpmnManager.downloadBPMN(id);
        $("#"+this.state.id).modal('hide');
  }

  render(){
    return(
      <div className="modal" tabIndex="-1" role="dialog" id={this.state.id}>
        <div className="modal-dialog" role="document">
          <div className="loader_container" id="sending-loader">
              <div className="lds-hourglass"></div>
          </div>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.state.title}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="download-composition-id">{this.state.idLabel}</label>
                <input type="text" className="form-control" id="download-composition-id" value={this.state.idCompo} onChange={this.idCompoHandler} placeholder={this.state.idLabel}/>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={this.downloadComposition} id="compositionActionBtn">{this.state.downloadButtonLabel}</button>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}