var cutOffYear = 3;

function HideOldContent($parent) {
    var count = 0;
    $("time.end", $parent).each(function() {
        if (timeElementIsTooOld($(this))) {
            $(this).parent().parent().parent().hide();
        }
        count++;
    });
    console.log("completed looking for old content. found " + count + " time elements");
}

function timeElementIsTooOld($time) {
    var timeVal = new Date($time.attr("datetime"));
    var cutOffTime = new Date();
    cutOffTime.setYear(cutOffTime.getFullYear() - 3);
    return cutOffTime.valueOf() > timeVal.valueOf();
}