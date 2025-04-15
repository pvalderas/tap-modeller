import React, { Component } from 'react';
import MenuOption from './MenuOption.js';

import newModel from '../NewModel.bpmn';
import BPMN2Java from '../bpmn/BPMN2Java.js';

//import {showConfig,defaultExampleConfig} from '../dialogs/ConfigDialog.js';
import {showDownloadDialog} from '../dialogs/DownloadDialog.js';
import {showUploadDialog} from '../dialogs/UploadDialog.js';
import {showBPUploadDialog} from '../dialogs/UploadBPDialog.js';
import {showRemoteDialog} from '../dialogs/RemoteDialog.js';
import {showSendDialog } from '../dialogs/SendCompositionDialog';
import {showBPRemoteDialog} from '../dialogs/BPRemoteDialog.js';
import {showSendBPDialog } from '../dialogs/SendBPDialog';

import {showODRLUploadDialog} from '../dialogs/ODRLUploadDialog.js';
import {showODRLManagementDialog} from '../dialogs/ODRLManagementDialog.js';
import {showWoTDialog} from '../dialogs/WoTDialog.js';
import {showWoTDescriptionsDialog} from '../dialogs/WoTDescriptionsDialog.js';
//import {showSendSystemModelsDialog} from '../dialogs/SendSystemModelsDialog';


export var updateMenuTitle = function(title){
    window.menu.updateMenuTitle(title);
};

export var newComposition = function(){
    window.menu.newComposition();
};

export var showLinkPanel = function(){
    window.menu.showLinkPanel();
};

export var showLinkedLabel = function(state){
	window.menu.showLinkedLabel(state)
}

export default class Menu extends React.Component {

	constructor(props) {
		super(props);
		window.menu=this;
		
		this.modeler=this.props.modeler;
		
		this.bpmn2Java=new BPMN2Java(this.modeler);
		this.bpmnManager=this.props.bpmnManager;

		this.state = {
			displayWoT:localStorage.getItem("isWoT")!="0"?true:false,
			linkPanel:false,
			propertyPanel: false,
			processTitle:"",
			linkLabel:"link"
		}
		sessionStorage.setItem("linking",0);

		this.newComposition=this.newComposition.bind(this);
		
		this.generateJava=this.generateJava.bind(this);

		this.zoomin=this.zoomin.bind(this);
		this.zoomout=this.zoomout.bind(this);
		
		this.toggleLinkPanel=this.toggleLinkPanel.bind(this);
		this.showLinkPanel=this.showLinkPanel.bind(this);
		this.hideLinkPanel=this.hideLinkPanel.bind(this);
		this.togglePropertyPanel=this.togglePropertyPanel.bind(this);
		this.showPropertyPanel=this.showPropertyPanel.bind(this);
		this.hidelePropertyPanel=this.hidePropertyPanel.bind(this);
		this.showSendCompositionDialog=this.showSendCompositionDialog.bind(this);
		this.showSendBPDialog=this.showSendBPDialog.bind(this);
	}

	updateMenuTitle(title){
		this.setState({processTitle: title});
	}	

	newComposition(){
		this.modeler.importXML(newModel);
		this.hideLinkPanel();
		document.getElementById("showPropLink").style.display="inline";
		this.showLinkedLabel(false);
	}


	generateJava(){
		//if(this.bpmnManager.checkBPMN()){
			this.bpmn2Java.downloadJava();
		//}
	}

	zoomin(){
		this.modeler.get('canvas').zoom(this.props.modeler.get('canvas').zoom()+0.1);
	}

	zoomreset(){
		this.modeler.get('zoomScroll').reset();
	}

	zoomout(){
		this.modeler.get('canvas').zoom(this.props.modeler.get('canvas').zoom()-0.1);
	}


	showLinkPanel(){
		document.getElementById("bottom-view").style.display="block";
		document.getElementById("showPropLink").style.display="none";
		//document.getElementsByClassName("djs-palette")[0].style.display="none";

		this.hidePropertyPanel();
		this.setState({linkLabel: "stop"});
		sessionStorage.setItem("linking",1);
		document.getElementById("saveIoTBP").classList.remove("disabled");
		//document.getElementById("downloadIoTBP").classList.remove("disabled");

		document.getElementById("bps").classList.add("disabled");
		//document.getElementById("artefacts").classList.remove("disabled");

		this.modeler.get('palette')._rebuild();
	}

	hideLinkPanel(){
		document.getElementById("bottom-view").style.display="none";
		document.getElementById("showPropLink").style.display="block";
		//document.getElementsByClassName("djs-palette")[0].style.display="block";
		
		
		this.setState({linkLabel: "link"});
		sessionStorage.setItem("linking",0);

		document.getElementById("saveIoTBP").classList.add("disabled");
		//document.getElementById("downloadIoTBP").classList.add("disabled");

		document.getElementById("bps").classList.remove("disabled");
		//document.getElementById("artefacts").classList.add("disabled");

		this.modeler.get('palette')._rebuild();
	}

	toggleLinkPanel(){
		if(this.state.linkLabel=="link") this.showLinkPanel();
		else this.hideLinkPanel();
	}

	showLinkedLabel(state){
		/*if(state)
			document.getElementById("linkedLabel").style.display="block";
		else
			document.getElementById("linkedLabel").style.display="none";*/
	}

	showPropertyPanel(){
		const propertiesPanel = this.props.modeler.get('propertiesPanel');
		document.getElementById('right-property-panel-container').style.display='block';
        propertiesPanel.attachTo('#right-property-panel-container');
        document.getElementById('modeler-container').className="col-10";
        let rightZoom=document.getElementById('right-property-panel-container').offsetWidth;
        document.getElementById("io-zoom-controls").style.right=(rightZoom+10)+"px";

        document.getElementById("propPanelBtn").classList.remove("btn-secondary");
        document.getElementById("propPanelBtn").classList.add("btn-light");
	}

