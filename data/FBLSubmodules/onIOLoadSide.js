
window.fbl.circuitName = 'antenna';
window.IOName = 'Antenna';

window.sendExperimentConfig = function () {
    var experimentConfig = JSON.stringify(window._neuGFX.mods.FlyBrainLab.experimentConfig);
    window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'loadExperimentConfig', config: experimentConfig });
}
if (typeof window.IOData !== 'undefined') {

}
else
{
    window.IOData = {
        inputs: ["Ir31a", "Ir41a", "Ir64a.DC4", "Ir64a.DP1m", "Ir75a", "Ir75d", "Ir76a", "Ir84a", "Ir92a", "Or1a", "Or2a", "Or7a", "Or9a", "Or10a", "Or13a", "Or19a", "Or22a", "Or22b", "Or23a", "Or30a", "Or33a", "Or33b", "Or33c", "Or35a", "Or42a", "Or42b", "Or43a", "Or43b", "Or45a", "Or45b", "Or46a", "Or47a", "Or47b", "Or49a", "Or49b", "Or59a", "Or59b", "Or59c", "Or65a", "Or67a", "Or67b", "Or67c", "Or69a", "Or71a", "Or74a", "Or82a", "Or83c", "Or85a", "Or85b", "Or85c", "Or85d", "Or85e", "Or85f", "Or88a", "Or92a", "Or94a", "Or94b", "Or98a"],
        outputs: []
    };
}

var IOSynapses = [];

var IOActivities = {
    a: [0.2, 0.5, 0.8, 0.0, 0.1]
};
IOActivityLen = 4;


console.log(window.fbl.experimentConfig['antenna']);

if ('antenna' in window.fbl.experimentConfig) {} else {
    window.fbl.experimentConfig['antenna'] = {};
    window.fbl.experimentConfig['antenna'].updated = [];
}

console.log(window.fbl.experimentConfig['antenna']);

wireAutomatically = function (IOData) {
    window.IOSynapses = [];
    window.ISynapses = [];
    window.OSynapses = [];
    window.ITSynapses = [];
    window.OTSynapses = [];
    for (var i = 0; i < IOData.inputs.length; i++)
        window.ISynapses.push(0);
    for (var j = 0; j < IOData.outputs.length; j++)
        window.OSynapses.push(0);

    for (var i = 0; i < IOData.inputs.length; i++)
        window.ITSynapses.push(IOData.outputs.length);
    for (var j = 0; j < IOData.outputs.length; j++)
        window.OTSynapses.push(IOData.inputs.length);

    for (var i = 0; i < IOData.inputs.length; i++)
        for (var j = 0; j < IOData.outputs.length; j++) {
            if (IOData.inputs[i] != IOData.outputs[j]) { // There are no autapses
                window.IOSynapses.push([IOData.inputs[i], IOData.outputs[j]]);
            }
        }
}

wireAutomatically(IOData);

