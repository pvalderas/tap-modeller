import React from 'react';
import './button.css'
import { showSendDialog } from '../dialogs/SendCompositionDialog';


export default class SendButton extends React.Component {

	constructor(props) {
		super(props);
		this.modeler=this.props.modeler;
		this.bpmnManager=this.props.bpmnManager;


		this.showSendCompositionDialog=this.showSendCompositionDialog.bind(this);

	}

	showSendCompositionDialog(){
		if(this.bpmnManager.checkBPMN()){
			showSendDialog();
	    }
	}


	render() {
	  		return(
  				<button onClick={this.showSendCompositionDialog} className="btn btn-primary property_panel_button">Send to Server</button>
  			);
	}

}