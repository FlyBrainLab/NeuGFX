/* 
IOName = "test";

var IOData = {
    inputs: ['a', 'b', 'c'],
    hidden: ['d', 'e', 'f'],
    outputs: ['g', 'h', 'i'],
};
var IOLayers = ['inputs', 'hidden', 'outputs'];
var IOLayerData = {};
var IOSynapses = [];
*/


for (var i = 0; i < IOLayers.length; i++) {
    var newLayer = {};
    newLayer.synapses = [];
    newLayer.wiredSynapses = 0;
    newLayer.feedbackSynapses = 0;
    newLayer.neurons = [];
    IOLayerData[IOLayers[i]] = newLayer;
}

getLayerColor = function(i) {
    if (i == 0)
    return "rgb(230,57,70)";
    if (i == 1)
    return "rgb(27,153,139)";
    if (i == 2)
    return "rgb(35,87,137)";
    if (i == 3)
    return "rgb(239,170,196)";
    if (i == 4)
    return "rgb(215,206,178)";
    if (i == 5)
    return "rgb(234,247,207)";
    // return "rgb(206,181,167)";
    return "rgb(0,189,210)";
}

wireAutomatically = function (IOData) {
    window.IONeurons = {};
    for (var i = 0; i < IOLayers.length; i++) {
        for (var j = 0; j < IOData[IOLayers[i]].length; j++) {
            var newNeuron = {};
            var name = IOData[IOLayers[i]][j];
            newNeuron.layer = IOLayers[i];
            IOLayerData[IOLayers[i]].neurons.push(name);
            newNeuron.layerY = i;
            newNeuron.layerX = j;
            newNeuron.ISynTotal = 0;
            newNeuron.OSynTotal = 0;
            newNeuron.ISyn = 0;
            newNeuron.OSyn = 0;
            newNeuron.ISyns = [];
            newNeuron.OSyns = [];
            newNeuron.postsynapticPartners = 0;
            IONeurons[IOData[IOLayers[i]][j]] = newNeuron;
        }
        //window.IODrawList.push([]);
        //window.ISynapses.push([]);
        //window.OSynapses.push([]);
    }

    /*for (var i = 0; i < IOLayers.length - 1; i++)
        for (var j = 0; j < IOLayerData[IOLayers[i]].neurons.length; j++) {
            for (var k = 0; k < IOLayerData[IOLayers[i + 1]].neurons.length; k++) {
                window.IOSynapses.push([IOLayerData[IOLayers[i]].neurons[j], IOLayerData[IOLayers[i + 1]].neurons[k]]);
            }
        }*/
    //window.IOSynapses.push(['i', 'a']);
    for (var i = 0; i < IOSynapses.length; i++) {
        IONeurons[IOSynapses[i][0]].OSynTotal += 1;
        IONeurons[IOSynapses[i][1]].ISynTotal += 1;
        IOLayerData[IONeurons[IOSynapses[i][1]].layer].synapses.push(IOSynapses[i]);
    }
}

wireAutomatically(IOData);

