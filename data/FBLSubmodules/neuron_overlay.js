const NEURON_OVERLAY_CLASSNAME = "neuron-overlay";

class NeuronOverlay{
    constructor(modelData, parentDiv){
        if (parentDiv === undefined){
            this.parentDiv = document.createElement('div');
        }
        this.value = modelData;
        this.update(); // render
        this.table = document.createElement('div');
        this.table.className = NEURON_OVERLAY_CLASSNAME;
        /** in CSS for this object, */
        // .neuron-overlay {
        // }
    }

    get value(){
        return this.value;
    }

    set value(newData){
        this.value = newData;
        this.update();
    }

    /** close overlay */ 
    close(){

    }

    /** show overlay */ 
    show(){

    }

    /**
     * Re-render overlay
     */
    update(){
        // render logic based on this.value

        // var overlay = document.createElement("div");
        // overlay.classList.add('NeuGFX-overlay');

        // var baseRow = getBaseRow(modelId);
        // overlay.appendChild(baseRow);

        // var headingRow = getHeadingRow(modelId);
        // overlay.append(headingRow);

        // var infoRow = getInfoRow(modelId);
        // overlay.appendChild(infoRow);

        // var descriptionRow = getDescriptionRow(modelId);
        // overlay.append(descriptionRow);

        // $('.NeuGFX-overlay').on('click', function (e) {
        //     e.stopPropagation();
        // });
        // $(document).on('click', function (event) {
        //     //getModelData(function () { $('.NeuGFX-overlay').remove(); });
        //     $('.NeuGFX-overlay').remove();
        // });
        // document.body.appendChild(overlay);
    }
}


const HTML_TEMPLATE = "
<>
"

/**Example Application */
var neuronData = {...};
var neuronOverlay = new NeuronOverlay(neuronData);


// where you start
<div id="myDiv">
</div>

// run
var neuronData = {...};
var neuronOverlay = new NeuronOverlay(neuronData, "myDiv");

// where you end
<div id="myDiv">
    <div> 
        // this is the child content
    </div>
</div>