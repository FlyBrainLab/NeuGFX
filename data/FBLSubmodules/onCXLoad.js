svgObj = d3.select(document.querySelector('svg'));
svgObj.selectAll("*").each(function (d, i) {
    if (this.getAttribute("label") != null) {
        var label = this.getAttribute("label");
        var labels = label.split("|");
        console.log(labels);
    }
});


svgObj = d3.select(document.querySelector('svg'));

svgObj.selectAll("*").each(function (d, i) {
    //d3.select(this).style("opacity", "0.3");
    this.setAttribute("selected", "false");
    this.setAttribute("hovered", "false");
});

svgObj.selectAll(".region").each(function (d, i) {
    var label = this.getAttribute("label");
    if (label.indexOf("EB/") > -1) {
        var lab = +label.slice(-1);
        this.setAttribute("label", "EB/" + (9 - lab))
    }

});

svgObj.selectAll("*").on("mouseover", function (d, i) {
    if (this.getAttribute("label") != null) {
        var querylabel = this.getAttribute("label");
        svgObj.selectAll(".region,.neuron").each(function (d, i) {
            d3.select(this).attr("hovered", "false");
            if (this.getAttribute("selected") == "false") {
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
                    console.log(label);
                }
                var _this = this;
                labels.forEach(function (d) {
                    if (d.indexOf('-') > -1) {
                        console.log("Found label...")
                        //var labels = d.split("-");
                        if (d.indexOf(querylabel) > -1) {
                            d3.select(_this).style("opacity", "1");
                            //this.setAttribute("hovered", "true");
                            d3.select(_this).attr("hovered", "true");
                            var children = d3.selectAll(_this.childNodes);
                            try {children.style("opacity", "1");} catch {};
                            try {children.attr("hovered", "true");} catch {};
                            
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

svgObj.selectAll("*").on("click", function (d, i) {
    console.log("On Click!");
    svgObj.selectAll(".region,.neuron").each(function (d, i) {
        //d3.select(this).style("opacity", "0.3");
        if (this.getAttribute("hovered") == "true") {
            if (this.getAttribute("selected") == "false")  {
            var _this = this;
            d3.select(_this).attr("selected", "true");
            var children = d3.selectAll(_this.childNodes);
            try {children.style("opacity", "1");} catch {};
            try {children.attr("selected", "true");} catch {};
        }
        else
        {
                var _this = this;
                d3.select(_this).attr("selected", "false");
                var children = d3.selectAll(_this.childNodes);
                try {children.style("opacity", "1");} catch {};
                try {children.attr("selected", "false");} catch {};
        }
    }
    });
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
        neu.style("opacity", "1.0");
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

