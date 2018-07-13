var GraphicsExplorer = function (svgobj, node_selector, edge_selector) {

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
    this._this = this;
    this.d3SVG = svgobj;
    this.toolTipPos = undefined;
    this.init();
}



GraphicsExplorer.prototype.initNode = function () {
    var _this = this;
    this.d3SVG.selectAll(this.node_selector)
        .style('cursor', 'pointer')
        .classed('selected', true)
        .attr('opacity', window.graphicsExplorer.metadata.selectedOpacity)
        .attr('default-color',
            function () {
                return d3.select(this).style('stroke');
            })
        .on('mouseenter',
            function () {
                //console.log(d3.event);
                //window.graphicsExplorer.toolTipPos = {'x': d3.event.pageX, 'y':d3.event.pageY+30 };
                _this.highlight(d3.select(this));

            })
        .on('mouseleave',
            function () {
                _this.resume(d3.select(this));
            })
        .on('click',
            function () {
                _this.dispatch['click-node'](d3.select(this).attr("id"));
            })
        .on('dblclick',
            function () {
                _this.dispatch['dblclick-node'](d3.select(this).attr("id"));
            })
}

GraphicsExplorer.prototype.initEdge = function () {
    var _this = this;
    this.d3SVG.selectAll(this.edge_selector)
        .attr("node-count", 2)
        .classed('selected', true)
        .attr('opacity', this.metadata.selectedOpacity)
        .attr('default-color',
            function () {
                return d3.select(this).style('stroke');
            })
        .attr('default-stroke-width',
            function () {
                return d3.select(this).style('stroke-width');
            })
        .on('mouseenter',
            function () {
                //window.graphicsExplorer.toolTipPos = {'x': d3.event.pageX, 'y':d3.event.pageY+30 };
                _this.highlight(d3.select(this));
            })
        .on('mouseleave',
            function () {
                _this.resume(d3.select(this));
            })
}

GraphicsExplorer.prototype.getNodeList = function (selection, attr) {
    if (selection === undefined)
        selection = "";
    attr = attr || "id";
    var val = [];
    this.d3SVG.selectAll(selection + this.node_selector)
        .each(function () {
            val.push(d3.select(this).attr(attr));
        });
    return val;
}

GraphicsExplorer.prototype.getEdgeList = function (selection, attr) {
    if (selection === undefined)
        selection = "";
    attr = attr || "id";
    var val = [];
    this.d3SVG.selectAll(selection + this.edge_selector)
        .each(function () {
            val.push(d3.select(this).attr(attr));
        });
    return val;
}



GraphicsExplorer.prototype.toggleEdge = function (d3obj, isSel) {
    var _this = this;
    if (typeof d3obj == 'string')
        d3obj = this.d3SVG.select(d3obj);

    if (isSel === undefined)
        isSel = !d3obj.classed("selected");
    d3obj
        .classed("selected", isSel)
        .attr("opacity", (isSel) ? _this.metadata.selectedOpacity : window.graphicsExplorer.metadata.unselectedOpacity)
}

GraphicsExplorer.prototype.toggleEdgeByNode = function (id, sign) {
    var _this = this;
    this.d3SVG.selectAll("." + id + "_dependent")
        .each(function () {
            var count = parseInt(d3.select(this).attr("node-count"));
            count = (count + sign);
            if (count > 2)
                count = 2;
            else if (count < 0)
                count = 0;
            d3.select(this)
                .attr("node-count", count)
                .attr("opacity", (count == 2) ? _this.metadata.selectedOpacity : window.graphicsExplorer.metadata.unselectedOpacity)
        });
}

GraphicsExplorer.prototype.selectAll = function () {
    this.d3SVG.selectAll(this.edge_selector + ", " + this.node_selector)
        .classed("selected", true)
        .attr("opacity", this.metadata.selectedOpacity)
    this.d3SVG.selectAll(this.edge_selector)
        .attr("node-count", 2)
    //  .selectAll('path')
    //  .style('stroke-width',window.graphicsExplorer.metadata.selectedStrokeWidth);
}

