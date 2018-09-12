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
        neuList.forEach(function (element) {
            element = element.replace('a','alpha');
            var neu = svgObj.select("#" + element);
            if (neu.attr("visible") == "true") {
                toggleByID(element, false);
            };
        });
        NLPInput.elements.forEach(function (element) {
            element = element.replace('a','alpha');
            toggleByID(element, false);
        });
    }
    if (NLPInput.command == "remove") {
        NLPInput.elements.forEach(function (element) {
            element = element.replace('a','alpha');
            var neu = svgObj.select("#" + element);
            if (neu.attr("visible") == "true") {
                toggleByID(element, false);
            };
        });
    }
    if (NLPInput.command == "add") {
        NLPInput.elements.forEach(function (element) {
            element = element.replace('a','alpha');
            var neu = svgObj.select("#" + element);
            if (neu.attr("visible") != "true") {
                toggleByID(element, false);
            };
        });
    }
}

/*
 * Create neuron list
 */
svgObj = d3.select(document.querySelector('svg'));
var neuList = [
    'C2', 'C3', 'L1', 'L2', 'L3', 'L4', 'L5', 'R1', 'R2', 'R3', 'R4',
    'R5', 'R6', 'T1', 'alpha1', 'alpha2', 'alpha3', 'alpha4', 'alpha5', 'alpha6'];

//var neuList = ['C2','C3'];
/*
 * Create neuron json
 */
neuJson = {};
for (var i = 0; i < neuList.length; i++) {
    var id = neuList[i];
    if (id[0] == 'a')
        id = 'a' + id[5];
    neuJson[neuList[i]] = {
        'filename': '/lpu/lam_r/swc/' + id + '.swc',
        'label': neuList[i]
    };
}

var cartridge_data_set = false;

$(".vis").dblclick(function () {
    if ($(this).hasClass("vis-sm")) {
        $(".vis-hf-r").toggleClass("vis-sm vis-hf-r");
        $(".vis-lg").toggleClass("vis-sm vis-lg");
        $(this).toggleClass("vis-sm vis-lg");
    }
});




