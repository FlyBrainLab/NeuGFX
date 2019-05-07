svgObj = d3.select(document.querySelector('svg'));
svgObj.selectAll("*").each(function (d, i) {
    if (this.getAttribute("label") != null) {
        var label = this.getAttribute("label");
        var labels = label.split("|");
        //console.log(labels);
    }
});


svgObj = d3.select(document.querySelector('svg'));

svgObj.selectAll("*").each(function (d, i) {
    //d3.select(this).style("opacity", "0.3");
    this.setAttribute("selected", "true");
    this.setAttribute("hovered", "false");
});


window.sendExperimentConfig = function () {
    var experimentConfig = JSON.stringify(window._neuGFX.mods.FlyBrainLab.experimentConfig);
    window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'loadExperimentConfig', config: experimentConfig });
}

window.IOName = 'cx';
window.fbl.experimentConfig['cx'].updated = [];

window.updateCircuit = function () {
    if (IOName in window.fbl.experimentConfig) {
        if ('disabled' in window.fbl.experimentConfig[IOName]) {
            let disabled_temp = Array.from(window.fbl.experimentConfig['cx'].disabled);
            window.fbl.experimentConfig['cx'].disabled = [];
            var arrayLength = disabled_temp.length;
            for (var i = 0; i < arrayLength; i++) {
                if (disabled_temp[i].includes('->')) {
                    window.fbl.experimentConfig['cx'].disabled.push(disabled_temp[i]);
                }
            }
        }
        else {
            window.fbl.experimentConfig['cx'].disabled = [];
        }
    }
    else {
        window.fbl.experimentConfig['cx'].disabled = [];
    }

    svgObj.selectAll(".region,.neuron").each(function (d, i) {
        if (this.getAttribute("selected") == "false") {
            window.fbl.experimentConfig['cx'].disabled.push(d3.select(this).attr("label"));
        }
    });
    window.sendExperimentConfig();
};




window.renewCircuit = function () {
    if (IOName in window.fbl.experimentConfig) {
        if ('disabled' in window.fbl.experimentConfig[IOName]) {
            console.log('Found config: ', window.fbl.experimentConfig[IOName].disabled)
            // var arrayLength = window.fbl.experimentConfig[IOName].disabled.length;
            // for (var i = 0; i < arrayLength; i++) {
            $(".region,.neuron").each(function (index, value) {
                //console.log(d3.select(this).attr("label"));
                //console.log(window.fbl.experimentConfig[IOName].disabled[i]);
                if (window.fbl.experimentConfig[IOName].disabled.includes(d3.select(this).attr("label"))) {
                    // if ($(this).is('.region,.neuron')) {
                    d3.select(this).attr("selected", "false");
                    // };
                }
                else
                {
                    // d3.select(this).attr("selected", "true");
                }
                /*
                else
                {
                    d3.select(this).attr("selected", "true");
                }
                */

                d3.select(this).attr("hovered", "false");
                d3.select(this).style("opacity", "0.6");
                if (this.getAttribute("selected") == "false") {
                    d3.select(this).style("opacity", "0.15");
                }
                else if (this.getAttribute("selected") == "true") {
                    d3.select(this).style("opacity", "0.6");
                }
                var children = d3.selectAll(this.childNodes);
                try { children.style("opacity", "0.6"); } catch { };
                try { children.attr("hovered", "false"); } catch { };
            });
            // }
        }
        else {
            setTimeout(function () { reloadNeurons3D(); }, 1000);
        }
    }
    window.updateCircuit();
};

/* svgObj.selectAll(".region").each(function (d, i) {
    var label = this.getAttribute("label");
    if (label.indexOf("EB/") > -1) {
        var lab = +label.slice(-1);
        this.setAttribute("label", "EB/" + (9 - lab))
    }

}); */

svgObj.selectAll(".region,.neuron").each(function (d, i) {
    d3.select(this).attr("hovered", "false");
    d3.select(this).style("opacity", "0.6");
    if (this.getAttribute("selected") == "false") {
        d3.select(this).style("opacity", "0.15");
    }
    else if (this.getAttribute("selected") == "true") {
        d3.select(this).style("opacity", "0.6");
    }
    var children = d3.selectAll(this.childNodes);
    try { children.style("opacity", "0.6"); } catch { };
    try { children.attr("hovered", "false"); } catch { };
    d3.select('.svg-pan-zoom_viewport').style("opacity", "1");
});

