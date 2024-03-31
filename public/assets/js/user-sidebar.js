$(document).ready(function() {
    var url = window.location + "";
    var path = "/"+url.replace(
      window.location.protocol + "//" + window.location.host + "/",
      ""
    );

    // Iterate over each sidebar link
    $('.dashboard-list-link').each(function() {
        // Compare the href attribute with the current path
        if ($(this).attr('href') === path) {
            // Add the "active" class if they match
            //$(this).addClass('active');
            $(this).css({
                "backgroundColor": "#fe696a",
                "color": "white", // Font color
            });
        }
    });
});