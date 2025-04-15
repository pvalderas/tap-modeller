import inherits from "inherits";
import { is } from 'bpmn-js/lib/util/ModelUtil';
import RuleProvider from "diagram-js/lib/features/rules/RuleProvider";

export function MessageFlowCreationRule(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(MessageFlowCreationRule, RuleProvider);

MessageFlowCreationRule.$inject = ["eventBus"];

MessageFlowCreationRule.prototype.init = function () {
  this.addRule("connection.create", 2000, function (context) {
    if(context.source.businessObject.name=="PHYSICAL WORLD" && (!context.target.businessObject.eventDefinitions || context.target.businessObject.eventDefinitions.length==0)) return false;
    if(context.target.businessObject.name=="PHYSICAL WORLD") return false;

    if(sessionStorage.getItem("linking")=="1"){
       if( !is(context.source.businessObject,"bpmn:ServiceTask") && 
           !is(context.source.businessObject,"bpmn:DataObjectReference") ) return false;

       if((is(context.source.businessObject,"bpmn:ServiceTask") &&
            !is(context.target.businessObject,"bpmn:DataObjectReference")) || 
          (is(context.source.businessObject,"bpmn:DataObjectReference") && 
            !is(context.target.businessObject,"bpmn:ServiceTask"))) return false;
    }

  });

  this.addRule("connection.reconnect", 2000, function (context) {
    if(context.source.businessObject.name=="PHYSICAL WORLD" && (!context.target.businessObject.eventDefinitions || context.target.businessObject.eventDefinitions.length==0)) return false;
    if(context.target.businessObject.name=="PHYSICAL WORLD") return false;
  });


};


export default {
  __init__: [ 'customRules' ],
  customRules: [ 'type', MessageFlowCreationRule ]
};