svgObj.selectAll("*").on("mouseout", function (d, i) {
    $('.fbl-info-container').hide();
    svgObj.selectAll(".region,.neuron").each(function (d, i) {
        d3.select(this).attr("hovered", "false");
        d3.select(this).style("opacity", "0.6");
        if (this.getAttribute("selected") == "false") {
            d3.select(this).style("opacity", "0.15");
        }
        else if (this.getAttribute("selected") == "true") {
            d3.select(this).style("opacity", "0.6");
        }
        d3.select('.svg-pan-zoom_viewport').style("opacity", "1");
    });
});

svgObj.selectAll("*").on("mouseover", function (d, i) {
    if (this.getAttribute("label") != null) {
        $('.fbl-info-container').show();
        document.getElementsByClassName("fbl-info-name")[0].innerHTML = this.getAttribute("label");
        document.getElementsByClassName("fbl-info-desc")[0].innerHTML = "";
        if (this.getAttribute("label") in window.fbl.experimentConfig['cx']) {
            document.getElementsByClassName("fbl-info-desc")[0].innerHTML = JSON.stringify(window.fbl.experimentConfig['cx'][this.getAttribute("label")]);
        }
        var querylabel = this.getAttribute("label");
        svgObj.selectAll(".region,.neuron").each(function (d, i) {
            d3.select(this).attr("hovered", "false");
            d3.select(this).style("opacity", "0.6");
            if (this.getAttribute("selected") == "false") {
                d3.select(this).style("opacity", "0.15");
            }
            else if (this.getAttribute("selected") == "true") {
                d3.select(this).style("opacity", "0.3");
            }
            d3.select('.svg-pan-zoom_viewport').style("opacity", "1");
        });
        d3.select('.svg-pan-zoom_viewport').style("opacity", "1");
        svgObj.selectAll(".region,.neuron").each(function (d, i) {
            //d3.select(this).style("opacity", "0.3");
            if (this.getAttribute("label") != null) {
                var label = this.getAttribute("label");

                var labels = label.split("|");
                if (label.indexOf(querylabel) > -1) {
                    d3.select(this).style("opacity", "1");
                    d3.select(this).attr("hovered", "true");
                    if (d3.select(this).attr("selected") == "false")
                        d3.select(this).style("opacity", "1");
                    //console.log(label);
                }
                var _this = this;
                labels.forEach(function (d) {
                    if (d.indexOf('-') > -1) {
                        //console.log("Found label...")
                        //var labels = d.split("-");
                        if (d.indexOf(querylabel) > -1) {
                            d3.select(_this).style("opacity", "1");
                            //this.setAttribute("hovered", "true");
                            d3.select(_this).attr("hovered", "true");
                            var children = d3.selectAll(_this.childNodes);
                            try { children.style("opacity", "1"); } catch { };
                            try { children.attr("hovered", "true"); } catch { };
                            if (d3.select(_this).attr("selected") == "false") {
                                d3.select(_this).style("opacity", "1");
                                try { children.style("opacity", "1"); } catch { };
                            }
                            //console.log(_this);
                        }
                    }
                })
                //console.log(labels);
            }
        });
    }
    svgObj.selectAll("g").each(function (d, i) {
        //d3.select(this).style("opacity", "1");
    });
});

svgObj.selectAll(".neuron path").style("fill", "none");

svgObj.selectAll("text").style("pointer-events", "none");

window.activateElement = function (_this, sendNLP) {
    d3.select(_this).attr("selected", "true");
    d3.select(_this).style("opacity", "1");
    var children = d3.selectAll(_this.childNodes);
    try { children.style("opacity", "1"); } catch { };
    try { children.attr("selected", "true"); } catch { };
    var toggleLabels = {};
    toggleLabels[_this.getAttribute("label")] = true;
    if (_this.getAttribute("label") != null) {
        var label = _this.getAttribute("label");
        var labels = label.split("|");
        labels.forEach(function (d) {
            toggleLabels[d] = true;
        });
    }
    if (sendNLP == true)
        toggleByDiagramName(toggleLabels, "true");
}

