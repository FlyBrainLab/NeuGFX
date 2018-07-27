var IOData = {
    inputs: ['a', 'b', 'c'],
    outputs: ['d', 'e', 'f']
};

var IOSynapses = [['a','d'],['b','f']];

generatePinMap = function(IOData, IOSynapses, IOName) {
    var neuronWidth = 64;
    var neuronHeight = 32;

    neuronInX = function(i) {return (i+1) * 96 + 25};
    neuronInY = function(i) {return 125};

    neuronOutX = function(i) {return 100 + (i+1) * 96 + 25};
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
        var yBreak = (IOSynapses.length-k)/synI*(neuronOutY(j)-neuronInY(i))+neuronInY(i);
        pathData.push({x: neuronInX(i), y: neuronInY(i)});
        pathData.push({x: neuronInX(i), y: yBreak});
        pathData.push({x: neuronOutX(j), y: yBreak});
        pathData.push({x: neuronOutX(j), y: neuronOutY(j)});
        var lineGraph = svgObj.append("path")
                                    .attr("d", lineGenerator(pathData))
                                    .attr("stroke", "rgb(52,67,73)")
                                    .attr("stroke-width", 2)
                                    .attr("class","synapse_class")
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
            .attr("neuron", IOData.inputs[i])
            .attr("class","neuron_class")
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
            .attr("neuron", IOData.outputs[i])
            .attr("class","neuron_class")
            .attr("tooltip-data", IOData.outputs[i] + " :: " + "This is a postsynaptic neuron.")
            .style("fill", "rgb(248,1,86)")
            .text(IOData.inputs[i]);
        var neuronText = svgObj.append("text")
            .attr("x", neuronOutX(i))
            .attr("y", neuronOutY(i))
            .attr("dy", ".35em")
            .text(IOData.inputs[i])
            .style("text-anchor", "middle");
    }
    window._neuGFX.mods.FlyBrainLab.addFBLPath(IOName,function() {});
    window._neuGFX.mods.FlyBrainLab.loadNewLPU();
}

generatePinMap(IOData, IOSynapses, "Example");


svgObj.selectAll("text").style("pointer-events","none");