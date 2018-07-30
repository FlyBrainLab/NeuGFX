// Use a closure to keep vars out of global scope
(function () {
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
}());

$(document).ready( function() {

    $('.myclass line').hover( function() {
        $(this).find('.title').fadeIn(300);
    }, function() {
        $(this).find('.title').fadeOut(100);
    });
	
});