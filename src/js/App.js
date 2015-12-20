import Util from './Util.js'

var Parse = require('parse')
var Vue = require('vue')

// Application entry point
window.onload = () => {

  // var VisitorInfo = require('../component/visitor-info/visitor-info.js');
  // Vue.component("visitor-info", {
  //   template: '<div>hoge</div>'
  // })
  // new Vue({
  //   el: "#visitor-list"
  // })

  // 定義する
  var VisitorInfo = Vue.extend({
    template: '#visitor-info-template'
  })

  // 登録する
  Vue.component('visitor-info', VisitorInfo)

  // root インスタンスを作成する
  new Vue({
    el: '#visitor-list'
  })



  const date = Util.formatDate();
  console.log( '[' + date + '] Application was launched.' );

  // init Parse
  Parse.initialize("Ikzt3vnq6LwIKSb4WDP8RkOcUW3wRlsQuLUlrrFN", "mQTMG00TR3azol0UmAT6IIUH0uWFtppRDqDjNS5h");

  var TestObject = Parse.Object.extend("TestObject");
  var testObject = new TestObject();
  testObject.save({foo: "bar"}).then(function(object) {
    console.log("yay! Parse worked");
  });

};
