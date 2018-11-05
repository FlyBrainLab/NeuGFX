import { debug } from 'util';

// Important Package Imports

// Sigma and its Plugins
import Sigma from 'sigma';
import('sigma/build/plugins/sigma.layout.forceAtlas2.min');
import('sigma/build/plugins/sigma.layout.noverlap.min');
import('./sigma.parsers.gexf.min'); // the current parser has a bug that is fixed in this local file
import Mustache from "mustache";
import('sigma/build/plugins/sigma.parsers.json.min');
import('sigma/build/plugins/sigma.exporters.svg.min');
import('sigma/build/plugins/sigma.plugins.animate.min');
import('sigma/build/plugins/sigma.plugins.dragNodes.min');
import('sigma/build/plugins/sigma.plugins.filter.min');
import('./sigma.plugins.tooltips.min');
import('sigma/build/plugins/sigma.plugins.relativeSize.min');
import('sigma/build/plugins/sigma.renderers.parallelEdges.min');
import('sigma/build/plugins/sigma.renderers.snapshot.min');
// SVG-Pan-Zoom
import svgPanZoom from "svg-pan-zoom/src/svg-pan-zoom.js";
import * as d3 from 'd3';
import { event as currentEvent } from 'd3-selection';


import * as iziToast from "izitoast"
import dat from '../etc/dat.gui';

// Our Own Sub-Modules
import { FlyBrainLab } from "./FlyBrainLab.js";
import { GFXPlotter } from "./GFXPlotter.js";


// Stylings for neuGFX
import '../style/iziToast.min.css';
import '../style/jquery.qtip.min.css';
import '../style/circuitDiagrams.css';
import '../style/neuGFX.css';


// add FontAwesome
import fontawesome from '@fortawesome/fontawesome';
import solid from '@fortawesome/fontawesome-free-solid';
import regular from '@fortawesome/fontawesome-free-regular';
fontawesome.library.add(regular);
fontawesome.library.add(solid);


var isOnMobile = checkOnMobile();

function checkOnMobile() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    return true;
  else
    return false;
}

function getAttr(obj, key, val) {
  if (key in obj)
    val = obj[key];
  return val;
}

