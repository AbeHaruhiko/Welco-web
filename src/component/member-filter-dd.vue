<template>
<div class="pure-menu pure-menu-horizontal">
    <ul class="pure-menu-list">
        <li class="pure-menu-item pure-menu-has-children">
            <a href="#" id="memberFilterDd" class="pure-menu-link">{{ selectedMemberName }}</a>
            <ul class="pure-menu-children">
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link" @click.prevent.stop="selectMember()">すべて</a>
                </li>
                <li
                    class="pure-menu-item"
                    v-for="member in store.state.memberList">
                    <a href="#" class="pure-menu-link" @click.prevent.stop="selectMember(member)">{{ member.name }}</a>
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

export default {
    props: {
        // privateVisitorInfoList: [],
        store: {}
    },
    created: function() {

        // qiita
        this.$set('store.state.selectedMember', null)

        // 一旦クリア
        this.store.state.memberList = []
        var query = new Parse.Query('Member')
        query.descending('dispOrder')
        query.find()
        .then((results) => {    // arrowにしないとthisがvmを指さない
            _.forEach(results, (result) => {
                this.store.state.memberList.push(result.toJSON())
            })
        },
        function(error) {
            console.error(error)
        });
    },
    computed: {
        selectedMemberName: function() {
            return this.store.state.selectedMember ? this.store.state.selectedMember.name : '社員'
        }
    },
    methods: {
        selectMember: function(member) {

            this.store.state.selectedMember = member

            // DDクローズ
            document.getElementById('memberFilterDd').click()
        }
    }
}
</script>
