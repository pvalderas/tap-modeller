import ReactDOM from 'react-dom';
import React from 'react';

import Modeler from 'bpmn-js/lib/Modeler';
import PropertiesPanel from './properties-panel';
import Menu from './menu/Menu.js';
import SendCompositionDialog from "./dialogs/SendCompositionDialog.js";
import SendBPDialog from "./dialogs/SendBPDialog.js";
import DownloadDialog from "./dialogs/DownloadDialog.js";
import UploadDialog from "./dialogs/UploadDialog.js";
import UploadBPDialog from "./dialogs/UploadBPDialog.js";

import ODRLUploadDialog from "./dialogs/ODRLUploadDialog.js";
import ODRLManagementDialog from "./dialogs/ODRLManagementDialog.js";
import WoTDialog from "./dialogs/WoTDialog.js";
import WoTDescriptionsDialog from "./dialogs/WoTDescriptionsDialog";
import RemoteDialog from "./dialogs/RemoteDialog.js";
import BPRemoteDialog from "./dialogs/BPRemoteDialog.js";
import IoTDeviceDialog from "./dialogs/IoTDeviceDialog.js";
import OperationDialog from "./dialogs/OperationDialog.js";

import SensorDialog from "./dialogs/SensorDialog.js";
import EventDialog from "./dialogs/EventDialog.js";
import EventErrorDialog from "./dialogs/EventErrorDialog.js";
import MessageDialog from "./dialogs/MessageDialog.js";
import BPMNManager from "./bpmn/BPMNManager.js";
import SendSystemModelsDialog from "./dialogs/SendSystemModelsDialog.js";

import CustomLaneActions from "./custom-actions/CustomLaneActions.js";
import CustomMenuActions from "./custom-actions/CustomMenuActions.js";
import CustomPalette from "./custom-actions/CustomPalette.js";
import EventListener from "./custom-actions/EventListener.js";
import MessageFlowCreationRule from "./custom-actions/MessageFlowCreationRule.js"; 
import CreatePoolInterceptor from "./custom-actions/CreatePoolInterceptor.js"; 

import { BpmnPropertiesPanelModule,BpmnPropertiesProviderModule,CamundaPlatformPropertiesProviderModule} from 'bpmn-js-properties-panel';
import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda.json'


import newModel from './NewModel.bpmn';

const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');
const $menuContainer = document.querySelector('#menu-container');
const $sendCompositionDialogContainer = document.querySelector('#send-composition-dialog-container');
const $sendBPDialogContainer = document.querySelector('#send-bp-dialog-container');
const $sendSystemModelsDialogContainer = document.querySelector('#send-system-models-dialog-container');
const $downloadDialogContainer = document.querySelector('#download-dialog-container');
const $uploadDialogContainer = document.querySelector('#upload-dialog-container');
const $uploadBPDialogContainer = document.querySelector('#upload-bp-dialog-container');
const $remoteDialogContainer = document.querySelector('#remote-dialog-container');
const $bpRemoteDialogContainer = document.querySelector('#bp-remote-dialog-container');
const $iotDeviceDialogContainer = document.querySelector('#iot-device-dialog-container');
const $operationDialogContainer = document.querySelector('#operation-dialog-container');
const $sensorDialogContainer = document.querySelector('#sensor-dialog-container');
const $eventDialogContainer = document.querySelector('#event-dialog-container');
const $eventErrorDialogContainer = document.querySelector('#event-error-dialog-container');
const $messageDialogContainer = document.querySelector('#message-dialog-container');
const $odrlUploadDialogContainer = document.querySelector('#odrl-upload-dialog-container');
const $odrlManagementDialogContainer = document.querySelector('#odrl-management-dialog-container');
const $wotDialogContainer = document.querySelector('#wot-dialog-container');
const $wotDescriptionDialogContainer = document.querySelector('#wot-descriptions-dialog-container');
const $rightPropertyPanelContainer = document.querySelector('#right-property-panel-container');


//***************************************
// CREATING THE MODELER AND AN EMPTY MODEL
//***************************************

