var GraphicsExplorer = function(svgobj, node_selector, edge_selector) {

    this.metadata = {
        "highlightedOpacityScale": 1.25,
        "selectedOpacity": 0.8,
        "unselectedOpacity": 0.3,
        "highlightedStrokeWidth": 5,
        "selectedStrokeWidth": 3,
        "unselectedStrokeWidth": 1,
    };
    window.graphicsExplorer = this;
    this.node_selector = node_selector || '.neuron';
    this.edge_selector = edge_selector || '.synapse';

    this.d3SVG = svgobj;
    this.toolTipPos = undefined;
    this.dispatch = {
        'click-node': this.toggleNode,
        'dblckick-node': function(){}
    };

    this.initNode();
    this.initEdge();
    this.initToolTip();
}

GraphicsExplorer.prototype.initNode = function() {
    this.d3SVG.selectAll(this.node_selector)
        .style('cursor','pointer')
        .classed('selected',true)
        .attr('opacity', window.graphicsExplorer.metadata.selectedOpacity)
        .attr('default-color',
            function() {
                return d3.select(this).style('stroke');
            })
        .on('mouseenter',
            function() {
                //console.log(d3.event);
                //window.graphicsExplorer.toolTipPos = {'x': d3.event.pageX, 'y':d3.event.pageY+30 };
                window.graphicsExplorer.highlight(d3.select(this));

            })
        .on('mouseleave',
            function() {
                window.graphicsExplorer.resume(d3.select(this));
            })
        .on('click',
            function() {
                window.graphicsExplorer.dispatch['click-node'](d3.select(this).attr("id"));
            })
        .on('dblclick',
            function() {
                window.graphicsExplorer.dispatch['dblclick-node'](d3.select(this).attr("id"));
            })
}

GraphicsExplorer.prototype.initEdge = function() {
    this.d3SVG.selectAll(this.edge_selector)
        .attr("node-count",2)
        .classed('selected',true)
        .attr('opacity', window.graphicsExplorer.metadata.selectedOpacity)
        .attr('default-color',
            function() {
                return d3.select(this).style('stroke');
            })
        .attr('default-stroke-width',
            function() {
                return d3.select(this).style('stroke-width');
            })
        .on('mouseenter',
            function() {
                //window.graphicsExplorer.toolTipPos = {'x': d3.event.pageX, 'y':d3.event.pageY+30 };
                window.graphicsExplorer.highlight(d3.select(this));
            })
        .on('mouseleave',
            function() {
               window.graphicsExplorer.resume(d3.select(this));
            })
}

GraphicsExplorer.prototype.getNodeList = function(selection, attr) {
    if (selection === undefined)
        selection = "";
    attr = attr || "id";
    var val = [];
    window.graphicsExplorer.d3SVG.selectAll(selection + this.node_selector)
        .each(function() {
            val.push(d3.select(this).attr(attr));
        });
    return val;
}

GraphicsExplorer.prototype.getEdgeList = function(selection, attr) {
    if (selection === undefined)
        selection = "";
    attr = attr || "id";
    var val = [];
    window.graphicsExplorer.d3SVG.selectAll(selection + this.edge_selector)
        .each(function() {
            val.push(d3.select(this).attr(attr));
        });
    return val;
}

GraphicsExplorer.prototype.toggleNode = function(d3obj,isSel) {
  if (typeof d3obj == 'string')
      d3obj = this.d3SVG.select(d3obj);

      if (isSel === undefined)
          isSel = !d3obj.classed("selected");
   d3obj
    .classed("selected", isSel)
    .attr("opacity", (isSel) ? window.graphicsExplorer.metadata.selectedOpacity : window.graphicsExplorer.metadata.unselectedOpacity);
   window.graphicsExplorer.toggleEdgeByNode(d3obj.attr("id"), 2*isSel-1);
}

GraphicsExplorer.prototype.toggleEdge = function(d3obj, isSel) {
  if (typeof d3obj == 'string')
      d3obj = this.d3SVG.select(d3obj);

   if (isSel === undefined)
       isSel = !d3obj.classed("selected");
   d3obj
    .classed("selected", isSel)
    .attr("opacity", (isSel) ? window.graphicsExplorer.metadata.selectedOpacity : window.graphicsExplorer.metadata.unselectedOpacity)
}

GraphicsExplorer.prototype.toggleEdgeByNode = function(id, sign) {
    this.d3SVG.selectAll("." + id + "_dependent")
        .each(function(){
            var count = parseInt(d3.select(this).attr("node-count"));
            count = (count + sign);
            if (count > 2)
                count = 2;
            else if (count < 0)
                count = 0;
            d3.select(this)
              .attr("node-count", count)
              .attr("opacity", (count == 2) ? window.graphicsExplorer.metadata.selectedOpacity : window.graphicsExplorer.metadata.unselectedOpacity)
        });
}

