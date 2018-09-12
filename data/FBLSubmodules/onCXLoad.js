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

window.updateCircuit = function () {
    window.fbl.experimentConfig['cx'].disabled = [];
    svgObj.selectAll(".region,.neuron").each(function (d, i) {
        if (this.getAttribute("selected") == "false") {
            window.fbl.experimentConfig['cx'].disabled.push(d3.select(this).attr("label"));
        }
    });
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
        var querylabel = this.getAttribute("label");
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
                        d3.select(this).style("opacity", "0.4");
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
                                d3.select(_this).style("opacity", "0.4");
                                try { children.style("opacity", "0.4"); } catch { };
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

svgObj.selectAll(".region,.neuron").on("click", function (d, i) {
    //svgObj.selectAll(".region,.neuron").each(function (d, i) {
    //d3.select(this).style("opacity", "0.3");
    if (this.getAttribute("hovered") == "true") {
        if (this.getAttribute("selected") == "false") {
            console.log('Activating ' + this);
            var _this = this;
            d3.select(_this).attr("selected", "true");
            d3.select(_this).style("opacity", "1");
            var children = d3.selectAll(_this.childNodes);
            try { children.style("opacity", "1"); } catch { };
            try { children.attr("selected", "true"); } catch { };
            var toggleLabels = {};
            toggleLabels[this.getAttribute("label")] = true;
            if (this.getAttribute("label") != null) {
                var label = this.getAttribute("label");
                var labels = label.split("|");
                labels.forEach(function (d) {
                    toggleLabels[d] = true;
                });
            }
            toggleByDiagramName(toggleLabels, "true");
        }
        else {
            //console.log('Deactivating ' + this);
            var _this = this;
            d3.select(_this).attr("selected", "false");
            d3.select(_this).style("opacity", "0.4");
            var children = d3.selectAll(_this.childNodes);
            //try {children.style("opacity", "1");} catch {};
            try { children.attr("selected", "false"); } catch { };
            if (d3.select(_this).attr("selected") == "false") {
                try { children.style("opacity", "0.4"); } catch { };
            }
            var toggleLabels = {};
            toggleLabels[this.getAttribute("label")] = true;
            if (this.getAttribute("label") != null) {
                var label = this.getAttribute("label");
                var labels = label.split("|");
                labels.forEach(function (d) {
                    toggleLabels[d] = true;
                });
            }
            toggleByDiagramName(toggleLabels, "false");
        }
    }
    //});
    updateCircuit();
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

var neurons = svgObj.selectAll(".neuron");

var regions = svgObj.selectAll(".region")
    .on("dblclick", function (d, i) {
        //console.log("dblclicked!");

        var pre_id_list = [];
        var post_id_list = [];
        var label_this = d3.select(this).attr("label");

        neurons.each(function (d, i) {
            if (d3.select(this).attr("selected") == "true") {
                var id_neuron = d3.select(this).attr("id");
                var pre_region = d3.select(this).attr("presynaptic");
                if (pre_region != null) {
                    if (pre_region.indexOf(label_this) != -1) {
                        pre_id_list.push(id_neuron);
                    }
                }

                var post_region = d3.select(this).attr("postsynaptic");
                if (post_region != null) {
                    if (post_region.indexOf(label_this) != -1) {
                        post_id_list.push(id_neuron);
                    }
                }
            }

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
            window.fbl.loadSubmodule('data/FBLSubmodules/onIOLoad.js');
        }

    });


window._neuGFX.mods.FlyBrainLab.addFBLPath("Central Complex", function () { window.fbl.loadFBLSVG('cx', function () { window.fbl.loadSubmodule('data/FBLSubmodules/onCXLoad.js'); console.log("Submodule loaded.") }); });
window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPloadTag', tag: "centralcomplex_diagram" });

$.getJSON("https://data.flybrainlab.fruitflybrain.org/cx_gfx_correlates.json", function (data) {
    window.bioMatches = data;
    window.bioWorkspace = [];
    for (var i = 0; i < bioMatches[1].length; i++) {
        window.bioWorkspace[bioMatches[1][i]] = true;
    }

});


toggleWorkspaceByUname = function (uname, type) {
    if (type == "true")
    {
        uname = '"' + uname.join('","') + '"';
        window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPaddByUname', uname: uname });
    }
    else if (type == "false")
    {
        uname = '"' + uname.join('","') + '"';
        window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPremoveByUname', uname: uname });
    }
    else
    {
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


