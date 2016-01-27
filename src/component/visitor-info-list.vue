<template>
<div id="list" class="pure-u-1">
    <!-- qiita -->
    <visitor-info-list-item v-for="visitorInfo in store.state.visitorInfoList | filterBy store.state.selectedMember.objectId in 'member.objectId' | status store.state.selectedStatus.status" :visitor-info="visitorInfo" :store="store"></visitor-info-list-item>
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
    // computed: {
    //     selectedStatus: function() {
    //         if (this.store.state.currentState) {
    //             return this.store.state.currentState.state
    //         } else {
    //             return
    //         }
    //     }
    // },
    created: function() {
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
