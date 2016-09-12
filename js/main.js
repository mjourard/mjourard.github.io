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
    currentPage = "";
    $("#content-base").hide();
    $("#home-page").show();
    $("#CurriculumVitae").show();

}

function displayContent(directory, pageName) {
    console.log("in display content! pageName = " + pageName);
    var $base = $("#content-base");
    if (pageName === currentPage) {
        console.log("current page selected is the linked page.");
        return;
    } else if (currentPage !== "") {
        $("#" + currentPage, $base).hide();
    }
    $("#home-page").hide();
    $("#CurriculumVitae").hide();
    if ($("#" + pageName, $base).length === 0) {
        console.log("loading " + directory + "/" + pageName + ".html");
        $base.load(directory + "/" + pageName + ".html");
    } else {
        console.log("page name = " + pageName);
        $("#" + pageName, $base).show();
    }

    $base.show();
    currentPage = pageName;
}