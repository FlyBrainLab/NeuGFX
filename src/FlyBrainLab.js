import svgPanZoom from "svg-pan-zoom/src/svg-pan-zoom.js";
//import GraphicsExplorer from "./graphics_explorer";
import GraphicsExplorer from "./graphics_explorer.js";
import * as d3 from 'd3';
import { event as currentEvent } from 'd3-selection';
import * as iziToast from "iziToast";
import * as Fuse from 'fuse.js';
import Qtip2 from 'qtip2';

export class FlyBrainLab {
    constructor(container, options = {}) {
        this.container = container;
        this.gfx = options['master'] || null;
        this.circuitName = "fly";
        this.experimentConfig = {};
        this.linkPathConfig = [];
        this.CircuitOptions = {
            database: 'https://data.flybrainlab.fruitflybrain.org/data/',
            url: 'FITest',
            neuronColor: "#bbc7a4",
            synapseColor: '#E75A7C',
            edgeColor: '#8DA7BE',
            gravity: 25.,
            layoutTimeout: 10000,
            layouting: "forceatlas2",
            export: function () {
                console.log('exporting...');
                var output = window.s.toSVG({ download: true, filename: 'mygraph.svg', size: 1000 });
            },
            redraw: function () { }
        };
    };

    getSVG() {
        return d3.select(document.querySelector('svg'));
    };

    loadSVG(url, callback) {
        callback = callback || null;
        if (callback != null)
            this.gfx.loadSVG(url, callback);
        else
            this.gfx.loadSVG(url);
    }

    addCircuit(url) {
        if (this.experimentConfig[url] == undefined)
            this.experimentConfig[url] = {};
    }

    loadFBLSVG(url, callback = null) {
        if (this.circuitName != url) {
            this.gfx.loadSVG('https://data.flybrainlab.fruitflybrain.org/data/' + url + '.svg', callback);
            this.circuitName = url;
            this.addCircuit(url);
        }
    }

    loadFBLGEXF(url, callback = null) {
        if (this.circuitName != url || url == "auto") {
            this.CircuitOptions.url = url;
            this.gfx.loadGEXF(url);
            this.circuitName = url;
        }
    }

    loadCircuit(url) {
        if (this.circuitName != url) {
            this.gfx.loadSVG('https://data.flybrainlab.fruitflybrain.org/data/' + url + '.svg', callback);
            this.circuitName = url;
        }
    }

    sendAlert(type, string) {
        if (type == "log")
            console.log("This is a log event.");
        console.log(string);
        this.gfx.sendAlert(string);
    }

    sendMessage(message) {
        this.gfx.sendMessage(message);
    }

    clearSVG() {
        this.gfx.clearSVG();
    }

    refreshSVG() {
        this.gfx.refreshSVG();
    }

    createFBLPath() {
        $('.fbl-path').empty();
        var a = document.createElement('a');
        var linkText = document.createTextNode("Whole Brain");
        a.appendChild(linkText);
        a.href = "#";
        $('.fbl-path').append(a);
        a.addEventListener('click', function () {
            window._neuGFX.mods.FlyBrainLab.loadFBLSVG('fly', function () { window._neuGFX.mods.FlyBrainLab.initializeFlyBrainSVG(); console.log("Submodule loaded.") });
        });
        this.linkPathConfig = [];
        this.linkPathConfig.push({
            name: 'Whole Brain', callback: function () {
                window._neuGFX.mods.FlyBrainLab.loadFBLSVG('fly', function () { window._neuGFX.mods.FlyBrainLab.initializeFlyBrainSVG(); console.log("Submodule loaded.") });
            }
        });
    }

