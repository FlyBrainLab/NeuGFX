// Most of this is not a good fit for the window

var HodgkinHuxleyDescription = '<p class="des">' + 
'The Hodgkin-Huxley model is a conductance based mathematical model that describes how action potentials ' + 
'in neurons are initiated and propagated. It is a set of non-linear differential equations that approximates the electrical characteristics ' +
'of excitable cells such as neurons. It is a continuous time model and the typical model treats each component of an excitable cell as an ' + 
'excitable element.' + 
'</p>' + 
'<p class="des">The lipid bilayer is presented as a capacitance (C<sub>m</sub>). Voltage-gated ion channels are ' + 
'represented by electrical conductances, g<sub>n</sub> (where n represents the specific ion channel) that depend both on voltage and time. ' + 
'Leak channels are represented by linear conductances, g<sub>L</sub>. The electrochemical gradients driving the flow of ions are represented ' + 
'by voltage sources, E<sub>n</sub> whose voltages are determined by the ratios of the intra- and extracellular concentrations of the ionic' + 
'species of interest. Finally, ion pumps are represented by current sources, I<sub>P</sub>. The membrane potential is denoted by V<sub>m</sub>.' + 
'</p>' +  
'<p class="des">Mathematically, the current flowing through the lipid layer is written as </p>' + 
katex.renderToString("I_c = C_m {dV \\over dt}", {
    throwOnError: false
}) +
'<br><br><p class="des"> and the current through a given ion channel is the product </p>' + 
katex.renderToString("I_i = g_n (V_m - V_i)", {
    throwOnError: false
}) +
'<br><br><p class="des">where V<sub>i</sub> is the reversal potential of the <i>i</i>-th channel. Thus for a cell with sodium and potassium ion ' + 
'channels, the total current through the membrane is given by</p>' + 
katex.renderToString("I = C_m {dV \\over dt} + g_K (V_m - V_K) + g_Na (V_m - V_Na) + g_l (V_m - V_l)", {
    throwOnError: false
}) +
'<br><br><p class="des">where <i>I<i> is the total membrane current per unit area, <i>C<sub>m</sub></i> is the membrane capacitance per unit area, ' + 
'<i>g<sub>K</sub></i> and <i>g<sub>Na</sub></i> are the potassium and sodium conductances per unit area, respectively and V<sub>K</sub> and ' + 
'V<sub>Na</sub> are the potassium and sodium reversal potentials respectively. The time dependent elements of this equation are ' + 
'<i>V<subm></sub></i>, <i>g<sub>Na</sub></i> and <i>g<sub>K</sub></i>, where the last two conductances depend explicitly on voltage as well.</p>'; 

var LeakyIAFDescription = '<p class="des">The leaky integrate-and-fire (LIF) neuron is probably one of the simplest spiking neuron models' + 
' but it is still very popular due to the ease with which it can be analyzed and simulated. In its simplest form, a neuron is modeled as ' +
'a "leaky integrator" of its input <i>I(t)</i> </p>' + 
katex.renderToString("C_m  {dV \\over dt} = - V(t) + R I(t)", {
    throwOnError: false
}) +
'<br><br><p class="des"> where <i>V<sub>t</sub></i> represents the membrane potential at time <i>t</i>, <i>C<sub>m</sub></i> is the membrane time ' +
'constant and <i>R</i> is the membrane resistance. This equation describes a simple resistor-capacitor (RC) circuit where the leakage term ' +
'is due to the resistor and the integration of <i>I(t)</i> is due to the capacitor that is in paralled to the resistor. The spiking events ' + 
'are not explicitly modeled in the LIF model. Instead when the membrane potential <i>V(t)</i> reaches a certain threshold <i>V<sub>th</sub><i> ' +
'(spiking threshold), it is instantaneously set to a lower value <i>V<sub>r</sub></i> (reset potential), and the leaky integration described ' + 
'by the above equation starts anew with the initial value <i>V<sub>r</sub></i>.' + 
'</p>' + 
'<p class="des"> As per the assumption, the membrane resistance is not a perfect insulator and this forces the input current to exceed some ' +
'threshold <i>I</i><sub>th</sub> = <i>V</i><sub>th</sub> - <i>R</i><sub>m</sub> in order to cause the cell to fire, else it will simply ' +
'leak out any change in potential.' +
'</p>';

var ConnorStevensDescription = '<p class="des">It is an extended action potential generating model using gastropod neuron somas. There is ' + 
'a sodium, potassium and leak current as in the Hodgkin-Huxley model, and in addition, another potassium current that is transient, ' + 
'the so-called A-current, is included. This current has an activation and an inactivation variable.' + 
'</p>';

