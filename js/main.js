function HideOldContent() {
    var count = 0;
    $("time .end").each(function() {
        if (timeElementIsTooOld($(this))) {
            $(this).parent.parent.parent.hide();
        }
        count++;
    });
    console.log("completed looking for old content. found " + count + " time elements");
}

function timeElementIsTooOld($time) {
    var timeVal = new Date($time.attr("datetime"));
    var cutOffTime = Date.now();
    cutOffTime.setYear(cutOffTime.getYear() - 1);
    return cutOffTime.valueOf() > timeVal.valueOf();
}