
IOActivityDt = 1000;

animateStep = function (t) {
    svgObj = d3.select(document.querySelector('svg'));
    for (var el_name in IOActivities) {
        d3.selectAll(".neuron_class,.synapse_class").filter(function (d, i) {
            try {
              //console.log(el_name);
                if ((d3.select(this).attr(IOSelector).indexOf(el_name)>=0)) {

                    return true;
                }
            }
            catch { return false };
            return false;
        }).transition().duration(IOActivityDt).ease(d3.easeLinear).style("opacity", IOActivities[el_name][t]);
    }
}

$('.activitySlider').remove();

var sliderDiv = document.createElement("div"); sliderDiv.className = "activitySlider";
var sliderDivInput = document.createElement("input");
sliderDivInput.type = 'range'; sliderDivInput.value = '0'; sliderDivInput.min = '0'; sliderDivInput.max = IOActivityLen.toString(); sliderDivInput.step = '1'; sliderDivInput.id = 'sliderRange';
var sliderDivPlay = document.createElement("button"); sliderDivPlay.type = 'button'; sliderDivPlay.id = 'sliderStart'; sliderDivPlay.innerText = 'start';
var sliderDivPause = document.createElement("button"); sliderDivPause.type = 'button'; sliderDivPause.id = 'sliderPause'; sliderDivPause.innerText = 'pause';

sliderDiv.appendChild(sliderDivInput); sliderDiv.appendChild(sliderDivPlay); sliderDiv.appendChild(sliderDivPause);

document.body.appendChild(sliderDiv);
$(sliderDivInput).css({ "width": "80%", "min-width": "80%","vertical-align":"middle","margin-right":"8px" });
$(sliderDivPlay).css({ "margin-right":"4px" });
$(sliderDiv).css({ "position": "absolute", "left": "5%", "top": "95%", "width": "90%", "min-width": "90%" });

var sliderTimer;
d3.select("#sliderStart").on("click", function () {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(function () {
        var b = d3.select("#sliderRange");
        var t = (+b.property("value") + 1) % (+b.property("max") + 1);
        if (t == 0) { t = +b.property("min"); }
        b.property("value", t);
        animateStep(t);
    }, IOActivityDt);
});

d3.select('#sliderRange').on('input', function() {
	animateStep(this.value);
});

d3.select("#sliderPause").on("click", function () {
    clearInterval(sliderTimer);
});
