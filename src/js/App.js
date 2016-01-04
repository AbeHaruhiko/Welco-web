"use strict"
import Util from './Util.js'

import Parse from 'parse'
import Vue from 'vue'
import VueRouter from 'vue-router'
import _ from 'lodash'

import VisitorInfoContainer from '../component/visitor-info-container.vue'

import Store from './Store.js'

Vue.config.debug = true

// init Parse
Parse.initialize("Ikzt3vnq6LwIKSb4WDP8RkOcUW3wRlsQuLUlrrFN", "mQTMG00TR3azol0UmAT6IIUH0uWFtppRDqDjNS5h")

// コンポーネント登録
Vue.component('visitor-info-container', VisitorInfoContainer)

var store = Store

// routerプラグインインストール
Vue.use(VueRouter)

// router インスタンスを作成。
var router = new VueRouter()

// いくつかの routes を定義します
router.map({
    '/visitorinfo': {
        component: VisitorInfoContainer
    }
})


// root インスタンスを作成する
var App = Vue.extend({
    data: function() {
        return { store: store }
    }
})

router.start(App, '#content')


const date = Util.formatDate();
console.log( '[' + date + '] Application was launched.' );
