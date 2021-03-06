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
    window.submodules = {}

    this.CircuitOptions = {
      database: 'https://data.flybrainlab.fruitflybrain.org/data/',
      url: 'FITest',
      neuronColor: "#bbc7a4",
      synapseColor: '#E75A7C',
      edgeColor: '#8DA7BE',
      gravity: 1.,
      layoutTimeout: 1000,
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
        case 'loadCircuitFromString': {
          window._neuGFX.sendAlert("Loading a circuit...");
          window._neuGFX.mods.FlyBrainLab.loadCircuitFromString(event.data.data, null);
          // window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPloadTag', tag: "homecartridge" });
          break;
        }
        case 'loadCircuitAsData': {
          window._neuGFX.sendAlert("Loading a circuit...");
          window._neuGFX.mods.FlyBrainLab.loadCircuitAsData(event.data.data, null);
          // window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPloadTag', tag: "homecartridge" });
          break;
        }
        case 'loadJS': {
          window._neuGFX.mods.FlyBrainLab.loadSubmodule(event.data.data);
          break;
        }
        case 'renewCircuit': {
          window.renewCircuit();
          break;
        }
        case 'getExperimentConfig': {
          window._neuGFX.sendAlert("Loading experiment settings...");
          var experimentConfig = JSON.stringify(window._neuGFX.mods.FlyBrainLab.experimentConfig);
          window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'loadExperimentConfig', config: experimentConfig });
          break;
        }
        case 'loadSubmodule': {
          window.submodules[event.data.data.name] = event.data.data.data;
          break;
        }
        case 'eval': {
          window.submodules[event.data.data.name] = event.data.data.data;
          // console.log(window.submodules);
          eval(event.data.data.data);
          break;
        }
        case 'setExperimentConfig': {
          try {
            window.addAll();
          }
          catch (err) { };
          window._neuGFX.sendAlert("Setting experiment settings...");
          console.log("Setting experiment settings...");
          window._neuGFX.mods.FlyBrainLab.experimentConfig = JSON.parse(event.data.data);
          setTimeout(function () {
            try {
              window.renewCircuit();
            }
            catch (err) { };
          }, 300);
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
          var type = value.type;
          console.log("Received Data:");
          console.log(value);
          console.log("Received Data Type:");
          console.log(value.type);
          var active_neurons = [];
          for (var i in value) {
            active_neurons.push(value[i].name);
          }
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
          else {
            var message = { command: 'add', elements: active_neurons };
            console.log(message);
            window.modelUpdate(message);
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
        // this.mods.Plotter = new GFXPlotter(100, 100);
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
        try {
          console.log('Resized the SVG...');
          panZoomSVG.resize();
          panZoomSVG.updateBBox();
          panZoomSVG.fit();
          panZoomSVG.center();
        }
        catch (err) {
          setTimeout(function () {
            /*
            console.log('Resized the SVG...');
            panZoomSVG.resize(); 
            panZoomSVG.updateBBox(); 
            panZoomSVG.fit();
            panZoomSVG.center();*/
            // window._neuGFX.mods.FlyBrainLab.loadSVG(window._neuGFX.mods.FlyBrainLab.CircuitOptions.database + 'fly.svg', function () { window._neuGFX.mods.FlyBrainLab.initializeFlyBrainSVG(); });
          }, 100);
        }
      });
      callback();
    });
  }

  loadSVGFromString(url, callback = function () { }) {
    this.plotMode = "SVG";
    $('.activitySlider').remove();
    try { this.clearGraph(); } catch { };
    this.clear();
    var dom = new DOMParser();
    var svg = dom.parseFromString(url, 'image/svg+xml');
    this.container.appendChild(svg.rootElement);
    var svgElement = document.querySelector('svg');
    $(svgElement).width('100%');
    $(svgElement).height('100%');
    var panZoomSVG = svgPanZoom(svgElement, {
      dblClickZoomEnabled: false,
      preventMouseEventsDefault: false
    });
    window.addEventListener("resize", function () {
      try {
        console.log('Resized the SVG...');
        panZoomSVG.resize();
        panZoomSVG.updateBBox();
        panZoomSVG.fit();
        panZoomSVG.center();
      }
      catch (err) {
        setTimeout(function () {
          /*
          console.log('Resized the SVG...');
          panZoomSVG.resize(); 
          panZoomSVG.updateBBox(); 
          panZoomSVG.fit();
          panZoomSVG.center();*/
          // window._neuGFX.mods.FlyBrainLab.loadSVG(window._neuGFX.mods.FlyBrainLab.CircuitOptions.database + 'fly.svg', function () { window._neuGFX.mods.FlyBrainLab.initializeFlyBrainSVG(); });
        }, 100);
      }
    });
    if (callback != null) {
      callback();
    }
  }

  loadSVGAsData(url, callback = function () { }) {
    this.plotMode = "SVG";
    var _this = this;
    $('.activitySlider').remove();
    try { this.clearGraph(); } catch { };
    this.clear();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.addEventListener('load', function (ev) {
      var xml = ev.target.response;
      var dom = new DOMParser();
      var svg = dom.parseFromString(xml, 'image/svg+xml');
      _this.container.appendChild(svg.rootElement);
      var svgElement = document.querySelector('svg');
      $(svgElement).width('100%');
      $(svgElement).height('100%');
      var panZoomSVG = svgPanZoom(svgElement, {
        dblClickZoomEnabled: false,
        preventMouseEventsDefault: false
      });
      window.addEventListener("resize", function () {
        try {
          console.log('Resized the SVG...');
          panZoomSVG.resize();
          panZoomSVG.updateBBox();
          panZoomSVG.fit();
          panZoomSVG.center();
        }
        catch (err) {
          setTimeout(function () {
            /*
            console.log('Resized the SVG...');
            panZoomSVG.resize(); 
            panZoomSVG.updateBBox(); 
            panZoomSVG.fit();
            panZoomSVG.center();*/
            // window._neuGFX.mods.FlyBrainLab.loadSVG(window._neuGFX.mods.FlyBrainLab.CircuitOptions.database + 'fly.svg', function () { window._neuGFX.mods.FlyBrainLab.initializeFlyBrainSVG(); });
          }, 100);
        }
      });
      callback();
    });
    xhr.send(null);
  }

  loadrawGEXF(gexfcode, callback = function () { }) {
    var p = new DOMParser();
    var lines = gexfcode.split('\n');
    lines.splice(0, 1);
    var gexfcode = lines.join('\n');
    console.log(gexfcode);
    var url = p.parseFromString(gexfcode, 'application/xml');
    console.log(url);
    this.plotMode = "sigma";
    $('.activitySlider').remove();
    try { this.clearGraph(); } catch { };
    this.clear();
    this.CircuitOptions.url = url;
    this.initializeGEXF(this.CircuitOptions);
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

    window.s = this.s;

    let a = `_hidden_meshes = []`;
    window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'Execute', content: a });

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
    if (typeof CircuitOptions.url === 'string') {
      var connect_in = CircuitOptions.database + CircuitOptions.url + '.gexf';
    }
    else {
      var connect_in = CircuitOptions.url;
    }
    sigma.parsers.gexf(connect_in, this.s,
      function () {
        var i,
          nodes = window.s.graph.nodes(),
          len = nodes.length;
        var node_color_map = {};
        for (i = 0; i < len; i++) {

          nodes[i].x = Math.random();
          nodes[i].color = nodes[i].attributes['color'];
          node_color_map[nodes[i].id] = nodes[i].color;
          try {
            nodes[i].rid = nodes[i].attributes['rid'];
          }
          catch (err) {
          }
          nodes[i].y = Math.random();
          nodes[i].size = window.s.graph.degree(nodes[i].id);
          try {

            if (nodes[i].label.indexOf('Synapse') > -1) {
              nodes[i].color = CircuitOptions.synapseColor;
            }
          }
          catch (err) {
          }
          nodes[i].type = 'square';
          nodes[i].image = {};
        }
        var edges = window.s.graph.edges(),
          len = edges.length;
        // console.log('Nodes:', nodes);
        // console.log('Edges:', edges);
        for (var i = 0; i < len; i++) {
          edges[i].color = node_color_map[edges[i]['source']];
        }
        window.dispatch_highlight = function (x) {
          let a = `a = {'data': {'commands': {'pin': [['word'], []]} },'messageType': 'Command','widget': 'NLP'}
client = fbl.get_client()
client.tryComms(a)`;
          a = a.replace('word', x['data']['node']['rid']);
          window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'Execute', content: a });
          // console.log(a);
        }
        window.dispatch_resume = function (x) {
          let a = `a = {'data': {'commands': {'unpin': [['word'], []]} },'messageType': 'Command','widget': 'NLP'}
client = fbl.get_client()
client.tryComms(a)`;
          a = a.replace('word', x['data']['node']['rid']);
          window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'Execute', content: a });
          // console.log(a);
        }
        window.dispatch_toggle = function (x) {
          let a = `_hidden_meshes = _hidden_meshes
if 'word' in _hidden_meshes:
    a = {'data': {'commands': {'show': [['word'], []]} },'messageType': 'Command','widget': 'NLP'}
    _hidden_meshes.remove('word')
else:
    a = {'data': {'commands': {'hide': [['word'], []]} },'messageType': 'Command','widget': 'NLP'}
    _hidden_meshes.append('word')
client = fbl.get_client()
client.tryComms(a)`;
          a = a.replace(/word/g, x['data']['node']['rid']);
          window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'Execute', content: a });
        }
        window.s.bind('overNode', (e) => { window.dispatch_highlight(e); });
        window.s.bind('clickNode', (e) => { window.dispatch_toggle(e); });
        window.s.bind('outNode', (e) => { window.dispatch_resume(e); });
        window.s.refresh();
        // ForceAtlas
        window.s.startForceAtlas2({ worker: true, barnesHutOptimize: true, gravity: CircuitOptions.gravity, strongGravityMode: false, edgeWeightInfluence: 1, normal: 1.0, slowDown: 5.0 });
        setTimeout(function () { window.s.stopForceAtlas2(); }, CircuitOptions.layoutTimeout);
        if (len == 0)
          window.s.stopForceAtlas2();
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
        );

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