window.deactivateAll = function () {
    svgObj.selectAll(".region,.neuron").each(function (d, i) {
        window.deactivateElement(this, false);
    });
}

window.deactivateElement = function (_this, sendNLP) {
    console.log(d3.select(_this));
    d3.select(_this).attr("selected", "false");
    d3.select(_this).style("opacity", "0.4");
    var children = d3.selectAll(_this.childNodes);
    //try {children.style("opacity", "1");} catch {};
    try { children.attr("selected", "false"); } catch { };
    if (d3.select(_this).attr("selected") == "false") {
        try { children.style("opacity", "0.4"); } catch { };
    }
    var toggleLabels = {};
    toggleLabels[_this.getAttribute("label")] = true;
    if (_this.getAttribute("label") != null) {
        var label = _this.getAttribute("label");
        var labels = label.split("|");
        labels.forEach(function (d) {
            toggleLabels[d] = true;
        });
    }
    if (sendNLP == true)
        toggleByDiagramName(toggleLabels, "false");
}

window.toggleByID = function (label, type) {
    if (bioMatches[1].indexOf(label) > -1) {
        label = bioMatches[0][bioMatches[1].indexOf(label)];
        // console.log('Label is now:',label)
    }
    var neurons = svgObj.selectAll(".neuron,.region");
    neurons.each(function (d, i) {
        var label_pre = d3.select(this).attr("presynaptic");
        var label_pos = d3.select(this).attr("postsynaptic");
        var label_label = d3.select(this).attr("label");
        var label_this = (label_pre == null ? '' : label_pre) + ' ' + (label_pos == null ? '' : label_pos) + ' ' + (label_label == null ? '' : label_label);
        // console.log(label_this);
        // if (typeof label_this === 'string' || label_this instanceof String) {
        if (label_this.includes(label)) {
            // console.log('Found match!');
            // console.log(label_this);
            // console.log(label);
            if (type == true)
                activateElement(this, false);
            if (type == false)
                deactivateElement(this, false);
        }
        // }
    });
};

window.removeAll = function (label, type) {
    var neurons = svgObj.selectAll(".neuron,.region");
    neurons.each(function (d, i) {
        var label_pre = d3.select(this).attr("presynaptic");
        var label_pos = d3.select(this).attr("postsynaptic");
        var label_label = d3.select(this).attr("label");
        deactivateElement(this, false);
    });
};

window.addAll = function (label, type) {
    var neurons = svgObj.selectAll(".neuron,.region");
    neurons.each(function (d, i) {
        var label_pre = d3.select(this).attr("presynaptic");
        var label_pos = d3.select(this).attr("postsynaptic");
        var label_label = d3.select(this).attr("label");
        activateElement(this, false);
    });
};


