import generateJava from './BPMN2Java.js';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { showMessage } from '../dialogs/MessageDialog';

export default class BPMNManager{
	constructor(modeler) {
		this.modeler=modeler;

		this.sendBPMN=this.sendBPMN.bind(this);
		this.downloadBPMN=this.downloadBPMN.bind(this);
		this.addMessage=this.addMessage.bind(this);
		this.addAllMessages=this.addAllMessages.bind(this);
		this.completeBPMN=this.completeBPMN.bind(this);
		this.getProcessID=this.getProcessID.bind(this);
		this.removeIoTaspects=this.removeIoTaspects.bind(this);
	}

	getProcessID(){
		let name=""
		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
		 definitions.rootElements.forEach(function(element){
		 	if (element.$type=="bpmn:Process"){
		 		name=element.id;
		 	}
		});
		return name;
	}

	getEvents(){
		let highLevelEvents=[];
	    const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
	    definitions.rootElements.forEach(function(element,index){
	        if (element.$type=="bpmn:Collaboration" && element.messageFlows){
	          element.messageFlows.forEach(function(message,index){
	            if(message.targetRef.name && message.targetRef.extensionElements){
	            	let event={"name":message.targetRef.name}
	            	message.targetRef.extensionElements.values.forEach(field=>{
			            event[field.name]=field.stringValue;
			        });
	              	highLevelEvents.push(event);
	            }
	          });
	        }
	    });
	    return highLevelEvents;
	}

	async sendIoTEnhancedBPMN(id, user, success, error, highLevelEvents, deploy){
		let managerUrl=localStorage.getItem("managerUrl");
		let url=managerUrl+(managerUrl.charAt(managerUrl.length-1)=="/"?"":"/")+"wot/iotbps";

		const result = await this.modeler.saveXML({ format: true });
  		const { err, xml } = result;

  		if (err) {
			showMessage("Error","Could not save BPMN 2.0 diagram");
			return console.error('Could not save BPMN 2.0 diagram', err);
		}

		fetch(url,{
			method:'POST',
			body: JSON.stringify({"id":id,"user":user,"name":name, "xml":xml, "events":highLevelEvents, "deploy":deploy, "conditions":[]})
	 	})
		.then(function (response) {
		        return response.text()
		    })
	    .then(result => {
	    	success(result);
	    })
	    .catch(err => {
	        error(err);
	    })
	}

	sendBPMN(id, user, success, error, highLevelEvents, deploy){

		let managerUrl=localStorage.getItem("managerUrl");
		let url=managerUrl+(managerUrl.charAt(managerUrl.length-1)=="/"?"":"/")+"wot/bps";

	   	//let conditions=this.completeBPMN(highLevelEvents, id);
	   	this.removeIoTaspects();
		
		this.modeler.saveXML({ format: true }, function(err, xml) {
			if (err) {
				showMessage("Error","Could not save BPMN 2.0 diagram");
				return console.error('Could not save BPMN 2.0 diagram', err);
			}
			
			fetch(url,{
				 		method:'POST',
				 		/*headers:{
							"Content-Type":"application/json",
						},*/
				 		body: JSON.stringify({"id":id,"user":user,"name":name, "xml":xml, "events":highLevelEvents, "deploy":deploy, "conditions":[]})
		 		})
			.then(function (response) {
			        return response.text()
			    })
		    .then(result => {
		    	success(result);
		    })
		    .catch(err => {
		        error(err);
		    })
		})
	}

	removeIoTaspects(){
		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;

		for(let element of definitions.rootElements){
			if (element.$type=="bpmn:Process"){
				
				for(let lane of element.laneSets[0].lanes){

					for(let node of lane.flowNodeRef){
						
						switch(node.$type){
							case "bpmn:StartEvent": 
							case "bpmn:IntermediateCatchEvent": 
							case "bpmn:ServiceTask": 
								if(node.extensionElements){
									delete node.extensionElements;
								}
	
						} 
					}
				}
			}
		}
	}

