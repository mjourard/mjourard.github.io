var cutOffYear = 3;
var currentPage = "";

function HideOldContent() {
    var $sections = $(".resume-section");
    $sections.each(function() {
        var $jobs = $("div.job", $(this));
        var hidden = 0;
        $jobs.each(function() {
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
    console.log("home page displayed!");
    $("#content-base").hide();
    $("#home-page").show();
    $("#CurriculumVitae\.html").show();

}

function displayContent(directory, pageName) {
    var pagePath = directory.replace("/", "-") + "-" + pageName;
    if (pagePath === currentPage) {
        return;
    } else if (currentPage !== "") {
        $("#" + currentPage, "#content-base").hide();
    }
    $("#home-page").hide();
    $("#CurriculumVitae\.html").hide();
    if ($("#" + escapedPagePath, "#content-base").length === 0) {
        $("#content-base").load(pagePath);
    } else {
        $("#" + escapedPagePath, "#content-base").show();
    }

    currentPage = pagePath;
}