    addFBLPath(name, callback) {
        var previouslyExisting = false;
        var arrayLen = this.linkPathConfig.length;
        for (var i = 0; i < arrayLen-1; i++) {
            if (previouslyExisting == false)
            if (this.linkPathConfig[i].name == name) {
                console.log('Found ' + name + ", index: " + i);
                this.linkPathConfig = this.linkPathConfig.slice(0, i+1);
                console.log(this.linkPathConfig);
                console.log(previouslyExisting);
                this.linkPathConfig[i].callback = callback;
                previouslyExisting = true;
                break;
            }
        }
        if (previouslyExisting == false) {
            var a = document.createElement('a');
            var linkText = document.createTextNode(name);
            var b = document.createTextNode(" ≫ ");
            a.appendChild(linkText);
            a.href = "#";
            $('.fbl-path').append(b);
            $('.fbl-path').append(a);
            $(a).click(callback);
            this.linkPathConfig.push({ name: name, callback: callback });
        }
        var _this = this;
        setTimeout(function(){_this.updateFBLPath();}, 50);
    }

    popFBLPath() {
        this.linkPathConfig = this.linkPathConfig.slice(0, -1);
        this.updateFBLPath();
    }

    updateFBLPath() {
        $('.fbl-path').empty();
        var a = document.createElement('a');
        var linkText = document.createTextNode("Whole Brain");
        a.appendChild(linkText);
        a.href = "#";
        $('.fbl-path').append(a);
        $(a).click( function () {
            window._neuGFX.mods.FlyBrainLab.loadFBLSVG('fly', function () { window._neuGFX.mods.FlyBrainLab.initializeFlyBrainSVG(); console.log("Submodule loaded.") });
        });
        console.log("Link Path:", this.linkPathConfig);
        for (var i = 1; i < this.linkPathConfig.length; i++) {
            var a = document.createElement('a');
            var linkText = document.createTextNode(this.linkPathConfig[i].name);
            var b = document.createTextNode(" ≫ ");
            a.appendChild(linkText);
            a.href = "#";
            $('.fbl-path').append(b);
            $('.fbl-path').append(a);
            $(a).click(this.linkPathConfig[i].callback);
        }
    }