var MorrisLecarDescription = '<p class="des">The Morris–Lecar model is a two-dimensional system of nonlinear differential equations. ' + 
'It is considered a simplified model compared to the four-dimensional Hodgkin–Huxley model. Qualitatively, this system of equations ' + 
'describes the complex relationship between membrane potential and the activation of ion channels within the membrane: the potential ' + 
'depends on the activity of the ion channels, and the activity of the ion channels depends on the voltage. As bifurcation parameters are ' + 
'altered, different classes of neuron behavior are exhibited.' + 
'</p>';


_NKModels = {
    AxonHillockModels: {
        LeakyIAF:
            {
                states: { initV: -60.},
                params: { reset_potential: -70., capacitance: 0.5, resting_potential: 0., resistance: 250.0 }
            },
        HodgkinHuxley:
            {
                states: { V: -10., spike_state: 0., n: 0., m: 0., h: 1. },
                params: { g_K: 100., g_Na: 10., g_l: 1. }
            },
        ConnorStevens:
            {
                states: { V: -10., Vprev: 0., Vprev2: 0., spike_state: 0., n: 0., m: 0., h: 1., a: 0., b: 0. },
                params: { g_K: 100., g_Na: 10., g_l: 1. }
            }
    },
    MembraneModels: {
        MorrisLecar:
            {
                states: { V: -46.080, n: 0.3525 },
                params: { V1: -20.0, V2: 50.0, V3: -40.0, V4: 20.0, phi: 0.001, offset: 0.0, V_L: -40.0, V_Ca: 120.0, V_K: -80.0, g_L: 3.0, g_Ca: 4.0, g_K: 15.0 }
            }
    }
};

// var _NKModelFamilies = [];
// var _NKModelNames = [];
// for (var modelFamily in _NKModels) {
//     console.log(modelFamily);
//     _NKModelFamilies.push(modelFamily);
//     for (var model in _NKModels[modelFamily]) {
//         console.log(model);
//         _NKModelNames.push(model);
//     }
// }


// window.modelId = '1';
window.neuron_selector = ".lpu";
// $(neuron_selector).each(function (index, value) {
//     $(this).attr('simID', index);
//     simModels[index] = _NKModels.MembraneModels.MorrisLecar;
//     simNames[index] = "MorrisLecar";
// });

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


var modelDescriptionMap = {
    '1': {
        'id': 'LeakyIAF',
        'title': 'Leaky Integrate-and-Fire', 
        'caption': 'The models in this category describe the relationship between neuronal membrane currents at the input stage, and membrane voltage at the output stage.',
        'description': LeakyIAFDescription,
        'states': { 'V<sub>init</sub>': -60.},
        'params': { 'Reset Potential': -70., 'Capacitance': 0.5, 'Resting Potential': 0., 'Resistance': 250.0 }
    },
    '2': {
        'id': 'HodgkinHuxley',
        'title': 'Hodgkin Huxley',
        'caption': 'Hodgkin–Huxley type models represent the biophysical characteristic of cell membranes',
        'description': HodgkinHuxleyDescription,
        'states': { 'V': -10., 'Spike State': 0., 'n': 0., 'm': 0., 'h': 1. },
        'params': { 'g<sub>K</sub>': 100., 'g<sub>Na</sub>': 10., 'g<sub>l</sub>': 1. }
    },
    '3': {
        'id': 'ConnorStevens',
        'title': 'Connor Stevens',
        'caption': '',
        'description': ConnorStevensDescription,
        'states': { 'V': -10., 'V<sub>prev</sub>': 0., 'V<sub>prev2</sub>': 0., 'Spike State': 0., 'n': 0., 'm': 0., 'h': 1., 'a': 0., 'b': 0. },
        'params': { 'g<sub>K</sub>': 100., 'g<sub>Na</sub>': 10., 'g<sub>L</sub>': 1. }
    },
    '4': {
        'id': 'MorrisLecar',
        'title': 'Morris Lecar',
        'caption': '',
        'description': MorrisLecarDescription,
        'states': {'V': -46.080, 'n': 0.3525},
        'params': {'V<sub>1</sub>': -20.0, 'V<sub>2</sub>': 50.0, 'V<sub>3</sub>': -40.0, 'V<sub>4</sub>': 20.0, 'phi': 0.001, 'offset': 0.0, 'V<sub>L</sub>': -40.0, 'V<sub>Ca</sub>': 120.0, 'V<sub>K</sub>': -80.0, 'g<sub>L</sub>': 3.0, 'g<sub>Ca</sub>': 4.0, 'g<sub>K</sub>': 15.0 }
    }
}

