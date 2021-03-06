// Most of this is not a good fit for the window

_NKModels = {
    AxonHillockModels: {
        LeakyIAF:
            {
                states: { initV: -60.},
                params: { threshold: 0., reset_potential: -70., capacitance: 0.5, resting_potential: 0., resistance: 250.0 },
                names: {'initV': 'Initial Potential (mV)', 'threshold': 'Threshold (mV)', 'reset_potential': 'Reset Potential (mV)', 'capacitance': 'Capacitance (muF)', 'resting_potential': 'Resting Potential (mV)', 'resistance': 'Resistance (KOhm)'},
            },
        HodgkinHuxley:
            {
                states: { V: -10., spike_state: 0., n: 0., m: 0., h: 1. },
                params: { g_K: 100., g_Na: 10., g_l: 1. },
                names: {'g_K': 'Potassium Conductance (mS)', 'g_Na': 'Sodium Conductance (mS)', 'g_l': 'Leaky Channel Conductance (mS)', 'V': 'Membrane Potential (mV)', 'spike_state': 'Spike State', 'n': 'n', 'm': 'm', 'h': 'h'},
            },
        ConnorStevens:
            {
                states: { V: -10., Vprev: 0., Vprev2: 0., spike_state: 0., n: 0., m: 0., h: 1., a: 0., b: 0. },
                params: { g_K: 100., g_Na: 10., g_l: 1. },
                names: {'g_K': 'Potassium Conductance (mS)', 'g_Na': 'Sodium Conductance (mS)', 'g_l': 'Leaky Channel Conductance (mS)', 'V': 'Membrane Potential (mV)', 'Vprev': 'Previous Membrane Potential 1 (mV)', 'Vprev2': 'Previous Membrane Potential 2 (mV)', 'spike_state': 'Spike State', 'n': 'n', 'm': 'm', 'h': 'h', 'a': 'a', 'b': 'b'}
            }
    },
    SynapseModels: {
        AlphaSynapse: {
        states: { z: 0., dz: 0., d2z: 0. },
        params: { gmax: 100., ar: 10., ad: 1. },
        names: {'gmax': 'Maximum Conductance (mS/cm^2)', 
        'ar': 'Rise Rate of Conductance (ms)', 
        'ad': 'Decay Rate of Conductance (ms)', 
        'z': 'z', 
        'dz': 'Gradient of z', 
        'd2z': 'Second Gradient of z'}
        }
    },
    DendriteModels: {
        Dendrite: {
        states: {},
        params: {},
        names: {}
        }
    },
    DefaultModels: {
        Default: {
        states: {},
        params: {},
        names: {}
        }
    },
    MembraneModels: {
        MorrisLecar:
        {
            states: { V: -46.080, n: 0.3525 },
            params: { V1: -20.0, V2: 50.0, V3: -40.0, V4: 20.0, phi: 0.001, offset: 0.0, V_L: -40.0, V_Ca: 120.0, V_K: -80.0, g_L: 3.0, g_Ca: 4.0, g_K: 15.0 },
            names: {
                'g_K': 'Potassium Conductance (mS)',
                'g_Na': 'Sodium Conductance (mS)',
                'g_L': 'Leaky Channel Conductance (mS)',
                'g_Ca': 'Calcium Channel Conductance (mS)',
                'V': 'Membrane Potential (mV)',
                'V1': 'Previous Membrane Potential 1 (mV)',
                'V2': 'Previous Membrane Potential 2 (mV)',
                'V3': 'Previous Membrane Potential 3 (mV)',
                'V4': 'Previous Membrane Potential 4 (mV)',
                'phi': 'phi',
                'n': 'n',
                'offset': 'offset',
                'V_L': 'V_L',
                'V_K': 'V_K',
                'V_Ca': 'V_Ca',
                'b': 'b'
            }
        }
    },
    TransductionModels: {
        FlyTransducer:
            {
                states: { x1: 0., x2: 0., x3: 0., I: 0.},
                params: { b: 10., d: 5. },
                names: {'x1':'x1','x2':'x2','x3':'x3','I':'I','b':'b','d':'d'}
            }
    },
};

var _NKModelFamilies = [];
var _NKModelNames = [];
for (var modelFamily in _NKModels) {
    console.log(modelFamily);
    _NKModelFamilies.push(modelFamily);
    for (var model in _NKModels[modelFamily]) {
        console.log(model);
        _NKModelNames.push(model);
    }
}

window.simModels = {};
window.simNames = {};
window.simID = 0;
window.neuron_selector = ".lpu";
$(neuron_selector).each(function (index, value) {
    $(this).attr('simID', index);
    simModels[index] = _NKModels.MembraneModels.MorrisLecar;
    simNames[index] = "MorrisLecar";
});

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

window.createOverlay = function(simID, simModel) {
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
    $(selectList).on('change', function() {
        modelName = $('#modelSelect')[0].value;
        for (var modelFamily in _NKModels) {
            for (var model in _NKModels[modelFamily]) {
                if (model == modelName)
                {
                    data = _NKModels[modelFamily][model];
                    simModels[simID] = data;
                    simNames[simID] = model;
                    simModel = simModels[simID];
                    getModelData(function () { $('.NeuGFX-overlay').remove(); createOverlay(simID, simModel);});
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


