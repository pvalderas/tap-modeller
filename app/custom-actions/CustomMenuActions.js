import inherits from 'inherits';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';


export default function CustomContextPadProvider() {
    
}

inherits(CustomContextPadProvider, ContextPadProvider);


const _getContextPadEntries = ContextPadProvider.prototype.getContextPadEntries;

ContextPadProvider.prototype.getContextPadEntries = function (element) {
    const entries = _getContextPadEntries.apply(this,[element]);

    if(sessionStorage.getItem("linking")=="1"){
    		if(is(element, "bpmn:DataObjectReference"))
    				return  {
    					connect:entries.connect,
    					delete:entries.delete
    				};
    		else if(is(element, "bpmn:ServiceTask"))
    				return  {
    					connect:entries.connect
    				};
    		else if(is(element, "bpmn:DataOuputAssociation") || is(element, "bpmn:DataInputAssociation"))
    				return  {
    					delete:entries.delete
    				};
            else return  {};
    
    }else{
            return  entries;
    }

}