//var toolTip = new ToolTip("tool-tip");
svgObj.on('dblclick', function () {
    if ($("#vis-svg").hasClass("vis-svg-sm")) {
        $("#vis-svg").toggleClass("vis-svg-sm vis-svg-lg");
        $("#vis-3d").toggleClass('vis-3d-sm vis-3d-lg');
        //ffboMesh.onWindowResize();
    }
});
//var svg = svgObj.selectAll(".neuron-block");
function toggleByID(a, echo = true) {
    var neu = svgObj.select("#" + a);
    var hideOrShow = "remove";
    $("#btn-" + a).toggleClass("selected unselected");
    if (neu.attr("visible") == "true") {
        neu.attr("visible", "false");
        neu.style("opacity", "0.3");
        $("#btn-" + a).html('&EmptySmallSquare; ' + a);
        hideOrShow = "remove";
    } else {
        neu.attr("visible", "true");
        neu.style("opacity", "1.0");
        $("#btn-" + a).html('&FilledSmallSquare; ' + a)
        hideOrShow = "add";
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

    if (cartridge_data_set) {
        $("#num-of-cartridge").text("Cartridge #" + cartridge_num + ", Number of Neurons: " + getNeuronCount());
    }

    if (echo == true) {
        b = a;
        b = b.replace("alpha", "a");
        if (b.indexOf('R') > -1)
            window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPquery', query: hideOrShow + " " + b });
        else
            window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPquery', query: hideOrShow + " " + b + " home" });
    }
}
for (var i = 0; i < neuList.length; i++) {
    var id = neuList[i];
    $("#single-neu").append("<li><a id='" + "btn" + "-" + id + "'role='button' class='btn-neu-single selected'>&FilledSmallSquare; " + id + "</a></li>");
}
$(".btn-neu-single").click(function () {
    var id = $(this).attr("id").substring(4);
    toggleByID(id);
});
/*
 * create neuron 3D mesh
ffboMesh = new FFBOMesh3D('vis-3d', {'ffbo_json':neuJson, 'colororder': 'order', 'showAfterLoadAll': true}); 
ffboMesh.dispatch['click'] = toggleByID;
 */
//ffboMesh = new FFBOMesh3D('vis-3d', neuJson, toggleByID);
//ffboMesh.animate();
//new ResizeSensor($("#vis-3d"), function() {
//ffboMesh.onWindowResize();
//});

window.onAddAllClick = function () {
    svgObj.selectAll(".syn-stroke")
        .style("opacity", "1.0")
        .attr("count", 0);
    //ffboMesh.showAll();
    //window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPquery', query: "remove neurons" });
    window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPloadTag', tag: "homecartridge" });
    //window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPaddByUname', uname: "TH-F-200073" });
    //neuList.forEach(function(el) {el = el.replace("alpha", "a"); window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPquery', query: "add " + el + " in column home" });});

    svgObj.selectAll(".neuron-block")
        .attr("visible", "true")
        .style("opacity", "1.0")
        .each(function () {
        })
    $(".btn-neu-single").each(function () {
        var id = $(this).attr("id").substring(4);
        $(this).removeClass("unselected");
        $(this).addClass("selected");
        $(this).html('&FilledSmallSquare; ' + id)
    });
}

window.onRemoveAllClick = function () {
    svgObj.selectAll(".syn-stroke")
        .style("opacity", "0.0")
        .attr("count", function () { return d3.select(this).attr("max-count") });
    svgObj.selectAll(".neuron-block")
        .attr("visible", "false")
        .style("opacity", "0.3")
        .each(function () {
        })
    $(".btn-neu-single").each(function () {
        var id = $(this).attr("id").substring(4);
        $(this).removeClass("selected");
        $(this).addClass("unselected");
        $(this).html('&EmptySmallSquare; ' + id)
        svgObj.selectAll(".neuron-block")
    });
    //ffboMesh.hideAll();
}
svgObj.selectAll(".neuron-block")
    .style("cursor", "pointer")
    .style("opacity", "1.0")
    .attr("visible", "true")
    .each(function () {
        var a = d3.select(this).attr("id");
        svgObj.selectAll("." + a + "-dependent")
            .style("opacity", function () {

                if (d3.select(this).attr("count") == null)
                    d3.select(this).attr("count", 0);
                if (d3.select(this).attr("max-count") == null)
                    d3.select(this).attr("max-count", 0);
                var count = parseInt((d3.select(this).attr("max-count")), 10);
                count += 1;
                d3.select(this).attr("max-count", count);
                d3.select(this).classed("syn-stroke", true);
            })
    })
    .on("mouseover", function () {
        if (d3.select(this).attr("visible") == "true") {
            d3.select(this).style("opacity", 0.5);
        }
        var neuron_id = d3.select(this).attr("id")
        var neuron_label;

        if (cartridge_data_set) {
            if (Object.keys(cartridge_name_to_label).indexOf(neuron_id) > -1) {
                //toolTip.showNeuronInfo(10,250,neuron_id,
                //    cartridge_graph["nodes"][cartridge_name_to_label[neuron_id]["key"]]);
            } else {
                //toolTip.showText(10,250,"Neuron not Available")
            }
        } else {
            //toolTip.showNeuronInfo(10,250,neuron_id,{"N/A": "N/A"})
        };
    })
    .on("mouseout", function () {
        if (d3.select(this).attr("visible") == "true") {
            d3.select(this).style("opacity", 1.0);
        }
        //toolTip.hide();
    })
    .on("click", function () {

        var id = d3.select(this).attr("id");

        toggleByID(id);
    })
//    $("#btn-nk").click( function() {
//        if ($(this).hasClass('closed')) {
//            $(this).text("Close NK");
//            $(".vis-3d-lg").toggleClass('vis-3d-lg vis-sm-2')
//            $(".vis-svg-lg").toggleClass('vis-svg-lg vis-sm-2')
//            $(".vis-3d-sm").toggleClass('vis-3d-sm vis-sm-1')
//            $(".vis-svg-sm").toggleClass('vis-svg-sm vis-sm-1')
//            $("#nk-panel").show();
//        } else {
//            $(this).text("Open NK");
//            $(".vis-sm-1").each( function() {
//                var c = $(this).attr('id') + '-sm';
//                $(this).toggleClass('vis-sm-1 ' + c);
//            })
//            $(".vis-sm-2").each( function() {
//                var c = $(this).attr('id') + '-lg';
//                $(this).toggleClass('vis-sm-2 ' + c);
//            })
//            $("#nk-panel").hide();
//        }
//        $(this).toggleClass('closed opened');
//    });
getNeuronCount = function () {
    var activeObj = getActiveObjOnSVG();
    var activeObj_to_label = [];
    for (var key in cartridge_node_dict) {
        var name = cartridge_node_dict[key]["name"];
        if (name.constructor === Array) { // Amacrine Cells
            var count = [];
            // get all the alpha processes that is not active
            for (var i = 0; i < name.length; i++) {
                var alpha_process = name[i];
                if (activeObj.indexOf(alpha_process) < 0) {
                    count.push(alpha_process);
                };
            };
            // if all alpha processes associated with the Amacrine cell
            // is not active, then remove the Amacrine cell by label
            if (count.length != name.length) {
                activeObj_to_label.push(key);
            };
        } else {
            if (activeObj.indexOf(name) >= 0) {
                activeObj_to_label.push(key);
            };
        };
    };
    return activeObj_to_label.length;
}
function getActiveObjOnSVG() {
    var list = [];
    svgObj.selectAll(".neuron-block")
        .each(function () {
            if (d3.select(this).attr("visible") == "true")
                list.push(d3.select(this).attr("id"));
        });
    svgObj.selectAll("path.syn-stroke")
        .each(function () {
            if (parseInt(d3.select(this).attr("count")) == 0) { }
            //    list.push( d3.select(this).attr("id") );
        });

    return list;
}
//nkpanel = new NKPanel("nk-panel");


$("#nk-panel").hide();
$('.vis')
    .mouseenter(function () {
        if ($(this).hasClass("vis-sm") || $(this).hasClass("vis-sm-1"))
            $("#nk-panel").toggleClass('nk-panel-half nk-panel-whole');
    })
    .mouseleave(function () {
        if ($(this).hasClass("vis-sm") || $(this).hasClass("vis-sm-1")) {
            $("#nk-panel").toggleClass('nk-panel-half nk-panel-whole');
        }
    });
$('.vis').dblclick(function () {
    if ($(this).hasClass("vis-hf-l") || $(this).hasClass("vis-sm-1"))
        $(this).toggleClass("vis-sm-1 vis-hf-l")
})


$('.vis').hover(
    function () {
        if ($(this).hasClass("vis-sm"))
            $(".vis-lg").toggleClass("vis-hf-r vis-lg");
    }, function () {
        if ($(this).hasClass("vis-sm"))
            $(".vis-hf-r").toggleClass("vis-hf-r vis-lg");
    });



onToggleNeuronsClick = function () {
    mm_menu_right.open();
    $("a[href='#toggle_neurons']")[0].click()
}
openRightMenu = function () {
    mm_menu_right.open();
}
openServerMenu = function () {
    mm_menu_left.open();
}
// Load Cartridge button clicking event
onLoadClick = function () {
    construct_cartridge(client_session, cartridge_num);
}
onOpenNKClick = function () {
    console.log("launch NK btn clicked");

    if (cartridge_data_set) {
        if ($(".btn-nk").hasClass('closed')) {
            var activeObj = getActiveObjOnSVG();
            console.log(activeObj);
            start_nk_execution(client_session, activeObj);
            $(".btn-nk").text("Close NK");
        } else {
            $(".btn-nk").text("Open NK");
            $("#vis-svg").toggleClass('vis-sm vis-lg')
            $("#vis-3d").toggleClass('vis-sm-1 vis-sm')
            $("#nk-panel").hide();
            //nkpanel.hidePlayBar();
        }
        $(".btn-nk").toggleClass('closed opened');
        //ffboMesh.loadAnimJson(animJSON);
    } else {
        Notify("Error: Please load cartridge info first by clicking on 'Load Cartridge'", null, null, 'danger')
    };

}

var QueryString = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

var cartridge_num = QueryString.cartridge_num;
console.log(cartridge_num)

$("#num-of-cartridge").text("Cartridge #" + cartridge_num)

$("#btn-tutorial-video").click(function () { $("#video-panel").slideDown(500) });
$("#btn-video-close").click(function () {
    $("#video-iframe")[0].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    $("#video-panel").slideUp(500)
});
//function processUser()
//{
//var parameters = location.search.substring(1).split("&");
//
//var temp = parameters[0].split("=");
//l = unescape(temp[1]);
//temp = parameters[1].split("=");
//p = unescape(temp[1]);
//document.getElementById("cartnum").innerHTML = l;
//console.log(p)
//}


window._simulate = function () {
    //window._neuGFX.sendAlert("Starting execution...");
    var cartid = window.customCircuitAttributes.cartridge_num;
    var uids = [];
    var data = [];
    var activeList = getActiveObjOnSVG();
    window.simData['uids'].forEach(function (value, i) {
        var a = value.split("_");
        //console.log(a[a.length - 1]);
        if (a[a.length - 1] == String(cartid)) {
            var uid = window.simData['uids'][i];
            if (activeList.includes(a[1])) {
                data.push(window.simData['data'][i]);
                uids.push(window.simData['uids'][i]);
            }
        }
        //console.log('%d: %s', i, value);
    });
    //console.log(uids);
    window._neuGFX.sendAlert("Results loaded!");
    window._neuGFX.mods.Plotter.addExternalData(data, uids,"Time [s]","Voltage [mV]");
}

window._neuGFX.mods.FlyBrainLab.addFBLPath("Cartridge",function() {});
console.log('Loading was successful...');
window.onAddAllClick();

window.simulate = function () {
    window._neuGFX.sendAlert("Starting execution...");
    jQuery.getJSON("https://data.flybrainlab.fruitflybrain.org/simresults/lamina_output0.json", function (result) {
        console.log(result);
        window.simData = result;
        //window._neuGFX.mods.Plotter.addExternalData(result['data'], result['uids']);
        jQuery.getJSON("https://data.flybrainlab.fruitflybrain.org/simresults/retina_output0.json", function (result) {
            console.log(result);
            window.simData['data'] = window.simData['data'].concat(result['data']);
            window.simData['uids'] = window.simData['uids'].concat(result['uids']);
            //window._neuGFX.mods.Plotter.addExternalData(result['data'], result['uids']);
            console.log("Test data loaded...")
            window._neuGFX.sendAlert("Execution complete! Loading results...");
            window._simulate();
        });
        console.log("Test data loaded...")
    });
}
