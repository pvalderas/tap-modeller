import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { showMessage } from '../dialogs/MessageDialog';
import DataObject from './DataObject.js';

export default class BPMN2Java{

	constructor(modeler) {
		this.modeler=modeler;
		this.dataObject=new DataObject();
		this.downloadJava=this.downloadJava.bind(this);
		this.IoTDevices=[];
	}

	generateJava(devices){
		if(devices.length>0){
			let zip = new JSZip();
			
			devices.forEach(function(device,index){


				let className=device.name.replaceAll(" ","");



				/*****************************************************/
				//IoT Device Main Class
				/*****************************************************/

				let mainClassContent='package '+className.toLowerCase()+';\r\n';

				mainClassContent+='import org.springframework.boot.ApplicationRunner;\r\n';
				mainClassContent+='import org.springframework.boot.SpringApplication;\r\n';
				mainClassContent+='import org.springframework.boot.autoconfigure.SpringBootApplication;\r\n';
				mainClassContent+='import org.springframework.context.annotation.Bean;\r\n';
				mainClassContent+='import org.springframework.core.env.Environment;\r\n';
				mainClassContent+='import org.springframework.http.MediaType;\r\n';
				mainClassContent+='import org.springframework.web.client.RestClient;\r\n\r\n';

				mainClassContent+='@SpringBootApplication\r\npublic class '+className+' {\r\n	public static void main(String[] args) {\r\n		SpringApplication.run('+className+'.class, args);\r\n	}\r\n';

				mainClassContent+='\r\n';

				mainClassContent+='	@Bean\r\n';
			    mainClassContent+='	ApplicationRunner applicationRunner(Environment environment) {\r\n';
			    mainClassContent+='	    return args -> {\r\n';
			    mainClassContent+='			String registryUrl=environment.getProperty("registry.url");\r\n';
				mainClassContent+='			if(registryUrl!=null){\r\n';
				mainClassContent+='				String microserviceName=environment.getProperty("spring.application.name");\r\n';
			    mainClassContent+='				String ip=environment.getProperty("server.address");\r\n';
				mainClassContent+='				String port=environment.getProperty("server.port");\r\n';
				mainClassContent+='				String protocol="http";\r\n';
				mainClassContent+='				RestClient restClient = RestClient.create();\r\n';
				mainClassContent+='				restClient.put().uri(registryUrl)\r\n';
				mainClassContent+='					.contentType(MediaType.APPLICATION_JSON)\r\n';
				mainClassContent+='					.body(new String("{\\"name\\":\\""+microserviceName+"\\",\\"ip\\":\\""+ip+"\\",\\"port\\":"+port+",\\"protocol\\":\\""+protocol+"\\"}"))\r\n';
			    mainClassContent+='					.retrieve().toBodilessEntity();\r\n';
			    mainClassContent+='			}\r\n';
			    mainClassContent+='	    };\r\n';
			    mainClassContent+='	}\r\n';
			    mainClassContent+='}\r\n';

				zip.file(className+"/src/main/java/"+className.toLowerCase()+"/"+className+".java", mainClassContent);




				/*****************************************************/
				//IoT Device Actuator
				/*****************************************************/

				let actuatorClass='package '+className.toLowerCase()+';\r\n';

				actuatorClass+='import org.springframework.web.bind.annotation.RequestMapping;\r\n';
				actuatorClass+='import org.springframework.web.bind.annotation.RequestMethod;\r\n';
				actuatorClass+='import org.springframework.web.bind.annotation.RestController;\r\n';
				actuatorClass+='import org.springframework.web.client.RestClient;\r\n';
				actuatorClass+='import '+className.toLowerCase()+'.results.*;\r\n\r\n';

				actuatorClass+='@RestController\r\npublic class '+className+'Actuator {\r\n\r\n';
				device.operations.forEach(function(operation){
					let operationName=operation.name.charAt(0).toUpperCase()+operation.name.substring(1);
					operationName=operationName.replaceAll(" ","");
					actuatorClass+='	@RequestMapping(value="'+operation.path+'",\r\n';
					actuatorClass+='					method=RequestMethod.'+(operation.method?operation.method:"GET")+',\r\n';
					actuatorClass+='					produces="application/json"';
					if(operation.method=="POST" || operation.method=="PUT"){
						actuatorClass+=',\r\n';
						actuatorClass+='					consumes="application/json")\r\n';
					}else{
						actuatorClass+=')\r\n';
					}
					actuatorClass+='	public String '+operationName.toLowerCase()+'(';
					if(operation.method=="POST" || operation.method=="PUT") actuatorClass+='String input';
					/*if(operation.inputs.length>0){
						let args="";
						operation.inputs.forEach(function(input){
							args+=input.schema+' '+input.name+',';
						});
						args=args.substring(0,args.length-1);
						actuatorClass+=args;
					}*/
					actuatorClass+='){\r\n';
					actuatorClass+='		String result ="";\r\n';
					actuatorClass+='/*\r\n';
					switch(operation.method){
						case "GET": actuatorClass+='		result=restClient.get().uri("'+operation.baseUri+operation.path+'").retrieve().body(String.class);\r\n';break;
						case "POST": actuatorClass+='		result=restClient.post().uri("'+operation.baseUri+operation.path+'").contentType(MediaType.APPLICATION_JSON).body(input).retrieve().toBodilessEntity();\r\n';break;
						case "PUT": actuatorClass+='		result=restClient.put().uri("'+operation.baseUri+operation.path+'").contentType(MediaType.APPLICATION_JSON).body(input).retrieve().toBodilessEntity();\r\n';break;
						case "DELETE": actuatorClass+='		result=restClient.delete().uri("'+operation.baseUri+operation.path+'").retrieve().toBodilessEntity();\r\n';break;
						default: actuatorClass+='		result=restClient.get().uri("'+operation.baseUri+operation.path+'").retrieve().body(String.class);\r\n';break;
					}
					actuatorClass+='*/\r\n';
					actuatorClass+='		result="{\\"message\\":\\"Operation '+operationName+' Executed\\"}";\r\n';
					actuatorClass+='		System.out.println("Operation '+operationName+' Executed");\r\n';
					actuatorClass+='		return new '+operationName+'Result().parseResult(result);\r\n';
					actuatorClass+='	}\r\n\r\n';
				});
				actuatorClass+='}';
				zip.file(className+"/src/main/java/"+className.toLowerCase()+"/"+className+"Actuator.java", actuatorClass);


				/*****************************************************/
				//Result classes for IoT Device's operations
				/*****************************************************/
				device.operations.forEach(function(operation){

					let resultClass='package '+className.toLowerCase()+'.results;\r\n';
					resultClass+='import org.json.JSONObject;\r\n\r\n';

					let operationName=operation.name.charAt(0).toUpperCase()+operation.name.substring(1);
					operationName=operationName.replaceAll(" ","");

					resultClass+='public class '+operationName+'Result {\r\n';
					if(operation.outputs.length>0){
						operation.outputs.forEach(function(output){
							resultClass+='	private '+output.schema.charAt(0).toUpperCase()+output.schema.substring(1)+' '+output.name+';\r\n';
						});
					}
					resultClass+='\r\n';
					resultClass+='	public String parseResult(String result){\r\n';
					resultClass+='		JSONObject resultJSON=new JSONObject(result);\r\n';
					if(operation.outputs.length>0){
						operation.outputs.forEach(function(output){
							resultClass+='		resultJSON.put["'+output.name+'"]=result[""];\r\n';
						});
					}
					resultClass+='		return resultJSON.toString();\r\n';
					resultClass+='	}';
					resultClass+='\r\n}';

					zip.file(className+"/src/main/java/"+className.toLowerCase()+"/results/"+operationName+"Result.java", resultClass);

				});


				/*****************************************************/
				//Property File
				/*****************************************************/
				let propertyFile="spring.application.name="+device.name+"\r\n";
				propertyFile+="server.port=808"+index+"\r\n";
				propertyFile+="server.address=localhost\r\n";
				propertyFile+="registry.url=https://pedvalar.webs.upv.es/microservices/host\r\n";

				zip.file(className+"/src/main/resources/application.properties", propertyFile);


				/*****************************************************/
				//Gradle Build
				/*****************************************************/
				let gradleBuildFile="plugins {\r\n";
				gradleBuildFile+="	id 'java'\r\n";
				gradleBuildFile+="	id 'org.springframework.boot' version '3.4.0-SNAPSHOT'\r\n";
				gradleBuildFile+="	id 'io.spring.dependency-management' version '1.1.6'\r\n";
				gradleBuildFile+="}\r\n\r\n";

				gradleBuildFile+="group = 'es.upv.pros.pvalderas'\r\n";
				gradleBuildFile+="version = '0.0.1-SNAPSHOT'\r\n\r\n";

				gradleBuildFile+="java {\r\n";
				gradleBuildFile+="	toolchain {\r\n";
				gradleBuildFile+="		languageVersion = JavaLanguageVersion.of(17)\r\n";
				gradleBuildFile+="	}\r\n";
				gradleBuildFile+="}\r\n\r\n";

				gradleBuildFile+="repositories {\r\n";
				gradleBuildFile+="	mavenCentral()\r\n";
				gradleBuildFile+="	maven { url 'https://repo.spring.io/milestone' }\r\n";
				gradleBuildFile+="	maven { url 'https://repo.spring.io/snapshot' }\r\n";
				gradleBuildFile+="}\r\n\r\n";

				gradleBuildFile+="dependencies {\r\n";
				gradleBuildFile+="	implementation 'org.springframework.boot:spring-boot-starter'\r\n";
				gradleBuildFile+="	implementation 'org.springframework.boot:spring-boot-starter-web'\r\n";
				gradleBuildFile+="	implementation 'org.json:json:20240303'\r\n";
				gradleBuildFile+="	implementation 'com.rabbitmq:amqp-client:5.23.0'\r\n\r\n";

				gradleBuildFile+="	testImplementation 'org.springframework.boot:spring-boot-starter-test'\r\n";
				gradleBuildFile+="	testRuntimeOnly 'org.junit.platform:junit-platform-launcher'\r\n";
				gradleBuildFile+="}\r\n\r\n";

				gradleBuildFile+="tasks.named('test') {\r\n";
				gradleBuildFile+="	useJUnitPlatform()\r\n";
				gradleBuildFile+="}\r\n\r\n";

				gradleBuildFile+="tasks.named('bootJar') {\r\n";
				gradleBuildFile+="	archiveFileName.set('"+className.toLowerCase()+"_iot_gateway_microservice.jar')\r\n";
				gradleBuildFile+="}\r\n";

				zip.file(className+"/build.gradle", gradleBuildFile);


				/*****************************************************/
				//Gradle Settings
				/*****************************************************/
				let gradleSettingsFile="pluginManagement {\r\n";
				gradleSettingsFile+="	repositories {\r\n";
				gradleSettingsFile+="		maven { url 'https://repo.spring.io/milestone' }\r\n";
				gradleSettingsFile+="		maven { url 'https://repo.spring.io/snapshot' }\r\n";
				gradleSettingsFile+="		gradlePluginPortal()\r\n";
				gradleSettingsFile+="	}\r\n";
				gradleSettingsFile+="}\r\n";
				gradleSettingsFile+="rootProject.name = '"+className.toLowerCase()+"'\r\n";

				zip.file(className+"/settings.gradle", gradleSettingsFile);


				/*****************************************************/
				//Docker File
				/*****************************************************/
				let dockerFile='FROM arm64v8/eclipse-temurin:21\r\n';
				dockerFile+='RUN mkdir /opt/app\r\n';
				dockerFile+='COPY '+className.toLowerCase()+'_iot_gateway_microservice.jar /opt/app\r\n';
				dockerFile+='CMD ["java", "-jar", "'+className.toLowerCase()+'_iot_gateway_microservice.jar"]\r\n';
				dockerFile+='EXPOSE 8080\r\n';

				zip.file(className+"/Dockerfile", dockerFile);
			});


			/*****************************************************/
			//Docker Compose
			/*****************************************************/
			let dockerCompos='version: "3.9"\r\n';
			dockerCompos+='services:\r\n';
			devices.forEach(function(device,index){
				let deviceName=device.name.replaceAll(" ","");
				dockerCompos+='  '+deviceName.toLowerCase()+':\r\n';
				dockerCompos+='    container_name: '+deviceName.toLowerCase()+'\r\n';
				dockerCompos+='    build: ./IoTDeviceGateWays/'+deviceName+'\r\n';
				dockerCompos+='    expose:\r\n';
				dockerCompos+='      - "8080"\r\n';
			});

			dockerCompos+='  camunda:\r\n';
			dockerCompos+='      build: ./CamundaServer\r\n';
			dockerCompos+='      platform: linux/amd64  #<-- For Mac with M1 Chip\r\n';
			dockerCompos+='      ports:\r\n';
			dockerCompos+='        - "8080:8080"\r\n';
			dockerCompos+='      volumes:\r\n';
			dockerCompos+='        - "./BPMN:/camunda/configuration/resources"\r\n';


		  	zip.file("/docker-compose.yml", dockerCompos);
			
		
			zip.generateAsync({type: "blob"}).then(function(content) {
			  FileSaver.saveAs(content, localStorage.getItem("selectedSystem")+".zip");
			});
		}
		else{
			showMessage("Attention","There are not IoT Devices to be exported.");
		}
	}

