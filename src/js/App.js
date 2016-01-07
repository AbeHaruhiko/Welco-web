"use strict"
import Util from './Util.js'

import Parse from 'parse'
import Vue from 'vue'
import VueRouter from 'vue-router'
import _ from 'lodash'

import VisitorInfoContainer from '../component/visitor-info-container.vue'

import store from './Store.js'

Vue.config.debug = true

// init Parse
Parse.initialize("Ikzt3vnq6LwIKSb4WDP8RkOcUW3wRlsQuLUlrrFN", "mQTMG00TR3azol0UmAT6IIUH0uWFtppRDqDjNS5h")

// routerプラグインインストール
Vue.use(VueRouter)

// router インスタンスを作成。
var router = new VueRouter({
    history: true
})


var Foo = Vue.extend({
    template: '<p>This is foo!</p>'
})

var Bar = Vue.extend({
    template: '<p>This is bar!</p>'
})


// routes を定義します
router.map({
    '/visitorinfo': {
        data: function() {
            return { store: store }
        },
        component: VisitorInfoContainer
    },
    '/foo': {
        // data: function() {
        //     return { store: store }
        // },
        component: Foo
    },
    '/bar': {
        // data: function() {
        //     return { store: store }
        // },
        component: Bar
    }
})


// root インスタンスを作成する
var App = Vue.extend({
    data: function() {
        return { store: store }
    }
    // components: {
    //     'visitor-info-container': VisitorInfoContainer
    // },
    // template: '<router-view></router-view>'
})

// 第二引数のelementをAppでリプレイスする。
router.start(App, 'app')


const date = Util.formatDate();
console.log( '[' + date + '] Application was launched.' );
