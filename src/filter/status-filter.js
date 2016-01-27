"use strict";

export function statusFilter(visitorInfoList, status) {
    return _.filter(visitorInfoList, function(visitorInfo) {
        if (status === undefined || status === null) {
            return true
        }
        if (status === 0) {
            // unread
            return !visitorInfo.readBy
        } else if (status === 1) {
            return visitorInfo.readBy
        }
    })
}