GraphicsExplorer.prototype.unselectAll = function () {
    this.d3SVG.selectAll(this.edge_selector + ", " + this.node_selector)
        .classed("selected", false)
        .attr("opacity", this.metadata.unselectedOpacity)
    this.d3SVG.selectAll(this.edge_selector)
        .attr("node-count", 0)
    //  .selectAll('path')
    //  .style('stroke-width',window.graphicsExplorer.metadata.selectedStrokeWidth);
}

GraphicsExplorer.prototype.selectNodes = function (selection) {
    var _this = this;
    if (selection === undefined)
        selection = "";
    this.d3SVG.selectAll(selection + this.node_selector)
        .each(function () {
            _this.dispatch['click-node'](d3.select(this).attr("id"), true);
        })
}

GraphicsExplorer.prototype.unselectNodes = function (selection) {
    var _this = this;
    if (selection === undefined)
        selection = "";
    this.d3SVG.selectAll(selection + this.node_selector)
        .each(function () {
            _this.dispatch['click-node'](d3.select(this).attr("id"), false);
        })
}

GraphicsExplorer.prototype.selectEdges = function (selection) {
    if (selection === undefined)
        selection = "";
    this.d3SVG.selectAll(selection + this.edge_selector)
        .classed("selected", true)
        .attr("opacity", this.metadata.selectedOpacity)
        .attr("node-count", 2)
}

GraphicsExplorer.prototype.unselectEdges = function (selection) {
    if (selection === undefined)
        selection = "";
    this.d3SVG.selectAll(selection + this.edge_selector)
        .classed("selected", false)
        .attr("opacity", this.metadata.unselectedOpacity)
        .attr("node-count", 0)
}

GraphicsExplorer.prototype.highlight = function (d3obj) {

    if (typeof d3obj == 'string')
        d3obj = this.d3SVG.select(d3obj);
    this.highlightedObj = d3obj;
    /* highlight the object */
    d3obj.attr('opacity', d3obj.attr('opacity') * this.metadata.highlightedOpacityScale);
    this.showToolTip(d3obj.attr('label'));
    if (this.dispatch.highlight !== undefined) {
        var x = d3obj.attr('label').split('/');
        this.dispatch.highlight(x[0])
    }
}

GraphicsExplorer.prototype.resume = function () {
    var _this = this;
    this.highlightedObj
        .attr('opacity', function () {
            return (_this.highlightedObj.classed("selected")) ? _this.metadata.selectedOpacity : _this.metadata.unselectedOpacity;
        });
    this.highlightedObj = null;
    this.hideToolTip();
    if (this.dispatch.resume !== undefined) {
        this.dispatch.resume()
    }
}

GraphicsExplorer.prototype.initToolTip = function () {

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
    if (left + toolTipRect.width > domRect.right)
        left = domRect.right - 10 - toolTipRect.width;
    var top = this.toolTipPos.y + 10;
    if (top + toolTipRect.height > domRect.bottom)
        top = this.toolTipPos.y - 10 - toolTipRect.height;
    this.toolTipDiv.style.left = left + "px";
    this.toolTipDiv.style.top = top + "px";
}

GraphicsExplorer.prototype.hideToolTip = function () {
    this.toolTipDiv.style.opacity = 0.0;
}

GraphicsExplorer.prototype.toggleNode = function (d3obj, isSel) {
    if (typeof d3obj == 'string')
        d3obj = this.d3SVG.select(d3obj);

    if (isSel === undefined)
        isSel = !d3obj.classed("selected");
    d3obj
        .classed("selected", isSel)
        .attr("opacity", (isSel) ? this.metadata.selectedOpacity : this.metadata.unselectedOpacity);
    this.toggleEdgeByNode(d3obj.attr("id"), 2 * isSel - 1);
}

GraphicsExplorer.prototype.init = function () {

    this.dispatch = {
        'click-node': this.toggleNode,
        'dblckick-node': function () { }
    };

    this.initNode();
    this.initEdge();
    this.initToolTip();
}

export default GraphicsExplorer;