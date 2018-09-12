import * as d3 from 'd3';
import Plotly from 'plotly.js/dist/plotly';
import * as iziToast from "izitoast";

import '../style/GFXPlotter.css';


export class GFXPlotter {

    constructor(width_p, height_p) {
        $('#upper_plot').html('')
        let font1 = 'Rajdhani, sans-serif';
        let font2 = 'Montserrat, sans-serif'
        let x_label = 'Time [s]';
        let y_label = 'Odorant Concentration (ppm)';
        this.plot_dict = {};
        // Create the graph
        this.d3 = Plotly.d3;

        // Set plot percentages within div
        this.width_p = width_p;
        this.height_p = height_p;

        // Construct the plots

        this.config = {
            modeBarButtonsToRemove: [
                'sendDataToCloud', 'zoom2d', 'pan2d',
                'zoomIn2d', 'zoomOut2d', 'autoScale2d',
                'zoom3d', 'pan3d', 'orbitRotation',
                'tableRotation', 'resetCameraLastSave3d', 'toImage'
            ],
            displaylogo: false
        };

        this.upper_layout = {
            showlegend: false,
            /*
                         xaxis: 
                         {title: x_label, gridcolor: '#444', tickfont: {
                    family: font1,
                    size: 14,
                    color: '#999'
                }, titlefont: {
                    family: font2,
                    size: 18,
                    color: '#bbb'
                }},
                         yaxis: 
                         {fixedrange: true, title: y_label, gridcolor: '#444', tickfont: {
                    family: font1,
                    size: 14,
                    color: '#999'
                }, titlefont: {
                    family: font2,
                    size: 18,
                    color: '#bbb'
                }}, 
            */
            yaxis:
                { fixedrange: true },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
        };



        // ** Upper Plot

        this.upper_plot_d3 = this.d3.select('#upper_plot')
            .append('div')
            .style({
                width: this.width_p + '%',
                height: this.height_p + '%',
                'margin-left': (100 - this.width_p) / 2 + '%',
                'margin-top': (100 - this.height_p) / 2 + '%'
            });

        this.upper_plot = this.upper_plot_d3.node();
        // window.mixedtraceplot = this;

        // SEARCH
        this.current_object = this;
        var search_bar = this.d3.select('#plot_search');
        var _this = this;
        search_bar.on('keydown', function () {
            //console.log(d3.event.key);
            if (d3.event.key == 'Escape') {
                // DEBUG: redraw+escape for testing redraw()
                if (search_bar.node().value.toLowerCase() == "redraw") {
                    console.log("REDRAW TRIGGERED.");
                    current_object.redraw();
                    iziToast.warning({
                        title: 'DEBUG:',
                        icon: 'fas fa-exclamation-circle',
                        message: 'Redraw Triggered.',
                    });
                }
                // DEBUG: clear+escape for testing clear()
                if (search_bar.node().value.toLowerCase() == "clear") {
                    console.log("CLEAR TRIGGERED.");
                    //current_object.clear_data();
                    current_object.clear_plot();
                    iziToast.warning({
                        title: 'DEBUG:',
                        icon: 'fas fa-exclamation-circle',
                        message: 'Clear Triggered.',
                    });
                }
                // DEBUG: log+escape for logging
                if (search_bar.node().value.toLowerCase() == "log") {
                    console.log(current_object.upper_plot.data);
                    iziToast.warning({
                        title: 'DEBUG:',
                        icon: 'fas fa-exclamation-circle',
                        message: 'Logged.',
                    });
                }
                // DEBUG: extend+escape for logging
                if (search_bar.node().value.toLowerCase() == "extend") {
                    console.log("EXTEND TRIGGERED.");
                    var dict_keys = Object.keys(_this.plot_dict);
                    start = window.extend_end;
                    end = window.extend_end + 20;
                    for (var i = 0; i < window.dict_len; i++) {
                        if (_this.plot_dict[dict_keys[i]][1] > -1) {
                            current_object.add_data({
                                x: d3.range(start, end, 1),
                                y: d3.range(start, end, 1).map(d3.random.normal(10.)),
                                z: d3.range(start, end, 1).map(function (x) { return 0; }),
                                type: 'scatter',
                                name: _this.plot_dict[dict_keys[i]][0]['name']
                            });
                        }
                    }
                    window.extend_end = window.extend_end + 20;
                    iziToast.warning({
                        title: 'DEBUG:',
                        icon: 'fas fa-exclamation-circle',
                        message: 'Extend Triggered.',
                    });
                }
                search_bar.node().value = "";
                $('.list-elem').show();
            }
        });

        // GLOBALS

        // keep track of all data in a dict
        // plot_dict[key][0]    ->  data
        // plot_dict[key][1]    ->  plot index
        // plot_dict[key][2]    ->  info
        this.plot_dict = {};
        // keep track of the latest plot number in the plotly div
        this.current_trace = 0;
        // keep track of the plot_dict length (can be replaced by Object.keys( _this.plot_dict ))
        this.dict_len = 0;
        // keep track of current plot in info
        this.hover_key = -1;
        // plotly default colors array // TODO: do this in a better way?
        this.plotly_colors = [
            '#1f77b4',  // muted blue
            '#ff7f0e',  // safety orange
            '#2ca02c',  // cooked asparagus green
            '#d62728',  // brick red
            '#9467bd',  // muted purple
            '#8c564b',  // chestnut brown
            '#e377c2',  // raspberry yogurt pink
            '#7f7f7f',  // middle gray
            '#bcbd22',  // curry yellow-green
            '#17becf'   // blue-teal
        ];
        this.plotly_focus = false;

        /*iziToast.success({
            title: 'Welcome',
            icon: 'fas fa-check-circle',
            position: 'center',
            message: 'GFXPlotter Succesfully Loaded!',
        });*/

        /*
        var ps = new PerfectScrollbar('.list_container');
        
        iziToast.success({
            title: 'Welcome',
            icon: 'fas fa-check-circle',
            position: 'center',
            message: 'PerfectScrollbar Succesfully Loaded!',
        });
        */

        // DEBUG: for extend debug
        this.extend_end = 20;

        /*
        // DEBUG: window.performance
        console.log(window.performance);
        */

        // TODO: fix responsiveness for very small screen
        // TODO: test with large/realistic dataset
        // TODO: error checking for plot data
        // TODO: handle other formats besides 'scatter's

        // REVIEW: correct way to test functions etc.

        // FIXME: CSS
        // FIXME: perfect scrollbar

    }

