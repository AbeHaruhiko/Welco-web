<template>
<div id="main" class="pure-u-1" v-if="store.state.currentVisitorInfo">
    <div class="email-content">
        <div class="email-content-header pure-g">
            <div class="pure-u-1-2">
                <h1 class="email-content-title">Hello from Toronto</h1>
                <p class="email-content-subtitle">
                    From <a>{{ store.state.currentVisitorInfo.member ? store.state.currentVisitorInfo.member.name : '' }}</a> at <span>3:56pm, April 3, 2012</span>
                </p>
            </div>

            <div class="email-content-controls pure-u-1-2">
                <button v-if="!store.state.currentVisitorInfo.read"
                    class="secondary-button pure-button"
                    @click="setRead">
                    確認済みにする
                </button>
                <p v-else>
                    {{ dateOfRead }} 確認
                </p>
            </div>
        </div>

        <div class="email-content-body">
            <p>
                <img v-if="companyNameUrl" class="signature" :src="companyNameUrl" alt="会社名"/>
            </p>
            <p>
                <img v-if="visitorNameUrl" class="signature" :src="visitorNameUrl" alt="氏名"/>
            </p>
        </div>
    </div>
</div>
</template>

<style>
.signature {
    width: 50%;
    height: auto;
    border: 1px gray solid;
}
</style>

<script>
"use strict";

import Parse from 'parse'
import { findParseVisitorInfoList } from '../component/parse-visitor-info.js'

import moment from 'moment'

export default {
    props: {
        store: {}
    },
    computed: {
        dateOfRead: function() {
            return moment(this.store.state.currentVisitorInfo.updatedAt).format('YYYY/MM/DD HH:mm')
        },
        companyNameUrl: function() {
            if (!this.store.state.currentVisitorInfo.company) {
                return ''
            }
            return this.store.state.currentVisitorInfo.company.url
        },
        visitorNameUrl: function() {
            if (!this.store.state.currentVisitorInfo.visitor) {
                return ''
            }
            return this.store.state.currentVisitorInfo.visitor.url
        }
    },
    created: function() {
      console.log('visitor-info created.')
      console.log(this.store)
    },
    methods: {
      setRead: function() {
        console.log('setRead called.')

        this.store.state.currentVisitorInfo.className = 'VisitorInfo'   // classNameがないと保存できない
        this.store.state.currentVisitorInfo.read = true                 // 確認済み（表示変更用）
        var parseVisitorInfo = Parse.Object.fromJSON(this.store.state.currentVisitorInfo)
        parseVisitorInfo.set('read', true)  // fromJSONではreadなどのプロパティがフィールドにならないので手動でセット
        parseVisitorInfo.save()
        .then((result) => {
            console.log('saved.')
        }, (error) => {
            console.log('save failed.')
            this.store.state.currentVisitorInfo.read = false    // 保存に失敗したので表示を戻す。
        })
      }
    }
}
</script>
