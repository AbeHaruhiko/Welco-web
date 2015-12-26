<template>
<div
    class="email-item pure-g"
    @click="selectVisitorInfo"
    :class="[
        classSelectState,
        classReadState
    ]"
>
    <div class="pure-u">
        <img class="email-avatar" alt="Tilo Mitra&#x27;s avatar" height="64" width="64" src="/img/common/tilo-avatar.png">
    </div>

    <div class="pure-u-3-4">
        <h5 class="email-name">{{ visitorInfo.member.name }}</h5>
        <h4 class="email-subject">Hello from Toronto</h4>
        <p class="email-desc">
            Hey, I just wanted to check in with you from Toronto. I got here earlier today.
        </p>
    </div>
</div>
</template>

<script>
"use strict";
export default {
    props: {
        store: {},
        visitorInfo: {},
        // isSelected: false
    },
    data: {
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
            if (this.visitorInfo.read) {
                return 'email-item-read'
            } else {
                return 'email-item-unread'
            }
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