    create_plot(upper_data) {
        Plotly.plot(this.upper_plot, upper_data, this.upper_layout, this.config);

        // REVIEW: should this be moved?
        // Search Bar
        var search_obj = this.d3.select('#plot_search').node();

        this.current_object = this;
        var _this = this;
        this.d3.select('#plot_search').on('input', function () {
            var search = search_obj.value;

            if (typeof search == 'undefined' || search == "") {
                $('.list-elem').show();
            }
            else if (search.toLowerCase() == "active") {
                var dict_keys = Object.keys(_this.plot_dict);
                $('.list-elem').hide();
                $('.list-elem').filter(function (index) {
                    return _this.plot_dict[dict_keys[index]][1] >= 0;
                }).show();
            }
            else {
                $('.list-elem').show();
                $('.list-elem').filter(function (index) {
                    return !$('.list-elem')[index].innerHTML.toLowerCase().includes(search.toLowerCase());
                }).hide();
            }
        });

        // Zoom Callbacks: 
        var current_object = this;
        /*
        // DEBUG: catch restyle events
        current_object.upper_plot.on('plotly_restyle', function(eventdata) {
            console.log(eventdata[0]); // Update object
            console.log(eventdata[1]); // Array of indices
        });
        */
        window.onresize = function () {
            Plotly.Plots.resize(current_object.upper_plot);
            console.log('resized!');
        };
    }

    resize()
    {
        Plotly.Plots.resize(this.upper_plot);
    }

    clear_data() {
        this.plot_dict = {};
        window.current_trace = 0;
        window.dict_len = 0;

        $('#plot_list').empty();

        Plotly.react(this.upper_plot, [], this.upper_layout);

        $('#info_div')[0].innerHTML = "";

        this.relegend();
    }