function setAttrIfNotDefined(obj, key, val) {
  if (!(key in obj))
    obj[key] = val;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main class for NeuGFX behavior

class NeuGFX {
  constructor(container, options = {}) {
    /**
    * Initializes the NeuGFX class.
    * @param {domObject} container Container for the NeuGFX.
    * @param {dict} options Optional argument specifying various options for NeuGFX.
    */

    this.container = container;
    this.customCircuitAttributes = {};
    this.plotMode = "sigma";
    this.screenMode = "diagram";
    this.mode = "object";
    this.svgElement = null;
    this.mods = {};
    this.data = {};

    window.modelUpdate = function (NLPInput) {
      console.log('modelUpdate called, but no modelUpdate was defined.');
    }

    this.CircuitOptions = {
      database: 'https://data.flybrainlab.fruitflybrain.org/data/',
      url: 'FITest',
      neuronColor: "#bbc7a4",
      synapseColor: '#E75A7C',
      edgeColor: '#8DA7BE',
      gravity: 25.,
      layoutTimeout: 10000,
      export: function () {
        console.log('exporting...');
        var output = window.s.toSVG({ download: true, filename: 'graph_output.svg', size: 1000 });
      },
      redraw: function () { }
    };
    window.iframeEventHandler = function (event) {
      console.log('[GFX FrontEnd Obtained Message:]', event.data);
      var msg = event.data;
      //permittedMessages = ['loadResults', 'clearResults', 'showServerMessage', 'startExecution', 'loadCircuit', 'updateFileList'];
      switch (msg.messageType) {
        case 'loadResults': {
          window._neuGFX.mods.Plotter.addExternalData(event.data.data['data'], event.data.data['uids']);
          break;
        }
        case 'togglePlotter': {
          window._neuGFX.toggleScreen();
          window._neuGFX.sendAlert("Plotter toggled...");
          break;
        }
        case 'clearResults': {
          window._neuGFX.mods.Plotter.clear_data();
          window._neuGFX.mods.Plotter.clear_plot();
          break;
        }
        case 'showServerMessage': {
          window._neuGFX.showServerMessage(event.data.data);
          break;
        }
        case 'startExecution': {
          window._neuGFX.startExecution(event.data.data);
          break;
        }
        case 'loadCircuit': {
          window._neuGFX.sendAlert("Loading a circuit...");
          window._neuGFX.mods.FlyBrainLab.loadCircuit(event.data.data, null);
          // window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPloadTag', tag: "homecartridge" });
          break;
        }
        case 'loadJS': {
          window._neuGFX.mods.FlyBrainLab.loadSubmodule(event.data.data);
          break;
        }
        case 'getExperimentConfig': {
          window._neuGFX.sendAlert("Loading experiment settings...");
          var experimentConfig = JSON.stringify(window._neuGFX.mods.FlyBrainLab.experimentConfig);
          window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'loadExperimentConfig', config: experimentConfig });
          break;
        }
        case 'updateActiveNeuropils': {
          window._neuGFX.mods.FlyBrainLab.updateActiveNeuropils(event.data.data);
          break;
        }
        case 'runLayouting': {
          window._neuGFX.sendAlert("Starting layouting...");
          window._neuGFX.mods.FlyBrainLab.loadFBLGEXF('auto');
          break;
        }
        case 'updateFileList': {
          window._neuGFX.updateFileList(event.data.data);
          break;
        }
        case 'GFXquery': {
          window._neuGFX.executeGFXquery(event.data.data);
          break;
        }
        case 'simulate': {
          window.simulate();
          break;
        }
        case 'Data': {
          var sender = event.data.data.sender;
          var value = event.data.data.value;
          //console.log(data);
          var type = value.type;
          if (value.type == "append") {
            console.log(value.type, sender._value[value['data']].name);
            window._neuGFX.data = {
              ...window._neuGFX.data,
              ...sender._value
            };
            var message = { command: 'add', elements: [window._neuGFX.data[value['data']].name] };
            console.log(message);
            window.modelUpdate(message);
          }
          if (value.type == "remove") {
            try {
              console.log(value.type, window._neuGFX.data[value['data']].name);
              window.modelUpdate({ command: 'remove', elements: [window._neuGFX.data[value['data']].name] });
            }
            catch { };
          }
          break;
          //if ("data" in data) {
          //  console.log(data);
          //}
          //window.neu_neuGFXgfx.executeGFXquery(event.data.data);
        }
      }
    }
    //this.checkIframe();
  };

  connectModule(moduleName) {
    switch (moduleName) {
      case "FlyBrainLab":
        this.mods.FlyBrainLab = new FlyBrainLab(this.container, { master: this });
        break;
      case "Plotter":
        this.mods.Plotter = new GFXPlotter(100, 100);
        $('.fbl-plotter-container').hide();
        break;
    }
  }

  getModule(moduleName) {
    return this.mods[moduleName];
  }

  sendAlert(string, type = "success") {
    if (type == "log")
      console.log("This is a log event.");
    console.log(string);
    window.top.postMessage({ messageType: 'alert', alertType: "success", data: string }, '*');
  }

  sendMessage(message) {
    console.log(message);
    if (this.mode == "iframe")
      window.top.postMessage(message, '*');
  }

  loadMockData() {
    /**
    * Loads made-up data to the plotter. For testing.
    */
    this.plotter.createMockData();
  }

  clearSVG() {
    this.plotMode = "SVG";
    try { this.clearGraph(); } catch { };
    this.clear();
    d3.select(this.container).append("svg");
  }

  refreshSVG() {
    var svgElement = document.querySelector('svg');
    $(svgElement).width('100%');
    $(svgElement).height('100%');
    var panZoomSVG = svgPanZoom(svgElement, {
      dblClickZoomEnabled: false,
      preventMouseEventsDefault: false
    });
    window.addEventListener("resize", function () {
      console.log('Resized the SVG...');
      panZoomSVG.resize(); 
      panZoomSVG.updateBBox(); 
      panZoomSVG.fit();
      panZoomSVG.center();
    });
  }

  loadSVG(url, callback = function () { }) {
    this.plotMode = "SVG";
    $('.activitySlider').remove();
    try { this.clearGraph(); } catch { };
    this.clear();
    $(this.container).load(url, function () {
      var svgElement = document.querySelector('svg');
      $(svgElement).width('100%');
      $(svgElement).height('100%');
      var panZoomSVG = svgPanZoom(svgElement, {
        dblClickZoomEnabled: false,
        preventMouseEventsDefault: false
      });
      window.addEventListener("resize", function () {
        console.log('Resized the SVG...');
        panZoomSVG.resize(); 
        panZoomSVG.updateBBox(); 
        panZoomSVG.fit();
        panZoomSVG.center();
      });
      callback();
    });
  }

  loadGEXF(url, callback = function () { }) {
    this.plotMode = "sigma";
    $('.activitySlider').remove();
    try { this.clearGraph(); } catch { };
    this.clear();
    this.CircuitOptions.url = url;
    this.initializeGEXF(this.CircuitOptions);
  }

  switchScreen(screen) {
    if (screen == "plot") {
      $('#fbl-vis-gfx').hide();
      $('.fbl-plotter-container').show();
      this.mods.Plotter.resize();
      this.screenMode = "plot";
    }
    if (screen == "diagram") {
      $('#fbl-vis-gfx').show();
      $('.fbl-plotter-container').hide();
      this.screenMode = "diagram";
    }
  }

  toggleScreen() {
    if (this.screenMode == "plot")
      this.screenMode = "diagram";
    else if (this.screenMode == "diagram")
      this.screenMode = "plot";
    this.switchScreen(this.screenMode);
  }

  clearGraph() {
    this.s.stopForceAtlas2();
    this.s.graph.clear();
    this.s.graph.kill();
    $(this.container).empty();
  }

  initializeGEXF(CircuitOptions) {
    this.plotMode = "sigma";
    try { this.clearGraph(); } catch { };
    var defaultSettings = {
      autoRescale: true,
      mouseEnabled: true,
      touchEnabled: false,
      nodesPowRatio: 1,
      edgesPowRatio: 1,
      defaultEdgeColor: '#484848',
      defaultNodeColor: '#333',
      defautlEdgeType: 'arrow',
      edgeColor: 'default',
      defaultLabelSize: 12,
      defaultLabelColor: '#FFFFFF',
      zoomMin: 0.03125
    };
    this.s = new sigma({
      renderer: {
        container: this.container,
        type: 'canvas'
      },
      settings: defaultSettings
    });

    console.log(sigma.parsers);
    window.s = this.s;

    window.generateTooltip = function (data) {
      var templateStart = '' +
        ' <div class="sigma-tooltip-header">' + data.label + '</div>' +
        '  <div class="sigma-tooltip-body">' +
        '    <table>';
      var templateEnd = '    </table>' +
        '  </div>' +
        '  <div class="sigma-tooltip-footer">Number of connections: ' + data.degree + '</div>';
      var template = templateStart;
      Object.keys(data.attributes).forEach(function (key) {
        console.log(key, data.attributes[key]);
        template = template + '      <tr><th>' + key + '</th> <td>' + data.attributes[key] + '</td></tr>';
      });
      template = template + templateEnd;
      console.log(template);
      return template;
    }
    sigma.parsers.gexf(CircuitOptions.database + CircuitOptions.url + '.gexf', this.s,
      function () {
        var dragListener = sigma.plugins.dragNodes(window.s, window.s.renderers[0]);
        dragListener.bind('startdrag', function (event) {
          window.s.settings('drawEdges', false);
        });
        dragListener.bind('drag', function (event) {
        });
        dragListener.bind('drop', function (event) {
        });
        dragListener.bind('dragend', function (event) {
          window.s.settings('drawEdges', true);
        });
        // this is needed in case the original JSON doesn't have color / size / x-y attributes 
        var i,
          nodes = window.s.graph.nodes(),
          len = nodes.length;
        for (i = 0; i < len; i++) {
          nodes[i].x = Math.random();
          nodes[i].idk = nodes[i].attributes['class-**'];
          nodes[i].label = nodes[i].attributes['BioName'];
          nodes[i].y = Math.random();
          nodes[i].size = window.s.graph.degree(nodes[i].id);
          //console.log(nodes[i]);
          if (nodes[i].label.indexOf('Synapse') > -1) {
            nodes[i].color = CircuitOptions.synapseColor;
          }
          else
            nodes[i].color = CircuitOptions.neuronColor;
          nodes[i].type = 'square';
          nodes[i].image = {};
        }
        var edges = window.s.graph.edges(),
          len = edges.length;
        for (var i = 0; i < len; i++) {
          //console.log(edges[i]);
          edges[i].color = CircuitOptions.edgeColor;
        }

        // Refresh the display:
        window.s.refresh();
        // ForceAtlas Layout
        window.s.startForceAtlas2({ worker: true, barnesHutOptimize: true, gravity: CircuitOptions.gravity, strongGravityMode: false, edgeWeightInfluence: 1, normal: 1.0, slowDown: 5.0 });
        setTimeout(function () { window.s.stopForceAtlas2(); }, CircuitOptions.layoutTimeout);
        if (len == 0)
          window.s.stopForceAtlas2();
        console.log('Refreshed!');
        console.log("adding tooltips...");
        var tooltipInstance = sigma.plugins.tooltips(
          window.s, window.s.renderers[0],
          {
            node: [{
              show: 'doubleClickNode',
              hide: 'clickStage',
              cssClass: 'sigma-tooltip',
              position: 'top',
              template: "",
              autoadjust: true,
              renderer: function (node, template) {
                node.degree = this.degree(node.id);
                console.log(node);
                return window.generateTooltip(node);
              }
            }]
          }
        ); /* */

        tooltipInstance.bind('shown', function (event) {
          console.log('tooltip shown', event);
        });
        tooltipInstance.bind('hidden', function (event) {
          console.log('tooltip hidden', event);
        });
      });


    /*this.s.bind('overNode clickNode', (e)=> {
      console.log(e.data.node.attributes);
    });*/
  };

  clear() {
    this.container.innerHTML = "";
  }

  reset() {
    this.clear();
  }

  executeGFXquery(query) {
    if (query.indexOf("load") !== -1) {
      window._neuGFX.mods.FlyBrainLab.loadCircuit(event.data.data.split(" ")[1]);
    }
    else {
      query.indexOf("show") !== -1
      window.onRemoveAllClick();
    }


  }

  getSVG() {
    return d3.select(document.querySelector('svg'));
  };

  enableIFrameComms() {
    this.mode = "iframe";
    //console.log("NeuGFX IFrame comms loaded...");
    window.removeEventListener('message', window.iframeEventHandler);
    window.addEventListener('message', window.iframeEventHandler);

    window.FFBOLabSession = function () {
      this.call = function (args) {
        window.top.postMessage({ messageType: 'GFXcall', args: args }, '*');
      }
      return this;
    }

    window.current_session = new FFBOLabSession();

    setTimeout(function () {
      current_session.call('ffbo.gfx.updateFileList');
      console.log('Testing GFX MasterWidget Call: updateServers')
    }, 5000);

    setTimeout(function () {
      console.log('Testing GFX MasterWidget Call: loadResults');
      //current_session.call('ffbo.gfx.loadResults');

    }, 10000);

  }

  inIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {

      return true;
    }
  }

  checkIframe() {
    if (this.inIframe() && this.mode != "iframe")
      this.enableIFrameComms();
  }

};

export { NeuGFX };