GraphicsExplorer.prototype.selectAll = function() {
    window.graphicsExplorer.d3SVG.selectAll(this.edge_selector + ", " + this.node_selector)
        .classed("selected", true)
        .attr("opacity", window.graphicsExplorer.metadata.selectedOpacity)
    window.graphicsExplorer.d3SVG.selectAll(this.edge_selector)
        .attr("node-count", 2)
      //  .selectAll('path')
      //  .style('stroke-width',window.graphicsExplorer.metadata.selectedStrokeWidth);
}

GraphicsExplorer.prototype.unselectAll = function() {
    window.graphicsExplorer.d3SVG.selectAll(this.edge_selector + ", " + this.node_selector)
        .classed("selected", false)
        .attr("opacity", window.graphicsExplorer.metadata.unselectedOpacity)
    window.graphicsExplorer.d3SVG.selectAll(this.edge_selector)
        .attr("node-count", 0)
      //  .selectAll('path')
      //  .style('stroke-width',window.graphicsExplorer.metadata.selectedStrokeWidth);
}

GraphicsExplorer.prototype.selectNodes = function(selection) {
    if (selection === undefined)
        selection = "";
    window.graphicsExplorer.d3SVG.selectAll(selection + this.node_selector)
        .each( function(){
          window.graphicsExplorer.dispatch['click-node'](d3.select(this).attr("id"), true);
        })
}

GraphicsExplorer.prototype.unselectNodes = function(selection) {
    if (selection === undefined)
        selection = "";
    window.graphicsExplorer.d3SVG.selectAll(selection + this.node_selector)
        .each( function(){
          window.graphicsExplorer.dispatch['click-node'](d3.select(this).attr("id"), false);
        })
}

GraphicsExplorer.prototype.selectEdges = function(selection) {
    if (selection === undefined)
        selection = "";
    window.graphicsExplorer.d3SVG.selectAll(selection + this.edge_selector)
      .classed("selected", true)
      .attr("opacity", window.graphicsExplorer.metadata.selectedOpacity)
      .attr("node-count", 2)
}

GraphicsExplorer.prototype.unselectEdges = function(selection) {
    if (selection === undefined)
        selection = "";
    window.graphicsExplorer.d3SVG.selectAll(selection + this.edge_selector)
      .classed("selected", false)
      .attr("opacity", window.graphicsExplorer.metadata.unselectedOpacity)
      .attr("node-count", 0)
}

GraphicsExplorer.prototype.highlight = function(d3obj) {

    if (typeof d3obj == 'string')
        d3obj = this.d3SVG.select(d3obj);
    this.highlightedObj = d3obj;
    /* highlight the object */
    d3obj.attr('opacity', d3obj.attr('opacity')*window.graphicsExplorer.metadata.highlightedOpacityScale);
    this.showToolTip(d3obj.attr('label'));
    if (this.dispatch.hightlight !== undefined) {
        var x = d3obj.attr('label').split('/');
        this.dispatch.hightlight( x[0] )
    }
}

GraphicsExplorer.prototype.resume = function() {

    this.highlightedObj
        .attr('opacity', function() {
            return (window.graphicsExplorer.highlightedObj.classed("selected")) ? window.graphicsExplorer.metadata.selectedOpacity:window.graphicsExplorer.metadata.unselectedOpacity;
        });
    this.highlightedObj = null;
    this.hideToolTip();
    if (this.dispatch.resume !== undefined) {
        this.dispatch.resume()
    }
}

GraphicsExplorer.prototype.initToolTip = function() {

    this.toolTipDiv = document.createElement('div');
    this.toolTipDiv.className = "tooltipFlySVG";
	this.toolTipDiv.style.cssText = `
        z-index: 999;
        position: absolute;
        text-align: center;
        width: auto;
        height: auto;
        min-height: 10px;
        padding: 2px;
        font: 12px arial;
        background: lightgreen;
        border: 0px;
        border-radius: 3px;
        pointer-events: none;
        opacity: 0;`;
	this.toolTipDiv.style.transition = "opacity 0.5s";
	document.body.appendChild(this.toolTipDiv);
}

GraphicsExplorer.prototype.showToolTip = function (text) {

	if (this.toolTipPos == undefined)
		return;
	this.toolTipDiv.innerHTML = text;
	this.toolTipDiv.style.opacity = .9;

	var domRect = document.body.getBoundingClientRect();
	var toolTipRect = this.toolTipDiv.getBoundingClientRect();


	var left = this.toolTipPos.x + 10;
	if (left + toolTipRect.width > domRect.right )
		left = domRect.right - 10 - toolTipRect.width;
	var top = this.toolTipPos.y + 10;
	if (top + toolTipRect.height > domRect.bottom )
		top = this.toolTipPos.y - 10 - toolTipRect.height;
	this.toolTipDiv.style.left = left + "px";
	this.toolTipDiv.style.top =  top + "px";
}

GraphicsExplorer.prototype.hideToolTip = function () {
	this.toolTipDiv.style.opacity = 0.0;
}

export default GraphicsExplorer;