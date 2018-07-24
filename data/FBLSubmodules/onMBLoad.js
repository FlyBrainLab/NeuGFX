svgObj = d3.select(document.querySelector('svg'));

var ID = "tooltip", CLS_ON = "tooltip_ON", FOLLOW = true,
    DATA = "_tooltip", OFFSET_X = 20, OFFSET_Y = 10,
    showAt = function (e) {
        var ntop = e.pageY + OFFSET_Y, nleft = e.pageX + OFFSET_X;
        $("#" + ID).html($(e.target).data(DATA)).css({
            position: "absolute", top: ntop, left: nleft
        }).show();
    };
$(document).on("mouseenter", "*[title]", function (e) {
    $(this).data(DATA, $(this).attr("title"));
    $(this).removeAttr("title").addClass(CLS_ON);
    $("<div id='" + ID + "' />").appendTo("body");
    showAt(e);
});
$(document).on("mouseleave", "." + CLS_ON, function (e) {
    $(this).attr("title", $(this).data(DATA)).removeClass(CLS_ON);
    $("#" + ID).remove();
});
if (FOLLOW) { $(document).on("mousemove", "." + CLS_ON, showAt); }


$('.myclass line').hover(function () {
    $(this).find('.title').fadeIn(300);
}, function () {
    $(this).find('.title').fadeOut(100);
});


window._neuGFX.mods.FlyBrainLab.loadNewLPU();

/*$('#current_constraints').scrollbar();
$('#current_notebook_url').scrollbar();
$('.options-form').scrollbar();
$('textarea').focus(function (e) {
    e.target.select();
    $(e.target).one('mouseup', function (e) {
        e.preventDefault();
    });
});*/

$('.constraint_generator_button').on('click', function () {
    constraint_list = [];
    $("svg g.synapse_class").each(function () {
        if ($(this).attr('inactive')) {
            constraint_list.push($(this).attr("synapse_info"));
        }
    });
    $("svg g.neuron_class").each(function () {
        if ($(this).attr('inactive')) {
            constraint_list.push($(this).attr("name"));
        }
    });

    constraint_dictionary['constraints'] = constraint_list;
    var constraint_dictionary_encoded = btoa(JSON.stringify(constraint_dictionary));
    $('#current_constraints').val(constraint_dictionary_encoded);
    //alertify.logPosition("middle bottom right");
    alertify.log("Simulation settings generated...");
    to_send = 3;
});

$('.save_tag_locally_button').on('click', function () {
    constraint_list = [];
    $("svg g.synapse_class").each(function () {
        if ($(this).attr('inactive')) {
            constraint_list.push($(this).attr("synapse_info"));
        }
    });
    $("svg g.neuron_class").each(function () {
        if ($(this).attr('inactive')) {
            constraint_list.push($(this).attr("name"));
        }
    });

    constraint_dictionary['constraints'] = constraint_list;
    var constraint_dictionary_encoded = btoa(JSON.stringify(constraint_dictionary));
    $('#current_constraints').val(constraint_dictionary_encoded);
    //alertify.logPosition("middle bottom right");
    alertify.log("Simulation settings generated...");
});

$('.inactivate_all_button').on('click', function () {
    constraint_list = [];
    $("svg g.synapse_class").each(function () {
        $(this).attr('inactive', 'true');
    });
    $("svg g.neuron_class").each(function () {
        $(this).attr('inactive', 'true');
    });
});


window._neuGFX.mods.FlyBrainLab.addFBLPath("Mushroom Body",function() {});