var modelId = '1';

window.getModelData = function (callback) {
    if ($('.NeuGFX-overlay').length) {
        modelData = {};
        console.log("1: modelData");
        console.log(modelData);
        $(".modelInput").each(function (index, value) {
            //console.log(this);
            if (!($(this).attr('entryType') in modelData))
                modelData[$(this).attr('entryType')] = {};
            modelData[$(this).attr('entryType')][$(this).attr('name')] = this.value;
        });
        modelData['name'] = modelDescriptionMap[modelId]['id'];
        console.log("2: modelData");
        console.log(modelData);
        $('.container-fullwidth').removeClass("is-blurred");
        callback();
    }
}

window.createOverlay = function(modelId) {
    var overlay = document.createElement("div");
    overlay.classList.add('NeuGFX-overlay');

    var baseRow = getBaseRow(modelId);
    overlay.appendChild(baseRow);

    var headingRow = getHeadingRow(modelId);
    overlay.append(headingRow);

    var infoRow = getInfoRow(modelId);
    overlay.appendChild(infoRow);

    var descriptionRow = getDescriptionRow(modelId);
    overlay.append(descriptionRow);

    $('.NeuGFX-overlay').on('click', function (e) {
        e.stopPropagation();
    });
    $(document).on('click', function (event) {
        //getModelData(function () { $('.NeuGFX-overlay').remove(); });
        $('.NeuGFX-overlay').remove();
    });
    document.body.appendChild(overlay);
}

function getBaseRow(modelId) {
    var row1 = document.createElement("div");
    row1.classList.add("container");
    row1.classList.add("contextmenu");

    var modelList = document.createElement("ul");
    modelList.classList.add("nopadding");
    modelList.classList.add("pagination");
    modelList.classList.add("pagination-lg");

    var listElem1 = getModelListElem(modelId, '1');
    modelList.appendChild(listElem1);
    var listElem2 = getModelListElem(modelId, '2');
    modelList.appendChild(listElem2);
    var listElem3 = getModelListElem(modelId, '3');
    modelList.appendChild(listElem3);
    var listElem4 = getModelListElem(modelId, '4');
    modelList.appendChild(listElem4);

    row1.appendChild(modelList);
    return row1;
}

function getModelListElem(modelId, index) {
    var listElem = document.createElement("li");
    listElem.classList.add("model");
    listElem.id = modelDescriptionMap[index]['id'];
    if (modelId == index) listElem.classList.add("active");
    var a = document.createElement("a");
    a.id = index;
    a.setAttribute("href", "#");
    a.textContent = modelDescriptionMap[index]['title'];
    listElem.appendChild(a);
    
    return listElem;
}

function getHeadingRow(modelId) {
    var headingRow = document.createElement("div");
    headingRow.id = "modelHeading";
    headingRow.classList.add("container");
    var heading = document.createElement("h1");
    heading.id = "heading";
    heading.innerText = modelDescriptionMap[modelId]['title'];
    headingRow.appendChild(heading);
    return headingRow;
}

function getInfoRow(modelId) {
    
    var infoRow = document.createElement("div");
    infoRow.classList.add("row");
    var col1 = getImageColumn(modelId);
    var col2 = getStatesTable(modelId);
    var col3 = getParamsTable(modelId);
    var col4 = document.createElement("div");
    col4.classList.add("col-md-1");
    infoRow.appendChild(col1);
    infoRow.appendChild(col2);
    infoRow.appendChild(col3);
    infoRow.appendChild(col4);
    return infoRow;
}

function getImageColumn(modelId) {
    model = modelDescriptionMap[modelId]['id'];
    src = "media/" + model + ".png";
    alt = model;

    var imgDiv = document.createElement("div");
    imgDiv.classList.add("col-md-7");
    var figure = document.createElement("figure");
    var img = document.createElement("img");
    img.classList.add("img-rounded");
    img.classList.add("center-block");
    img.setAttribute("src", src);
    img.setAttribute("alt", alt);

    figure.appendChild(img);

    var figureCaption = document.createElement("figcaption");
    figureCaption.classList.add("figCaption");
    figureCaption.innerHTML = modelDescriptionMap[modelId]['caption'];

    figure.appendChild(figureCaption);

    imgDiv.appendChild(figure);

    return imgDiv;
}

function getDescriptionRow(modelId) {
    var descriptionRow = document.createElement("div");
    descriptionRow.classList.add("row");
    descriptionRow.id = "descriptionRow";
    var descriptionContent = document.createElement("div");
    descriptionContent.classList.add("container");
    var modelDescription = modelDescriptionMap[modelId]['description'];
    
    descriptionContent.innerHTML = modelDescription;
    descriptionRow.appendChild(descriptionContent);
    return descriptionRow;
}

