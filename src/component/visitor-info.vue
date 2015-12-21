<template>
<div class="email-item pure-g" @click="selectVisitorInfo" :class="[ isSelected ? 'email-item-unread' : 'email-item-selected' ]">
    <div class="pure-u">
        <img class="email-avatar" alt="Tilo Mitra&#x27;s avatar" height="64" width="64" src="/img/common/tilo-avatar.png">
    </div>

    <div class="pure-u-3-4">
        <h5 class="email-name">{{ visitorInfo.get('member').get('name') }}</h5>
        <h4 class="email-subject">Hello from Toronto</h4>
        <p class="email-desc">
            Hey, I just wanted to check in with you from Toronto. I got here earlier today.
        </p>
    </div>
</div>
</template>

<script>
export default {
    props: {
        visitorInfo: {},
        isSelected: false
        // isUnselected: true
    },
    methods: {
        selectVisitorInfo: function() {
            console.debug('clicked')

            // 全行を一旦非選択状態にする。
            // 親のイベントを呼び出す。
            this.$dispatch('clearSelection', null)

            this.isSelected = true
            // this.isUnselected = false
        }
    }
}
</script>
