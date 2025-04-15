import React, { Component} from 'react';
import {hideMicroserviceDialog} from '../dialogs/IoTDeviceDialog';
import {hideOperationDialog} from '../dialogs/OperationDialog';
import {hideEventDialog} from '../dialogs/EventDialog';
import {hideSensorDialog} from '../dialogs/SensorDialog';
import {hideTaskOperationsListDialog} from '../dialogs/TaskOperationsListDialog';
import TaskOperationsListDialog from "../dialogs/TaskOperationsListDialog.js";

import ElementProperties from './ElementPropertiesFunction';

import './PropertiesView.css';


export default class PropertiesView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedElements: [],
      element: null,
      seed:1
    };

    const propertiesPanel = this.props.modeler.get('propertiesPanel');
    propertiesPanel.detach();

    this.configLabel={
      marginTop: "20px",
      width: "100%",
      textAlign: "center",
      color: "gray",
      fontSize: "20px"
    }

    this.resetKey=this.resetKey.bind(this);
  }

  componentDidMount() {

    const {
      modeler
    } = this.props;

    modeler.on('selection.changed', (e) => {

          this.setState({
            selectedElements: e.newSelection,
            element: e.newSelection[0]
          });

          if(e.newSelection.length!=1 || e.newSelection[0].businessObject.name=='PHYSICAL WORLD'){
            hideOperationDialog();
            hideMicroserviceDialog();
            hideSensorDialog();
            hideEventDialog();
            hideTaskOperationsListDialog();
          }

    });


    modeler.on('element.changed', (e) => {

        const {
          element
        } = e;

        const currentElement=this.state.element;

        if (!currentElement) {
          return;
        }

        // update panel, if currently selected element changed
       if (element.id !== currentElement.id) {
          this.setState({
            selectedElements:[element],
            element:element
          });
        }

    });
  }

  resetKey(){
    this.setState({seed: Math.random()});
  }

  

  render() {

    const {
      modeler
    } = this.props;

    const {
      selectedElements,
      element
    } = this.state;

    return (
      <div>
        <TaskOperationsListDialog modeler={modeler} refreshProperties={this.resetKey}/>
        {
          selectedElements.length === 1
            && <ElementProperties key={this.state.seed} modeler={ modeler } element={ element } />
        }

        {
          selectedElements.length !== 1 
            && <div style={this.configLabel}>IoT Configuration Panel</div> 
        }

      </div>
    );
  }

}

