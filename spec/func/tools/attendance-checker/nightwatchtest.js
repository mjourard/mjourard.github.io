const baseUrl = 'http://localhost:4000';
const fs = require('fs');

let sheets = fs.readFileSync(__dirname + '/test_content/sheets.tsv', {encoding: 'utf8'});
let fbevent = fs.readFileSync(__dirname + '/test_content/fbevent.txt', {encoding: 'utf8'});

let firstFBMissing = "Isabelle Schmidt\n" +
    "Anastazja Barr\n" +
    "Dexter Gutierrez\n" +
    "Pixie Oliver\n" +
    "Izabella Simmonds\n" +
    "Daisy-May Bull\n" +
    "Rae Ritter\n" +
    "Hunter Whitaker\n" +
    "Alfie-James Stott";

module.exports = {
    'Test attendance checker' : function (browser) {
        browser
            .url(baseUrl + '/tools/attendance-checker')
            .waitForElementVisible('body')
            .assert.visible('#fb_event_attendee_ta')
            .setValue('#fb_event_attendee_ta', fbevent)
            .assert.visible('#gs_signup_ta')
            .setValue('#gs_signup_ta', sheets)
            .assert.visible('#calc_differences')
            .click('#calc_differences')
            .assert.containsText('#fb_missing_td ul', firstFBMissing)
            .assert.containsText('#fb_missing_td div.attendance-checker__div__leader', "Frederick Talbot")
            .end();
    }
};