generatePinMap = function (IOData, IOSynapses, IOName) {
    window._neuGFX.mods.FlyBrainLab.clearSVG();
    var neuronWidth = 120;
    var neuronDX = 2;
    var neuronHeight = 30;

    neuronInY = function (i) { return (i + 1) * 18 + 25 };
    neuronInX = function (i) { return 125  + neuronWidth * 2.5 * (i % 2)};

    neuronOutY = function (i) { return 96 + 48 + (i + 1) * 34 + 25 };
    neuronOutX = function (i) { return 325 };

    svgObj = d3.select(document.querySelector('svg'));
    svgObj.selectAll("*").remove();

    var lineGenerator = d3.line()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; })
        .curve(d3.curveLinear);

    var synI = IOSynapses.length + 1;
    for (var k = 0; k < IOSynapses.length; k++) {
        i = IOData.inputs.findIndex(x => x === IOSynapses[k][0]);
        j = IOData.outputs.findIndex(x => x === IOSynapses[k][1]);

        var indx = (1 + window.ISynapses[i]) * neuronWidth / (window.ITSynapses[i] + 1)/2 - neuronWidth / 2;
        window.ISynapses[i] = window.ISynapses[i] + 1;

        var outdx = (1 + window.OSynapses[j]) * neuronWidth / (window.OTSynapses[j] + 1)/2 - neuronWidth / 2;
        window.OSynapses[j] = window.OSynapses[j] + 1;

        var pathData = [];
        var yBreak = (IOSynapses.length - k) / synI * (neuronOutY(j) - neuronInY(i) - neuronHeight) + neuronInY(i) + neuronHeight / 2;
        pathData.push({ x: neuronInX(i) + indx, y: neuronInY(i) + neuronHeight / 2 });
        pathData.push({ x: neuronInX(i) + indx, y: yBreak });
        pathData.push({ x: neuronOutX(j) + outdx, y: yBreak });
        pathData.push({ x: neuronOutX(j) + outdx, y: neuronOutY(j) - neuronHeight / 2 });
        // .attr("label", IOData.inputs[i] + " to " + IOData.outputs[j])
        var lineGraph = svgObj.append("path")
            .attr("d", lineGenerator(pathData))
            .attr("stroke", "rgb(52,67,73)")
            .attr("stroke-width", 2)
            .attr("label", IOData.inputs[i] + "->" + IOData.outputs[j] + "_in_" + window.IOName)
            .attr("class", "synapse_class")
            .attr("selected", "true")
            .attr("tooltip-data", IOData.inputs[i] + " to " + IOData.outputs[j] + " in " + window.IOName + " :: " + "This is a synapse.")
            .attr("fill", "none");
    }

    for (var i = 0; i < IOData.inputs.length; i++) {
        var neuron = svgObj.append("rect")
            .attr("x", neuronInX(i) - neuronWidth / 2)
            .attr("y", neuronInY(i) - neuronHeight / 2)
            .attr("width", neuronWidth)
            .attr("height", neuronHeight)
            .attr("r", 10)
            .attr("label", IOData.inputs[i])
            .attr("class", "neuron_class")
            .attr("selected", "true")
            .attr("tooltip-data", IOData.inputs[i] + " :: " + "This is an OTP Node.")
            .style("fill", "rgb(0,189,210)")
            .text(IOData.inputs[i]);
        var neuron_line = svgObj.append("line")
            .attr("x1", neuronInX(i) - 1.5 * neuronWidth / 2)
            .attr("y1", neuronInY(i))
            .attr("x2", neuronInX(i) - neuronWidth / 2)
            .attr("y2", neuronInY(i))
            .attr("label", IOData.inputs[i])
            .attr("class", "neuron_class2")
            .attr("selected", "true")
            .attr("tooltip-data", IOData.inputs[i] + " :: " + "This is an OTP Node.")
            .style("stroke", "rgb(0,189,210)")
            .style("stroke-width", "2")
            .text(IOData.inputs[i]);
        var neuron_line2 = svgObj.append("line")
            .attr("x1", neuronInX(i) + neuronWidth / 2)
            .attr("y1", neuronInY(i))
            .attr("x2", neuronInX(i) + neuronWidth - neuronHeight/2)
            .attr("y2", neuronInY(i))
            .attr("label", IOData.inputs[i])
            .attr("class", "neuron_class2")
            .attr("selected", "true")
            .attr("tooltip-data", IOData.inputs[i] + " :: " + "This is an OSN BSG coupled to the OTP.")
            .style("stroke", "rgb(0,189,210)")
            .style("stroke-width", "2")
            .text(IOData.inputs[i]);
        var neuron_circle = svgObj.append("circle")
            .attr("cx", neuronInX(i)+neuronWidth)
            .attr("cy", neuronInY(i))
            .attr("r", neuronHeight/2+1)
            .attr("label", IOData.inputs[i] + ' BSG')
            .attr("class", "neuron_class")
            .attr("selected", "true")
            .attr("tooltip-data", IOData.inputs[i] + ' BSG' + " :: " + "This is an OSN BSG coupled to the OTP.")
            .style("fill", "rgb(0,189,210)")
            .text(IOData.inputs[i]);
        var neuronText2 = svgObj.append("text")
            .attr("x", neuronInX(i)+neuronWidth)
            .attr("y", neuronInY(i)+1)
            .attr("dy", ".32em")
            .text('BSG')
            .style("text-anchor", "middle");
        var neuronText = svgObj.append("text")
            .attr("x", neuronInX(i))
            .attr("y", neuronInY(i))
            .attr("dy", ".32em")
            .text(IOData.inputs[i])
            .style("text-anchor", "middle");
    }

    for (var i = 0; i < IOData.outputs.length; i++) {
        var neuron = svgObj.append("rect")
            .attr("x", neuronOutX(i) - neuronWidth / 2)
            .attr("y", neuronOutY(i) - neuronHeight / 2)
            .attr("width", neuronWidth)
            .attr("height", neuronHeight)
            .attr("r", 10)
            .attr("label", IOData.outputs[i])
            .attr("class", "neuron_class")
            .attr("selected", "true")
            .attr("tooltip-data", IOData.outputs[i] + " :: " + "This is a postsynaptic neuron.")
            .style("fill", "rgb(248,1,86)")
            .text(IOData.inputs[i]);
        var neuronText = svgObj.append("text")
            .attr("x", neuronOutX(i))
            .attr("y", neuronOutY(i))
            .attr("dy", ".35em")
            .text(IOData.outputs[i])
            .style("text-anchor", "middle");
    }
    window._neuGFX.mods.FlyBrainLab.addFBLPath(IOName, function () { });
    window._neuGFX.mods.FlyBrainLab.loadNewLPU();
    window._neuGFX.mods.FlyBrainLab.refreshSVG();
    //setTimeout(function () { window._neuGFX.mods.FlyBrainLab.refreshSVG();}, 500);
}

generatePinMap(IOData, IOSynapses, IOName);


svgObj.selectAll("text").style("pointer-events", "none");

window.fbl.addCircuit(IOName);
// window.fbl.circuitName = 'cx';
window.parentNeuropil = 'antenna';
$('.fbl-info-container').hide();

