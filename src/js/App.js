import Util from './Util.js'

import Parse from 'parse'
import Vue from 'vue'
import _ from 'lodash'

import VisitorInfoList from '../component/visitor-info-list.vue'
import VisitorInfo from '../component/visitor-info.vue'

Vue.config.debug = true

// Application entry point
window.onload = () => {

  // init Parse
  Parse.initialize("Ikzt3vnq6LwIKSb4WDP8RkOcUW3wRlsQuLUlrrFN", "mQTMG00TR3azol0UmAT6IIUH0uWFtppRDqDjNS5h");

  // コンポーネント登録
  Vue.component('visitor-info-list', VisitorInfoList)
  Vue.component('visitor-info', VisitorInfo)

  // root インスタンスを作成する
  var vm = new Vue({
    el: '#layout',
    data: {
      visitorInfoList: []
    },
    created: function() { // ここはアローファンクションにするとthisがvmを指さなくなる。

      var query = new Parse.Query('VisitorInfo')
      query.descending('createdAt')
      query.include('member')

      query.find()
      .then(function(results) {
        _.forEach(results, function(result) {
            vm.$children[0].visitorInfoList.push(result.toJSON())

        })
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
    }
  })



  const date = Util.formatDate();
  console.log( '[' + date + '] Application was launched.' );


};
