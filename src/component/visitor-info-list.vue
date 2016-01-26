<template>
<div id="list" class="pure-u-1">
    <visitor-info-list-item v-for="visitorInfo in store.state.visitorInfoList" :visitor-info="visitorInfo" :store="store"></visitor-info-list-item>
</div>
</template>

<script>
"use strict";
import VisitorInfoListItem from '../component/visitor-info-list-item.vue'
import { findParseVisitorInfoList } from '../component/parse-visitor-info.js'

export default {
    props: {
        // privateVisitorInfoList: [],
        store: {}
    },
    components: {
        VisitorInfoListItem
    },
    created: function() {
        // this.privateVisitorInfoList = this.store.getVisitorInfoList();
        console.log(this.store)

        findParseVisitorInfoList()
        .then((results) => {    // arrowにしないとthisがvmを指さない
            _.forEach(results, (result) => {
                this.store.state.visitorInfoList.push(result.toJSON())
            })
            // store.visitorInfoList = this.privateVisitorInfoList;
        },
        function(error) {
            console.error(error)
        })

    }
}
</script>