svgObj.selectAll(".region,.neuron").on("click", function (d, i) {
    //svgObj.selectAll(".region,.neuron").each(function (d, i) {
    //d3.select(this).style("opacity", "0.3");
    var _this = this;
    var $this = $(this);
    if ($(_this).hasClass('clicked')) {
        $(_this).removeClass('clicked');
        // console.log(_this);
    }
    else {
        $(_this).addClass('clicked');
        // console.log(_this);
        setTimeout(function () {
            // console.log($this);
            var _this = $this[0];
            // console.log(_this);
            if ($(_this).hasClass('clicked')) {
                // console.log("Executing...");
                if (_this.getAttribute("hovered") == "true") {
                    if (_this.getAttribute("selected") == "false") {
                        console.log('Activating ' + _this);
                        window.fbl.experimentConfig['lastAction'] = 'activated';
                        if (_this.getAttribute("label") != null) {
                            window.fbl.experimentConfig['lastLabel'] = _this.getAttribute("label");
                        }
                        else
                        {
                            window.fbl.experimentConfig['lastLabel'] = "Unknown";
                        }
                        if ($(_this).hasClass('region')) {
                            window.fbl.experimentConfig['lastObject'] = 'region';
                        }
                        if ($(_this).hasClass('neuron')) {
                            window.fbl.experimentConfig['lastObject'] = 'neuron';
                        }

                        d3.select(_this).attr("selected", "true");
                        d3.select(_this).style("opacity", "1");
                        var children = d3.selectAll(_this.childNodes);
                        try { children.style("opacity", "1"); } catch { };
                        try { children.attr("selected", "true"); } catch { };
                        var toggleLabels = {};
                        toggleLabels[_this.getAttribute("label")] = true;
                        if (_this.getAttribute("label") != null) {
                            var label = _this.getAttribute("label");
                            var labels = label.split("|");
                            labels.forEach(function (d) {
                                toggleLabels[d] = true;
                            });
                        }
                        toggleByDiagramName(toggleLabels, "true");
                    }
                    else {
                        //console.log('Deactivating ' + this);
                        // var _this = this;
                        window.fbl.experimentConfig['lastAction'] = 'deactivated';
                        if (_this.getAttribute("label") != null) {
                            window.fbl.experimentConfig['lastLabel'] = _this.getAttribute("label");
                        }
                        else
                        {
                            window.fbl.experimentConfig['lastLabel'] = "Unknown";
                        }
                        if ($(_this).hasClass('region')) {
                            window.fbl.experimentConfig['lastObject'] = 'region';
                        }
                        if ($(_this).hasClass('neuron')) {
                            window.fbl.experimentConfig['lastObject'] = 'neuron';
                        }
                        d3.select(_this).attr("selected", "false");
                        d3.select(_this).style("opacity", "0.4");
                        var children = d3.selectAll(_this.childNodes);
                        //try {children.style("opacity", "1");} catch {};
                        try { children.attr("selected", "false"); } catch { };
                        if (d3.select(_this).attr("selected") == "false") {
                            try { children.style("opacity", "0.4"); } catch { };
                        }
                        var toggleLabels = {};
                        toggleLabels[_this.getAttribute("label")] = true;
                        if (_this.getAttribute("label") != null) {
                            var label = _this.getAttribute("label");
                            var labels = label.split("|");
                            labels.forEach(function (d) {
                                toggleLabels[d] = true;
                            });
                        }
                        toggleByDiagramName(toggleLabels, "false");
                    }
                }
                //});
                window.updateCircuit();
                $(_this).removeClass('clicked');
            }
        }, 150);
    }
});

function toggleByLabel(a) {
    var neu = svgObj.select("#" + a);
    var hideOrShow = "hide";
    $("#btn-" + a).toggleClass("selected unselected");
    if (neu.attr("visible") == "true") {
        neu.attr("visible", "false");
        neu.style("opacity", "0.3");
        $("#btn-" + a).html('&EmptySmallSquare; ' + a);
        hideOrShow = "hide";
    } else {
        neu.attr("visible", "true");
        neu.style("opacity", "0.8");
        $("#btn-" + a).html('&FilledSmallSquare; ' + a)
        hideOrShow = "unhide";
    }

    svgObj.selectAll("." + a + "-dependent")
        .style("opacity", function () {

            var count = parseInt((d3.select(this).attr("count")), 10);

            if (neu.attr("visible") == "false") {
                count += 1;
                d3.select(this).attr("count", count);
                return "0.0";
            } else {
                count -= 1;
                d3.select(this).attr("count", count);
                if (count == 0) {
                    return "1.0";
                } else {
                    return "0.0";
                }
            }
        });
}


function modelUpdate(NLPInput) {
    /**
     * Updates the workspace according to server commands.
     * 
     * @example modelUpdate({command: "show", elements: ["R1","R2"]});
     * @example modelUpdate({command: "add", elements: ["L2"]});
     * 
     * @param {dict} NLPInput A dictionary with two keys, command and elements. Command is one of "show", "add" and "remove"; elements is an array of strings.
     */
    console.log('modelUpdate Input:', NLPInput);
    if (NLPInput.command == "show") {
        window.deactivateAll();
        NLPInput.elements.forEach(function (element) {
            // element = element.replace('a','alpha');
            toggleByID(element, true);
        });
    }
    if (NLPInput.command == "remove") {
        NLPInput.elements.forEach(function (element) {
            // element = element.replace('a','alpha');
            toggleByID(element, false);
        });
    }
    if (NLPInput.command == "add") {
        NLPInput.elements.forEach(function (element) {
            // element = element.replace('a','alpha');
            toggleByID(element, true);
        });
    }
}