    initializeFlyBrainSVG() {
        window.lpuState = {};
        var svgObj = this.getSVG();
        this.createFBLPath();

        svgObj.selectAll('.lpu').each(function () {

            var id = d3.select(this).attr("id");
            var label = d3.select(this).attr("label");
            lpuState[id] = {
                "selected": true,
                "label": label
            };
            // dynamically generate LPU buttons
            $("#single-lpu").append(
                "<li>" +
                "  <a id='" + "btn" + "-" + id + " " +
                "     role='button'" +
                "     class='btn-lpu-single'>" +
                "       &FilledSmallSquare; " + label +
                "  </a>" +
                "</li>"
            );

        });

        this.graphicsExplorer = new GraphicsExplorer(svgObj, '.lpu', '.tract');
        window.graphicsExplorer = this.graphicsExplorer;

        this.graphicsExplorer.dispatch["dblclick-node"] = function (id) {
            if (id === 'lam_r') {
                window.fbl.loadFBLSVG('lamina', function () { window.fbl.loadSubmodule('data/FBLSubmodules/onLaminaLoad.js'); console.log("Submodule loaded.") });
                //window.fbl.sendMessage({ messageType: 'NLPquery', query: "show columns" }, '*');
            }
            if (id === 'mb_r' || id === 'mb_l') {
                window.fbl.loadFBLSVG('mb', function () { window.fbl.loadSubmodule('data/FBLSubmodules/onMBLoad.js'); console.log("Submodule loaded.") });
                //window.fbl.sendMessage({ messageType: 'NLPquery', query: "show columns" }, '*');
            }
            if (id === 'al_r' || id === 'al_l') {
                window.fbl.loadFBLSVG('al', function () { window.fbl.loadSubmodule('data/FBLSubmodules/onALLoad.js'); console.log("Submodule loaded.") });
                //window.fbl.sendMessage({ messageType: 'NLPquery', query: "show columns" }, '*');
            }
            if (id === 'eb' || id === 'pb' || id === 'fb') {
                window.fbl.loadFBLSVG('cx', function () { window.fbl.loadSubmodule('data/FBLSubmodules/onCXLoad.js'); console.log("Submodule loaded.") });
                //window.fbl.sendMessage({ messageType: 'NLPquery', query: "show columns" }, '*');
            }
        };
        window.fbl.loadSubmodule('data/FBLSubmodules/onFlyLoad.js');

        console.log('Loaded GraphicsExplorer...');

        window.toggleLPUButton = function (id) {
            var btn = $("#btn-" + id);
            var marker = lpuState[id]['selected'] ? "&FilledSmallSquare;" : "&EmptySmallSquare;";
            btn.html(marker + " " + lpuState[id].label);
        }

        window.toggleLPU = function (id, isSel) {
            if (!(id in lpuState))
                return;
            if (isSel === undefined)
                lpuState[id].selected = !lpuState[id].selected;
            else
                lpuState[id].selected = isSel;
            // update svg
            window.graphicsExplorer.toggleNode("#" + id);
            // update btn
            window.toggleLPUButton(id);
            // update 3d scene
            //ffboMesh.toggleVis(id);
        }
        this.graphicsExplorer.dispatch["click-node"] = window.toggleLPU;

        window.onLPUGroupClick = function (id) {
            onRemoveAllClick();
            console.log(id)
            window.graphicsExplorer.selectNodes("." + id);
        }

        window.onTractGroupClick = function (id) {
            onRemoveAllClick();
            window.graphicsExplorer.selectEdges("." + id);
            //for (var x of graphicsExplorer.getEdgeList("."+id, 'mesh-label'))
            //    ffboMesh.show(x);
        }

        window.onAddAllClick = function () {
            for (var key in lpuState) {
                lpuState[key].selected = true;
                window.toggleLPUButton(key);
            }
            window.graphicsExplorer.selectAll();
            //ffboMesh.showAll();
        }
        window.onRemoveAllClick = function () {
            for (var key in lpuState) {
                lpuState[key].selected = false;
                window.toggleLPUButton(key);
            }
            window.graphicsExplorer.unselectAll();
            //ffboMesh.hideAll();
        }

        $(".btn-lpu-single").click(function () {
            var id = $(this).attr("id").substring(4);
            window.toggleLPU(id);
        });
        $(".btn-lpu-group").click(function () {
            var id = $(this).attr("id").substring(4);
            window.onLPUGroupClick(id);
        })
        $(".btn-tract").click(function () {
            var id = $(this).attr("id").substring(4);
            window.onTractGroupClick(id);
        })

        console.log("FlyBrainLab initialized...");


    };

    updateActiveNeuropils(neuropils) {
        if (this.circuitName == "fly") {
            window.onRemoveAllClick();
            for (var i = 0; i < neuropils.length; i++) {
                $('g .lpu').each(function () {
                    if ($(this).attr('label').indexOf(neuropils[i]) > -1) {
                        if ((neuropils[i] == "OG" && $(this).attr('label').indexOf("SOG") > -1) || (neuropils[i] == "og" && $(this).attr('label').indexOf("sog") > -1)) { }
                        else
                            window.toggleLPU($(this).attr('id'), true);
                    }
                });
            }
        }
    };

    loadSubmodule(url, callback) {
        $.ajax({
            url: url,
            dataType: 'script',
            success: callback,
            async: true
        });
    }

    loadResults(data) {

    }

