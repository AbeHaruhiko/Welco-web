"use strict"
import Util from './Util.js'

import Parse from 'parse'
import Vue from 'vue'
import _ from 'lodash'

import VisitorInfoList from '../component/visitor-info-list.vue'
import VisitorInfo from '../component/visitor-info.vue'

import Store from './Store.js'

Vue.config.debug = true

// init Parse
Parse.initialize("Ikzt3vnq6LwIKSb4WDP8RkOcUW3wRlsQuLUlrrFN", "mQTMG00TR3azol0UmAT6IIUH0uWFtppRDqDjNS5h")

// コンポーネント登録
Vue.component('visitor-info-list', VisitorInfoList)
Vue.component('visitor-info', VisitorInfo)

var store = Store

// root インスタンスを作成する
var vm = new Vue({
    el: '#layout',
    data: {
        // privateVisitorInfoList: [],     // storeにも置くので冗長だけど・・・
        store: store
    },
    created: function() { // ここはアローファンクションにするとthisがvmを指さなくなる。

        // this.visitorInfoList = store.getVisitorInfoList()

        var query = new Parse.Query('VisitorInfo')
        query.descending('createdAt')
        query.include('member')

        query.find()
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
    }
})



const date = Util.formatDate();
console.log( '[' + date + '] Application was launched.' );
