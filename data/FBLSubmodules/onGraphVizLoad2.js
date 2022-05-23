svgObj = d3.select(document.querySelector('svg'));

var ID = "tooltip", CLS_ON = "tooltip_ON", FOLLOW = true,
    DATA = "_tooltip", OFFSET_X = 20, OFFSET_Y = 10,
    showAt = function (e) {
        var ntop = e.pageY + OFFSET_Y, nleft = e.pageX + OFFSET_X;
        $("#" + ID).html($(e.target).data(DATA)).css({
            position: "absolute", top: ntop, left: nleft
        }).show();
    };
$(document).on("mouseenter", "*[title]", function (e) {
    $(this).data(DATA, $(this).attr("title"));
    $(this).removeAttr("title").addClass(CLS_ON);
    $("<div id='" + ID + "' />").appendTo("body");
    showAt(e);
});
$(document).on("mouseleave", "." + CLS_ON, function (e) {
    $(this).attr("title", $(this).data(DATA)).removeClass(CLS_ON);
    $("#" + ID).remove();
});
if (FOLLOW) { $(document).on("mousemove", "." + CLS_ON, showAt); }


$('.myclass line').hover(function () {
    $(this).find('.title').fadeIn(300);
}, function () {
    $(this).find('.title').fadeOut(100);
});


window._neuGFX.mods.FlyBrainLab.loadNewLPU();
svgObj.selectAll("text").style("pointer-events","none");
/*$('#current_constraints').scrollbar();
$('#current_notebook_url').scrollbar();
$('.options-form').scrollbar();
$('textarea').focus(function (e) {
    e.target.select();
    $(e.target).one('mouseup', function (e) {
        e.preventDefault();
    });
});*/



$('.constraint_generator_button').on('click', function () {
    constraint_list = [];
    $("svg g.synapse_class").each(function () {
        if ($(this).attr('inactive')) {
            constraint_list.push($(this).attr("synapse_info"));
        }
    });
    $("svg g.neuron_class").each(function () {
        if ($(this).attr('inactive')) {
            constraint_list.push($(this).attr("name"));
        }
    });

    constraint_dictionary['constraints'] = constraint_list;
    var constraint_dictionary_encoded = btoa(JSON.stringify(constraint_dictionary));
    $('#current_constraints').val(constraint_dictionary_encoded);
    //alertify.logPosition("middle bottom right");
    alertify.log("Simulation settings generated...");
    to_send = 3;
});

$('.save_tag_locally_button').on('click', function () {
    constraint_list = [];
    $("svg g.synapse_class").each(function () {
        if ($(this).attr('inactive')) {
            constraint_list.push($(this).attr("synapse_info"));
        }
    });
    $("svg g.neuron_class").each(function () {
        if ($(this).attr('inactive')) {
            constraint_list.push($(this).attr("name"));
        }
    });

    constraint_dictionary['constraints'] = constraint_list;
    var constraint_dictionary_encoded = btoa(JSON.stringify(constraint_dictionary));
    $('#current_constraints').val(constraint_dictionary_encoded);
    //alertify.logPosition("middle bottom right");
    alertify.log("Simulation settings generated...");
});

$('.inactivate_all_button').on('click', function () {
    constraint_list = [];
    $("svg g.synapse_class,svg g.edge").each(function () {
        $(this).attr('inactive', 'true');
    });
    $("svg g.neuron_class,svg g.node").each(function () {
        $(this).attr('inactive', 'true');
    });
});

window.lpu_name = 'graphviz';
window.fbl.experimentConfig[lpu_name] = {};
window.fbl.experimentConfig[lpu_name].disabled = [];
// window._neuGFX.mods.FlyBrainLab.addFBLPath("GraphViz Diagram",function() {});

window.switchLPU = function () {
    window.fbl.popFBLPath();
    window.fbl.loadFBLSVG('graphviz', function () { window.fbl.loadSubmodule('data/FBLSubmodules/onGraphVizLoad.js'); console.log("Submodule loaded.") });
}

window.neurons = {};
window.neurons_names = [];
$("svg g.node").each(function () {
    var name = $(this).attr('tooltip-data');
    window.neurons_names.push(name);
    window.neurons[name] = true;
});
neurons_names.sort(() => Math.random() - 0.5);
// var neurons_to_load = neurons_names.slice(0,20);
var neurons_to_load = neurons_names;

// uname = 'add /:referenceId:[' + neurons_to_load.join(',') + '] ';
// window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPquery', query: uname });
uname = '"' + neurons_names.join('","') + '"';
window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPaddByUname', uname: uname });
// toggleWorkspaceByUname(neurons_to_load,"true");