generatePinMap = function (IOData, IOLayers, IOSynapses, IOName) {
    window._neuGFX.mods.FlyBrainLab.clearSVG();
    var neuronWidth = 128;
    var neuronDX = 2;
    var neuronHeight = 32;

    getNeuronX = function (i, j) { return (i + j * 1.5 + 1) * 160 + 25 }; // Row, Column
    getNeuronY = function (i, j) { return 125 + j * 200 };

    //getNeuronX = function (i) { return 96 + 48 + (i + 1) * 96 + 25 };
    //getNeuronY = function (i) { return 325 };

    svgObj = d3.select(document.querySelector('svg'));
    svgObj.selectAll("*").remove();

    var lineGenerator = d3.line()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; })
        .curve(d3.curveLinear);


    for (var k = 0; k < IOSynapses.length; k++) {
        //console.log(IOSynapses[k][0]);
        //console.log(IONeurons[IOSynapses[k][0]]);
        ii = IONeurons[IOSynapses[k][0]].layerX; ij = IONeurons[IOSynapses[k][0]].layerY;
        ji = IONeurons[IOSynapses[k][1]].layerX; jj = IONeurons[IOSynapses[k][1]].layerY;

        var indx = (1 + IONeurons[IOSynapses[k][0]].OSyn) * neuronWidth / (IONeurons[IOSynapses[k][0]].OSynTotal + 1) - neuronWidth / 2;
        IONeurons[IOSynapses[k][0]].OSyn += 1;
        IONeurons[IOSynapses[k][0]].OSyns.push(IOSynapses[k][1]);
        var outdx = (1 + IONeurons[IOSynapses[k][1]].ISyn) * neuronWidth / (IONeurons[IOSynapses[k][1]].ISynTotal + 1) - neuronWidth / 2;
        IONeurons[IOSynapses[k][1]].ISyn += 1;
        IONeurons[IOSynapses[k][1]].ISyns.push(IOSynapses[k][0]);
        // var indx = 
        //window.ISynapses[i] = window.ISynapses[i] + 1;

        //var outdx = (1 + window.OSynapses[j]) * neuronWidth / (window.OTSynapses[j] + 1) - neuronWidth / 2;
        //window.OSynapses[j] = window.OSynapses[j] + 1;
        var synI = IOLayers[IONeurons[IOSynapses[k][1]].layer].synapses.length;
        var pathData = [];
        var yBreak = (IOLayers[IONeurons[IOSynapses[k][1]].layer].synapses.length - IOLayers[IONeurons[IOSynapses[k][1]].layer].wiredSynapses) / synI * (getNeuronY(ii, jj) - getNeuronY(ii, ij) - 3 * neuronHeight) + getNeuronY(ii, ij) + neuronHeight * 1.5;
        //console.log(yBreak);
        IOLayers[IONeurons[IOSynapses[k][1]].layer].wiredSynapses += 1;
        if ((jj - ij) == 1) {
            pathData.push({ x: getNeuronX(ii, ij) + indx, y: getNeuronY(ii, ij) + neuronHeight / 2 });
            pathData.push({ x: getNeuronX(ii, ij) + indx, y: yBreak });
            pathData.push({ x: getNeuronX(ji, jj) + outdx, y: yBreak });
            pathData.push({ x: getNeuronX(ji, jj) + outdx, y: getNeuronY(ji, jj) - neuronHeight / 2 });
            var lineGraph = svgObj.append("path")
                .attr("d", lineGenerator(pathData))
                .attr("stroke", "rgb(52,67,73)")
                .attr("stroke-width", 1)
                .attr("label", IOSynapses[k][0] + " to " + IOSynapses[k][1])
                .attr("class", "synapse_class")
                .attr("selected", "true")
                .attr("tooltip-data", IOSynapses[k][0] + " to " + IOSynapses[k][1] + " :: " + "This is a synapse.")
                .attr("fill", "none");
        }
        else
        {
            IOLayers[IONeurons[IOSynapses[k][1]].layer].feedbackSynapses +=  0.02;
            var feedbackIdx = IOLayers[IONeurons[IOSynapses[k][1]].layer].feedbackSynapses;
            var yBreakSemi = (IOLayers[IONeurons[IOSynapses[k][1]].layer].synapses.length - IOLayers[IONeurons[IOSynapses[k][1]].layer].wiredSynapses) / synI * (getNeuronY(ii, ij+1) - getNeuronY(ii, ij) - 3 * neuronHeight) + getNeuronY(ii, ij) + neuronHeight * 1.5;
            var yBreak = (IOLayers[IONeurons[IOSynapses[k][1]].layer].synapses.length - IOLayers[IONeurons[IOSynapses[k][1]].layer].wiredSynapses) / synI * (getNeuronY(ii, jj) - getNeuronY(ii, jj-1) - 3 * neuronHeight) + getNeuronY(ii, jj-1) + neuronHeight * 1.5;
            pathData.push({ x: getNeuronX(ii, ij) + indx, y: getNeuronY(ii, ij) + neuronHeight / 2 });
            pathData.push({ x: getNeuronX(ii, ij) + indx, y: yBreakSemi });
            pathData.push({ x: getNeuronX(-1-feedbackIdx, jj), y: yBreakSemi });
            pathData.push({ x: getNeuronX(-1-feedbackIdx, jj), y: yBreak });
            pathData.push({ x: getNeuronX(ji, jj) + outdx, y: yBreak });
            pathData.push({ x: getNeuronX(ji, jj) + outdx, y: getNeuronY(ji, jj) - neuronHeight / 2 });
            var lineGraph = svgObj.append("path")
                .attr("d", lineGenerator(pathData))
                .attr("stroke", "rgb(52,67,73)")
                .attr("stroke-width", 1)
                .attr("label", IOSynapses[k][0] + " to " + IOSynapses[k][1])
                .attr("class", "synapse_class")
                .attr("selected", "true")
                .attr("tooltip-data", IOSynapses[k][0] + " to " + IOSynapses[k][1] + " :: " + "This is a synapse.")
                .attr("fill", "none");
        }
    }

    for (var x in IONeurons) {
        var neuron = svgObj.append("rect")
            .attr("x", getNeuronX(IONeurons[x].layerX, IONeurons[x].layerY) - neuronWidth / 2)
            .attr("y", getNeuronY(IONeurons[x].layerX, IONeurons[x].layerY) - neuronHeight / 2)
            .attr("width", neuronWidth)
            .attr("height", neuronHeight)
            .attr("r", 10)
            .attr("label", x)
            .attr("class", "neuron_class")
            .attr("selected", "true")
            .attr("tooltip-data", x + " :: " + "This is a neuron in layer " + IONeurons[x].layer + ".")
            .style("fill", getLayerColor(IONeurons[x].layerY))
            .text(x);
        var neuronText = svgObj.append("text")
            .attr("x", getNeuronX(IONeurons[x].layerX, IONeurons[x].layerY))
            .attr("y", getNeuronY(IONeurons[x].layerX, IONeurons[x].layerY))
            .attr("dy", ".35em")
            .text(x)
            .style("text-anchor", "middle")
            .style("fill", "#ffffff")
            .style("font", "bold 24px Rajdhani");
    }

    window._neuGFX.mods.FlyBrainLab.addFBLPath(IOName, function () { });
    window._neuGFX.mods.FlyBrainLab.loadNewLPU();
    window._neuGFX.mods.FlyBrainLab.refreshSVG();
    //setTimeout(function () { window._neuGFX.mods.FlyBrainLab.refreshSVG();}, 500);
}

