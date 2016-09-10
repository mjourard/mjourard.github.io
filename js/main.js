var cutOffYear = 3;
var currentPage = "";

function HideOldContent() {
    var $sections = $(".resume-section");
    $sections.each(function() {
        var $jobs = $("div.job", $(this));
        var hidden = 0;
        $jobs.each(function() {
            console.log($("time.end", $(this)));
            if (timeElementIsTooOld($("time.end", $(this)))) {
                $(this).hide();
                hidden++;
            }
        });
        if (hidden > 0 && hidden === $jobs.length) {
            $(this).hide();
        }
    });

}

function timeElementIsTooOld($time) {
    var timeVal = new Date($time.attr("datetime"));
    var cutOffTime = new Date();
    cutOffTime.setYear(cutOffTime.getFullYear() - cutOffYear);
    return cutOffTime.valueOf() > timeVal.valueOf();
}

function displayHomePage() {
    $("#content-base").hide();
    $("#home-page").show();
    $("#CurriculumVitae\.html").show();

}

function displayContent(pagePath) {
    if (pagePath === currentPage) {
        return;
    } else {
        $("#" + currentPage, "#content-base").hide();
    }
    $("#home-page").hide();
    $("#CurriculumVitae\.html").hide();
    if ($("#" + pagePath, "#content-base").length === 0) {
        $("#content-base").load(pagePath);
    } else {
        $("#" + pagePath, "#content-base").show();
    }
}