//window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPloadTag', tag: "mb_ex_all" });
//window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPloadTag', tag: "mb_kc_mbons_20syn_11" });
//window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPloadTag', tag: "kc_dan_20syn" });



$.getJSON("https://data.flybrainlab.fruitflybrain.org/mb_gfx_correlates.json", function (data) {
    window.bioMatches = data;
    window.bioWorkspace = [];
    for (var i = 0; i < bioMatches[1].length; i++) {
        window.bioWorkspace[bioMatches[1][i]] = true;
    }

});

window.sendExperimentConfig = function() {
    console.log('Updating the circuit4');
    var experimentConfig = JSON.stringify(window._neuGFX.mods.FlyBrainLab.experimentConfig);
    console.log('Experiment config getting sent...')
    window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'loadExperimentConfig', config: experimentConfig });
}

window.updateCircuit = function () {
    console.log('Updating the circuit');
    var lpu_name = 'graphviz';
    //window.fbl.experimentConfig[lpu_name] = {};
    //window.fbl.experimentConfig[lpu_name].disabled = [];
    //console.log('Updating the circuit2');
    /*
    neurons_names.forEach(function (element) {
        // element = element.replace('a','alpha');
        var neu = svgObj.select("#" + element);
        if (neu.attr("inactive") == "true") {
            window.fbl.experimentConfig[lpu_name].disabled.push(element);
        };
    });
    */
    //console.log('Updating the circuit3');
    window.sendExperimentConfig();
};

function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }

toggleWorkspaceByUname = function (uname, type) {
    console.log(uname, type);
    if (typeof type === "boolean"){
        if (type == true)
        {
            type = "true";
        }
        else {
            type = "false";
        }
    }
    if (type == "true")
    {
        // uname = '"' + uname.join('","') + '"';
        
        for (var i = 0; i < uname.length; i++) {
            removeItemAll(window.fbl.experimentConfig[lpu_name].disabled,uname[i]);
        }
        // uname = 'add /:referenceId:[' + uname.join(',') + '] ';
        uname = '"' + uname.join('","') + '"';
        window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPaddByUname', uname: uname });
    }
    else if (type == "false")
    {
        // uname = '"' + uname.join('","') + '"';
        
        for (var i = 0; i < uname.length; i++) {
            window.fbl.experimentConfig[lpu_name].disabled.push(uname[i]);
        }
        // uname = 'remove /:referenceId:[' + uname.join(',') + '] ';
        uname = '"' + uname.join('","') + '"';
        window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPremoveByUname', uname: uname });
    }
    else
    {
        console.log('Neither true nor false',type);
        var pos_unames = [];
        var neg_unames = [];
        for (var i = 0; i < uname.length; i++) {
            if (uname[i] == true) {
                pos_unames.push(uname[i]);
                window.bioWorkspace[uname[i]] = false;
            }
            else
            {
                neg_unames.push(uname[i]);
                window.bioWorkspace[uname[i]] = true;
            }
        }
        uname = '"' + pos_unames.join('","') + '"';
        if (pos_unames.length > 0)
        window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPremoveByUname', uname: uname });

        uname = '"' + neg_unames.join('","') + '"';
    
        if (neg_unames.length > 0)
        window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPaddByUname', uname: uname });
    
    }
    window.updateCircuit();
}


toggleByDiagramName = function (diagramNames, type) {
    console.log(diagramNames);
    var toggled = {};
    if (typeof diagramNames === 'object') {
    }
    else {
        a = {};
        a[diagramNames] = true;
        diagramNames = a;
    }
    var toggled_keys = [];
    for (var diagramName in diagramNames) {
        toggled_keys.push(diagramName);
        type = diagramNames[diagramName];
        if (window.fbl.experimentConfig[lpu_name].disabled.includes(diagramName.toString())) {
            type = "true";
        }
        else {
            type = "false";
        }
    }
    for (var diagramName in diagramNames) {
        for (var i = 0; i < bioMatches[0].length; i++) {
            if (bioMatches[0][i].includes(diagramName)) {
                console.log('Found a match!');
                console.log(type);
                console.log(diagramName);
                toggled[bioMatches[1][i]] = true;
                /*if (!toggled.includes(bioMatches[1][i])) {
                    toggleWorkspaceByUname(bioMatches[1][i]);
                    toggled.push(bioMatches[1][i]);
                }*/
            }
        }
    }
    
    for (var key in toggled) {
        toggled_keys.push(key);
    }
    console.log('toggleByDiagramName Output',toggled_keys,type);
    toggleWorkspaceByUname(toggled_keys, type);
}



