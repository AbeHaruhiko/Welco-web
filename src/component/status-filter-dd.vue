<template>
<div class="pure-menu pure-menu-horizontal">
    <ul class="pure-menu-list">
        <li class="pure-menu-item pure-menu-has-children">
            <a href="#" id="statusFilterDd" class="pure-menu-link">{{ selectedStatusName }}</a>
            <ul class="pure-menu-children">
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link" @click.prevent.stop="selectStatus()">すべて</a>
                </li>
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link" @click.prevent.stop="selectStatus(STATUS_UNREAD)">未確認</a>
                </li>
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link" @click.prevent.stop="selectStatus(STATUS_READ)">確認済み</a>
                </li>
            </ul>
        </li>
    </ul>
</div>
</template>

<style>
.pure-menu-children {
    background-color: rgb(75, 113, 151);
}
#nav .pure-menu-children {
    color: #fff;
    margin-left: 0.5em;
}
</style>
<script>
"use strict";

import Parse from 'parse'

import { findParseVisitorInfoList } from '../component/parse-visitor-info.js'

// const STATUS_UNREAD = { status: 0, name: '未確認' }
// const STATUS_READ = { status: 1, name: '確認済み' }

export default {

    props: {
        store: {}
    },
    created: function() {
        this.$set('store.state.selectedStatus', { status: null, name: 'ステータス' })
    },
    computed: {
        selectedStatusName: function() {
            return this.store.state.selectedStatus ? this.store.state.selectedStatus.name : 'ステータス'
        },
        STATUS_UNREAD: function() {
            return { status: 0, name: '未確認' }
        },
        STATUS_READ: function() {
            return { status: 1, name: '確認済み' }
        }
    },
    methods: {
        selectStatus: function(status) {

            this.store.state.selectedStatus = status

            // DDクローズ
            document.getElementById('statusFilterDd').click()
        }
    }
}
</script>