    clear_plot() {
        window.current_trace = 0;
        var _this = this;
        var dict_keys = Object.keys(_this.plot_dict);
        for (var i = 0; i < window.dict_len; i++) {
            _this.plot_dict[dict_keys[i]][1] = -1;
        }

        this.redraw();
    }

    import(data, len) {
        var _this = this;
        _this.plot_dict = data;
        window.current_trace = 0;
        // TODO: error checking of length vs len
        window.dict_len = len;
        window.hover_key = -1;

        $('#plot_list').empty();

        Plotly.react(this.upper_plot, [], this.upper_layout);

        this.redraw();
    }

    redraw() {
        var _this = this;
        var current_object = this;
        //window.current_trace = 0;
        $('#plot_list').empty();

        var dict_keys = Object.keys(_this.plot_dict);
        for (var i = 0; i < window.dict_len; i++) {
            var new_plot = current_object.d3.select('#plot_list').append('h2').attr("class", "list-elem");
            var currName = dict_keys[i];
            new_plot.text(currName);
            if (_this.plot_dict[dict_keys[i]][1] >= 0) {
                new_plot.style("color", "orange");
            }
            //_this.plot_dict[currName][1] = -1;
        }

        for (var j = 0; j < window.dict_len; j++) {
            $('.list-elem').filter(function (index) {
                return index == j;
            }).on('click', function () {
                var curr_plot = this;
                var curr_name = this.innerHTML;
                if (_this.plot_dict[curr_name][1] >= 0) {
                    // Remove Trace
                    curr_plot.style["color"] = ["white"];

                    this.current_object.undraw_trace(curr_name);
                }
                else {
                    // Add Trace
                    curr_plot.style["color"] = ["orange"];

                    this.current_object.draw_trace(curr_name);
                }
            });
            $('.list-elem').filter(function (index) {
                return index == j;
            }).on('mouseover', function () {
                window.hover_key = this.innerHTML;
                $('#info_div')[0].innerHTML = _this.plot_dict[this.innerHTML][2];
            });
        }

        Plotly.react(this.upper_plot, [], this.upper_layout);

        var dict_keys = Object.keys(_this.plot_dict);
        var reload_queue = [];
        for (var x = 0; x < window.dict_len; x++) {
            if (_this.plot_dict[dict_keys[x]][1] >= 0) {
                Plotly.addTraces(this.upper_plot, _this.plot_dict[dict_keys[x]][0]);
                reload_queue.push(_this.plot_dict[dict_keys[x]][1]);
            }
        }

        Plotly.moveTraces(this.upper_plot, [...Array(window.current_trace).keys()], reload_queue);

        if (window.hover_key > 0)
            $('#info_div')[0].innerHTML = _this.plot_dict[window.hover_key][2];

        current_object.relegend();
    }

    add_data(data, inName, info = "") {
        var _this = this;
        window.current_object = this;
        name = data['name'];
        if (!_this.plot_dict.hasOwnProperty(name)) {
            this.current_object = this;
            _this.plot_dict[name] = [data, -1, info];
            window.dict_len++;
            var new_plot = this.d3.select('#plot_list').append('h2').attr("class", "list-elem");
            new_plot.text(name);


            $('.list-elem').filter(function (index) {
                return this.innerHTML == name;
            }).on('click', function () {
                var curr_plot = this;
                var curr_name = this.innerHTML;
                if (_this.plot_dict[curr_name][1] >= 0) {
                    // Remove Trace
                    curr_plot.style["color"] = ["white"];

                    window.current_object.undraw_trace(curr_name);
                }
                else {
                    // Add Trace
                    curr_plot.style["color"] = ["orange"];

                    window.current_object.draw_trace(curr_name);
                }
            });
            $('.list-elem').filter(function (index) {
                return this.innerHTML == name;
            }).on('mouseover', function () {
                window.hover_key = this.innerHTML;
                $('#info_div')[0].innerHTML = _this.plot_dict[this.innerHTML][2];
            });
        }
        else {
            var new_data = jQuery.map(_this.plot_dict[name][0], function (a, i) {
                if (Array.isArray(a)) {
                    _this.plot_dict[name][0][i] = _this.plot_dict[name][0][i].concat(data[i]);
                }
                return 0;
            });
            if (_this.plot_dict[name][1] >= 0) {
                //this.redraw();
                Plotly.deleteTraces(current_object.upper_plot, [_this.plot_dict[name][1]]);
                Plotly.addTraces(current_object.upper_plot, _this.plot_dict[name][0], [_this.plot_dict[name][1]]);
            }
        }
    }

