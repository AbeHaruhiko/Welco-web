import Util from './Util.js';

var Parse = require('parse');
require('vue');

// Application entry point
window.onload = () => {



  const date = Util.formatDate();
  console.log( '[' + date + '] Application was launched.' );

  // init Parse
  Parse.initialize("Ikzt3vnq6LwIKSb4WDP8RkOcUW3wRlsQuLUlrrFN", "mQTMG00TR3azol0UmAT6IIUH0uWFtppRDqDjNS5h");

  var TestObject = Parse.Object.extend("TestObject");
  var testObject = new TestObject();
  testObject.save({foo: "bar"}).then(function(object) {
    alert("yay! it worked");
  });

};
