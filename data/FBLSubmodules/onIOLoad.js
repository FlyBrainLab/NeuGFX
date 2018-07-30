/*var IOData = {
    inputs: ['a', 'b', 'c'],
    outputs: ['d', 'e', 'f']
};

var IOSynapses = [['a','d'],['b','f']];*/

wireAutomatically = function(IOData) {
    window.IOSynapses = [];
    for (var i=0;i<IOData.inputs.length;i++)
    for (var j=0;j<IOData.outputs.length;j++)
    {
        window.IOSynapses.push([IOData.inputs[i], IOData.outputs[j]]);
    }
}

wireAutomatically(IOData);

generatePinMap = function(IOData, IOSynapses, IOName) {
    var neuronWidth = 64;
    var neuronHeight = 32;

    neuronInX = function(i) {return (i+1) * 96 + 25};
    neuronInY = function(i) {return 125};

    neuronOutX = function(i) {return 96 + 48 + (i+1) * 96 + 25};
    neuronOutY = function(i) {return 325};

    svgObj = d3.select(document.querySelector('svg'));
    svgObj.selectAll("*").remove();

    var lineGenerator = d3.line()
                            .x(function(d) { return d.x; })
                            .y(function(d) { return d.y; })
                            .curve(d3.curveLinear);

    var synI = IOSynapses.length + 1;
    for (var k = 0; k < IOSynapses.length; k++) {
        i = IOData.inputs.findIndex(x => x === IOSynapses[k][0]);
        j = IOData.outputs.findIndex(x => x === IOSynapses[k][1]);
        var pathData = [];
        var yBreak = (IOSynapses.length-k)/synI*(neuronOutY(j)-neuronInY(i)-neuronHeight)+neuronInY(i)+neuronHeight/2;
        pathData.push({x: neuronInX(i), y: neuronInY(i)});
        pathData.push({x: neuronInX(i), y: yBreak});
        pathData.push({x: neuronOutX(j), y: yBreak});
        pathData.push({x: neuronOutX(j), y: neuronOutY(j)});
        var lineGraph = svgObj.append("path")
                                    .attr("d", lineGenerator(pathData))
                                    .attr("stroke", "rgb(52,67,73)")
                                    .attr("stroke-width", 2)
                                    .attr("label", IOData.inputs[i] + " to " + IOData.outputs[j])
                                    .attr("class","synapse_class")
                                    .attr("selected","true")
                                    .attr("tooltip-data", IOData.inputs[i] + " to " + IOData.outputs[j] + " :: " + "This is a synapse.")
                                    .attr("fill", "none");
    }

    for (var i = 0; i < IOData.inputs.length; i++) {
        var neuron = svgObj.append("rect")
            .attr("x", neuronInX(i)-neuronWidth/2)
            .attr("y", neuronInY(i)-neuronHeight/2)
            .attr("width", neuronWidth)
            .attr("height", neuronHeight)
            .attr("r", 10)
            .attr("label", IOData.inputs[i])
            .attr("class","neuron_class")
            .attr("selected","true")
            .attr("tooltip-data", IOData.outputs[i] + " :: " + "This is a presynaptic neuron.")
            .style("fill", "rgb(0,189,210)")
            .text(IOData.inputs[i]);
        var neuronText = svgObj.append("text")
            .attr("x", neuronInX(i))
            .attr("y", neuronInY(i))
            .attr("dy", ".35em")
            .text(IOData.inputs[i])
            .style("text-anchor", "middle");
    }

    for (var i = 0; i < IOData.outputs.length; i++) {
        var neuron = svgObj.append("rect")
            .attr("x", neuronOutX(i)-neuronWidth/2)
            .attr("y", neuronOutY(i)-neuronHeight/2)
            .attr("width", neuronWidth)
            .attr("height", neuronHeight)
            .attr("r", 10)
            .attr("label", IOData.outputs[i])
            .attr("class","neuron_class")
            .attr("selected","true")
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
    window._neuGFX.mods.FlyBrainLab.addFBLPath(IOName,function() {});
    window._neuGFX.mods.FlyBrainLab.loadNewLPU();
    window._neuGFX.mods.FlyBrainLab.refreshSVG();
}

generatePinMap(IOData, IOSynapses, IOName);


svgObj.selectAll("text").style("pointer-events","none");

window.fbl.addCircuit(IOName);
window.fbl.circuitName = IOName;
window.updateCircuit = function() {
    window.fbl.experimentConfig[IOName].disabled = [];
    svgObj.selectAll(".neuron_class,.synapse_class").each(function (d, i) {
        if (this.getAttribute("selected") == "false") {
            window.fbl.experimentConfig[IOName].disabled.push(d3.select(this).attr("label"));
        }
    });
};