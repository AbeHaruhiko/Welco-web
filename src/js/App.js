import Util from './Util.js'

import Parse from 'parse'
import Vue from 'vue'

Vue.config.debug = true

// Application entry point
window.onload = () => {

  // init Parse
  Parse.initialize("Ikzt3vnq6LwIKSb4WDP8RkOcUW3wRlsQuLUlrrFN", "mQTMG00TR3azol0UmAT6IIUH0uWFtppRDqDjNS5h");

  // コンポーネント登録
  Vue.component('visitor-info', require('../component/visitor-info.js'))

  // root インスタンスを作成する
  var vm = new Vue({
    el: '#list',
    data: {
      visitorInfoList: null
    },
    created: function() { // ここはアローファンクションにするとthisがvmを指さなくなる。

      var query = new Parse.Query('VisitorInfo')
      query.descending('createdAt')
      query.include('member')

      query.find()
      .then((results) => {

        this.visitorInfoList = results
      },
      (error) => {
        console.error(error)
      });

    }
  })



  const date = Util.formatDate();
  console.log( '[' + date + '] Application was launched.' );


};