	hidePropertyPanel(){
		const propertiesPanel = this.props.modeler.get('propertiesPanel');
		document.getElementById('right-property-panel-container').style.display='none';
        propertiesPanel.detach();
        document.getElementById('modeler-container').className="col-12";
        document.getElementById("io-zoom-controls").style.right="10px";

        document.getElementById("propPanelBtn").classList.add("btn-secondary");
        document.getElementById("propPanelBtn").classList.remove("btn-light");
	}

	togglePropertyPanel(){

		this.setState({propertyPanel:!this.state.propertyPanel});

		const propertiesPanel = this.props.modeler.get('propertiesPanel');
		if(this.state.propertyPanel){
			this.hidePropertyPanel();
		}else{
			this.showPropertyPanel();
		}
	}

	showSendBPDialog(){
		//if(this.bpmnManager.checkBPMN()){
		showSendBPDialog();
	    //}
	}

	showSendCompositionDialog(){
		//if(this.bpmnManager.checkBPMN()){
		showSendDialog();
	    //}
	}

	render() {

		const wotOptions = [
			{id:"wot",label:"Load Web of Thing descriptions",click:showWoTDialog},
			{id:"wotmanagement",label:"Manage Web of Thing descriptions",click:showWoTDescriptionsDialog}
		];
		

		const bpOptions = [
					{id:"new",label:"New BP",click:this.newComposition.bind(this, this.props.modeler)},
					{id:"separator"},
					{id:"loadBPLocal",label:"Load from Local",click:showBPUploadDialog},
					{id:"loadBPRepository",label:"Load from Repository",click:showBPRemoteDialog},
					{id:"separator"},
					{id:"save",label:"Save in Respository",click:showSendBPDialog},
					//{id:"downloadBP",label:"Download",click:showDownloadDialog}

		];


		const iotbpOptions = [
					{id:"link",label:this.state.linkLabel=="link"?"Link current Model":"Stop linking",click:this.toggleLinkPanel},
					{id:"separator"},
					{id:"loadIoTBPLocal",label:"Load from Local",click:showUploadDialog},
					{id:"loadIoTBP",label:"Load from server",click:showRemoteDialog},
					{id:"separator"},
					{id:"saveIoTBP",label:"Save in server",click:this.showSendCompositionDialog, disabled:true}
					//{id:"downloadIoTBP",label:"Download",click:showDownloadDialog, disabled:true}
		];


		const policiesOptions = [
					{id:"odrl",label:"Load ODRL policies",click:showODRLUploadDialog},
					{id:"odrlmanagement",label:"Manage ODRL policies",click:showODRLManagementDialog}
		];

		const artefactsOptions = [
					{id:"java",label:"Java IoT Microservices",click:this.generateJava},
					{id:"executableBPMN",label:"Executable BPMN File",click:showDownloadDialog}
		];


		/*
		<MenuOption label="+" id="zoominoption" click={this.zoomin}/>
		<MenuOption label="-" id="zoomoutoption" click={this.zoomout}/>
		*/

		return(
			<div className="row">
			 	{
			 		//<div id="wotLabel" style={{position:"fixed;margin:0 auto", color:"#555", textShadow: "grey 1px 1px 2px", width:"100%", textAlign: "center"}}>Thing-aware Process Modeller</div>
			 	}
				<div id="processTitle" style={{position:"absolute", width:"100%", left:"0px", top:"30px", textAlign: "center", color:"darkgrey"}}>{this.state.processTitle}</div>
				
				<div id="number1" style={{position:"absolute", left:"120px", top:"0px", color:"blue", fontSize:"small"}}>1</div>
				<div id="number2" style={{position:"absolute", left:"320px", top:"0px", color:"blue", fontSize:"small"}}>2</div>
				<div id="number3" style={{position:"absolute", left:"480px", top:"0px", color:"blue", fontSize:"small"}}>3</div>
				<div id="number4" style={{position:"absolute", left:"650px", top:"0px", color:"blue", fontSize:"small"}}>4</div>
				{//<div id="number5" style={{position:"absolute", left:"700px", top:"0px", color:"blue", fontSize:"small"}}>5</div>
				}

				<div  id="navbarSupportedContent">
					<ul className="navbar-nav mr-auto">
					  <MenuOption label="BP Modelling" id="bps" items={bpOptions}/>
					  <MenuOption id="separatorSmall"/>
					  <MenuOption label="WoT Things" id="things" items={wotOptions}/>
					  <MenuOption id="separatorArrow"/>
					  <MenuOption label="ODRL Policies" id="policies" items={policiesOptions}/>
					  <MenuOption id="separatorArrow"/>
					  <MenuOption label="Link BP with WoT" id="iotbps" items={iotbpOptions}/>
					  <MenuOption id="separatorArrow"/>
					  <MenuOption label="Software Artefacs" id="artefacts" items={artefactsOptions}/>
					</ul>
					
				</div>
		
				<div id="showPropLink" style={{position:"absolute", right:"20px",top:"10px", color:"blue"}}><a href="#" id="propPanelBtn" className="btn btn-secondary btn-sm" onClick={this.togglePropertyPanel}>{this.state.propertyPanel?"Hide BPMN Property Panel":"Show BPMN Property Panel"}</a></div>
				<div id="linkedLabel" style={{position:"absolute", right:"20px",top:"5px", color:"red", display:"none"}}>Linked</div>
				 
			</div>
		);

  	}

}