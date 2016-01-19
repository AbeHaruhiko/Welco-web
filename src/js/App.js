"use strict"
import Util from './Util.js'

import Parse from 'parse'
import Vue from 'vue'
import VueRouter from 'vue-router'
import _ from 'lodash'

import VisitorInfoContainer from '../component/visitor-info-container.vue'
import Login from '../component/login.vue'
import Signup from '../component/signup.vue'
import NotFound from '../component/not-found.vue'

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

// routes を定義します
router.map({
    '/visitorinfo': {
        component: VisitorInfoContainer,
        auth: true
    },
    '/login': {
        component: Login
    },
    '/signup': {
        component: Signup
    },
    '*': {
        component: NotFound
    }
})

// 認証
router.beforeEach(function (transition) {
    if (transition.to.path === '/') {
        transition.redirect('/visitorinfo')
        return true
    }
    if (transition.to.auth) {
        // 認証処理
        if (Parse.User.current()) {
            transition.next()
        } else {
            transition.redirect('/login')
        }
    }
    // qiita これがないとnext()やredirect()で遷移しない（URLだけ書き換わる）
    return true
})

// root インスタンスを作成する
var App = Vue.extend({
    data: function() {
        return { store: store }
    }
})

// 第二引数のelementをAppでリプレイスする。
router.start(App, '#app')


const date = Util.formatDate();
console.log( '[' + date + '] Application was launched.' );