generatePinMap(IOData, IOLayerData, IOSynapses, IOName);


svgObj.selectAll("text").style("pointer-events", "none");

window.fbl.addCircuit(IOName);
window.fbl.circuitName = IOName;
window.fbl.experimentConfig[IOName] = {'disabled': []};

window.updateCircuit = function () {
    window.fbl.experimentConfig[IOName].disabled = [];
    svgObj.selectAll(".neuron_class,.synapse_class").each(function (d, i) {
        if (this.getAttribute("inactive") == "true") {
            window.fbl.experimentConfig[IOName].disabled.push(d3.select(this).attr("label"));
        }
    });
};

window.renewCircuit = function () {
    if (IOName in window.fbl.experimentConfig) {
        if ('disabled' in window.fbl.experimentConfig[IOName]) {
            console.log('Found config: ', window.fbl.experimentConfig[IOName].disabled)
            var arrayLength = window.fbl.experimentConfig[IOName].disabled.length;
            for (var i = 0; i < arrayLength; i++) {
                $(neuron_selector).each(function (index, value) {
                    //console.log(d3.select(this).attr("label"));
                    //console.log(window.fbl.experimentConfig[IOName].disabled[i]);
                    if (d3.select(this).attr("label") == window.fbl.experimentConfig[IOName].disabled[i]) {
                        if ($(this).is('svg g.synapse_class,.synapse_class')) {
                            //console.log('Switched ' + this);
                            //console.log(this);
                            if ($(this).attr('inactive')) {
                                $(this).removeAttr('inactive');
                                var presyn = $(this).attr('presyn');
                                var postsyn = $(this).attr('postsyn');
                                $("svg g.neuron_class").each(function () {
                                    if ($(this).attr("name") == presyn)
                                        $(this).removeAttr('inactive');
                                    if ($(this).attr("name") == postsyn)
                                        $(this).removeAttr('inactive');
                                });
                            } else {
                                $(this).attr('inactive', 'true');
                            }
                            //try { window.updateCircuit(); } catch { };
                        };

                        if ($(this).is('svg g.neuron_class,.neuron_class')) {
                            //console.log('Switched ' + this);
                            if ($(this).attr('inactive')) {
                                $(this).removeAttr('inactive');
                                var neuron = $(this).attr('name');
                                $("svg g.synapse_class").each(function () {
                                    if ($(this).attr("presyn") == neuron)
                                        $(this).removeAttr('inactive');
                                    if ($(this).attr("postsyn") == neuron)
                                        $(this).removeAttr('inactive');
                                });
                            } else {
                                $(this).attr('inactive', 'true');
                                var neuron = $(this).attr('name');
                                $("svg g.synapse_class").each(function () {
                                    if ($(this).attr("presyn") == neuron)
                                        $(this).attr('inactive', 'true');
                                    if ($(this).attr("postsyn") == neuron)
                                        $(this).attr('inactive', 'true');
                                });

                            }
                            //try { window.updateCircuit(); } catch { };
                        };

                    }
                });
            }
        }
    }
    window.updateCircuit();
};




