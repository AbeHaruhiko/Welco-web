<template>
<div
    class="email-item pure-g"
    @click="selectVisitorInfo"
    :class="[
        classSelectState,
        classReadState
    ]"
>
    <!-- <div class="pure-u">
        <img class="email-avatar" alt="Tilo Mitra&#x27;s avatar" height="64" width="64" src="/img/common/tilo-avatar.png">
    </div> -->

    <div class="pure-u-3-4">
        <h5 class="email-name" style="display: inline;">{{ visitorInfo.member.name }}</h5>
        <span class="time-of-visitation" style="float: right;">{{ timeOfVisitation }}</span>
        <div style="clear: both;"></div>
        <img v-if="companyNameUrl" class="signature" :src="companyNameUrl" alt="会社名" />
        <img v-if="visitorNameUrl" class="signature" :src="visitorNameUrl" alt="氏名" />
    </div>
</div>
</template>

<style>
.email-item  .signature {
    width: 45%;
    height: auto;
    border: 1px gray solid;
}
.time-of-visitation {
    font-size: 0.6em;
}
</style>

<script>
"use strict";

import moment from 'moment'

export default {
    props: {
        store: {},
        visitorInfo: {},
        // isSelected: false
    },
    data: function() {
    },
    computed: {
        // 一覧の選択状態
        classSelectState: function() {
            if (this.visitorInfo === this.store.state.currentVisitorInfo) {
                return 'email-item-selected'
            } else {
                return ''
            }
        },
        // VisitorInfoの確認済/未
        classReadState: function() {
            if (this.visitorInfo.readBy) {
                return 'email-item-read'
            } else {
                return 'email-item-unread'
            }
        },
        timeOfVisitation: function() {
            return moment(this.visitorInfo.createdAt).format('YYYY/MM/DD HH:mm')
        },
        companyNameUrl: function() {
            if (!this.visitorInfo.company) {
                return ''
            }
            return this.visitorInfo.company.url
        },
        visitorNameUrl: function() {
            if (!this.visitorInfo.visitor) {
                return ''
            }
            return this.visitorInfo.visitor.url
        }
    },
    methods: {
        selectVisitorInfo: function() {
            console.debug('clicked')

            // 全行を一旦非選択状態にする。
            // 親のイベントを呼び出す。
            // this.$dispatch('clearSelection', null)

            // this.isSelected = true
            this.store.state.currentVisitorInfo = this.visitorInfo
        }
    }
}
</script>