	updateUserTaksListeners(xml){

		let parser = new DOMParser();
		let xmlDoc = parser.parseFromString(xml,"text/xml");
		let userTasks = xmlDoc.getElementsByTagName("bpmn:userTask");
		for(let userTask of userTasks){
			console.log(userTask);
			let extensionElements = userTask.getElementsByTagName("bpmn:extensionElements");
			if(extensionElements.length>0){
				extensionElements=extensionElements[0];
				let elements= extensionElements.childNodes;
				let toAdd=[];

				if(elements.length>0){
					for(let field of elements){
						if(field.tagName=="camunda:executionListener"){
							extensionElements.removeChild(field);
						}else if(field.tagName=="camunda:field"){
							if(field.getAttribute('name')=="device" || field.getAttribute('name')=="deviceID" || field.getAttribute('name')=="operation" || field.getAttribute('name')=="operationPattern"){
								toAdd.push(field);
							}
						}
						
					}
				}

				if(toAdd.length>0){
					
					let listener= xmlDoc.createElement("camunda:executionListener");
					listener.setAttribute("class","es.upv.pros.pvalderas.bpcontroller.server.bpmn.WoTUserTask");
					listener.setAttribute("event","start");
					
					for(let field of toAdd){
						let newField= xmlDoc.createElement("camunda:field");
						newField.setAttribute("name", field.getAttribute('name'));
						let value= xmlDoc.createElement("camunda:string");
						value.innerHTML=field.getAttribute('stringValue');
						newField.appendChild(value);
						listener.appendChild(newField);
						extensionElements.removeChild(field);
						extensionElements.appendChild(listener);
					}
				}
			}
		}
		
		const serializer = new XMLSerializer();
		return serializer.serializeToString(xmlDoc);
	}
	
