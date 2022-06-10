$.getJSON("data/resources/janelia.written.json", function(json) {
    window.visualCircuit = json;
    window.IOLayers = ['retina', 'lamina', 'medulla', 'lobulaplate'];
    window.IOLayerData = {};
    window.IOSynapses = [];

    window.IOData = {
        retina: [],
        lamina: [],
        medulla: [],
        lobulaplate: [],
    };
    window.IOName = "Early Visual System";

    for (var key in visualCircuit)
    {
        IOData[visualCircuit[key].layer].push(key);
        for(var i=0; i<visualCircuit[key].post.length; i++)
        {
            if (!IOSynapses.includes([key, visualCircuit[key].post[i]]))
                IOSynapses.push([key, visualCircuit[key].post[i]]);
        }

    }
    window.realIOSynapses = [];
    for (var i = 0; i < IOSynapses.length-1; i++) {
        if ((IOSynapses[i][0] != IOSynapses[i+1][0]) || (IOSynapses[i][1] != IOSynapses[i+1][1])) {
            realIOSynapses.push(IOSynapses[i]);
        }
    }
    window.IOSynapses = realIOSynapses;
    window._neuGFX.mods.FlyBrainLab.loadSubmodule('data/FBLSubmodules/onMultilayerLoad.js'); 
    // window._neuGFX.mods.FlyBrainLab.loadSubmodule('data/FBLSubmodules/hexDraw.js'); 
});


