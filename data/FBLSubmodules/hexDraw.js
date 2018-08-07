// hexDraw.js - Adapted from https://www.visualcinnamon.com/2013/07/self-organizing-maps-creating-hexagonal.html

hexRadius = 32;
//SVG sizes and margins
var margin = {
    top: 50,
    right: 20,
    bottom: 20,
    left: 1150
},
width = 850,
height = 350;

//The number of columns and rows of the heatmap
var MapColumns = 30,
    MapRows = 20;

//The maximum radius the hexagons can have to still fit the screen
var hexRadius = d3.min([width/((MapColumns + 0.5) * Math.sqrt(3)),
    height/((MapRows + 1/3) * 1.5)]);

//Calculate the center positions of each hexagon 
var points = [];
for (var i = 0; i < MapRows; i++) {
    for (var j = 0; j < MapColumns; j++) {
        points.push([hexRadius * j * 1.75, hexRadius * i * 1.5]);
    }//for j
}//for i

//Create SVG element
svgObj = d3.select(document.querySelector('svg'));
var svg = svgObj.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Set the hexagon radius
var hexbin = d3.hexbin().radius(hexRadius);

//Draw the hexagons
svg.append("g")
    .selectAll(".hexagon")
    .data(hexbin(points))
    .enter().append("path")
    .attr("class", "hexagon")
    .attr("d", function (d) {
        return "M" + d.x + "," + d.y + hexbin.hexagon();
    })
    .attr("stroke", "white")
    .attr("stroke-width", "1px")
    .style("fill", "teal");


