class ListComparer {

    _privateFunc() {

    }

    parseFacebookAttendees(attendeeList) {
        let tempList = attendeeList.split("\n");
        tempList = tempList.filter(attendee => attendee.length > 0 && attendee.trim() !== "");
        tempList.forEach((attendee, idx, list) => {
            list[idx] = attendee.trim();
        });
        return tempList;
    }

    /**
     * Parses the content of a Googlesheets sheet into an object to be worked with
     * @param sheetsContent
     * @returns {{}}
     */
    parseSheetsList(sheetsContent) {
        sheetsContent = sheetsContent.trim();
        let rows = sheetsContent.split("\n");
        if (rows.length === 1 && rows[0].trim() === "") {
            return {};
        }
        let sheets = {};
        let leaders = rows.splice(0, 1)[0].split("\t");
        rows.forEach(row => {
            if (row.trim() === "") {
                return;
            }
            //skip the total row
            if (row.startsWith("TOTAL NUMBER:")) {
                return;
            }
            let attendees = row.split("\t");
            attendees.forEach((person, idx) => {
                if (person.trim() === "") {
                    return;
                }
                sheets[person] = leaders[idx]
            });
        });
        return sheets;
    }

    /**
     * Compares the passed in sheet object to the attendance list and returns who on the list is not yet attending, and under which leader
     *
     * @param sheet object
     * @param fbList Array
     */
    compareGSheetToFacebookAttendees(sheet, fbList) {
        let notYetAttending = {};
        if (fbList.length === 0) {
            return notYetAttending;
        }
        fbList.forEach(attendee => {
            if (!sheet.hasOwnProperty(attendee)) {
                return;
            }
            delete sheet[attendee];
        });
        Object.keys(sheet).forEach(name => {
            if (!notYetAttending.hasOwnProperty(sheet[name])) {
                notYetAttending[sheet[name]] = [];
            }
            notYetAttending[sheet[name]].push(name);
        });
        return notYetAttending;
    }

    /**
     * Returns the facebook event attendees that are not yet assigned to a leader in google sheets
     *
     *
     * @param sheet
     * @param fbList
     * @returns {[]}
     */
    compareFacebookAttendeesToGSheet(sheet, fbList) {
        if (Object.keys(sheet).length === 0) {
            return fbList
        }
        //add the leaders to the keys to check
        Object.keys(sheet).forEach(key => {
            sheet[sheet[key]] = "leader";
        });
        return fbList.filter(name => {
            return !sheet.hasOwnProperty(name) ;
        });
    }
}

export {ListComparer};
