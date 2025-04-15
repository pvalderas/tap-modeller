import ReactDOM from 'react-dom';
import React from 'react';
import { showMessage } from '../dialogs/MessageDialog';


export var showSendBPDialog = function(){
   window.sendBPDialog.show();
};


export default class SendBPCompositionDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      type:"modal",
      title:"Saving a BP",
      idLabel:"Introduces an ID for the BP and your user",
      idPlaceHolder:"Business Process ID",
      userPlaceHolder:"User ID",
      sendButtonLabel:"Save",
      idDiv:"sendBP-dialog",
      loader:"sending-loader",
      idBP:"",
      idUser:""
    };


    this.sendComposition=this.sendComposition.bind(this);
    this.error=this.error.bind(this);
    this.success=this.success.bind(this);
    this.idBPHandler=this.idBPHandler.bind(this);
    this.idUserHandler=this.idUserHandler.bind(this);
    this.show=this.show.bind(this);

    window.sendBPDialog=this;

  }

  show(){
    this.setState({
        idBP:sessionStorage.getItem("bpName")?sessionStorage.getItem("bpName"):"",
        idUser:sessionStorage.getItem("user")?sessionStorage.getItem("user"):""
    });
    $("#"+this.state.idDiv).modal();
  }

  hide(){
    $("#"+this.state.idDiv).modal('hide');
  }

  success(data){
    document.getElementById(this.state.loader).style.display = "none";
    this.hide();

    if(data=="1"){
      if(this.state.idBP) sessionStorage.setItem("bpName", this.state.idBP);
      if(this.state.idUser) sessionStorage.setItem("user", this.state.idUser);
      showMessage("Congratulations","The BPMN model has been successfully saved in the server","Close"); //<br>Please, fill in the following "+aLink+"evaluation form</a>
    }else{
      showMessage("Error","Some error occurs when sending the BPMN model");
    }
  }

  error(err){
      document.getElementById(this.state.loader).style.display = "none";
      this.hide();
      console.log(err);
      showMessage("Error","Some error occurs when sending the BPMN model");
  }

  idBPHandler(event){
      this.setState({idBP:event.target.value});
  }

  idUserHandler(event){
      this.setState({idUser:event.target.value});
  }

  sendComposition(){
        this.props.bpmnManager.sendBPMN(this.state.idBP, this.state.idUser, this.success, this.error, [], false);
        document.getElementById(this.state.loader).style.display = "inline";
  }

  render(){

    return(
      <div className="modal" tabIndex="-1" role="dialog" id={this.state.idDiv}>
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
                <label htmlFor="compositionId">Process ID</label>
                <input type="text" className="form-control" id="compositionId" value={this.state.idBP} onChange={this.idBPHandler} placeholder={this.state.idPlaceHolder} />
                <label htmlFor="userId" style={{marginTop:"20px"}}>User</label>
                <input type="text" className="form-control" id="userId" value={this.state.idUser} onChange={this.idUserHandler} placeholder={this.state.userPlaceHolder}/>
                <br/>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={this.sendComposition} id="compositionActionBtn">{this.state.sendButtonLabel}</button>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}