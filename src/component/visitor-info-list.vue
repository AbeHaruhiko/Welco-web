<template>
<div id="list" class="pure-u-1">
    <visitor-info-list-item v-for="visitorInfo in visitorInfoList" :visitor-info="visitorInfo"></visitor-info-list-item>
</div>
</template>

<script>
"use strict";
import VisitorInfoListItem from '../component/visitor-info-list-item.vue'

export default {
    props: {
        visitorInfoList: [],
    },
    components: {
        VisitorInfoListItem
    },
    created: function() {
        this.visitorInfoList = [];
        console.log(store)
    }
}
</script>
