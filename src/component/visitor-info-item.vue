<template>
<div id="main" class="pure-u-1" v-if="store.state.currentVisitorInfo">
    <div class="email-content">
        <div class="email-content-header pure-g">
            <div class="pure-u-1-2">
                <p class="email-content-subtitle">
                    面会者： <a>{{ store.state.currentVisitorInfo.member ? store.state.currentVisitorInfo.member.name : '' }}</a>
                </p>
                <p class="email-content-subtitle">
                    来社時刻：<span>{{ timeOfVisitation }}</span>
                </p>
            </div>

            <div class="email-content-controls pure-u-1-2">
                <button v-if="!store.state.currentVisitorInfo.readBy"
                    class="secondary-button pure-button"
                    @click="setRead">
                    確認済みにする
                </button>
                <p v-else>
                    {{ dateOfRead + ' ' + readBy }} 確認
                </p>
            </div>
        </div>

        <div class="email-content-body">
            <p>
                <img v-if="companyNameUrl" class="signature" :src="companyNameUrl" alt="会社名"/>
                <img v-if="visitorNameUrl" class="signature" :src="visitorNameUrl" alt="氏名"/>
            </p>
        </div>
    </div>
</div>
</template>

<style>
#main .signature {
    width: 45%;
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
        timeOfVisitation: function() {
            return moment(this.store.state.currentVisitorInfo.createdAt).format('YYYY/MM/DD HH:mm')
        },
        readBy: function() {
            return this.store.state.currentVisitorInfo.readBy.name
        },
        dateOfRead: function() {
            return moment(this.store.state.currentVisitorInfo.readAt).format('YYYY/MM/DD')
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
        this.store.state.currentVisitorInfo.readBy = Parse.User.current().get('member')                   // 確認済み（表示変更用）
        var parseVisitorInfo = Parse.Object.fromJSON(this.store.state.currentVisitorInfo)
        parseVisitorInfo.set('readBy', Parse.User.current().get('member'))  // fromJSONではreadなどのプロパティがフィールドにならないので手動でセット
        parseVisitorInfo.set('readAt', new Date())  // fromJSONではreadなどのプロパティがフィールドにならないので手動でセット
        parseVisitorInfo.save()
        .then((result) => {
            console.log('saved.')
        }, (error) => {
            console.log('save failed.')
            // TODO: このthisはvueコンポーネントを指していないかも。
            this.store.state.currentVisitorInfo.read = false    // 保存に失敗したので表示を戻す。
        })
      }
    }
}
</script>