	async addWoT(name){
		let response=await fetch("https://pedvalar.webs.upv.es/microservicesEmu/wot/getWoTDescription.php?name="+name.replaceAll(" ","_"));
		let wot=await response.json();

		let operations=[];

		if(wot.actions!=undefined){
			Object.keys(wot.actions).forEach(function(actionName){
				let url=wot.actions[actionName].forms.filter((form) => form.href!=undefined);
				let baseUri=wot.base;
				if(url[0]) url=url[0].href;
				operations.push({
					name:actionName,
					inputs: [],
					outputs: [],
					baseUri: baseUri,
					path: url
				});
			});
		}

		if(wot.properties!=undefined){
			Object.keys(wot.properties).forEach(function(propName){
				let url=wot.properties[propName].forms.filter((form) => form.href!=undefined);
				let baseUri=wot.base;
				if(url[0]) url=url[0].href;
				operations.push({
					name:"set"+propName.charAt(0).toUpperCase()+propName.slice(1),
					method:"POST",
					inputs: [],
					outputs: [],
					baseUri: baseUri,
					path: url
				});

				operations.push({
					name:"get"+propName.charAt(0).toUpperCase()+propName.slice(1),
					inputs: [],
					outputs: [],
					baseUri: baseUri,
					path: url
				});
			});
		}

		this.IoTDevices.push({
			"name":wot.title,
			"operations":operations
		})

	}

	downloadJava(){

		this.IoTDevices=[];

		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
		
		let _this=this;

		let llamadas=[];
		let devicesToGenerate=[];
		definitions.rootElements.forEach(function(element,index){
				if (element.$type=="bpmn:Collaboration"){
					
					element.participants.forEach(function(participant,index){
					
						if(participant.name!="PHYSICAL WORLD" && participant.processRef){
							jQuery.each(participant.processRef.flowElements,function(index, element){
								if(element.$type=="bpmn:ServiceTask" || element.$type=="bpmn:UserTask" ){
									if(element.extensionElements){
										let devices=element.extensionElements.values.filter((field)=> field.name=='device');
										if(devices.length>0){
											let deviceField=devices[0].stringValue;
											let deviceNames=deviceField.split(";");
											for(let i=1; i<deviceNames.length;i++){
												if(!devicesToGenerate.includes(deviceNames[i])){
													llamadas.push(_this.addWoT(deviceNames[i]));
													devicesToGenerate.push(deviceNames[i]);
												}
											}
										}
									}
								}
							});
						}
					});
				}
		});

		Promise.all(llamadas).then(reponse=>{this.generateJava(this.IoTDevices);})
	}
}

 