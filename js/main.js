var cutOffYear = 3;

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