<template>
    <div id="layout" class="content pure-g">
        <div id="nav" class="pure-u">
            <a href="#" class="nav-menu-button">Menu</a>

            <div class="nav-inner">
                <button class="primary-button pure-button"><i class="fa fa-sign-out"></i> ログアウト</button>

                <!-- <div class="pure-menu">
                    <ul class="pure-menu-list">
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link">Inbox <span class="email-count">(2)</span></a></li>
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link">Important</a></li>
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link">Sent</a></li>
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link">Drafts</a></li>
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link">Trash</a></li>
                        <li class="pure-menu-heading">Labels</li>
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link"><span class="email-label-personal"></span>Personal</a></li>
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link"><span class="email-label-work"></span>Work</a></li>
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link"><span class="email-label-travel"></span>Travel</a></li>
                    </ul>
                </div> -->
                <!-- <div class="pure-menu pure-menu-horizontal">
                    <ul class="pure-menu-list">
                        <li class="pure-menu-item pure-menu-has-children">
                            <a href="#" id="menuLink1" class="pure-menu-link">社員絞り込み</a>
                            <ul class="pure-menu-children">
                                <li class="pure-menu-item"><a href="#" class="pure-menu-link">Email</a></li>
                                <li class="pure-menu-item"><a href="#" class="pure-menu-link">Twitter</a></li>
                                <li class="pure-menu-item"><a href="#" class="pure-menu-link">Tumblr Blog</a></li>
                            </ul>
                        </li>
                    </ul>
                </div> -->
                <member-list-dd :store="store"></member-list-dd>
                <div class="pure-menu pure-menu-horizontal">
                    <ul class="pure-menu-list">
                        <li class="pure-menu-item pure-menu-has-children">
                            <a href="#" id="menuLink1" class="pure-menu-link">Contact</a>
                            <ul class="pure-menu-children">
                                <li class="pure-menu-item"><a href="#" class="pure-menu-link">Email</a></li>
                                <li class="pure-menu-item"><a href="#" class="pure-menu-link">Twitter</a></li>
                                <li class="pure-menu-item"><a href="#" class="pure-menu-link">Tumblr Blog</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <visitor-info-list :store="store"></visitor-info-list>

        <visitor-info-item :store="store"></visitor-info-item>
    </div>

</template>

<style src="../css/layouts/email.css"></style>


<script>
"use strict";

import MemberListDd from '../component/member-list-dd.vue'
import VisitorInfoList from '../component/visitor-info-list.vue'
import VisitorInfoItem from '../component/visitor-info-item.vue'
import { findParseVisitorInfoList } from '../component/parse-visitor-info.js'

import { menu } from '../js/menus.js'

// import Store from '../js/Store.js'

export default {

    el: function() {
        return '#layout'
    },
    props: {
        // privateVisitorInfoList: [],     // storeにも置くので冗長だけど・・・
        store: {}
    },
    created: function() { // ここはアローファンクションにするとthisがvmを指さなくなる。

        // TODO: ここでなく、visitor-info-list.vueに移動した方がいい？

        // this.visitorInfoList = store.getVisitorInfoList()

        // var query = new Parse.Query('VisitorInfo')
        // query.descending('createdAt')
        // query.include('member')
        //
        // query.find()
        findParseVisitorInfoList()
        .then((results) => {    // arrowにしないとthisがvmを指さない
            _.forEach(results, (result) => {
                this.store.state.visitorInfoList.push(result.toJSON())
            })
            // store.visitorInfoList = this.privateVisitorInfoList;
        },
        function(error) {
            console.error(error)
        });
    },
    ready: function() {
        // drop down menus
        menu(window, document)
    },
    events: {
        // 'clearSelection': function() {
        //     // 親（このコンポーネントのvisitorInfoList）はisSelectedは持っていない。
        //     // よって子のプロパティを変更する。（後で変えるかも）
        //     _.forEach(this.$children, function(visitorInfo) {
        //         visitorInfo.isSelected = false;
        //     })
        // }
    },
    methods: {
    },
    components: {
        MemberListDd,
        VisitorInfoList,
        VisitorInfoItem
    }
}
</script>
