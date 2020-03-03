import {ListComparer} from "./ListComparer.mjs";
import {ListUI} from "./ListUI.mjs";

const $ = document.querySelector.bind(document);
const lc = new ListComparer();

document.addEventListener('DOMContentLoaded', function () {
    let collapsibleElems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(collapsibleElems, {});

    let $fbAttendeesTA = $('#fb_event_attendee_ta');
    let $gsSignup = $('#gs_signup_ta');
    let $goBtn = $('#calc_differences');
    let $fbMissing = $('#fb_missing_td');
    let $gsMissing = $('#gs_missing_td');
    // let $gsNew = $('#gs_new_td');
    // let $missingFromLastYear = $('#missing_from_last_year_td');
    $goBtn.addEventListener('click', () => {
        console.log("parsing facebook attendees");
        let fbList = lc.parseFacebookAttendees($fbAttendeesTA.value);
        console.log("parsing google sheets attendees");
        let sheets = lc.parseSheetsList($gsSignup.value);
        let tempSheets = Object.assign({}, sheets);
        let tempFbList = fbList.slice();
        let fbNotYetAttending = lc.compareGSheetToFacebookAttendees(tempSheets, tempFbList);
        let fbListUI = new ListUI($fbMissing);
        fbListUI.clear();
        Object.keys(fbNotYetAttending).forEach(leader => {
            //append the name of the leader and a divider
            if (fbNotYetAttending[leader].length === 0) {
                return;
            }
            fbListUI.insertListHeader(leader);
            fbListUI.insertDivider();
            fbListUI.initList();
            fbNotYetAttending[leader].forEach(person => {
                fbListUI.appendListItem(person);
            });
        });
        tempSheets = Object.assign({}, sheets);
        tempFbList = fbList.slice();
        let attendeesNotAssigned = lc.compareFacebookAttendeesToGSheet(tempSheets, tempFbList);
        let gsListUI = new ListUI($gsMissing);
        gsListUI.clear();
        if (attendeesNotAssigned.length > 0) {
            gsListUI.initList();
            attendeesNotAssigned.forEach(person => {
                gsListUI.appendListItem(person);
            });
        }
    })
});
