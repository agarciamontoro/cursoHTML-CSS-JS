function adjustStyle(width) {
    width = parseInt(width);
    if (width < 480) {
        $("#size-stylesheet").attr("href", "css/narrow.css");
    } else if ((width >= 481) && (width < 900)) {
        $("#size-stylesheet").attr("href", "css/medium.css");
    } else {
       $("#size-stylesheet").attr("href", "css/wide.css"); 
    }
}

$(function() {
    adjustStyle($(this).width());
    $(window).resize(function() {
        adjustStyle($(this).width());
    });
});