    replace_data(data, name, info = "") {
        var _this = this;
        if (_this.plot_dict.hasOwnProperty(name)) {
            this.current_object = this;
            _this.plot_dict[name][0] = data;
            if (info != "") {
                _this.plot_dict[name][2] = info
            }

            Plotly.deleteTraces(current_object.upper_plot, [_this.plot_dict[name][1]]);
            Plotly.addTraces(current_object.upper_plot, _this.plot_dict[name][0], [_this.plot_dict[name][1]]);
        }
        else {
            this.add_data(data, name);
        }
    }


    draw_trace(name) {
        var _this = this;
        // TODO: draw trace and handle errors of 'name' existance
        _this.plot_dict[name][1] = window.current_trace;
        window.current_trace++;
        Plotly.addTraces(current_object.upper_plot, _this.plot_dict[name][0]);
        iziToast.info({
            title: name,
            icon: 'fas fa-info-circle',
            message: 'Has Been Added.',
        });

        this.current_object.relegend();
    }

    undraw_trace(name) {
        var _this = this;
        // TODO: draw trace and handle errors of 'name' existance
        window.current_object = this;
        var temp = _this.plot_dict[name][1];

        Plotly.deleteTraces(window.current_object.upper_plot, [_this.plot_dict[name][1]]);
        _this.plot_dict[name][1] = -1;

        window.current_trace--;

        var keys = Object.keys(_this.plot_dict);
        for (var i = 0; i < window.dict_len; i++) {
            if (_this.plot_dict[keys[i]][1] >= 0 && _this.plot_dict[keys[i]][1] > temp)
                _this.plot_dict[keys[i]][1]--;
        }
        iziToast.info({
            title: name,
            icon: 'fas fa-info-circle',
            message: 'Has Been Removed.',
        });

        current_object.relegend();
    }

    relegend() {
        var _this = this;
        $('#legend_div').empty();
        var current_object = this;
        let data = current_object.upper_plot.data;
        var x;

        

        for (x = 0; x < data.length; x++) {
            var new_legend = current_object.d3.select('#legend_div').append('h6').attr("class", "legend-elem").text(data[x].name).attr("style", "color:" + window.plotly_colors[x % 10]);

            $('.legend-elem').filter(function (index) {
                return index == x;
            }).on('click', function () {
                var curr_legend = this;
                var curr_name = this.innerHTML;

                if (current_object.upper_plot.data[_this.plot_dict[curr_name][1]].hasOwnProperty('visible')) {
                    if (current_object.upper_plot.data[_this.plot_dict[curr_name][1]]['visible'] == true) {
                        Plotly.restyle(current_object.upper_plot, { visible: ["legendonly"] }, [_this.plot_dict[curr_name][1]]);
                        curr_legend.style['opacity'] = 0.5;
                    }
                    else {
                        Plotly.restyle(current_object.upper_plot, { visible: [true] }, [_this.plot_dict[curr_name][1]]);
                        curr_legend.style['opacity'] = 1;
                    }
                }
                else {
                    Plotly.restyle(current_object.upper_plot, { visible: ["legendonly"] }, [_this.plot_dict[curr_name][1]]);
                    curr_legend.style['opacity'] = 0.5;
                }
            });
            $('.legend-elem').filter(function (index) {
                return index == x;
            }).on('dblclick', function () {
                var curr_legend = this;
                var curr_name = this.innerHTML;
                window.plotly_focus = !window.plotly_focus;
                if (window.plotly_focus) {
                    let settings_arr = new Array(window.current_trace);
                    settings_arr.fill("legendonly");
                    settings_arr[_this.plot_dict[curr_name][1]] = true;

                    Plotly.restyle(current_object.upper_plot, { visible: settings_arr }, [...Array(window.current_trace).keys()]);
                    $('.legend-elem').css("opacity", 0.5);
                    this.style['opacity'] = 1;
                }
                else {
                    let settings_arr = new Array(window.current_trace);
                    settings_arr.fill(true);

                    Plotly.restyle(current_object.upper_plot, { visible: settings_arr }, [...Array(window.current_trace).keys()]);
                    $('.legend-elem').css("opacity", 1);
                }
            });
            $('.legend-elem').filter(function (index) {
                return index == x;
            }).on('mousedown', false);
        }
    }

