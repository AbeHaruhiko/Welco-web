<template>
<div id="list" class="pure-u-1">
    <visitor-info-list-item v-for="visitorInfo in store.state.visitorInfoList" :visitor-info="visitorInfo" :store="store"></visitor-info-list-item>
</div>
</template>

<script>
"use strict";
import VisitorInfoListItem from '../component/visitor-info-list-item.vue'

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
    }
}
</script>
