"use strict"
import Util from './Util.js'

import Parse from 'parse'
import Vue from 'vue'
import _ from 'lodash'

import VisitorInfoList from '../component/visitor-info-list.vue'
import VisitorInfo from '../component/visitor-info.vue'

import ActionCreator from "./flux/ActionCreator"
import Store from "./flux/Store"
import EventEmitter from "./flux/EventEmitter"

Vue.config.debug = true

// Application entry point
window.onload = () => {

  // init Parse
  Parse.initialize("Ikzt3vnq6LwIKSb4WDP8RkOcUW3wRlsQuLUlrrFN", "mQTMG00TR3azol0UmAT6IIUH0uWFtppRDqDjNS5h")

  // コンポーネント登録
  Vue.component('visitor-info-list', VisitorInfoList)
  Vue.component('visitor-info', VisitorInfo)

  var dispatcher = new EventEmitter();
  var action = new ActionCreator(dispatcher);
  var store = new Store(dispatcher);

  // root インスタンスを作成する
  var vm = new Vue({
    el: '#layout',
    data: {
      visitorInfoList: []
    },
    created: function() { // ここはアローファンクションにするとthisがvmを指さなくなる。

      this.visitorInfoList = store.getVisitorInfoList()
      store.on("CHANGE", () => {
        this._onChange()
      })

      var query = new Parse.Query('VisitorInfo')
      query.descending('createdAt')
      query.include('member')

      query.find()
      .then(function(results) {
        _.forEach(results, function(result) {
            vm.visitorInfoList.push(result.toJSON())
        })
        action.setVisitorInfoList(vm.visitorInfoList)
      },
      function(error) {
        console.error(error)
      });

    },
    events: {
        'clearSelection': function() {
            // 親（このコンポーネントのvisitorInfoList）はisSelectedは持っていない。
            // よって子のプロパティを変更する。（後で変えるかも）
            _.forEach(this.$children, function(visitorInfo) {
                visitorInfo.isSelected = false;
            })
        }
    },
    methods: {
      _onChange (){
        console.trace()
        this.count = store.getCount()
      }
    }
  })



  const date = Util.formatDate();
  console.log( '[' + date + '] Application was launched.' );


};
