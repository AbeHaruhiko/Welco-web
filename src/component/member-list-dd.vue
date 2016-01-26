<template>
<div class="pure-menu pure-menu-horizontal">
    <ul class="pure-menu-list">
        <li class="pure-menu-item pure-menu-has-children">
            <a href="#" id="menuLink1" class="pure-menu-link">社員絞り込み</a>
            <ul class="pure-menu-children">
                <li class="pure-menu-item">
                    <a href="#" class="pure-menu-link" @click="filterVisitorInfoListByMember()">すべて</a>
                </li>
                <li
                    class="pure-menu-item"
                    v-for="member in store.state.memberList">
                    <a href="#" class="pure-menu-link" @click="filterVisitorInfoListByMember(member)">{{ member.name }}</a>
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
        // 一旦クリア
        this.store.state.memberList = []

        // // 「すべて」を追加
        // const allMember = new Parse.Object('Member')
        // this.store.state.visitorInfoList.push({ name: 'すべて'})

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
    methods: {
        filterVisitorInfoListByMember: function(member) {
            // 一旦クリア
            this.store.state.visitorInfoList = []

            let memberJSON
            if (member) {
                member.className = 'Member'     // classNameがないと保存できない
                memberJSON = Parse.Object.fromJSON(member)
            }
            findParseVisitorInfoList(memberJSON)
            .then((results) => {    // arrowにしないとthisがvmを指さない
                this.store.state.visitorInfoList = []
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
}
</script>