sessionStorage.clear();
localStorage.setItem("managerUrl", "https://pedvalar.webs.upv.es/microservices/");
localStorage.setItem("serviceServerType","eureka");
localStorage.setItem("serviceServerUrl", "https://pedvalar.webs.upv.es/microservices/");
localStorage.setItem("selectedSystem", "wot");

const modeler = new Modeler({
  container: $modelerContainer,
  propertiesPanel: {
    parent: $rightPropertyPanelContainer
  },
  additionalModules: [
      CustomLaneActions, 
      CustomMenuActions,
      CustomPalette,
      EventListener,
      MessageFlowCreationRule,
      CreatePoolInterceptor,
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      CamundaPlatformPropertiesProviderModule
  ],
  moddleExtensions: {
    camunda: CamundaBpmnModdle
  },
  keyboard: {
    bindTo: document.body
  }
});
modeler.importXML(newModel);

document.getElementById("zoomResetBtn").addEventListener("click",function(){
  modeler.get('zoomScroll').reset();
})

document.getElementById("zoomInBtn").addEventListener("click",function(){
  modeler.get('canvas').zoom(modeler.get('canvas').zoom()+0.1);
})

document.getElementById("zoomOutBtn").addEventListener("click",function(){
  modeler.get('canvas').zoom(modeler.get('canvas').zoom()-0.1);
})

//***************************************



//***************************************
// ADDING THE TOP MENU
//***************************************
ReactDOM.render(
  <Menu modeler={modeler} bpmnManager={new BPMNManager(modeler)}/>,
  $menuContainer
);
//***************************************



//***************************************
// ADDING THE PROPERTY PANEL AND BUTTONS
//***************************************
const propertiesPanel = new PropertiesPanel({
  container: $propertiesContainer,
  modeler
});

//***************************************



//***************************************
// ADDING DIALOGS
//***************************************

ReactDOM.render(
  <SendCompositionDialog modeler={modeler} bpmnManager={new BPMNManager(modeler)} />,
  $sendCompositionDialogContainer
);

ReactDOM.render(
  <SendSystemModelsDialog modeler={modeler} bpmnManager={new BPMNManager(modeler)} />,
  $sendSystemModelsDialogContainer
);

ReactDOM.render(
  <DownloadDialog modeler={modeler} bpmnManager={new BPMNManager(modeler)} />,
  $downloadDialogContainer
);

ReactDOM.render(
  <UploadDialog modeler={modeler} />,
  $uploadDialogContainer
);

ReactDOM.render(
  <UploadBPDialog modeler={modeler} />,
  $uploadBPDialogContainer
);

ReactDOM.render(
  <ODRLUploadDialog />,
  $odrlUploadDialogContainer
);

ReactDOM.render(
  <ODRLManagementDialog />,
  $odrlManagementDialogContainer
);

ReactDOM.render(
  <WoTDialog />,
  $wotDialogContainer
);

ReactDOM.render(
  <WoTDescriptionsDialog />,
  $wotDescriptionDialogContainer
);

ReactDOM.render(
  <BPRemoteDialog modeler={modeler} />,
  $bpRemoteDialogContainer
);

ReactDOM.render(
  <SendBPDialog modeler={modeler} bpmnManager={new BPMNManager(modeler)} />,
  $sendBPDialogContainer
);

ReactDOM.render(
  <RemoteDialog modeler={modeler} />,
  $remoteDialogContainer
);

ReactDOM.render(
  <IoTDeviceDialog modeler={modeler}/>,
  $iotDeviceDialogContainer
);

ReactDOM.render(
  <OperationDialog modeler={modeler}/>,
  $operationDialogContainer
);

ReactDOM.render(
  <SensorDialog modeler={modeler}/>,
  $sensorDialogContainer
);

ReactDOM.render(
  <EventDialog modeler={modeler}/>,
  $eventDialogContainer
);

ReactDOM.render(
  <EventErrorDialog id="eventError"/>,
  $eventErrorDialogContainer
);

ReactDOM.render(
  <MessageDialog />,
  $messageDialogContainer
);

//***************************************