window.simModels = {};
window.simNames = {};
window.simIDs = {};
window.simID = 0;
window.neuron_selector = ".neuron_class, .synapse_class";
$(neuron_selector).each(function (index, value) {
    $(this).attr('simID', index);
    if (typeof window.defaultNeuronModel !== 'undefined') {
        simModels[index] = window.defaultNeuronModel;
        simNames[index] = window.defaultNeuronModelName;
    }
    simModels[index] = {'states': {}, 'params': {}};
    simModels[index].params['name'] = "MorrisLecar";
    simNames[index] = "MorrisLecar";
    simIDs[index] = this;
});

window.reloadModels = function () {
    for (var key in window.fbl.experimentConfig[window.fbl.circuitName]) {
        $(neuron_selector).each(function (index, value) {
            var configName = $(value).attr('tooltip-data').split(" :: ")[0];
            if (key == configName) {
                console.log('Found previous setting for and updated ' + configName + '.');
                window.simModels[$(value).attr('simID')] = window.fbl.experimentConfig[window.fbl.circuitName][key];
                window.simNames[index] = window.fbl.experimentConfig[window.fbl.circuitName][key]['params']['name'];
            }
        });
    }
}

window.reloadModels();

window.getModelData = function (callback) {
    if ($('.NeuGFX-overlay').length) {
        modelData = {};
        $(".modelInput").each(function (index, value) {
            //console.log(this);
            if (!($(this).attr('entryType') in modelData))
                modelData[$(this).attr('entryType')] = {};
            modelData[$(this).attr('entryType')][$(this).attr('name')] = this.value;
        });
        modelData['name'] = $('#modelSelect')[0].value;
        $('.container-fullwidth').removeClass("is-blurred");
        callback();
    }
}