function getStatesTable(modelId) {
    var states = modelDescriptionMap[modelId]['states'];
    var stateDiv = document.createElement("div");
    stateDiv.id = "stateDiv";
    stateDiv.classList.add("col-md-2");

    var stateTableHeading = document.createElement("div");
    stateTableHeading.classList.add("row");
    stateTableHeading.classList.add("container-fluid");
    var s = document.createElement("h3");
    s.id = "statesHeading";
    s.innerText = "States";
    stateTableHeading.appendChild(s);
    stateDiv.appendChild(stateTableHeading);

    var tableDiv = document.createElement("div");
    tableDiv.classList.add("row");
    tableDiv.classList.add("container-fluid");
    tableDiv.id = "stateTable";
    var stateTable = document.createElement("table");
    stateTable.classList.add("table");
    stateTable.classList.add("table-dark");

    for (const [key, value] of Object.entries(states)) {
        var tr = document.createElement('tr');
        tr.classList.add("trEntry");
        var td1 = document.createElement('td');
        td1.classList.add("tdEntry");
        td1.innerHTML = key;
        var td2 = document.createElement('td');
        td2.classList.add("tdEntry");
        var inputDiv = document.createElement('div');
        inputDiv.classList.add("inputDiv");
        var input = document.createElement('input');
        input.classList.add("form-control");
        input.classList.add("modelInput");
        input.setAttribute("name", key);
        input.setAttribute("entryType", "states");
        input.id = key;
        input.placeholder = value;
        input.setAttribute("type", "text");
        inputDiv.appendChild(input);
        td2.appendChild(inputDiv);
        tr.appendChild(td1);
        tr.appendChild(td2);
        stateTable.appendChild(tr);
    }
    tableDiv.appendChild(stateTable);
    stateDiv.appendChild(tableDiv);
    return stateDiv;
}

function getParamsTable(modelId) {
    var params = modelDescriptionMap[modelId]['params'];
    var paramsDiv = document.createElement("div");
    paramsDiv.id = "paramsDiv";
    paramsDiv.classList.add("col-md-2");

    var paramsTableHeading = document.createElement("div");
    paramsTableHeading.classList.add("row");
    paramsTableHeading.classList.add("container-fluid");
    var p = document.createElement("h3");
    p.id = "paramsHeading";
    p.innerText = "Parameters";
    paramsTableHeading.appendChild(p);
    paramsDiv.appendChild(paramsTableHeading);

    var tableDiv = document.createElement("div");
    tableDiv.classList.add("row");
    tableDiv.classList.add("container-fluid");
    tableDiv.id = "paramsTable";
    var paramsTable = document.createElement("table");
    paramsTable.classList.add("table");
    paramsTable.classList.add("table-dark");

    for (const [key, value] of Object.entries(params)) {
        var tr = document.createElement('tr');
        tr.classList.add("trEntry");
        var td1 = document.createElement('td');
        td1.classList.add("tdEntry");
        td1.innerHTML = key;
        var td2 = document.createElement('td');
        td2.classList.add("tdEntry");
        var inputDiv = document.createElement('div');
        inputDiv.classList.add("inputDiv");
        var input = document.createElement('input');
        input.classList.add("form-control");

        input.classList.add("modelInput");
        input.setAttribute("name", key);
        input.setAttribute("entryType", "params");
        input.id = key;
        input.placeholder = value;
        input.setAttribute("type", "text");
        inputDiv.appendChild(input);
        td2.appendChild(inputDiv);
        tr.appendChild(td1);
        tr.appendChild(td2);
        paramsTable.appendChild(tr);
    }
    tableDiv.appendChild(paramsTable);
    paramsDiv.appendChild(tableDiv);
    return paramsDiv;
}

$(neuron_selector).on("click contextmenu", function (e) {
    $('.NeuGFX-overlay').remove();
    e.preventDefault();
    simID = $(this).attr('simID');
    //simModel = simModels[simID];
    if (e.type == "contextmenu") {
        // Create the Overlay Div
        createOverlay('1');
        makeModelsInteractive();
    }
});

makeModelsInteractive = function(e) {
    $('.model').on("click", function(event) {
        console.log("One of the models clicked!");
        modelId = event.target.id;
        //getModelData(function () { $('.NeuGFX-overlay').remove(); });
        //event.preventDefault();
        createOverlay(modelId);
        makeModelsInteractive();
    });
}

console.log('test')