window.updateCircuit = function () {
    // window.fbl.experimentConfig[IOName].disabled = [];
    svgObj.selectAll(".neuron_class,.synapse_class").each(function (d, i) {
        if (this.getAttribute("inactive") == "true") {
            var index = window.fbl.experimentConfig[parentNeuropil].disabled.indexOf(d3.select(this).attr("label"));
            if (index == -1) {
                window.fbl.experimentConfig[parentNeuropil].disabled.push(d3.select(this).attr("label"));
            }
        }
        if (this.getAttribute("inactive") == "false") {
            var index = window.fbl.experimentConfig[parentNeuropil].disabled.indexOf(d3.select(this).attr("label"));
            if (index > -1) {
                window.fbl.experimentConfig[parentNeuropil].disabled.splice(index, 1);
            }
        }
    });
    window.sendExperimentConfig();
};

window.renewCircuit = function () {
    if (parentNeuropil in window.fbl.experimentConfig) {
        if ('disabled' in window.fbl.experimentConfig[parentNeuropil]) {
            console.log('Found config: ', window.fbl.experimentConfig[parentNeuropil].disabled)
            var arrayLength = window.fbl.experimentConfig[parentNeuropil].disabled.length;
            for (var i = 0; i < arrayLength; i++) {
                $(neuron_selector).each(function (index, value) {
                    //console.log(d3.select(this).attr("label"));
                    //console.log(window.fbl.experimentConfig[IOName].disabled[i]);
                    // console.log(window.fbl.experimentConfig[parentNeuropil].disabled[i]);
                    if (d3.select(this).attr("label") == window.fbl.experimentConfig[parentNeuropil].disabled[i]) {
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
    if ($(this).attr('tooltip-data').includes('BSG')) {
        simModels[index] = _NKModels.PointNeuronModels.ConnorStevens;
        simModels[index].params['name'] = "FlyBSG";
        simNames[index] = "ConnorStevens";
        simIDs[index] = this;
    }
    else
    {
        simModels[index] = _NKModels.TransductionModels.FlyTransducer;
        simModels[index].params['name'] = "FlyTransducer";
        simNames[index] = "FlyTransducer";
        simIDs[index] = this;
    }
});

window.reloadModels = function () {
    for (var key in window.fbl.experimentConfig[window.fbl.circuitName]) {
        $(neuron_selector).each(function (index, value) {
            var configName = $(simIDs[index]).attr('tooltip-data').split(" :: ")[0];
            if (key == configName) {
                console.log('Found previous setting for and updated ' + configName + '.');
                window.simModels[$(value).attr('simID')] = window.fbl.experimentConfig[window.fbl.circuitName][key];
                window.simNames[index] = window.fbl.experimentConfig[window.fbl.circuitName][key]['params']['name'];
            }
        });
    }
}

window.reloadModels();

$(neuron_selector).each(function (index, value) {
    var configName = $(simIDs[index]).attr('tooltip-data').split(" :: ")[0];
    window.fbl.experimentConfig[window.fbl.circuitName][configName] = window.simModels[$(value).attr('simID')];
});

window.getModelData = function (callback) {
    if ($('.NeuGFX-overlay').length) {
        modelData = {};
        $(".modelInput").each(function (index, value) {
            //console.log(this);
            // if (!($(this).attr('entrytype') in modelData))
                // simModels[simID][$(this).attr('entrytype')] = {};
                // modelData[$(this).attr('entrytype')] = {};
            simModels[simID][$(this).attr('entrytype')][$(this).attr('name')] = this.value;
            var configName = $(simIDs[simID]).attr('tooltip-data').split(" :: ")[0];
            window.fbl.experimentConfig[window.fbl.circuitName][configName] = simModel;
        });
        modelData['name'] = $('#modelSelect')[0].value;
        $('.container-fullwidth').removeClass("is-blurred");
        
        window.sendExperimentConfig();
        callback();
    }
}
/*
if (!(modelData['name'] in window.fbl.experimentConfig['cx'].updated)) {
    window.fbl.experimentConfig['cx'].updated.push(modelData['name']);
}
*/
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
        window.sendExperimentConfig();
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
    var configName = $(simIDs[simID]).attr('tooltip-data').split(" :: ")[0];
    if (!(configName in window.fbl.experimentConfig['antenna'].updated)) {
        window.fbl.experimentConfig['antenna'].updated.push(configName);
    }
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

$(neuron_selector).on("click", function (e) {
    label = $(this).attr('label');
    console.log('Toggling element...');
    console.log(label);
    window.fbl.experimentConfig['lastAction'] = 'toggled';
    window.fbl.experimentConfig['lastLabel'] = label;
    if ($(this).hasClass('neuron_class')) {
        window.fbl.experimentConfig['lastObject'] = 'neuron';
    }
    if ($(this).hasClass('synapse_class')) {
        window.fbl.experimentConfig['lastObject'] = 'synapse';
    }
    toggleByDiagramName(label);
    window.updateCircuit();
});

window.addAll = function (label, type) {
    $(neuron_selector).each(function (index, value) {
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
        }
    });
};

window.renewCircuit();