window.createOverlay = function (simID, simModel) {
    var overlay = document.createElement("div");
    overlay.classList.add("NeuGFX-overlay");
    $('.container-fullwidth')[0].classList.add("is-blurred");
    // Create the three rows
    var row = document.createElement("div");
    row.classList.add("NeuGFX-overlay-row");
    overlay.appendChild(row);
    var leftc = document.createElement("div");
    leftc.classList.add("NeuGFX-overlay-column");
    row.appendChild(leftc);
    var middlec = document.createElement("div");
    middlec.classList.add("NeuGFX-overlay-column");
    row.appendChild(middlec);
    var rightc = document.createElement("div");
    rightc.classList.add("NeuGFX-overlay-column");
    row.appendChild(rightc);
    // Create the Selection List
    h4 = document.createElement("h4");
    h4.textContent = "Model Library";
    leftc.appendChild(h4);
    var selectList = document.createElement("select");
    selectList.id = "modelSelect";
    $(selectList).css({ 'min-width': '60%' });
    leftc.appendChild(selectList);
    for (var i = 0; i < _NKModelNames.length; i++) {
        var option = document.createElement("option");
        option.value = _NKModelNames[i];
        option.text = _NKModelNames[i];
        selectList.appendChild(option);
    }
    $(selectList).on('change', function () {
        modelName = $('#modelSelect')[0].value;
        for (var modelFamily in _NKModels) {
            for (var model in _NKModels[modelFamily]) {
                if (model == modelName) {
                    data = _NKModels[modelFamily][model];
                    simModels[simID] = data;
                    simModels[simID].params['name'] = model;
                    simNames[simID] = model;
                    simModel = simModels[simID];
                    getModelData(function () { $('.NeuGFX-overlay').remove(); createOverlay(simID, simModel); });
                    console.log(simIDs[simID]);
                    var configName = $(simIDs[simID]).attr('tooltip-data').split(" :: ")[0];
                    window.fbl.experimentConfig[window.fbl.circuitName][configName] = simModel;
                }
            }
        }
    })
    // Create the headers for the overlay
    h4 = document.createElement("h4");
    h4.textContent = "States";
    leftc.appendChild(h4);
    h4 = document.createElement("h4");
    h4.textContent = "Model Parameters";
    middlec.appendChild(h4);
    h4 = document.createElement("h4");
    h4.textContent = "Model Definition";
    rightc.appendChild(h4);
    // Add the states and Parameters
    data = simModel;
    selectList.value = simNames[simID];
    for (var state in data.states) {
        h6 = document.createElement("h6");
        h6.textContent = state;
        leftc.appendChild(h6);
        var inputElement = document.createElement("input");
        inputElement.setAttribute('type', "text");
        inputElement.setAttribute('name', state);
        inputElement.setAttribute('entryType', "states");
        inputElement.classList.add("modelInput");
        $(inputElement).css({ 'min-width': '60%' });
        inputElement.value = data['states'][state];
        leftc.appendChild(inputElement);
    }

    for (var param in data.params) {
        if (param != "name") {
            h6 = document.createElement("h6");
            h6.textContent = param;
            middlec.appendChild(h6);
            var inputElement = document.createElement("input");
            inputElement.setAttribute('type', "text");
            inputElement.setAttribute('name', param);
            inputElement.setAttribute('entryType', "params");
            inputElement.classList.add("modelInput");
            $(inputElement).css({ 'min-width': '60%' });
            inputElement.value = data['params'][param];
            middlec.appendChild(inputElement);
        }
    }

    // Add the overlay closing functionality
    document.body.appendChild(overlay);
    $('.NeuGFX-overlay').on('click', function (e) {
        e.stopPropagation();
    });
    $(document).on('click', function (event) {
        getModelData(function () { $('.NeuGFX-overlay').remove(); });
    });
}

$(neuron_selector).on("click contextmenu", function (e) {
    getModelData(function () { $('.NeuGFX-overlay').remove(); });
    e.preventDefault();
    simID = $(this).attr('simID');
    simModel = simModels[simID];
    if (e.type == "contextmenu") {
        // Create the Overlay Div
        createOverlay(simID, simModel);
    }
});

window.renewCircuit();



// Add hover highlights
$(neuron_selector).hover(function(){
    myLabel = $(this).attr("label");
    
        for (var i = 0; i < IONeurons[myLabel].ISyns.length; i++) {
            $(neuron_selector).each(function () {
                if ($(this).attr("label") == IONeurons[myLabel].ISyns[i]) {
                    $(this).addClass("active");
                }
            });
        }
        for (var i = 0; i < IONeurons[myLabel].OSyns.length; i++) {
            $(neuron_selector).each(function () {
                if ($(this).attr("label") == IONeurons[myLabel].OSyns[i]) {
                    $(this).addClass("active");
                }
            });
        }
        
    }, function(){

        for (var i = 0; i < IONeurons[myLabel].ISyns.length; i++) {
            $(neuron_selector).each(function () {
                if ($(this).attr("label") == IONeurons[myLabel].ISyns[i]) {
                    $(this).removeClass("active");
                }
            });
        }
        for (var i = 0; i < IONeurons[myLabel].OSyns.length; i++) {
            $(neuron_selector).each(function () {
                if ($(this).attr("label") == IONeurons[myLabel].OSyns[i]) {
                    $(this).removeClass("active");
                }
            });
        }

  });



window.toggleByDiagramName = function (o, type) {
    console.log(o, type);
    Object.keys(o).forEach(function(name) {
        name = '"' + name.split(' :: ')[0] + '"';
        console.log(name);
        if (type == "true") {
            window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPaddByUname', uname: name });
            }
            if (type == "false") {
            window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPremoveByUname', uname: name });
            }
        });
};