var neurons = svgObj.selectAll(".neuron");

var regions = svgObj.selectAll(".region")
    .on("dblclick", function (d, i) {
        //console.log("dblclicked!");

        var pre_id_list = [];
        var post_id_list = [];
        var label_this = d3.select(this).attr("label");

        neurons.each(function (d, i) {
            // if (d3.select(this).attr("selected") == "true") {
            var id_neuron = d3.select(this).attr("id");
            var pre_region = d3.select(this).attr("presynaptic");
            if (pre_region != null) {
                if (pre_region.indexOf(label_this) != -1) {
                    var neuron_id_index = window.bioMatches[0].indexOf(id_neuron);
                    if (neuron_id_index > -1)
                        pre_id_list.push(window.bioMatches[0][neuron_id_index]);
                }
            }

            var post_region = d3.select(this).attr("postsynaptic");
            if (post_region != null) {
                if (post_region.indexOf(label_this) != -1) {
                    var neuron_id_index = window.bioMatches[0].indexOf(id_neuron);
                    if (neuron_id_index > -1)
                        post_id_list.push(window.bioMatches[0][neuron_id_index]);
                }
            }
            // }

        });
        console.log("Presynaptic neurons' id:");
        console.log(pre_id_list);
        console.log("Postsynaptic neurons' id");
        console.log(post_id_list);
        if (pre_id_list.length > 0 && post_id_list.length > 0) {
            window.IOData = {
                inputs: pre_id_list,
                outputs: post_id_list
            };
            window.IOName = label_this;
            window.fbl.circuitName = label_this;
            window.fbl.loadSubmodule('data/FBLSubmodules/onIOLoad.js');
        }

    });


window._neuGFX.mods.FlyBrainLab.addFBLPath("Central Complex", function () { window.fbl.loadFBLSVG('cx', function () { window.fbl.loadSubmodule('data/FBLSubmodules/onCXLoad.js'); console.log("Submodule loaded.") }); });
// window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPloadTag', tag: "centralcomplex_diagram_v2" });

window.reloadNeurons3D = function () {
    uname = '"' + window.bioMatches[1].join('","') + '"';
    window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPaddByUname', uname: uname });
}

$.getJSON("https://data.flybrainlab.fruitflybrain.org/cx_gfx_correlates.json", function (data) {
    window.bioMatches = data;
    window.bioWorkspace = [];

    for (var i = 0; i < bioMatches[1].length; i++) {
        window.bioWorkspace[bioMatches[1][i]] = true;
    }

});


toggleWorkspaceByUname = function (uname, type) {
    if (type == "true") {
        uname = '"' + uname.join('","') + '"';
        window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPaddByUname', uname: uname });
    }
    else if (type == "false") {
        uname = '"' + uname.join('","') + '"';
        window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPremoveByUname', uname: uname });
    }
    else {
        var pos_unames = [];
        var neg_unames = [];
        for (var i = 0; i < uname.length; i++) {
            if (uname[i] == true) {
                pos_unames.push(uname[i]);
                window.bioWorkspace[uname[i]] = false;
            }
            else {
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
    for (var diagramName in diagramNames) {
        for (var i = 0; i < bioMatches[0].length; i++) {
            if (bioMatches[0][i].includes(diagramName)) {
                console.log('Found a match!');
                console.log(diagramName);
                toggled[bioMatches[1][i]] = true;
                /*if (!toggled.includes(bioMatches[1][i])) {
                    toggleWorkspaceByUname(bioMatches[1][i]);
                    toggled.push(bioMatches[1][i]);
                }*/
            }
        }
    }
    var toggled_keys = [];
    for (var key in toggled) {
        toggled_keys.push(key);
    }
    toggleWorkspaceByUname(toggled_keys, type);
}


window.renewCircuit();