	downloadBPMN (id){

		this.completeBPMN(this.getEvents(), id);

		let _this=this;

		this.modeler.saveXML({ format: true }, function(err, xml) {
			if (err) {
				showMessage("Error","Could not save BPMN 2.0 diagram");
				return console.error('Could not save BPMN 2.0 diagram', err);
			}


			xml=_this.updateUserTaksListeners(xml);

			console.log(xml);


			let element = document.createElement('a');
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(xml));
			element.setAttribute('download', id+".bpmn");

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		});
	}

	downloadJava(){

		const definitions=modeler.get('canvas').getRootElement().businessObject.$parent;

		let microservices=[];
		let urls=JSON.parse(sessionStorage.getItem("urls"));
		for (let key in urls) {
	        microservices.push(key);
	    }
		let IoTDevices=[];

		jQuery.each(definitions.rootElements, function(index, element){
				if (element.$type=="bpmn:Collaboration"){
					jQuery.each(element.participants, function(index, participant){
						if(participant.name!="PHYSICAL WORLD"){
							jQuery.each(participant.processRef.laneSets[0].lanes,function(index, lane){
								if(microservices.indexOf(lane.name)>=0){
									let operations=[];
									jQuery.each(lane.flowNodeRef,function(index, element){
										if(element.$type=="bpmn:ServiceTask"){
											operations.push(element.name);
										}
									});
									IoTDevices.push({
										"name":lane.name,
										"operations":operations
									})
								}
							});
						}
					});
				}
		});
		generateJava(IoTDevices);
	}

	checkBPMNPools(){
		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;

		let hayPools=false;
		let hayNombres=true;
		jQuery.each(definitions.rootElements, function(index, element){
				if (element.$type=="bpmn:Collaboration"){
					hayPools=true;
					jQuery.each(element.participants, function(index, participant){
						if(participant.name==undefined || participant.name==""){
							hayNombres=false
						}
					});
				}
		});

		if(!hayPools){
			showMessage("Error","Pools representing microservices must be defined");
			return false;
		}

		if(!hayNombres){
			showMessage("Error","Some pools are not assigned to a microservice");
			return false;
		}

		return true;
	}

	addMessage(messageFlow, messageIDs){
	    const modeler=this.modeler;
	    const moddle= modeler.get('moddle');

	    const messageName=messageFlow.targetRef.name.replaceAll(" ","");
	    let messageID=messageName+"ID";
	    let count=messageIDs.filter(id => {if(id==messageID) return true; else return false;}).length;
	    if(count>0) messageID=messageID+(count+1);
	    let message = moddle.create('bpmn:Message');
	    message.name=messageName;
	    message.id=messageID;

	    modeler.getDefinitions().rootElements.push(message);

	    messageFlow.targetRef.eventDefinitions[0].messageRef=message;
	    if(messageFlow.sourceRef.name!="PHYSICAL WORLD"){
	    	let camundaNs = 'http://camunda.org/schema/1.0/bpmn';
	    	if(messageFlow.sourceRef.eventDefinitions){ // It is a Throw Event 
	    		messageFlow.sourceRef.eventDefinitions[0].messageRef=message;
		        let extensionElements = moddle.create('bpmn:ExtensionElements');
		        let listener=moddle.createAny('camunda:executionListener',camundaNs, {class:"es.upv.pros.pvalderas.bpcontroller.server.bpmn.MessageSender",event:"start"});
		        extensionElements.get('values').push(listener);
		       	messageFlow.sourceRef.extensionElements=extensionElements;
		     }else{ // It is a Send Task
 				messageFlow.sourceRef.$attrs['camunda:class']="es.upv.pros.pvalderas.bpcontroller.server.bpmn.MessageSender";
		     }
	    }

	    return messageID;
	}

	addAllMessages(){
		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
	    
	    let _this=this;
	    let messageIDs=[];
	    definitions.rootElements.forEach(function(element,index){
	        if (element.$type=="bpmn:Collaboration" && element.messageFlows){
	          element.messageFlows.forEach(function(messageFlow,index){
	          	//if(messageFlow.sourceRef.name=="PHYSICAL WORLD")
	          		messageIDs.push(_this.addMessage(messageFlow, messageIDs));
	          })
	        }
	    });
	}

	completeBPMN(highLevelEvents, id){
		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
		const moddle= this.modeler.get('moddle');
		const modeling= this.modeler.get('modeling');
		const elementRegistry= this.modeler.get('elementRegistry');

		let newRootElements=jQuery.grep(definitions.rootElements, function(element, index){
				if (element.$type=="bpmn:Message"){
					return false;
				}else{
					return true;
				}
		});

		definitions.rootElements=newRootElements;

		let changeID=false, compositionID;
		/*if(id!=null && id.length>0){
			changeID=true;
			compositionID=id.replaceAll(" ","");
		}*/
		
		let collaboration=null, processNode=null;
		let conditions=[];
		let participantNames = new Map();
		let camundaNs = 'http://camunda.org/schema/1.0/bpmn';
		//let events=[];
		jQuery.each(definitions.rootElements, function(index, element){
				if (element.$type=="bpmn:Collaboration"){
					collaboration=element; //Updated after the for each has finished

					for(let participant of element.participants){
						if(participant.name!="PHYSICAL WORLD") participantNames.set(participant.processRef.id,participant.name);
					}
				}
				else if (element.$type=="bpmn:Process"){
					if (changeID){
						element.id=compositionID;
						processNode=element;
					}

					element.name=participantNames.get(element.id);
					
					jQuery.each(element.laneSets[0].lanes, function(index, lane){

						jQuery.each(lane.flowNodeRef, function(index, node){
							
							switch(node.$type){
								case "bpmn:ServiceTask": 
									let addWotServiceClass=false;
									let extensionElements = node.extensionElements;
									if(node.extensionElements && node.extensionElements.values && node.extensionElements.values.length>0){
										for(let field of node.extensionElements.values){
								            if(field.name=="operationPattern"){
								              	addWotServiceClass=true;
								              	break;
								            }
										}
									}

									if(addWotServiceClass){
										delete node['class'];
										node.$attrs['camunda:class']="es.upv.pros.pvalderas.bpcontroller.server.bpmn.WoTServiceClass";
									}else{
										if(node['class']!==undefined);
											node.$attrs['camunda:class']="es.upv.pros.pvalderas.bpcontroller.server.bpmn.BPMNServiceClass";
									}
									break;
								case "bpmn:UserTask": // User tasks are completed with an XML parser in the downloadBPMN method
									/*

									{ 
										let addWotUseTask=false;
										let extensionElements = node.extensionElements;
										let fields;
		
										if(node.extensionElements && node.extensionElements.values && node.extensionElements.values.length>0){
											fields=node.extensionElements.values.filter(element => element.$type!="camunda:ExecutionListener");
											node.extensionElements.values=fields;
											for(let field of fields){
									            if(field.name=="operationPattern"){
									              	addWotUseTask=true;
									              	break;
									            }
											}
										}

										if(addWotUseTask){
											let listener=moddle.createAny('camunda:executionListener',camundaNs, {class:"es.upv.pros.pvalderas.bpcontroller.server.bpmn.WoTUserTask",event:"start"});
											extensionElements.values.push(listener);
									        node.extensionElements=extensionElements;
									        // User tasks are completed with an XML parser in the downloadBPMN method

										}
									}*/
									break;
								case "bpmn:ExclusiveGateway": {	
											let camundaNs = 'http://camunda.org/schema/1.0/bpmn';
									        let extensionElements = moddle.create('bpmn:ExtensionElements');
									        let listener=moddle.createAny('camunda:executionListener',camundaNs, {class:"es.upv.pros.pvalderas.bpcontroller.server.bpmn.ConditionEvaluator",event:"start"});
									        extensionElements.get('values').push(listener);
									       	
											
											let conditionString=node.name?node.name:"";

										    jQuery.each(node.outgoing, function(index, edge){

										    	let conditionBody;
												let edgeName=edge.name!=null?edge.name: edge;
												if(node.name){					
													if(edgeName.toLowerCase()=="true" || edgeName.toLowerCase()=="false"){
										       		 	conditionBody= "#{conditionResult=="+edgeName+"}";
										       		}else{
										       		 	conditionBody="#{conditionResult==\""+edgeName+"\"}";
										       		}
											    }else{
													conditionBody="#{conditionResult==\""+edgeName+"\"}";
													conditionString+=edgeName+";";
											    }
										     
												
												let condition= moddle.create('bpmn:FormalExpression', { body: conditionBody });
												let connection = elementRegistry.get(edge.id);

												modeling.updateProperties(connection, {
												    conditionExpression: condition
												});

									       	});

										    if(!node.name){	
									       		let field=moddle.createAny('camunda:field',camundaNs, {name:"conditionName", stringValue:conditionString});
									       		extensionElements.get('values').push(field);
									       	}

									       	node.extensionElements=extensionElements;
									       	conditions.push(conditionString)
										}
										break;
								case "bpmn:StartEvent": {
								        let extensionElements = moddle.create('bpmn:ExtensionElements');
								        let listener=moddle.createAny('camunda:executionListener',camundaNs, {class:"es.upv.pros.pvalderas.bpcontroller.server.bpmn.ODRLValidator",event:"end"});
								        extensionElements.get('values').push(listener);
								        node.extensionElements=extensionElements;
								        }
								        break;
								

								/*case "bpmn:IntermediateCatchEvent":
										let isComplex=false;
										let description="";
										if(node.extensionElements && node.extensionElements.values && node.extensionElements.values.length>0){
											node.extensionElements.values.forEach(function(field){
								            if(field.name=="eventType" && field.stringValue=="complex"){
								              	isComplex=true;
								            }
								            if(field.name=="description"){
								               description=field.stringValue;
								            }
								          });
										}
										if(isComplex){
											events.push({
												name:node.name,
												description:description
											});
										}*/
							}
						});

					});
					element.isExecutable="true";
				} 
		});

		if(collaboration!=null){
			let _this=this;
			jQuery.each(collaboration.participants, function(index, participant){
				if(participant.name!="PHYSICAL WORLD"){
					if (changeID) participant.processRef=processNode;

					const moddle= _this.modeler.get('moddle');
				    let extensionElements = moddle.create('bpmn:ExtensionElements');
					
					let camundaNs = 'http://camunda.org/schema/1.0/bpmn';
				    let field1=moddle.createAny('camunda:field',camundaNs, {name:"system", stringValue:localStorage.getItem("selectedSystem")});
				    //let field2=moddle.createAny('camunda:field',camundaNs, {name:"isFloWare", stringValue:localStorage.getItem("isFloWare")});
				    //let field3=moddle.createAny('camunda:field',camundaNs, {name:"isOntology", stringValue:localStorage.getItem("isOntology")});

				    extensionElements.get('values').push(field1);
				    //extensionElements.get('values').push(field2);
				    //extensionElements.get('values').push(field3);

				    participant.extensionElements=extensionElements;
				}
			});
		}

		this.addAllMessages();

		return conditions;
	}

	checkBPMN(){
		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
		
		let hayPhysical=false;
		let hayNombres=true;
		let hayLanes=true;
		let eventNamesOK=true;
		let conditionErrors=[]
		
		let messages=[];

		jQuery.each(definitions.rootElements, function(index, element){
				if (element.$type=="bpmn:Collaboration"){
					jQuery.each(element.participants, function(index, participant){
						if(participant.name=="PHYSICAL WORLD"){
							hayPhysical=true;
						}
					});
					//if(!hayPhysical) return false; //exit mainforEach
				}else if (element.$type=="bpmn:Process"){
					if(!element.laneSets){
							hayLanes=false;
					}else{
						jQuery.each(element.laneSets[0].lanes, function(index, lane){
							if(!lane.name || lane.name==""){
								hayNombres=false;
								//return false; //exit forEach
							}

							jQuery.each(lane.flowNodeRef, function(index, node){
						
								if(node.eventDefinitions && node.eventDefinitions[0] && 
									node.eventDefinitions[0].$type=="bpmn:MessageEventDefinition" &&
									(node.$type=="bpmn:StartEvent" || node.$type=="bpmn:IntermediateCatchEvent") &&
									(!node.name || node.name=="")){
										eventNamesOK=false;
										return false; //exit lane forEach
								}
								
								if(node.$type=="bpmn:ExclusiveGateway" && node.incoming.length==1){
									jQuery.each(node.outgoing,function(index,edge){
										if(edge.name==null || edge.name.trim().length==0){
											conditionErrors.push(node.name);
											return false;
										}
									})
								}
							});

							//if(!eventNamesOK)return false; //exit laneSet forEach
								
						});

					//if(!hayNombres || !eventNamesOK)return false; //exit main forEach
					}
				}
		});

		let text="The following erros need to be fixed:<ul>";
		let ok=true;

		if(!hayPhysical){
			text+="<li>A Pool representing the Physical World must be defined</li>";
			//showMessage("Error","A Pool representing the Physical World must be defined");
			ok=false;
		}

		if(!hayNombres){
			text+="<li>Some lane is not assigned to an actor</li>";
			//showMessage("Error","Some lanes are not assigned to an actor");
			ok=false;
		}

		if(!hayLanes){
			text+="<li>Some non-collapsed pool does not have lanes.</li>";
			//showMessage("Error","Some lanes are not assigned to an actor");
			ok=false;
		}

		if(!eventNamesOK){
			text+="<li>Some Catch Message Event is defined without a name</li>";
			//showMessage("Error","Some message event is defined without a name");
			ok=false;
		}

		if(conditionErrors.length>0){
			text+="<li>These ExclusiveGateway have some outgoing edge without a condition:<br><ul>";
			conditionErrors.forEach(function(gateway){
				text+="<li>"+gateway+"</li>";
			})
			text+="</ul></li>";
			
			ok=false;
		}

		text+="</ul>";
		if(!ok) showMessage("Error",text);
		return ok;
	}
}