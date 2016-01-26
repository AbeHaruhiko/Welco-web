"use strict";
import Parse from 'parse'
export function findParseVisitorInfoList(member) {
    var query = new Parse.Query('VisitorInfo')
    query.descending('createdAt')
    query.include('member')
    if (member && member.id) {
        query.equalTo('member', member)
    }


    return query.find()
}