    executeGFXquery(c_string) {
        this.sendAlert('log', 'Sending query to NeuroNLP...');
        var fuse_options = {
            caseSensitive: true,
            shouldSort: true,
            tokenize: true,
            threshold: 0.35,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: undefined
        };

        var fuse_options_matches = {
            includeMatches: true,
            caseSensitive: true,
            shouldSort: true,
            tokenize: true,
            threshold: 0.35,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: undefined
        };

        var tag_search_string = '';
        var lexicon_synonyms = { ablate: 'deactivate', restore: 'activate' };
        var c_string_words = c_string.split(' ');
        var lexicon_defns = Object.keys(lexicon_synonyms);
        c_string_words = c_string_words.map(function (phrase) {
            return lexicon_synonyms[phrase] || phrase;
        });
        c_string = c_string_words.join(' ');
        /*var fuse = new Fuse(lexicon_tags, fuse_options_matches);
        var matches = fuse.search(c_string);
        for (var i = 0; i < matches.length; i++) {
            c_string = c_string + " " + lexicon[matches[i]];
        }*/
        var understood = false;
        console.log(c_string);
        console.log(c_string.indexOf('load experiment'));
        if (c_string.indexOf('load experiment') !== -1) {
            //sendAlert('log','Generated Search String: ' + c_string);
            this.sendMessage({ messageType: 'GFXMessage', args: { content: 'Generated Search String: ' + c_string, type: "log" } }, '*');
            experiment_name = c_string.slice('load experiment'.length + 1);
            if ($.inArray(circuit_name + '.json', file_list) > -1) {
                this.sendAlert('success', 'Experiment loaded!');
            }
            else {
                this.sendAlert('error', 'Specified experiment does not exist!');;
            }
        }
        else if (c_string.indexOf('load circuit') !== -1) {
            //sendAlert('log','Generated Search String: ' + c_string);
            this.sendMessage({ messageType: 'GFXMessage', args: { content: 'Generated Search String: ' + c_string, type: "log" } }, '*');
            circuit_name = c_string.slice('load circuit'.length + 1);
            if ($.inArray(circuit_name + '_visual.svg', file_list) > -1) {
                current_session.call('data/' + circuit_name + '_visual.svg');
            }
            else {
                //sendAlert('error','Specified circuit does not exist!');
                this.sendMessage({ messageType: 'GFXMessage', args: { content: 'Specified circuit does not exist!', type: "error" } }, '*');
            }
        }
        else {
            var lexicon_tags = ['KC', 'DAN', 'MBON', 'neuron', 'synapse', 'all'];
            var fuse = new Fuse(lexicon_tags, fuse_options);
            var matches = fuse.search(c_string);
            for (var i = 0; i < matches.length; i++) {
                c_string = c_string + " " + lexicon_tags[matches[i]];
            }
            //sendAlert('log','Generated Search String: ' + c_string);
            this.sendMessage({ messageType: 'GFXMessage', args: { content: 'Generated Search String: ' + c_string, type: "log" } }, '*');
            if (c_string.indexOf('deactivate') !== -1) {
                understood = true;
                //console.log('Ablating...', c_string);
                //sendAlert('log','Parsed entry, retrieving and applying results...');
                this.sendMessage({ messageType: 'GFXMessage', args: { content: 'Parsed entry, retrieving and applying results...', type: "log" } }, '*');
                var token_list = c_string.split(' ');
                $("svg g.neuron_class").each(function () {
                    for (var i = 0; i < token_list.length; i++) {
                        if ($(this).attr('tooltip-data').indexOf(token_list[i]) !== -1 || token_list[i] == 'all') {
                            $(this).attr('inactive', 'true');
                            var neuron = $(this).attr('name');
                            $("svg g.synapse_class").each(function () {
                                if ($(this).attr("presyn") == neuron)
                                    $(this).attr('inactive', 'true');
                                if ($(this).attr("postsyn") == neuron)
                                    $(this).attr('inactive', 'true');
                            });
                        }
                    }
                });
                $("svg g.synapse_class").each(function () {
                    for (var i = 0; i < token_list.length; i++) {
                        if ($(this).attr('tooltip-data').indexOf(token_list[i]) !== -1 || token_list[i] == 'all') {
                            $(this).attr('inactive', 'true');
                        }
                    }
                });

                this.sendMessage({ messageType: 'GFXMessage', args: { content: 'Results applied!', type: "success" } }, '*');
                $('#search_box').val('');
            }
            else if (c_string.indexOf('activate') !== -1) {
                understood = true;

                this.sendMessage({ messageType: 'GFXMessage', args: { content: 'Parsed entry, retrieving and applying results...', type: "log" } }, '*');
                var token_list = c_string.split(' ');
                $("svg g.neuron_class").each(function () {
                    for (var i = 0; i < token_list.length; i++) {
                        if ($(this).attr('tooltip-data').indexOf(token_list[i]) !== -1 || token_list[i] == 'all') {
                            $(this).removeAttr('inactive');
                            if (c_string.indexOf('synapse') !== -1 || token_list[i] == 'all') {

                            }
                        }
                    }
                });
                $("svg g.synapse_class").each(function () {
                    for (var i = 0; i < token_list.length; i++) {
                        if ($(this).attr('tooltip-data').indexOf(token_list[i]) !== -1 || token_list[i] == 'all') {
                            $(this).removeAttr('inactive');
                        }
                    }
                });
                //sendAlert('success','Results applied!');
                this.sendMessage({ messageType: 'GFXMessage', args: { content: 'Results applied!', type: "success" } }, '*');
                $('#search_box').val('');
            }
            else {
                //sendAlert('error',"Sorry! NeuroNLP was unable to parse your entry.");
                this.sendMessage({ messageType: 'GFXMessage', args: { content: "Sorry! NeuroNLP for GFX was unable to parse your entry.", type: "error" } }, '*');
            }

        }
    };