    addExternalData(data, names, x_label = "", y_label = "") {
        this.upper_layout = {
            showlegend: false,
            xaxis:
                {
                    title: x_label, gridcolor: '#444', tickfont: {
                        //family: 'Courier New, monospace',
                        size: 14,
                        color: '#999'
                    }, titlefont: {
                        //family: 'Courier New, monospace',
                        size: 18,
                        color: '#bbb'
                    }
                },
            yaxis:
                {
                    fixedrange: true, title: y_label, gridcolor: '#444', tickfont: {
                        size: 14,
                        color: '#999'
                    }, titlefont: {
                        size: 18,
                        color: '#bbb'
                    }
                },

            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
        };

        this.clear_data();
        this.clear_plot();

        this.create_plot([]);

        // Prepare mock data (send this from the server)
        var d3 = Plotly.d3;

        // DEBUG: ADD DATA for M = 25 bogus plots
        var trace_data = [];
        var M = data.length;
        var possible = "abcdefghijklmnopqrstuvwxyz          ";
        var randomstring = "";
        var saved_data = {};

        for (var i = 0; i < M; i++) {
            var randomstring = "";
            //for (var j = 0; j < 700; j++)
            //    randomstring += possible.charAt(Math.floor(Math.random() * possible.length));

            var curr_data = [{
                x: d3.range(1/(data[i].length), 1, 1/(data[i].length)),
                y: data[i],
                z: d3.range(0, data[i].length, 1).map(function (x) { return i; }),
                type: 'scatter',
                name: names[i]
            }, 
            names[i],
            "<div style=\"width:50%;\">" +
            "<h1>" + names[i] + "</h1>" +
            "<h6 align=\"left\">&emsp;" + randomstring.substr(0, 350) + "</h6>" +
            "<h6 align=\"left\">&emsp;" + randomstring.substr(350, 350) + "</h6>" +
            "</div>"];
            this.add_data(curr_data[0], curr_data[1], curr_data[2]);

            saved_data[curr_data[1]] = [curr_data[0], -1, curr_data[2]];
        }
    }

    createMockData() {
        this.create_plot([]);

        // Prepare mock data (send this from the server)
        var d3 = Plotly.d3;

        // DEBUG: ADD DATA for M = 25 bogus plots
        var trace_data = [];
        var M = 250;
        var possible = "abcdefghijklmnopqrstuvwxyz          ";
        var randomstring = "";
        var saved_data = {};

        for (var i = 0; i < M; i++) {
            var randomstring = "";
            for (var j = 0; j < 700; j++)
                randomstring += possible.charAt(Math.floor(Math.random() * possible.length));

            var curr_data = [{
                x: d3.range(0, 20, 1),
                y: d3.range(0, 20, 1).map(d3.random.normal(10.)),
                z: d3.range(0, 20, 1).map(function (x) { return i; }),
                type: 'scatter',
                name: 'Plot Name ' + i
            }, 'Plot ' + i,
            "<div style=\"width:50%;\">" +
            "<h1>" + "Plot " + i + "</h1>" +
            "<h6 align=\"left\">&emsp;" + randomstring.substr(0, 350) + "</h6>" +
            "<h6 align=\"left\">&emsp;" + randomstring.substr(350, 350) + "</h6>" +
            "</div>"];
            this.add_data(curr_data[0], curr_data[1], curr_data[2]);

            saved_data[curr_data[1]] = [curr_data[0], -1, curr_data[2]];
        }

    }

}


export default { GFXPlotter };
