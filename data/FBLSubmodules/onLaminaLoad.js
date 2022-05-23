window.sendMaster = function (x) {
    window.top.postMessage(x, '*');
}
cartridge_data_set = false;

    /*
    * Create neuron list
    */
    svgObj = d3.select(document.querySelector('svg'));
    num_of_cartridge = 721;
    var cartList = [];
    for (var i = 0; i < 721; i++) {
        cartList.push('cartridge' + i);
    }

    //var neuList = ['C2','C3'];
    /*
     * Create neuron json
     */
    cartJson = {};
    for (var i = 0; i < cartList.length; i++) {
        var id = cartList[i];
        cartJson[cartList[i]] = {
            'filename': 'cartridge_swc/' + id + '.swc',
            'label': cartList[i]
        };
    }
    var ffboMesh;
    var lamina_data_set = false;
    /*
     *
     */
    $(".vis").dblclick(function () {
        if ($(this).hasClass("vis-sm")) {
            $(".vis-hf-r").toggleClass("vis-sm vis-hf-r");
            $(".vis-lg").toggleClass("vis-sm vis-lg");
            $(this).toggleClass("vis-sm vis-lg");
        }
    });


    svgObj.on('dblclick', function () {
        if ($("#vis-svg").hasClass("vis-svg-sm")) {
            $("#vis-svg").toggleClass("vis-svg-sm vis-svg-lg");
            $("#vis-3d").toggleClass('vis-3d-sm vis-3d-lg');
            //ffboMesh.onWindowResize();
        }
    });

    function toggleByID(a) {
        var neu = svgObj.select("#" + a);
        var hideOrShow = "hide";
        $("#btn-"+a).toggleClass("selected unselected");
        if (neu.attr("visible") == "true"){
             neu.attr("visible", "false");
             neu.style("opacity", "0.3");
             $("#btn-"+a).html('&EmptySmallSquare; ' + a);
             hideOrShow = "hide";
        } else {
             neu.attr("visible", "true");
             neu.style("opacity", "1.0");
             $("#btn-"+a).html('&FilledSmallSquare; ' + a)
             hideOrShow = "unhide";
        }
 
        svgObj.selectAll("."+a+"-dependent")
          .style("opacity", function() {
 
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
 
        if (cartridge_data_set)
        {
            $("#num-of-cartridge").text("Cartridge #" + cartridge_num + ", Number of Neurons: "+getNeuronCount());
        }
 
        //ffboMesh.toggleVis(a);
        //console.log(a);
        //window._neuGFX.mods.FlyBrainLab.sendMessage({messageType:'NLPquery', query: hideOrShow + " " + a });
   }


    for (var i = 0; i < cartList.length; i++) {
        var id = cartList[i];
        $("#single-cart").append("<li><a id='" + "btn" + "-" + id + "' role='button' class='btn-cart-single selected'>&FilledSmallSquare; " + id + "</a></li>");
    }
    $(".btn-cart-single").click(function () {
        var id = $(this).attr("id").substring(4);
        toggleByID(id);
    });
    /*
     * create neuron 3D mesh
     */


    onAddAllClick = function () {
        //ffboMesh.showAll();
        svgObj.selectAll(".cartridge")
            .attr("visible", "true")
            .style("opacity", "1.0")
            .each(function () {
            })
        $(".btn-cart-single").each(function () {
            var id = $(this).attr("id").substring(4);
            $(this).removeClass("unselected");
            $(this).addClass("selected");
            $(this).html('&FilledSmallSquare; ' + id)
        });
        num_of_cartridge = 721;
        $("#num-of-cartridge").text("Number of Cartridges:" + num_of_cartridge)
    }
    onRemoveAllClick = function () {
        svgObj.selectAll(".cartridge")
            .attr("visible", "false")
            .style("opacity", "0.3")
            .each(function () {
            })
        $(".btn-cart-single").each(function () {
            var id = $(this).attr("id").substring(4);
            $(this).removeClass("selected");
            $(this).addClass("unselected");
            $(this).html('&EmptySmallSquare; ' + id)
            svgObj.selectAll(".cartridge")
        });
        num_of_cartridge = 0;
        $("#num-of-cartridge").text("Number of Cartridges:" + num_of_cartridge)
        //ffboMesh.hideAll();
    }
    svgObj.selectAll(".cart")
        .style("cursor", "pointer")
        .style("opacity", "1.0")
        .attr("visible", "true")
        .each(function () {
            var a = d3.select(this).attr("id");

            d3.select(this).selectAll(".cartridge")
                .style("cursor", "pointer")
                .style("opacity", "1.0")
                .attr("visible", "true")
            //       svgObj.selectAll("."+a+"-dependent")
            //         .style("opacity", function() {
            //
            //            if(d3.select(this).attr("count") == null)
            //                d3.select(this).attr("count", 0);
            //            if(d3.select(this).attr("max-count") == null)
            //                d3.select(this).attr("max-count", 0);
            //            var count = parseInt((d3.select(this).attr("max-count")), 10);
            //            count += 1;
            //            d3.select(this).attr("max-count", count);
            //            d3.select(this).classed("syn-stroke", true);
            //         })
        })
        .on("click", function () {
            var id = d3.select(this).attr("id");
            toggleByID(id);
            id = id.substring(1);
            id = 'circle' + (id - 5) / 6;
            
        })
        .on("dblclick", function () {
            var id = d3.select(this).attr("id");
            id = (id.substring(1) - 5) / 6;
            window.customCircuitAttributes = { 'cartridge_num': id };
            window._neuGFX.mods.FlyBrainLab.loadFBLSVG('cartridge', function() {window._neuGFX.mods.FlyBrainLab.loadSubmodule('data/FBLSubmodules/onCartridgeLoad.js'); console.log("Submodule loaded.")});
            //window._neuGFX.mods.FlyBrainLab.sendMessage({ messageType: 'NLPquery', query: "show neurons in column home" }, '*');
        })
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

    $('.vis').hover(
        function () {
            if ($(this).hasClass("vis-sm"))
                $(".vis-lg").toggleClass("vis-hf-r vis-lg");
        }, function () {
            if ($(this).hasClass("vis-sm"))
                $(".vis-hf-r").toggleClass("vis-hf-r vis-lg");
        });


console.log('Loading was successful...');
window._neuGFX.mods.FlyBrainLab.addFBLPath("Lamina",function() {});
//window.onLaminaLoad();