    loadNewLPU() {
        $("svg g").each(function () {
            console.log($(this).find('title').text());
            $(this).attr("tooltip-data", $(this).find('title').text());
            //$(this).find('title').remove();
            console.log($(this).find('tooltip-data').text());
        });
        $("svg g.synapse_class").each(function () {
            console.log($(this).find('tooltip-data').text());
            var synapse_info = $(this).attr('tooltip-data').split(' :: ')[2];
            if (typeof synapse_info === 'string') {
                $(this).attr("synapse_info", synapse_info);
                $(this).attr("presyn", synapse_info.split('-:-')[0]);
                $(this).attr("postsyn", synapse_info.split('-:-')[1]);
                $(this).attr("tags", $(this).attr('tooltip-data').split(' :: ')[3]);
            }
        });

        $("svg g.neuron_class").each(function () {
            console.log($(this).find('tooltip-data').text());
            var name = $(this).attr('tooltip-data').split(' :: ')[2];
            $(this).attr("name", name);
            $(this).attr("tags", $(this).attr("name") + ' ' + $(this).attr('tooltip-data').split(' :: ')[3]);
        });

        $('svg g.synapse_class,.synapse_class').on('click', function () {
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
            try { window.updateCircuit();} catch {};
        });

        $('svg g.neuron_class,.neuron_class').on('click', function () {
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
            try { window.updateCircuit();} catch {};
        });
        setTimeout(function () {
            $('.default_class, .synapse_class, .neuron_class').qtip({
                content: {
                    text: function (api) {
                        //return $(this).find('title').text().split(' :: ')[1];
                        console.log($(this).attr('tooltip-data'));
                        return $(this).attr('tooltip-data').split(' :: ')[1];
                    },
                    title: {
                        text: function (api) {
                            //return $(this).find('title').text().split(' :: ')[0];
                            return $(this).attr('tooltip-data').split(' :: ')[0];
                            //OR
                            return $(this).attr('tooltip');
                        }
                    }
                },
                position: {
                    target: 'mouse', // Track the mouse as the positioning target
                    adjust: { x: 5, y: 5 } // Offset it slightly from under the mouse
                },
                style: {
                    classes: 'qtip-bootstrap-neurogfx'
                }
            });

            $("svg g").each(function () {
                $(this).find('title').remove();
            });
        }, 10);
    }

};

export default { FlyBrainLab };