"use strict";
import Parse from 'parse'
export function findParseVisitorInfoList() {
    var query = new Parse.Query('VisitorInfo')
    query.descending('createdAt')
    query.include('member')
    // query.include('company')
    // query.include('visitor')

    return query.find()
}
