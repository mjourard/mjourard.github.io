require = require("esm")(module);
const lcmod = require("../../../../js/tools/attendance-checker/ListComparer.mjs");

const assert = require('assert');
const fs = require('fs');

describe('ListComparer', function () {
    let lc;
    before(function () {
        lc = new lcmod.ListComparer();
    });
    describe('#parseFacebookAttendees(attendeeList)', function () {
        it('should return [] when the list is empty', function () {
            assert.deepEqual(lc.parseFacebookAttendees(""), []);
        });
        it('should return a singular item list when the a single name is passed in', function () {
            assert.deepEqual(lc.parseFacebookAttendees("Homer Simpson"), ["Homer Simpson"]);
            assert.deepEqual(lc.parseFacebookAttendees("\n\tHomer Simpson"), ["Homer Simpson"]);
            assert.deepEqual(lc.parseFacebookAttendees("Homer Simpson\n\t"), ["Homer Simpson"]);
            assert.deepEqual(lc.parseFacebookAttendees("\n\tHomer Simpson\n\t"), ["Homer Simpson"]);
        });
        it('should return the proper list when the list string format is correct', function () {
            let attendeeStr = "\t\n" +
                "Joseph Car\n" +
                "\t\n" +
                "\t\n" +
                "Samantha Marcy\n" +
                "\t\n" +
                "\t\n" +
                "Matt Huga\n" +
                "\t\n" +
                "\t\n" +
                "Shawn Mouton\n";
            let expected = [
                "Joseph Car",
                "Samantha Marcy",
                "Matt Huga",
                "Shawn Mouton"
            ];
            assert.deepEqual(lc.parseFacebookAttendees(attendeeStr), expected);
        });
    });
    describe('#parseSheetsList(sheetsContent)', function () {
        it('should return {} when the empty string is passed in', function () {
            assert.deepEqual(lc.parseSheetsList(""), {});
        });
        it('should return the proper object when the sheet format is correct', function () {
            let sheets = fs.readFileSync(__dirname + '/test_content/sheets.tsv', {encoding: 'utf8'});
            let expected = {
                "Isabelle Schmidt": "Frederick Talbot",
                "Anastazja Barr": "Frederick Talbot",
                "Dexter Gutierrez": "Frederick Talbot",
                "Pixie Oliver": "Frederick Talbot",
                "Izabella Simmonds": "Frederick Talbot",
                "Daisy-May Bull": "Frederick Talbot",
                "Rae Ritter": "Frederick Talbot",
                "Hunter Whitaker": "Frederick Talbot",
                "Alfie-James Stott": "Frederick Talbot",

                "Jardel Lynn": "Bethany Fenton",
                "William Cannon": "Bethany Fenton",
                "Asif Chambers": "Bethany Fenton",
                "Thomas Mcdowell": "Bethany Fenton",
                "Lorenzo Smith": "Bethany Fenton",
                "Jacqueline Allison": "Bethany Fenton",
                "Avneet Hanna": "Bethany Fenton",
                "Molly Hernandez": "Bethany Fenton",
                "Jesus Yu": "Bethany Fenton",

                "Gabriela Mcnally": "Sanah Carver",
                "Maariyah Mckenzie": "Sanah Carver",
                "Sameera Benton": "Sanah Carver",
                "Ellisha Gill": "Sanah Carver",
                "Kane Shepard": "Sanah Carver",
                "Tina Odom": "Sanah Carver",
                "Shauna Simons": "Sanah Carver",
                "Aairah Hansen": "Sanah Carver",
                "Fred Seymour": "Sanah Carver",

                "Mila-Rose Tucker": "Gwen Morse",
                "Nora Miller": "Gwen Morse",
                "Indi Hunt": "Gwen Morse",
                "Anas Hastings": "Gwen Morse",
                "Giacomo Byers": "Gwen Morse",
                "Jarred Oneal": "Gwen Morse",
                "Hilda English": "Gwen Morse",
                "Cloe Ventura": "Gwen Morse",
                "Linzi Lara": "Gwen Morse",

                "Hallam Bate": "Tatiana Parra/Aleah Cox",
                "Masuma Frazier": "Tatiana Parra/Aleah Cox",
                "Zander Baker": "Tatiana Parra/Aleah Cox",
                "Amandeep Howell": "Tatiana Parra/Aleah Cox",
                "Erik Chamberlain": "Tatiana Parra/Aleah Cox",
                "Kane Francis": "Tatiana Parra/Aleah Cox",
                "Aminah Mccormack": "Tatiana Parra/Aleah Cox",
                "Terry Paine": "Tatiana Parra/Aleah Cox",
                "Zach Brone": "Tatiana Parra/Aleah Cox",
                "Jonah kawarsky": "Tatiana Parra/Aleah Cox",
                "Jesse cole arndt": "Tatiana Parra/Aleah Cox",
            };
            assert.deepEqual(lc.parseSheetsList(sheets), expected);
        })
    });
    describe('#compareGSheetToFacebookAttendees(sheet, fbList)', function () {
        it('should return {} when the facebook list is empty', function () {
            let sheet = {
                "Isabelle Schmidt": "Frederick Talbot",
                "Anastazja Barr": "Frederick Talbot",
                "Jardel Lynn": "Bethany Fenton",
                "William Cannon": "Bethany Fenton",
                "Gabriela Mcnally": "Sanah Carver",
                "Maariyah Mckenzie": "Sanah Carver",
                "Mila-Rose Tucker": "Gwen Morse",
                "Nora Miller": "Gwen Morse",
                "Hallam Bate": "Tatiana Parra/Aleah Cox",
                "Masuma Frazier": "Tatiana Parra/Aleah Cox",
            };
            assert.deepEqual(lc.compareGSheetToFacebookAttendees(sheet, []), {});
        });
        it('should return {} when the sheet list is empty', function () {
            let fbList = [
                "Hallam Bate",
                "Masuma Frazier"
            ];
            assert.deepEqual(lc.compareGSheetToFacebookAttendees({}, fbList), {});
        });
        it('should return {} when all names in the google sheet are found in the facebook attending list', function () {
            let sheet = {
                "Isabelle Schmidt": "Frederick Talbot",
                "Anastazja Barr": "Frederick Talbot",
                "Jardel Lynn": "Bethany Fenton",
                "William Cannon": "Bethany Fenton",
                "Gabriela Mcnally": "Sanah Carver",
                "Maariyah Mckenzie": "Sanah Carver",
                "Mila-Rose Tucker": "Gwen Morse",
                "Nora Miller": "Gwen Morse",
                "Hallam Bate": "Tatiana Parra/Aleah Cox",
                "Masuma Frazier": "Tatiana Parra/Aleah Cox",
            };
            let fbList = Object.keys(sheet);
            assert.deepEqual(lc.compareGSheetToFacebookAttendees(sheet, fbList), {});
        });
        it('should return the correct object when some names are not in the attendance list', function () {
            let sheet = {
                "Isabelle Schmidt": "Frederick Talbot",
                "Anastazja Barr": "Frederick Talbot",
                "Jardel Lynn": "Bethany Fenton",
                "William Cannon": "Bethany Fenton",
                "Gabriela Mcnally": "Sanah Carver",
                "Maariyah Mckenzie": "Sanah Carver",
                "Mila-Rose Tucker": "Gwen Morse",
                "Nora Miller": "Gwen Morse",
                "Hallam Bate": "Tatiana Parra/Aleah Cox",
                "Masuma Frazier": "Tatiana Parra/Aleah Cox",
            };
            let fbList = [
                "Gabriela Mcnally",
                "Maariyah Mckenzie",
                "Mila-Rose Tucker",
                "Nora Miller",
                "Hallam Bate",
                "Masuma Frazier"
            ];
            let expected = {
                "Frederick Talbot": [
                    "Isabelle Schmidt",
                    "Anastazja Barr"
                ],
                "Bethany Fenton": [
                    "Jardel Lynn",
                    "William Cannon"
                ]
            };
            assert.deepEqual(lc.compareGSheetToFacebookAttendees(sheet, fbList), expected);
        });
    });
    describe('#compareFacebookAttendeesToGSheet(sheet, fbList)', function() {
        it('should return [] when the facebook list is empty', function () {
            assert.deepEqual(lc.compareFacebookAttendeesToGSheet({}, []), []);
        });
        it('should return the exact same list when the sheet is empty', function() {
            let fbList = [
                "Gabriela Mcnally",
                "Maariyah Mckenzie",
                "Mila-Rose Tucker",
                "Nora Miller",
                "Hallam Bate",
                "Masuma Frazier"
            ];
            assert.deepEqual(lc.compareFacebookAttendeesToGSheet({}, fbList), fbList);
        });
        it('should return the correct list facebook attendees when some are already accounted for', function() {
            let sheet = {
                "Isabelle Schmidt": "Frederick Talbot",
                "Anastazja Barr": "Frederick Talbot",
                "Jardel Lynn": "Bethany Fenton",
                "William Cannon": "Bethany Fenton",
                "Gabriela Mcnally": "Sanah Carver",
                "Maariyah Mckenzie": "Sanah Carver",
                "Mila-Rose Tucker": "Gwen Morse",
                "Nora Miller": "Gwen Morse",
                "Hallam Bate": "Tatiana Parra/Aleah Cox",
                "Masuma Frazier": "Tatiana Parra/Aleah Cox",
                "John Smith": "Grad Students: Rick Einstein",
                "Jane Doe": "Alumni: Adam Horzues"
            };
            let unaccountedFor = [
                "dogbert",
                "catbert",
                "wally"
            ];
            let fbList = [
                "Isabelle Schmidt",
                "Anastazja Barr",
                "Jardel Lynn",
                "William Cannon",
                "Gabriela Mcnally",
                "Maariyah Mckenzie",
                //include the leaders
                "Frederick Talbot",
                "Gwen Morse",
                "Tatiana Parra",
                "Rick Einstein",
                "Adam Horzues"
            ];

            //add in people that aren't in the google sheet
            fbList = fbList.concat(unaccountedFor);
            assert.deepEqual(lc.compareFacebookAttendeesToGSheet(sheet, fbList), unaccountedFor);
        });
    });
});
