import inherits from 'inherits';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider';


export default function CustomPaletteProvider() {
    
}

//inherits(CustomPaletteProvider, PaletteProvider);

const _getPaletteEntries = PaletteProvider.prototype.getPaletteEntries;

PaletteProvider.prototype.getPaletteEntries = function (element) {
    const entries = _getPaletteEntries.apply(this,[element]);

    if(sessionStorage.getItem("linking")==1){
    		let linkEntries={
    			"hand-tool":entries["hand-tool"],
    			"lasso-tool":entries["lasso-tool"],
    			"space-tool":entries["space-tool"],
    			"global-connect-tool":entries["global-connect-tool"],
    			"tool-separator":entries["tool-separator"],
    			"create.data-object":entries["create.data-object"]
    		}
            return  linkEntries;
    }else{
            return  entries;
    }

}

