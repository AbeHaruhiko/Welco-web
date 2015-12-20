(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
module.exports = require('./lib/browser/Parse.js');

},{"./lib/browser/Parse.js":9}],3:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

/**
 * Parse.Analytics provides an interface to Parse's logging and analytics
 * backend.
 *
 * @class Parse.Analytics
 * @static
 */

/**
 * Tracks the occurrence of a custom event with additional dimensions.
 * Parse will store a data point at the time of invocation with the given
 * event name.
 *
 * Dimensions will allow segmentation of the occurrences of this custom
 * event. Keys and values should be {@code String}s, and will throw
 * otherwise.
 *
 * To track a user signup along with additional metadata, consider the
 * following:
 * <pre>
 * var dimensions = {
 *  gender: 'm',
 *  source: 'web',
 *  dayType: 'weekend'
 * };
 * Parse.Analytics.track('signup', dimensions);
 * </pre>
 *
 * There is a default limit of 8 dimensions per event tracked.
 *
 * @method track
 * @param {String} name The name of the custom event to report to Parse as
 * having happened.
 * @param {Object} dimensions The dictionary of information by which to
 * segment this event.
 * @param {Object} options A Backbone-style callback object.
 * @return {Parse.Promise} A promise that is resolved when the round-trip
 * to the server completes.
 */
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.track = track;

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

function track(name, dimensions, options) {
  name = name || '';
  name = name.replace(/^\s*/, '');
  name = name.replace(/\s*$/, '');
  if (name.length === 0) {
    throw new TypeError('A name for the custom event must be provided');
  }

  for (var key in dimensions) {
    if (typeof key !== 'string' || typeof dimensions[key] !== 'string') {
      throw new TypeError('track() dimensions expects keys and values of type "string".');
    }
  }

  options = options || {};
  return _CoreManager2['default'].getAnalyticsController().track(name, dimensions)._thenRunCallbacks(options);
}

_CoreManager2['default'].setAnalyticsController({
  track: function track(name, dimensions) {
    var RESTController = _CoreManager2['default'].getRESTController();
    return RESTController.request('POST', 'events/' + name, { dimensions: dimensions });
  }
});
},{"./CoreManager":5,"babel-runtime/helpers/interop-require-default":49}],4:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.run = run;

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _decode = require('./decode');

var _decode2 = _interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

/**
 * Contains functions for calling and declaring
 * <a href="/docs/cloud_code_guide#functions">cloud functions</a>.
 * <p><strong><em>
 *   Some functions are only available from Cloud Code.
 * </em></strong></p>
 *
 * @class Parse.Cloud
 * @static
 */

/**
 * Makes a call to a cloud function.
 * @method run
 * @param {String} name The function name.
 * @param {Object} data The parameters to send to the cloud function.
 * @param {Object} options A Backbone-style options object
 * options.success, if set, should be a function to handle a successful
 * call to a cloud function.  options.error should be a function that
 * handles an error running the cloud function.  Both functions are
 * optional.  Both functions take a single argument.
 * @return {Parse.Promise} A promise that will be resolved with the result
 * of the function.
 */

function run(name, data, options) {
  options = options || {};

  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('Cloud function name must be a string.');
  }

  var requestOptions = {};
  if (options.useMasterKey) {
    requestOptions.useMasterKey = options.useMasterKey;
  }
  if (options.sessionToken) {
    requestOptions.sessionToken = options.sessionToken;
  }

  return _CoreManager2['default'].getCloudController().run(name, data, requestOptions)._thenRunCallbacks(options);
}

_CoreManager2['default'].setCloudController({
  run: function run(name, data, options) {
    var RESTController = _CoreManager2['default'].getRESTController();

    var payload = (0, _encode2['default'])(data, true);

    var requestOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      requestOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      requestOptions.sessionToken = options.sessionToken;
    }

    var request = RESTController.request('POST', 'functions/' + name, payload, requestOptions);

    return request.then(function (res) {
      var decoded = (0, _decode2['default'])(res);
      if (decoded && decoded.hasOwnProperty('result')) {
        return _ParsePromise2['default'].as(decoded.result);
      }
      return _ParsePromise2['default'].error(new _ParseError2['default'](_ParseError2['default'].INVALID_JSON, 'The server returned an invalid response.'));
    })._thenRunCallbacks(options);
  }
});
},{"./CoreManager":5,"./ParseError":12,"./ParsePromise":18,"./decode":31,"./encode":32,"babel-runtime/helpers/interop-require-default":49}],5:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var config = {
  // Defaults
  IS_NODE: typeof process !== 'undefined' && !!process.versions && !!process.versions.node,
  REQUEST_ATTEMPT_LIMIT: 5,
  SERVER_URL: 'https://api.parse.com/1',
  VERSION: 'js' + '1.6.11',
  APPLICATION_ID: null,
  JAVASCRIPT_KEY: null,
  MASTER_KEY: null,
  USE_MASTER_KEY: false,
  PERFORM_USER_REWRITE: true,
  FORCE_REVOCABLE_SESSION: false
};

module.exports = {
  get: function get(key) {
    if (config.hasOwnProperty(key)) {
      return config[key];
    }
    throw new Error('Configuration key not found: ' + key);
  },

  set: function set(key, value) {
    config[key] = value;
  },

  /* Specialized Controller Setters/Getters */

  setAnalyticsController: function setAnalyticsController(controller) {
    if (typeof controller.track !== 'function') {
      throw new Error('AnalyticsController must implement track()');
    }
    config['AnalyticsController'] = controller;
  },

  getAnalyticsController: function getAnalyticsController() {
    return config['AnalyticsController'];
  },

  setCloudController: function setCloudController(controller) {
    if (typeof controller.run !== 'function') {
      throw new Error('CloudController must implement run()');
    }
    config['CloudController'] = controller;
  },

  getCloudController: function getCloudController() {
    return config['CloudController'];
  },

  setConfigController: function setConfigController(controller) {
    if (typeof controller.current !== 'function') {
      throw new Error('ConfigController must implement current()');
    }
    if (typeof controller.get !== 'function') {
      throw new Error('ConfigController must implement get()');
    }
    config['ConfigController'] = controller;
  },

  getConfigController: function getConfigController() {
    return config['ConfigController'];
  },

  setFileController: function setFileController(controller) {
    if (typeof controller.saveFile !== 'function') {
      throw new Error('FileController must implement saveFile()');
    }
    if (typeof controller.saveBase64 !== 'function') {
      throw new Error('FileController must implement saveBase64()');
    }
    config['FileController'] = controller;
  },

  getFileController: function getFileController() {
    return config['FileController'];
  },

  setInstallationController: function setInstallationController(controller) {
    if (typeof controller.currentInstallationId !== 'function') {
      throw new Error('InstallationController must implement currentInstallationId()');
    }
    config['InstallationController'] = controller;
  },

  getInstallationController: function getInstallationController() {
    return config['InstallationController'];
  },

  setPushController: function setPushController(controller) {
    if (typeof controller.send !== 'function') {
      throw new Error('PushController must implement send()');
    }
    config['PushController'] = controller;
  },

  getPushController: function getPushController() {
    return config['PushController'];
  },

  setObjectController: function setObjectController(controller) {
    if (typeof controller.save !== 'function') {
      throw new Error('ObjectController must implement save()');
    }
    if (typeof controller.fetch !== 'function') {
      throw new Error('ObjectController must implement fetch()');
    }
    if (typeof controller.destroy !== 'function') {
      throw new Error('ObjectController must implement destroy()');
    }
    config['ObjectController'] = controller;
  },

  getObjectController: function getObjectController() {
    return config['ObjectController'];
  },

  setQueryController: function setQueryController(controller) {
    if (typeof controller.find !== 'function') {
      throw new Error('QueryController must implement find()');
    }
    config['QueryController'] = controller;
  },

  getQueryController: function getQueryController() {
    return config['QueryController'];
  },

  setRESTController: function setRESTController(controller) {
    if (typeof controller.request !== 'function') {
      throw new Error('RESTController must implement request()');
    }
    if (typeof controller.ajax !== 'function') {
      throw new Error('RESTController must implement ajax()');
    }
    config['RESTController'] = controller;
  },

  getRESTController: function getRESTController() {
    return config['RESTController'];
  },

  setSessionController: function setSessionController(controller) {
    if (typeof controller.getSession !== 'function') {
      throw new Error('A SessionController must implement getSession()');
    }
    config['SessionController'] = controller;
  },

  getSessionController: function getSessionController() {
    return config['SessionController'];
  },

  setStorageController: function setStorageController(controller) {
    if (controller.async) {
      if (typeof controller.getItemAsync !== 'function') {
        throw new Error('An async StorageController must implement getItemAsync()');
      }
      if (typeof controller.setItemAsync !== 'function') {
        throw new Error('An async StorageController must implement setItemAsync()');
      }
      if (typeof controller.removeItemAsync !== 'function') {
        throw new Error('An async StorageController must implement removeItemAsync()');
      }
    } else {
      if (typeof controller.getItem !== 'function') {
        throw new Error('A synchronous StorageController must implement getItem()');
      }
      if (typeof controller.setItem !== 'function') {
        throw new Error('A synchronous StorageController must implement setItem()');
      }
      if (typeof controller.removeItem !== 'function') {
        throw new Error('A synchonous StorageController must implement removeItem()');
      }
    }
    config['StorageController'] = controller;
  },

  getStorageController: function getStorageController() {
    return config['StorageController'];
  },

  setUserController: function setUserController(controller) {
    if (typeof controller.setCurrentUser !== 'function') {
      throw new Error('A UserController must implement setCurrentUser()');
    }
    if (typeof controller.currentUser !== 'function') {
      throw new Error('A UserController must implement currentUser()');
    }
    if (typeof controller.currentUserAsync !== 'function') {
      throw new Error('A UserController must implement currentUserAsync()');
    }
    if (typeof controller.signUp !== 'function') {
      throw new Error('A UserController must implement signUp()');
    }
    if (typeof controller.logIn !== 'function') {
      throw new Error('A UserController must implement logIn()');
    }
    if (typeof controller.become !== 'function') {
      throw new Error('A UserController must implement become()');
    }
    if (typeof controller.logOut !== 'function') {
      throw new Error('A UserController must implement logOut()');
    }
    if (typeof controller.requestPasswordReset !== 'function') {
      throw new Error('A UserController must implement requestPasswordReset()');
    }
    if (typeof controller.upgradeToRevocableSession !== 'function') {
      throw new Error('A UserController must implement upgradeToRevocableSession()');
    }
    if (typeof controller.linkWith !== 'function') {
      throw new Error('A UserController must implement linkWith()');
    }
    config['UserController'] = controller;
  },

  getUserController: function getUserController() {
    return config['UserController'];
  }
};
}).call(this,require('_process'))

},{"_process":1}],6:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * -weak
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _parseDate = require('./parseDate');

var _parseDate2 = _interopRequireDefault(_parseDate);

var _ParseUser = require('./ParseUser');

var _ParseUser2 = _interopRequireDefault(_ParseUser);

var initialized = false;
var requestedPermissions;
var initOptions;

/**
 * Provides a set of utilities for using Parse with Facebook.
 * @class Parse.FacebookUtils
 * @static
 */
exports['default'] = {
  /**
   * Initializes Parse Facebook integration.  Call this function after you
   * have loaded the Facebook Javascript SDK with the same parameters
   * as you would pass to<code>
   * <a href=
   * "https://developers.facebook.com/docs/reference/javascript/FB.init/">
   * FB.init()</a></code>.  Parse.FacebookUtils will invoke FB.init() for you
   * with these arguments.
   *
   * @method init
   * @param {Object} options Facebook options argument as described here:
   *   <a href=
   *   "https://developers.facebook.com/docs/reference/javascript/FB.init/">
   *   FB.init()</a>. The status flag will be coerced to 'false' because it
   *   interferes with Parse Facebook integration. Call FB.getLoginStatus()
   *   explicitly if this behavior is required by your application.
   */
  init: function init(options) {
    if (typeof FB === 'undefined') {
      throw new Error('The Facebook JavaScript SDK must be loaded before calling init.');
    }
    initOptions = {};
    if (options) {
      for (var key in options) {
        initOptions[key] = options[key];
      }
    }
    if (initOptions.status && typeof console !== 'undefined') {
      var warn = console.warn || console.log || function () {};
      warn.call(console, 'The "status" flag passed into' + ' FB.init, when set to true, can interfere with Parse Facebook' + ' integration, so it has been suppressed. Please call' + ' FB.getLoginStatus() explicitly if you require this behavior.');
    }
    initOptions.status = false;
    FB.init(initOptions);
    _ParseUser2['default']._registerAuthenticationProvider({
      authenticate: function authenticate(options) {
        var _this = this;

        if (typeof FB === 'undefined') {
          options.error(this, 'Facebook SDK not found.');
        }
        FB.login(function (response) {
          if (response.authResponse) {
            if (options.success) {
              options.success(_this, {
                id: response.authResponse.userID,
                access_token: response.authResponse.accessToken,
                expiration_date: new Date(response.authResponse.expiresIn * 1000 + new Date().getTime()).toJSON()
              });
            }
          } else {
            if (options.error) {
              options.error(_this, response);
            }
          }
        }, {
          scope: requestedPermissions
        });
      },

      restoreAuthentication: function restoreAuthentication(authData) {
        if (authData) {
          var expiration = (0, _parseDate2['default'])(authData.expiration_date);
          var expiresIn = expiration ? (expiration.getTime() - new Date().getTime()) / 1000 : 0;

          var authResponse = {
            userID: authData.id,
            accessToken: authData.access_token,
            expiresIn: expiresIn
          };
          var newOptions = {};
          if (initOptions) {
            for (var key in initOptions) {
              newOptions[key] = initOptions[key];
            }
          }
          newOptions.authResponse = authResponse;

          // Suppress checks for login status from the browser.
          newOptions.status = false;

          // If the user doesn't match the one known by the FB SDK, log out.
          // Most of the time, the users will match -- it's only in cases where
          // the FB SDK knows of a different user than the one being restored
          // from a Parse User that logged in with username/password.
          var existingResponse = FB.getAuthResponse();
          if (existingResponse && existingResponse.userID !== authResponse.userID) {
            FB.logout();
          }

          FB.init(newOptions);
        }
        return true;
      },

      getAuthType: function getAuthType() {
        return 'facebook';
      },

      deauthenticate: function deauthenticate() {
        this.restoreAuthentication(null);
      }
    });
    initialized = true;
  },

  /**
   * Gets whether the user has their account linked to Facebook.
   *
   * @method isLinked
   * @param {Parse.User} user User to check for a facebook link.
   *     The user must be logged in on this device.
   * @return {Boolean} <code>true</code> if the user has their account
   *     linked to Facebook.
   */
  isLinked: function isLinked(user) {
    return user._isLinked('facebook');
  },

  /**
   * Logs in a user using Facebook. This method delegates to the Facebook
   * SDK to authenticate the user, and then automatically logs in (or
   * creates, in the case where it is a new user) a Parse.User.
   *
   * @method logIn
   * @param {String, Object} permissions The permissions required for Facebook
   *    log in.  This is a comma-separated string of permissions.
   *    Alternatively, supply a Facebook authData object as described in our
   *    REST API docs if you want to handle getting facebook auth tokens
   *    yourself.
   * @param {Object} options Standard options object with success and error
   *    callbacks.
   */
  logIn: function logIn(permissions, options) {
    if (!permissions || typeof permissions === 'string') {
      if (!initialized) {
        throw new Error('You must initialize FacebookUtils before calling logIn.');
      }
      requestedPermissions = permissions;
      return _ParseUser2['default']._logInWith('facebook', options);
    } else {
      var newOptions = {};
      if (options) {
        for (var key in options) {
          newOptions[key] = options[key];
        }
      }
      newOptions.authData = permissions;
      return _ParseUser2['default']._logInWith('facebook', newOptions);
    }
  },

  /**
   * Links Facebook to an existing PFUser. This method delegates to the
   * Facebook SDK to authenticate the user, and then automatically links
   * the account to the Parse.User.
   *
   * @method link
   * @param {Parse.User} user User to link to Facebook. This must be the
   *     current user.
   * @param {String, Object} permissions The permissions required for Facebook
   *    log in.  This is a comma-separated string of permissions.
   *    Alternatively, supply a Facebook authData object as described in our
   *    REST API docs if you want to handle getting facebook auth tokens
   *    yourself.
   * @param {Object} options Standard options object with success and error
   *    callbacks.
   */
  link: function link(user, permissions, options) {
    if (!permissions || typeof permissions === 'string') {
      if (!initialized) {
        throw new Error('You must initialize FacebookUtils before calling link.');
      }
      requestedPermissions = permissions;
      return user._linkWith('facebook', options);
    } else {
      var newOptions = {};
      if (options) {
        for (var key in options) {
          newOptions[key] = options[key];
        }
      }
      newOptions.authData = permissions;
      return user._linkWith('facebook', newOptions);
    }
  },

  /**
   * Unlinks the Parse.User from a Facebook account.
   *
   * @method unlink
   * @param {Parse.User} user User to unlink from Facebook. This must be the
   *     current user.
   * @param {Object} options Standard options object with success and error
   *    callbacks.
   */
  unlink: function unlink(user, options) {
    if (!initialized) {
      throw new Error('You must initialize FacebookUtils before calling unlink.');
    }
    return user._unlinkFrom('facebook', options);
  }
};
module.exports = exports['default'];
},{"./ParseUser":23,"./parseDate":36,"babel-runtime/helpers/interop-require-default":49}],7:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _Storage = require('./Storage');

var _Storage2 = _interopRequireDefault(_Storage);

var iidCache = null;

function hexOctet() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function generateId() {
  return hexOctet() + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + hexOctet() + hexOctet();
}

module.exports = {
  currentInstallationId: function currentInstallationId() {
    if (typeof iidCache === 'string') {
      return _ParsePromise2['default'].as(iidCache);
    }
    var path = _Storage2['default'].generatePath('installationId');
    return _Storage2['default'].getItemAsync(path).then(function (iid) {
      if (!iid) {
        iid = generateId();
        return _Storage2['default'].setItemAsync(path, iid).then(function () {
          iidCache = iid;
          return iid;
        });
      }
      iidCache = iid;
      return iid;
    });
  },

  _clearCache: function _clearCache() {
    iidCache = null;
  },

  _setInstallationIdCache: function _setInstallationIdCache(iid) {
    iidCache = iid;
  }
};
},{"./CoreManager":5,"./ParsePromise":18,"./Storage":26,"babel-runtime/helpers/interop-require-default":49}],8:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getState = getState;
exports.initializeState = initializeState;
exports.removeState = removeState;
exports.getServerData = getServerData;
exports.setServerData = setServerData;
exports.getPendingOps = getPendingOps;
exports.setPendingOp = setPendingOp;
exports.pushPendingState = pushPendingState;
exports.popPendingState = popPendingState;
exports.mergeFirstPendingState = mergeFirstPendingState;
exports.getObjectCache = getObjectCache;
exports.estimateAttribute = estimateAttribute;
exports.estimateAttributes = estimateAttributes;
exports.commitServerChanges = commitServerChanges;
exports.enqueueTask = enqueueTask;
exports._clearAllState = _clearAllState;

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = _interopRequireDefault(_ParseFile);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = _interopRequireDefault(_ParseRelation);

var _TaskQueue = require('./TaskQueue');

var _TaskQueue2 = _interopRequireDefault(_TaskQueue);

var _ParseOp = require('./ParseOp');

var objectState = {};

function getState(className, id) {
  var classData = objectState[className];
  if (classData) {
    return classData[id] || null;
  }
  return null;
}

function initializeState(className, id, initial) {
  var state = getState(className, id);
  if (state) {
    return state;
  }
  if (!objectState[className]) {
    objectState[className] = {};
  }
  if (!initial) {
    initial = {
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new _TaskQueue2['default'](),
      existed: false
    };
  }
  state = objectState[className][id] = initial;
  return state;
}

function removeState(className, id) {
  var state = getState(className, id);
  if (state === null) {
    return null;
  }
  delete objectState[className][id];
  return state;
}

function getServerData(className, id) {
  var state = getState(className, id);
  if (state) {
    return state.serverData;
  }
  return {};
}

function setServerData(className, id, attributes) {
  var data = initializeState(className, id).serverData;
  for (var attr in attributes) {
    if (typeof attributes[attr] !== 'undefined') {
      data[attr] = attributes[attr];
    } else {
      delete data[attr];
    }
  }
}

function getPendingOps(className, id) {
  var state = getState(className, id);
  if (state) {
    return state.pendingOps;
  }
  return [{}];
}

function setPendingOp(className, id, attr, op) {
  var pending = initializeState(className, id).pendingOps;
  var last = pending.length - 1;
  if (op) {
    pending[last][attr] = op;
  } else {
    delete pending[last][attr];
  }
}

function pushPendingState(className, id) {
  var pending = initializeState(className, id).pendingOps;
  pending.push({});
}

function popPendingState(className, id) {
  var pending = initializeState(className, id).pendingOps;
  var first = pending.shift();
  if (!pending.length) {
    pending[0] = {};
  }
  return first;
}

function mergeFirstPendingState(className, id) {
  var first = popPendingState(className, id);
  var pending = getPendingOps(className, id);
  var next = pending[0];
  for (var attr in first) {
    if (next[attr] && first[attr]) {
      var merged = next[attr].mergeWith(first[attr]);
      if (merged) {
        next[attr] = merged;
      }
    } else {
      next[attr] = first[attr];
    }
  }
}

function getObjectCache(className, id) {
  var state = getState(className, id);
  if (state) {
    return state.objectCache;
  }
  return {};
}

function estimateAttribute(className, id, attr) {
  var serverData = getServerData(className, id);
  var value = serverData[attr];
  var pending = getPendingOps(className, id);
  for (var i = 0; i < pending.length; i++) {
    if (pending[i][attr]) {
      if (pending[i][attr] instanceof _ParseOp.RelationOp) {
        value = pending[i][attr].applyTo(value, { className: className, id: id }, attr);
      } else {
        value = pending[i][attr].applyTo(value);
      }
    }
  }
  return value;
}

function estimateAttributes(className, id) {
  var data = {};
  var attr;
  var serverData = getServerData(className, id);
  for (attr in serverData) {
    data[attr] = serverData[attr];
  }
  var pending = getPendingOps(className, id);
  for (var i = 0; i < pending.length; i++) {
    for (attr in pending[i]) {
      if (pending[i][attr] instanceof _ParseOp.RelationOp) {
        data[attr] = pending[i][attr].applyTo(data[attr], { className: className, id: id }, attr);
      } else {
        data[attr] = pending[i][attr].applyTo(data[attr]);
      }
    }
  }
  return data;
}

function commitServerChanges(className, id, changes) {
  var state = initializeState(className, id);
  for (var attr in changes) {
    var val = changes[attr];
    state.serverData[attr] = val;
    if (val && typeof val === 'object' && !(val instanceof _ParseObject2['default']) && !(val instanceof _ParseFile2['default']) && !(val instanceof _ParseRelation2['default'])) {
      var json = (0, _encode2['default'])(val, false, true);
      state.objectCache[attr] = JSON.stringify(json);
    }
  }
}

function enqueueTask(className, id, task) {
  var state = initializeState(className, id);
  return state.tasks.enqueue(task);
}

function _clearAllState() {
  objectState = {};
}
},{"./ParseFile":13,"./ParseObject":16,"./ParseOp":17,"./ParsePromise":18,"./ParseRelation":20,"./TaskQueue":28,"./encode":32,"babel-runtime/helpers/interop-require-default":49}],9:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _decode = require('./decode');

var _decode2 = _interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _InstallationController = require('./InstallationController');

var _InstallationController2 = _interopRequireDefault(_InstallationController);

var _ParseOp = require('./ParseOp');

var ParseOp = _interopRequireWildcard(_ParseOp);

var _RESTController = require('./RESTController');

var _RESTController2 = _interopRequireDefault(_RESTController);

/**
 * Contains all Parse API classes and functions.
 * @class Parse
 * @static
 */
var Parse = {
  /**
   * Call this method first to set up your authentication tokens for Parse.
   * You can get your keys from the Data Browser on parse.com.
   * @method initialize
   * @param {String} applicationId Your Parse Application ID.
   * @param {String} javaScriptKey Your Parse JavaScript Key.
   * @param {String} masterKey (optional) Your Parse Master Key. (Node.js only!)
   * @static
   */
  initialize: function initialize(applicationId, javaScriptKey) {
    if ('browser' === 'browser' && _CoreManager2['default'].get('IS_NODE')) {
      console.log('It looks like you\'re using the browser version of the SDK in a ' + 'node.js environment. You should require(\'parse/node\') instead.');
    }
    Parse._initialize(applicationId, javaScriptKey);
  },

  _initialize: function _initialize(applicationId, javaScriptKey, masterKey) {
    _CoreManager2['default'].set('APPLICATION_ID', applicationId);
    _CoreManager2['default'].set('JAVASCRIPT_KEY', javaScriptKey);
    _CoreManager2['default'].set('MASTER_KEY', masterKey);
    _CoreManager2['default'].set('USE_MASTER_KEY', false);
  }
};

/** These legacy setters may eventually be deprecated **/
Object.defineProperty(Parse, 'applicationId', {
  get: function get() {
    return _CoreManager2['default'].get('APPLICATION_ID');
  },
  set: function set(value) {
    _CoreManager2['default'].set('APPLICATION_ID', value);
  }
});
Object.defineProperty(Parse, 'javaScriptKey', {
  get: function get() {
    return _CoreManager2['default'].get('JAVASCRIPT_KEY');
  },
  set: function set(value) {
    _CoreManager2['default'].set('JAVASCRIPT_KEY', value);
  }
});
Object.defineProperty(Parse, 'masterKey', {
  get: function get() {
    return _CoreManager2['default'].get('MASTER_KEY');
  },
  set: function set(value) {
    _CoreManager2['default'].set('MASTER_KEY', value);
  }
});
Object.defineProperty(Parse, 'serverURL', {
  get: function get() {
    return _CoreManager2['default'].get('SERVER_URL');
  },
  set: function set(value) {
    _CoreManager2['default'].set('SERVER_URL', value);
  }
});
/** End setters **/

Parse.ACL = require('./ParseACL');
Parse.Analytics = require('./Analytics');
Parse.Cloud = require('./Cloud');
Parse.CoreManager = require('./CoreManager');
Parse.Config = require('./ParseConfig');
Parse.Error = require('./ParseError');
Parse.FacebookUtils = require('./FacebookUtils');
Parse.File = require('./ParseFile');
Parse.GeoPoint = require('./ParseGeoPoint');
Parse.Installation = require('./ParseInstallation');
Parse.Object = require('./ParseObject');
Parse.Op = {
  Set: ParseOp.SetOp,
  Unset: ParseOp.UnsetOp,
  Increment: ParseOp.IncrementOp,
  Add: ParseOp.AddOp,
  Remove: ParseOp.RemoveOp,
  AddUnique: ParseOp.AddUniqueOp,
  Relation: ParseOp.RelationOp
};
Parse.Promise = require('./ParsePromise');
Parse.Push = require('./Push');
Parse.Query = require('./ParseQuery');
Parse.Relation = require('./ParseRelation');
Parse.Role = require('./ParseRole');
Parse.Session = require('./ParseSession');
Parse.Storage = require('./Storage');
Parse.User = require('./ParseUser');

Parse._request = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _CoreManager2['default'].getRESTController().request.apply(null, args);
};
Parse._ajax = function () {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return _CoreManager2['default'].getRESTController().ajax.apply(null, args);
};
// We attempt to match the signatures of the legacy versions of these methods
Parse._decode = function (_, value) {
  return (0, _decode2['default'])(value);
};
Parse._encode = function (value, _, disallowObjects) {
  return (0, _encode2['default'])(value, disallowObjects);
};
Parse._getInstallationId = function () {
  return _CoreManager2['default'].getInstallationController().currentInstallationId();
};

_CoreManager2['default'].setInstallationController(_InstallationController2['default']);
_CoreManager2['default'].setRESTController(_RESTController2['default']);

// For legacy requires, of the form `var Parse = require('parse').Parse`
Parse.Parse = Parse;

module.exports = Parse;
},{"./Analytics":3,"./Cloud":4,"./CoreManager":5,"./FacebookUtils":6,"./InstallationController":7,"./ParseACL":10,"./ParseConfig":11,"./ParseError":12,"./ParseFile":13,"./ParseGeoPoint":14,"./ParseInstallation":15,"./ParseObject":16,"./ParseOp":17,"./ParsePromise":18,"./ParseQuery":19,"./ParseRelation":20,"./ParseRole":21,"./ParseSession":22,"./ParseUser":23,"./Push":24,"./RESTController":25,"./Storage":26,"./decode":31,"./encode":32,"babel-runtime/helpers/interop-require-default":49,"babel-runtime/helpers/interop-require-wildcard":50}],10:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ParseRole = require('./ParseRole');

var _ParseRole2 = _interopRequireDefault(_ParseRole);

var _ParseUser = require('./ParseUser');

var _ParseUser2 = _interopRequireDefault(_ParseUser);

var PUBLIC_KEY = '*';

/**
 * Creates a new ACL.
 * If no argument is given, the ACL has no permissions for anyone.
 * If the argument is a Parse.User, the ACL will have read and write
 *   permission for only that user.
 * If the argument is any other JSON object, that object will be interpretted
 *   as a serialized ACL created with toJSON().
 * @class Parse.ACL
 * @constructor
 *
 * <p>An ACL, or Access Control List can be added to any
 * <code>Parse.Object</code> to restrict access to only a subset of users
 * of your application.</p>
 */

var ParseACL = (function () {
  function ParseACL(arg1) {
    _classCallCheck(this, ParseACL);

    this.permissionsById = {};
    if (arg1 && typeof arg1 === 'object') {
      if (arg1 instanceof _ParseUser2['default']) {
        this.setReadAccess(arg1, true);
        this.setWriteAccess(arg1, true);
      } else {
        for (var userId in arg1) {
          var accessList = arg1[userId];
          if (typeof userId !== 'string') {
            throw new TypeError('Tried to create an ACL with an invalid user id.');
          }
          this.permissionsById[userId] = {};
          for (var permission in accessList) {
            var allowed = accessList[permission];
            if (permission !== 'read' && permission !== 'write') {
              throw new TypeError('Tried to create an ACL with an invalid permission type.');
            }
            if (typeof allowed !== 'boolean') {
              throw new TypeError('Tried to create an ACL with an invalid permission value.');
            }
            this.permissionsById[userId][permission] = allowed;
          }
        }
      }
    } else if (typeof arg1 === 'function') {
      throw new TypeError('ParseACL constructed with a function. Did you forget ()?');
    }
  }

  /**
   * Returns a JSON-encoded version of the ACL.
   * @method toJSON
   * @return {Object}
   */

  _createClass(ParseACL, [{
    key: 'toJSON',
    value: function toJSON() {
      var permissions = {};
      for (var p in this.permissionsById) {
        permissions[p] = this.permissionsById[p];
      }
      return permissions;
    }

    /**
     * Returns whether this ACL is equal to another object
     * @method equals
     * @param other The other object to compare to
     * @return {Boolean}
     */
  }, {
    key: 'equals',
    value: function equals(other) {
      if (!(other instanceof ParseACL)) {
        return false;
      }
      var users = _Object$keys(this.permissionsById);
      var otherUsers = _Object$keys(other.permissionsById);
      if (users.length !== otherUsers.length) {
        return false;
      }
      for (var u in this.permissionsById) {
        if (!other.permissionsById[u]) {
          return false;
        }
        if (this.permissionsById[u].read !== other.permissionsById[u].read) {
          return false;
        }
        if (this.permissionsById[u].write !== other.permissionsById[u].write) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: '_setAccess',
    value: function _setAccess(accessType, userId, allowed) {
      if (userId instanceof _ParseUser2['default']) {
        userId = userId.id;
      } else if (userId instanceof _ParseRole2['default']) {
        userId = 'role:' + userId.getName();
      }
      if (typeof userId !== 'string') {
        throw new TypeError('userId must be a string.');
      }
      if (typeof allowed !== 'boolean') {
        throw new TypeError('allowed must be either true or false.');
      }
      var permissions = this.permissionsById[userId];
      if (!permissions) {
        if (!allowed) {
          // The user already doesn't have this permission, so no action is needed
          return;
        } else {
          permissions = {};
          this.permissionsById[userId] = permissions;
        }
      }

      if (allowed) {
        this.permissionsById[userId][accessType] = true;
      } else {
        delete permissions[accessType];
        if (_Object$keys(permissions).length === 0) {
          delete this.permissionsById[userId];
        }
      }
    }
  }, {
    key: '_getAccess',
    value: function _getAccess(accessType, userId) {
      if (userId instanceof _ParseUser2['default']) {
        userId = userId.id;
      } else if (userId instanceof _ParseRole2['default']) {
        userId = 'role:' + userId.getName();
      }
      var permissions = this.permissionsById[userId];
      if (!permissions) {
        return false;
      }
      return !!permissions[accessType];
    }

    /**
     * Sets whether the given user is allowed to read this object.
     * @method setReadAccess
     * @param userId An instance of Parse.User or its objectId.
     * @param {Boolean} allowed Whether that user should have read access.
     */
  }, {
    key: 'setReadAccess',
    value: function setReadAccess(userId, allowed) {
      this._setAccess('read', userId, allowed);
    }

    /**
     * Get whether the given user id is *explicitly* allowed to read this object.
     * Even if this returns false, the user may still be able to access it if
     * getPublicReadAccess returns true or a role that the user belongs to has
     * write access.
     * @method getReadAccess
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
     * @return {Boolean}
     */
  }, {
    key: 'getReadAccess',
    value: function getReadAccess(userId) {
      return this._getAccess('read', userId);
    }

    /**
     * Sets whether the given user id is allowed to write this object.
     * @method setWriteAccess
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
     * @param {Boolean} allowed Whether that user should have write access.
     */
  }, {
    key: 'setWriteAccess',
    value: function setWriteAccess(userId, allowed) {
      this._setAccess('write', userId, allowed);
    }

    /**
     * Gets whether the given user id is *explicitly* allowed to write this object.
     * Even if this returns false, the user may still be able to write it if
     * getPublicWriteAccess returns true or a role that the user belongs to has
     * write access.
     * @method getWriteAccess
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
     * @return {Boolean}
     */
  }, {
    key: 'getWriteAccess',
    value: function getWriteAccess(userId) {
      return this._getAccess('write', userId);
    }

    /**
     * Sets whether the public is allowed to read this object.
     * @method setPublicReadAccess
     * @param {Boolean} allowed
     */
  }, {
    key: 'setPublicReadAccess',
    value: function setPublicReadAccess(allowed) {
      this.setReadAccess(PUBLIC_KEY, allowed);
    }

    /**
     * Gets whether the public is allowed to read this object.
     * @method getPublicReadAccess
     * @return {Boolean}
     */
  }, {
    key: 'getPublicReadAccess',
    value: function getPublicReadAccess() {
      return this.getReadAccess(PUBLIC_KEY);
    }

    /**
     * Sets whether the public is allowed to write this object.
     * @method setPublicWriteAccess
     * @param {Boolean} allowed
     */
  }, {
    key: 'setPublicWriteAccess',
    value: function setPublicWriteAccess(allowed) {
      this.setWriteAccess(PUBLIC_KEY, allowed);
    }

    /**
     * Gets whether the public is allowed to write this object.
     * @method getPublicWriteAccess
     * @return {Boolean}
     */
  }, {
    key: 'getPublicWriteAccess',
    value: function getPublicWriteAccess() {
      return this.getWriteAccess(PUBLIC_KEY);
    }

    /**
     * Gets whether users belonging to the given role are allowed
     * to read this object. Even if this returns false, the role may
     * still be able to write it if a parent role has read access.
     *
     * @method getRoleReadAccess
     * @param role The name of the role, or a Parse.Role object.
     * @return {Boolean} true if the role has read access. false otherwise.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
  }, {
    key: 'getRoleReadAccess',
    value: function getRoleReadAccess(role) {
      if (role instanceof _ParseRole2['default']) {
        // Normalize to the String name
        role = role.getName();
      }
      if (typeof role !== 'string') {
        throw new TypeError('role must be a ParseRole or a String');
      }
      return this.getReadAccess('role:' + role);
    }

    /**
     * Gets whether users belonging to the given role are allowed
     * to write this object. Even if this returns false, the role may
     * still be able to write it if a parent role has write access.
     *
     * @method getRoleWriteAccess
     * @param role The name of the role, or a Parse.Role object.
     * @return {Boolean} true if the role has write access. false otherwise.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
  }, {
    key: 'getRoleWriteAccess',
    value: function getRoleWriteAccess(role) {
      if (role instanceof _ParseRole2['default']) {
        // Normalize to the String name
        role = role.getName();
      }
      if (typeof role !== 'string') {
        throw new TypeError('role must be a ParseRole or a String');
      }
      return this.getWriteAccess('role:' + role);
    }

    /**
     * Sets whether users belonging to the given role are allowed
     * to read this object.
     *
     * @method setRoleReadAccess
     * @param role The name of the role, or a Parse.Role object.
     * @param {Boolean} allowed Whether the given role can read this object.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
  }, {
    key: 'setRoleReadAccess',
    value: function setRoleReadAccess(role, allowed) {
      if (role instanceof _ParseRole2['default']) {
        // Normalize to the String name
        role = role.getName();
      }
      if (typeof role !== 'string') {
        throw new TypeError('role must be a ParseRole or a String');
      }
      this.setReadAccess('role:' + role, allowed);
    }

    /**
     * Sets whether users belonging to the given role are allowed
     * to write this object.
     *
     * @method setRoleWriteAccess
     * @param role The name of the role, or a Parse.Role object.
     * @param {Boolean} allowed Whether the given role can write this object.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
  }, {
    key: 'setRoleWriteAccess',
    value: function setRoleWriteAccess(role, allowed) {
      if (role instanceof _ParseRole2['default']) {
        // Normalize to the String name
        role = role.getName();
      }
      if (typeof role !== 'string') {
        throw new TypeError('role must be a ParseRole or a String');
      }
      this.setWriteAccess('role:' + role, allowed);
    }
  }]);

  return ParseACL;
})();

exports['default'] = ParseACL;
module.exports = exports['default'];
},{"./ParseRole":21,"./ParseUser":23,"babel-runtime/core-js/object/keys":43,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/interop-require-default":49}],11:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _decode = require('./decode');

var _decode2 = _interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _escape2 = require('./escape');

var _escape3 = _interopRequireDefault(_escape2);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _Storage = require('./Storage');

var _Storage2 = _interopRequireDefault(_Storage);

/**
 * Parse.Config is a local representation of configuration data that
 * can be set from the Parse dashboard.
 *
 * @class Parse.Config
 * @constructor
 */

var ParseConfig = (function () {
  function ParseConfig() {
    _classCallCheck(this, ParseConfig);

    this.attributes = {};
    this._escapedAttributes = {};
  }

  /**
   * Gets the value of an attribute.
   * @method get
   * @param {String} attr The name of an attribute.
   */

  _createClass(ParseConfig, [{
    key: 'get',
    value: function get(attr) {
      return this.attributes[attr];
    }

    /**
     * Gets the HTML-escaped value of an attribute.
     * @method escape
     * @param {String} attr The name of an attribute.
     */
  }, {
    key: 'escape',
    value: function escape(attr) {
      var html = this._escapedAttributes[attr];
      if (html) {
        return html;
      }
      var val = this.attributes[attr];
      var escaped = '';
      if (val != null) {
        escaped = (0, _escape3['default'])(val.toString());
      }
      this._escapedAttributes[attr] = escaped;
      return escaped;
    }

    /**
     * Retrieves the most recently-fetched configuration object, either from
     * memory or from local storage if necessary.
     *
     * @method current
     * @static
     * @return {Config} The most recently-fetched Parse.Config if it
     *     exists, else an empty Parse.Config.
     */
  }], [{
    key: 'current',
    value: function current() {
      var controller = _CoreManager2['default'].getConfigController();
      return controller.current();
    }

    /**
     * Gets a new configuration object from the server.
     * @method get
     * @static
     * @param {Object} options A Backbone-style options object.
     * Valid options are:<ul>
     *   <li>success: Function to call when the get completes successfully.
     *   <li>error: Function to call when the get fails.
     * </ul>
     * @return {Parse.Promise} A promise that is resolved with a newly-created
     *     configuration object when the get completes.
     */
  }, {
    key: 'get',
    value: function get(options) {
      options = options || {};

      var controller = _CoreManager2['default'].getConfigController();
      return controller.get()._thenRunCallbacks(options);
    }
  }]);

  return ParseConfig;
})();

exports['default'] = ParseConfig;

var currentConfig = null;

var CURRENT_CONFIG_KEY = 'currentConfig';

function decodePayload(data) {
  try {
    var json = JSON.parse(data);
    if (json && typeof json === 'object') {
      return (0, _decode2['default'])(json);
    }
  } catch (e) {
    return null;
  }
}

_CoreManager2['default'].setConfigController({
  current: function current() {
    if (currentConfig) {
      return currentConfig;
    }

    var config = new ParseConfig();
    var storagePath = _Storage2['default'].generatePath(CURRENT_CONFIG_KEY);
    var configData;
    if (!_Storage2['default'].async()) {
      configData = _Storage2['default'].getItem(storagePath);

      if (configData) {
        var attributes = decodePayload(configData);
        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }
      return config;
    }
    // Return a promise for async storage controllers
    return _Storage2['default'].getItemAsync(storagePath).then(function (configData) {
      if (configData) {
        var attributes = decodePayload(configData);
        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }
      return config;
    });
  },

  get: function get() {
    var RESTController = _CoreManager2['default'].getRESTController();

    return RESTController.request('GET', 'config', {}, {}).then(function (response) {
      if (!response || !response.params) {
        var error = new _ParseError2['default'](_ParseError2['default'].INVALID_JSON, 'Config JSON response invalid.');
        return _ParsePromise2['default'].error(error);
      }

      var config = new ParseConfig();
      config.attributes = {};
      for (var attr in response.params) {
        config.attributes[attr] = (0, _decode2['default'])(response.params[attr]);
      }
      currentConfig = config;
      return _Storage2['default'].setItemAsync(_Storage2['default'].generatePath(CURRENT_CONFIG_KEY), JSON.stringify(response.params)).then(function () {
        return config;
      });
    });
  }
});
module.exports = exports['default'];
},{"./CoreManager":5,"./ParseError":12,"./ParsePromise":18,"./Storage":26,"./decode":31,"./encode":32,"./escape":34,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/interop-require-default":49}],12:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Constructs a new Parse.Error object with the given code and message.
 * @class Parse.Error
 * @constructor
 * @param {Number} code An error code constant from <code>Parse.Error</code>.
 * @param {String} message A detailed description of the error.
 */
"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var ParseError = function ParseError(code, message) {
  _classCallCheck(this, ParseError);

  this.code = code;
  this.message = message;
}

/**
 * Error code indicating some error other than those enumerated here.
 * @property OTHER_CAUSE
 * @static
 * @final
 */
;

exports["default"] = ParseError;
ParseError.OTHER_CAUSE = -1;

/**
 * Error code indicating that something has gone wrong with the server.
 * If you get this error code, it is Parse's fault. Contact us at
 * https://parse.com/help
 * @property INTERNAL_SERVER_ERROR
 * @static
 * @final
 */
ParseError.INTERNAL_SERVER_ERROR = 1;

/**
 * Error code indicating the connection to the Parse servers failed.
 * @property CONNECTION_FAILED
 * @static
 * @final
 */
ParseError.CONNECTION_FAILED = 100;

/**
 * Error code indicating the specified object doesn't exist.
 * @property OBJECT_NOT_FOUND
 * @static
 * @final
 */
ParseError.OBJECT_NOT_FOUND = 101;

/**
 * Error code indicating you tried to query with a datatype that doesn't
 * support it, like exact matching an array or object.
 * @property INVALID_QUERY
 * @static
 * @final
 */
ParseError.INVALID_QUERY = 102;

/**
 * Error code indicating a missing or invalid classname. Classnames are
 * case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the
 * only valid characters.
 * @property INVALID_CLASS_NAME
 * @static
 * @final
 */
ParseError.INVALID_CLASS_NAME = 103;

/**
 * Error code indicating an unspecified object id.
 * @property MISSING_OBJECT_ID
 * @static
 * @final
 */
ParseError.MISSING_OBJECT_ID = 104;

/**
 * Error code indicating an invalid key name. Keys are case-sensitive. They
 * must start with a letter, and a-zA-Z0-9_ are the only valid characters.
 * @property INVALID_KEY_NAME
 * @static
 * @final
 */
ParseError.INVALID_KEY_NAME = 105;

/**
 * Error code indicating a malformed pointer. You should not see this unless
 * you have been mucking about changing internal Parse code.
 * @property INVALID_POINTER
 * @static
 * @final
 */
ParseError.INVALID_POINTER = 106;

/**
 * Error code indicating that badly formed JSON was received upstream. This
 * either indicates you have done something unusual with modifying how
 * things encode to JSON, or the network is failing badly.
 * @property INVALID_JSON
 * @static
 * @final
 */
ParseError.INVALID_JSON = 107;

/**
 * Error code indicating that the feature you tried to access is only
 * available internally for testing purposes.
 * @property COMMAND_UNAVAILABLE
 * @static
 * @final
 */
ParseError.COMMAND_UNAVAILABLE = 108;

/**
 * You must call Parse.initialize before using the Parse library.
 * @property NOT_INITIALIZED
 * @static
 * @final
 */
ParseError.NOT_INITIALIZED = 109;

/**
 * Error code indicating that a field was set to an inconsistent type.
 * @property INCORRECT_TYPE
 * @static
 * @final
 */
ParseError.INCORRECT_TYPE = 111;

/**
 * Error code indicating an invalid channel name. A channel name is either
 * an empty string (the broadcast channel) or contains only a-zA-Z0-9_
 * characters and starts with a letter.
 * @property INVALID_CHANNEL_NAME
 * @static
 * @final
 */
ParseError.INVALID_CHANNEL_NAME = 112;

/**
 * Error code indicating that push is misconfigured.
 * @property PUSH_MISCONFIGURED
 * @static
 * @final
 */
ParseError.PUSH_MISCONFIGURED = 115;

/**
 * Error code indicating that the object is too large.
 * @property OBJECT_TOO_LARGE
 * @static
 * @final
 */
ParseError.OBJECT_TOO_LARGE = 116;

/**
 * Error code indicating that the operation isn't allowed for clients.
 * @property OPERATION_FORBIDDEN
 * @static
 * @final
 */
ParseError.OPERATION_FORBIDDEN = 119;

/**
 * Error code indicating the result was not found in the cache.
 * @property CACHE_MISS
 * @static
 * @final
 */
ParseError.CACHE_MISS = 120;

/**
 * Error code indicating that an invalid key was used in a nested
 * JSONObject.
 * @property INVALID_NESTED_KEY
 * @static
 * @final
 */
ParseError.INVALID_NESTED_KEY = 121;

/**
 * Error code indicating that an invalid filename was used for ParseFile.
 * A valid file name contains only a-zA-Z0-9_. characters and is between 1
 * and 128 characters.
 * @property INVALID_FILE_NAME
 * @static
 * @final
 */
ParseError.INVALID_FILE_NAME = 122;

/**
 * Error code indicating an invalid ACL was provided.
 * @property INVALID_ACL
 * @static
 * @final
 */
ParseError.INVALID_ACL = 123;

/**
 * Error code indicating that the request timed out on the server. Typically
 * this indicates that the request is too expensive to run.
 * @property TIMEOUT
 * @static
 * @final
 */
ParseError.TIMEOUT = 124;

/**
 * Error code indicating that the email address was invalid.
 * @property INVALID_EMAIL_ADDRESS
 * @static
 * @final
 */
ParseError.INVALID_EMAIL_ADDRESS = 125;

/**
 * Error code indicating a missing content type.
 * @property MISSING_CONTENT_TYPE
 * @static
 * @final
 */
ParseError.MISSING_CONTENT_TYPE = 126;

/**
 * Error code indicating a missing content length.
 * @property MISSING_CONTENT_LENGTH
 * @static
 * @final
 */
ParseError.MISSING_CONTENT_LENGTH = 127;

/**
 * Error code indicating an invalid content length.
 * @property INVALID_CONTENT_LENGTH
 * @static
 * @final
 */
ParseError.INVALID_CONTENT_LENGTH = 128;

/**
 * Error code indicating a file that was too large.
 * @property FILE_TOO_LARGE
 * @static
 * @final
 */
ParseError.FILE_TOO_LARGE = 129;

/**
 * Error code indicating an error saving a file.
 * @property FILE_SAVE_ERROR
 * @static
 * @final
 */
ParseError.FILE_SAVE_ERROR = 130;

/**
 * Error code indicating that a unique field was given a value that is
 * already taken.
 * @property DUPLICATE_VALUE
 * @static
 * @final
 */
ParseError.DUPLICATE_VALUE = 137;

/**
 * Error code indicating that a role's name is invalid.
 * @property INVALID_ROLE_NAME
 * @static
 * @final
 */
ParseError.INVALID_ROLE_NAME = 139;

/**
 * Error code indicating that an application quota was exceeded.  Upgrade to
 * resolve.
 * @property EXCEEDED_QUOTA
 * @static
 * @final
 */
ParseError.EXCEEDED_QUOTA = 140;

/**
 * Error code indicating that a Cloud Code script failed.
 * @property SCRIPT_FAILED
 * @static
 * @final
 */
ParseError.SCRIPT_FAILED = 141;

/**
 * Error code indicating that a Cloud Code validation failed.
 * @property VALIDATION_ERROR
 * @static
 * @final
 */
ParseError.VALIDATION_ERROR = 142;

/**
 * Error code indicating that invalid image data was provided.
 * @property INVALID_IMAGE_DATA
 * @static
 * @final
 */
ParseError.INVALID_IMAGE_DATA = 143;

/**
 * Error code indicating an unsaved file.
 * @property UNSAVED_FILE_ERROR
 * @static
 * @final
 */
ParseError.UNSAVED_FILE_ERROR = 151;

/**
 * Error code indicating an invalid push time.
 * @property INVALID_PUSH_TIME_ERROR
 * @static
 * @final
 */
ParseError.INVALID_PUSH_TIME_ERROR = 152;

/**
 * Error code indicating an error deleting a file.
 * @property FILE_DELETE_ERROR
 * @static
 * @final
 */
ParseError.FILE_DELETE_ERROR = 153;

/**
 * Error code indicating that the application has exceeded its request
 * limit.
 * @property REQUEST_LIMIT_EXCEEDED
 * @static
 * @final
 */
ParseError.REQUEST_LIMIT_EXCEEDED = 155;

/**
 * Error code indicating an invalid event name.
 * @property INVALID_EVENT_NAME
 * @static
 * @final
 */
ParseError.INVALID_EVENT_NAME = 160;

/**
 * Error code indicating that the username is missing or empty.
 * @property USERNAME_MISSING
 * @static
 * @final
 */
ParseError.USERNAME_MISSING = 200;

/**
 * Error code indicating that the password is missing or empty.
 * @property PASSWORD_MISSING
 * @static
 * @final
 */
ParseError.PASSWORD_MISSING = 201;

/**
 * Error code indicating that the username has already been taken.
 * @property USERNAME_TAKEN
 * @static
 * @final
 */
ParseError.USERNAME_TAKEN = 202;

/**
 * Error code indicating that the email has already been taken.
 * @property EMAIL_TAKEN
 * @static
 * @final
 */
ParseError.EMAIL_TAKEN = 203;

/**
 * Error code indicating that the email is missing, but must be specified.
 * @property EMAIL_MISSING
 * @static
 * @final
 */
ParseError.EMAIL_MISSING = 204;

/**
 * Error code indicating that a user with the specified email was not found.
 * @property EMAIL_NOT_FOUND
 * @static
 * @final
 */
ParseError.EMAIL_NOT_FOUND = 205;

/**
 * Error code indicating that a user object without a valid session could
 * not be altered.
 * @property SESSION_MISSING
 * @static
 * @final
 */
ParseError.SESSION_MISSING = 206;

/**
 * Error code indicating that a user can only be created through signup.
 * @property MUST_CREATE_USER_THROUGH_SIGNUP
 * @static
 * @final
 */
ParseError.MUST_CREATE_USER_THROUGH_SIGNUP = 207;

/**
 * Error code indicating that an an account being linked is already linked
 * to another user.
 * @property ACCOUNT_ALREADY_LINKED
 * @static
 * @final
 */
ParseError.ACCOUNT_ALREADY_LINKED = 208;

/**
 * Error code indicating that the current session token is invalid.
 * @property INVALID_SESSION_TOKEN
 * @static
 * @final
 */
ParseError.INVALID_SESSION_TOKEN = 209;

/**
 * Error code indicating that a user cannot be linked to an account because
 * that account's id could not be found.
 * @property LINKED_ID_MISSING
 * @static
 * @final
 */
ParseError.LINKED_ID_MISSING = 250;

/**
 * Error code indicating that a user with a linked (e.g. Facebook) account
 * has an invalid session.
 * @property INVALID_LINKED_SESSION
 * @static
 * @final
 */
ParseError.INVALID_LINKED_SESSION = 251;

/**
 * Error code indicating that a service being linked (e.g. Facebook or
 * Twitter) is unsupported.
 * @property UNSUPPORTED_SERVICE
 * @static
 * @final
 */
ParseError.UNSUPPORTED_SERVICE = 252;

/**
 * Error code indicating that there were multiple errors. Aggregate errors
 * have an "errors" property, which is an array of error objects with more
 * detail about each error that occurred.
 * @property AGGREGATE_ERROR
 * @static
 * @final
 */
ParseError.AGGREGATE_ERROR = 600;

/**
 * Error code indicating the client was unable to read an input file.
 * @property FILE_READ_ERROR
 * @static
 * @final
 */
ParseError.FILE_READ_ERROR = 601;

/**
 * Error code indicating a real error code is unavailable because
 * we had to use an XDomainRequest object to allow CORS requests in
 * Internet Explorer, which strips the body from HTTP responses that have
 * a non-2XX status code.
 * @property X_DOMAIN_REQUEST
 * @static
 * @final
 */
ParseError.X_DOMAIN_REQUEST = 602;
module.exports = exports["default"];
},{"babel-runtime/helpers/class-call-check":45}],13:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

function b64Digit(number) {
  if (number < 26) {
    return String.fromCharCode(65 + number);
  }
  if (number < 52) {
    return String.fromCharCode(97 + (number - 26));
  }
  if (number < 62) {
    return String.fromCharCode(48 + (number - 52));
  }
  if (number === 62) {
    return '+';
  }
  if (number === 63) {
    return '/';
  }
  throw new TypeError('Tried to encode large digit ' + number + ' in base64.');
}

/**
 * A Parse.File is a local representation of a file that is saved to the Parse
 * cloud.
 * @class Parse.File
 * @constructor
 * @param name {String} The file's name. This will be prefixed by a unique
 *     value once the file has finished saving. The file name must begin with
 *     an alphanumeric character, and consist of alphanumeric characters,
 *     periods, spaces, underscores, or dashes.
 * @param data {Array} The data for the file, as either:
 *     1. an Array of byte value Numbers, or
 *     2. an Object like { base64: "..." } with a base64-encoded String.
 *     3. a File object selected with a file upload control. (3) only works
 *        in Firefox 3.6+, Safari 6.0.2+, Chrome 7+, and IE 10+.
 *        For example:<pre>
 * var fileUploadControl = $("#profilePhotoFileUpload")[0];
 * if (fileUploadControl.files.length > 0) {
 *   var file = fileUploadControl.files[0];
 *   var name = "photo.jpg";
 *   var parseFile = new Parse.File(name, file);
 *   parseFile.save().then(function() {
 *     // The file has been saved to Parse.
 *   }, function(error) {
 *     // The file either could not be read, or could not be saved to Parse.
 *   });
 * }</pre>
 * @param type {String} Optional Content-Type header to use for the file. If
 *     this is omitted, the content type will be inferred from the name's
 *     extension.
 */

var ParseFile = (function () {
  function ParseFile(name, data, type) {
    _classCallCheck(this, ParseFile);

    var specifiedType = type || '';

    this._name = name;

    if (Array.isArray(data)) {
      this._source = {
        format: 'base64',
        base64: ParseFile.encodeBase64(data),
        type: specifiedType
      };
    } else if (typeof File !== 'undefined' && data instanceof File) {
      this._source = {
        format: 'file',
        file: data,
        type: specifiedType
      };
    } else if (data && data.hasOwnProperty('base64')) {
      var matches = /^data:([a-zA-Z]*\/[a-zA-Z+.-]*);(charset=[a-zA-Z0-9\-\/\s]*,)?base64,(\S+)/.exec(data.base64);
      if (matches && matches.length > 0) {
        // if data URI with type and charset, there will be 4 matches.
        this._source = {
          format: 'base64',
          base64: matches.length === 4 ? matches[3] : matches[2],
          type: matches[1]
        };
      } else {
        this._source = {
          format: 'base64',
          base64: data.base64,
          type: specifiedType
        };
      }
    } else if (typeof data !== 'undefined') {
      throw new TypeError('Cannot create a Parse.File with that data.');
    }
  }

  /**
   * Gets the name of the file. Before save is called, this is the filename
   * given by the user. After save is called, that name gets prefixed with a
   * unique identifier.
   * @method name
   * @return {String}
   */

  _createClass(ParseFile, [{
    key: 'name',
    value: function name() {
      return this._name;
    }

    /**
     * Gets the url of the file. It is only available after you save the file or
     * after you get the file from a Parse.Object.
     * @method url
     * @return {String}
     */
  }, {
    key: 'url',
    value: function url() {
      return this._url;
    }

    /**
     * Saves the file to the Parse cloud.
     * @method save
     * @param {Object} options A Backbone-style options object.
     * @return {Parse.Promise} Promise that is resolved when the save finishes.
     */
  }, {
    key: 'save',
    value: function save(options) {
      var _this = this;

      options = options || {};
      var controller = _CoreManager2['default'].getFileController();
      if (!this._previousSave) {
        if (this._source.format === 'file') {
          this._previousSave = controller.saveFile(this._name, this._source).then(function (res) {
            _this._name = res.name;
            _this._url = res.url;
            return _this;
          });
        } else {
          this._previousSave = controller.saveBase64(this._name, this._source).then(function (res) {
            _this._name = res.name;
            _this._url = res.url;
            return _this;
          });
        }
      }
      if (this._previousSave) {
        return this._previousSave._thenRunCallbacks(options);
      }
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        __type: 'File',
        name: this._name,
        url: this._url
      };
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      if (this === other) {
        return true;
      }
      // Unsaved Files are never equal, since they will be saved to different URLs
      return other instanceof ParseFile && this.name() === other.name() && this.url() === other.url() && typeof this.url() !== 'undefined';
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(obj) {
      if (obj.__type !== 'File') {
        throw new TypeError('JSON object does not represent a ParseFile');
      }
      var file = new ParseFile(obj.name);
      file._url = obj.url;
      return file;
    }
  }, {
    key: 'encodeBase64',
    value: function encodeBase64(bytes) {
      var chunks = [];
      chunks.length = Math.ceil(bytes.length / 3);
      for (var i = 0; i < chunks.length; i++) {
        var b1 = bytes[i * 3];
        var b2 = bytes[i * 3 + 1] || 0;
        var b3 = bytes[i * 3 + 2] || 0;

        var has2 = i * 3 + 1 < bytes.length;
        var has3 = i * 3 + 2 < bytes.length;

        chunks[i] = [b64Digit(b1 >> 2 & 0x3F), b64Digit(b1 << 4 & 0x30 | b2 >> 4 & 0x0F), has2 ? b64Digit(b2 << 2 & 0x3C | b3 >> 6 & 0x03) : '=', has3 ? b64Digit(b3 & 0x3F) : '='].join('');
      }

      return chunks.join('');
    }
  }]);

  return ParseFile;
})();

exports['default'] = ParseFile;

_CoreManager2['default'].setFileController({
  saveFile: function saveFile(name, source) {
    if (source.format !== 'file') {
      throw new Error('saveFile can only be used with File-type sources.');
    }
    // To directly upload a File, we use a REST-style AJAX request
    var headers = {
      'X-Parse-Application-ID': _CoreManager2['default'].get('APPLICATION_ID'),
      'X-Parse-JavaScript-Key': _CoreManager2['default'].get('JAVASCRIPT_KEY')
    };
    var url = _CoreManager2['default'].get('SERVER_URL');
    url += '/1/files/' + name;
    return _CoreManager2['default'].getRESTController().ajax('POST', url, source.file, headers);
  },

  saveBase64: function saveBase64(name, source) {
    if (source.format !== 'base64') {
      throw new Error('saveBase64 can only be used with Base64-type sources.');
    }
    var data = {
      base64: source.base64
    };
    if (source.type) {
      data._ContentType = source.type;
    }

    return _CoreManager2['default'].getRESTController().request('POST', 'files/' + name, data);
  }
});
module.exports = exports['default'];
},{"./CoreManager":5,"./ParsePromise":18,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/interop-require-default":49}],14:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

/**
 * Creates a new GeoPoint with any of the following forms:<br>
 *   <pre>
 *   new GeoPoint(otherGeoPoint)
 *   new GeoPoint(30, 30)
 *   new GeoPoint([30, 30])
 *   new GeoPoint({latitude: 30, longitude: 30})
 *   new GeoPoint()  // defaults to (0, 0)
 *   </pre>
 * @class Parse.GeoPoint
 * @constructor
 *
 * <p>Represents a latitude / longitude point that may be associated
 * with a key in a ParseObject or used as a reference point for geo queries.
 * This allows proximity-based queries on the key.</p>
 *
 * <p>Only one key in a class may contain a GeoPoint.</p>
 *
 * <p>Example:<pre>
 *   var point = new Parse.GeoPoint(30.0, -20.0);
 *   var object = new Parse.Object("PlaceObject");
 *   object.set("location", point);
 *   object.save();</pre></p>
 */

var ParseGeoPoint = (function () {
  function ParseGeoPoint(arg1, arg2) {
    _classCallCheck(this, ParseGeoPoint);

    if (Array.isArray(arg1)) {
      ParseGeoPoint._validate(arg1[0], arg1[1]);
      this._latitude = arg1[0];
      this._longitude = arg1[1];
    } else if (typeof arg1 === 'object') {
      ParseGeoPoint._validate(arg1.latitude, arg1.longitude);
      this._latitude = arg1.latitude;
      this._longitude = arg1.longitude;
    } else if (typeof arg1 === 'number' && typeof arg2 === 'number') {
      ParseGeoPoint._validate(arg1, arg2);
      this._latitude = arg1;
      this._longitude = arg2;
    } else {
      this._latitude = 0;
      this._longitude = 0;
    }
  }

  /**
   * North-south portion of the coordinate, in range [-90, 90].
   * Throws an exception if set out of range in a modern browser.
   * @property latitude
   * @type Number
   */

  _createClass(ParseGeoPoint, [{
    key: 'toJSON',

    /**
     * Returns a JSON representation of the GeoPoint, suitable for Parse.
     * @method toJSON
     * @return {Object}
     */
    value: function toJSON() {
      ParseGeoPoint._validate(this._latitude, this._longitude);
      return {
        __type: 'GeoPoint',
        latitude: this._latitude,
        longitude: this._longitude
      };
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return other instanceof ParseGeoPoint && this.latitude === other.latitude && this.longitude === other.longitude;
    }

    /**
     * Returns the distance from this GeoPoint to another in radians.
     * @method radiansTo
     * @param {Parse.GeoPoint} point the other Parse.GeoPoint.
     * @return {Number}
     */
  }, {
    key: 'radiansTo',
    value: function radiansTo(point) {
      var d2r = Math.PI / 180.0;
      var lat1rad = this.latitude * d2r;
      var long1rad = this.longitude * d2r;
      var lat2rad = point.latitude * d2r;
      var long2rad = point.longitude * d2r;

      var sinDeltaLatDiv2 = Math.sin((lat1rad - lat2rad) / 2);
      var sinDeltaLongDiv2 = Math.sin((long1rad - long2rad) / 2);
      // Square of half the straight line chord distance between both points.
      var a = sinDeltaLatDiv2 * sinDeltaLatDiv2 + Math.cos(lat1rad) * Math.cos(lat2rad) * sinDeltaLongDiv2 * sinDeltaLongDiv2;
      a = Math.min(1.0, a);
      return 2 * Math.asin(Math.sqrt(a));
    }

    /**
     * Returns the distance from this GeoPoint to another in kilometers.
     * @method kilometersTo
     * @param {Parse.GeoPoint} point the other Parse.GeoPoint.
     * @return {Number}
     */
  }, {
    key: 'kilometersTo',
    value: function kilometersTo(point) {
      return this.radiansTo(point) * 6371.0;
    }

    /**
     * Returns the distance from this GeoPoint to another in miles.
     * @method milesTo
     * @param {Parse.GeoPoint} point the other Parse.GeoPoint.
     * @return {Number}
     */
  }, {
    key: 'milesTo',
    value: function milesTo(point) {
      return this.radiansTo(point) * 3958.8;
    }

    /**
     * Throws an exception if the given lat-long is out of bounds.
     */
  }, {
    key: 'latitude',
    get: function get() {
      return this._latitude;
    },
    set: function set(val) {
      ParseGeoPoint._validate(val, this.longitude);
      this._latitude = val;
    }

    /**
     * East-west portion of the coordinate, in range [-180, 180].
     * Throws if set out of range in a modern browser.
     * @property longitude
     * @type Number
     */
  }, {
    key: 'longitude',
    get: function get() {
      return this._longitude;
    },
    set: function set(val) {
      ParseGeoPoint._validate(this.latitude, val);
      this._longitude = val;
    }
  }], [{
    key: '_validate',
    value: function _validate(latitude, longitude) {
      if (latitude !== latitude || longitude !== longitude) {
        throw new TypeError('GeoPoint latitude and longitude must be valid numbers');
      }
      if (latitude < -90.0) {
        throw new TypeError('GeoPoint latitude out of bounds: ' + latitude + ' < -90.0.');
      }
      if (latitude > 90.0) {
        throw new TypeError('GeoPoint latitude out of bounds: ' + latitude + ' > 90.0.');
      }
      if (longitude < -180.0) {
        throw new TypeError('GeoPoint longitude out of bounds: ' + longitude + ' < -180.0.');
      }
      if (longitude > 180.0) {
        throw new TypeError('GeoPoint longitude out of bounds: ' + longitude + ' > 180.0.');
      }
    }

    /**
     * Creates a GeoPoint with the user's current location, if available.
     * Calls options.success with a new GeoPoint instance or calls options.error.
     * @method current
     * @param {Object} options An object with success and error callbacks.
     * @static
     */
  }, {
    key: 'current',
    value: function current(options) {
      var promise = new _ParsePromise2['default']();
      navigator.geolocation.getCurrentPosition(function (location) {
        promise.resolve(new ParseGeoPoint(location.coords.latitude, location.coords.longitude));
      }, function (error) {
        promise.reject(error);
      });

      return promise._thenRunCallbacks(options);
    }
  }]);

  return ParseGeoPoint;
})();

exports['default'] = ParseGeoPoint;
module.exports = exports['default'];
},{"./ParsePromise":18,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/interop-require-default":49}],15:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = _interopRequireDefault(_ParseObject2);

var Installation = (function (_ParseObject) {
  _inherits(Installation, _ParseObject);

  function Installation(attributes) {
    _classCallCheck(this, Installation);

    _get(Object.getPrototypeOf(Installation.prototype), 'constructor', this).call(this, '_Installation');
    if (attributes && typeof attributes === 'object') {
      if (!this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Session');
      }
    }
  }

  return Installation;
})(_ParseObject3['default']);

exports['default'] = Installation;

_ParseObject3['default'].registerSubclass('_Installation', Installation);
module.exports = exports['default'];
},{"./ParseObject":16,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/get":47,"babel-runtime/helpers/inherits":48,"babel-runtime/helpers/interop-require-default":49}],16:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

var _Object$create = require('babel-runtime/core-js/object/create')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _canBeSerialized = require('./canBeSerialized');

var _canBeSerialized2 = _interopRequireDefault(_canBeSerialized);

var _decode = require('./decode');

var _decode2 = _interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _equals = require('./equals');

var _equals2 = _interopRequireDefault(_equals);

var _escape2 = require('./escape');

var _escape3 = _interopRequireDefault(_escape2);

var _ObjectState = require('./ObjectState');

var ObjectState = _interopRequireWildcard(_ObjectState);

var _ParseACL = require('./ParseACL');

var _ParseACL2 = _interopRequireDefault(_ParseACL);

var _parseDate = require('./parseDate');

var _parseDate2 = _interopRequireDefault(_parseDate);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = _interopRequireDefault(_ParseFile);

var _ParseOp = require('./ParseOp');

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _ParseQuery = require('./ParseQuery');

var _ParseQuery2 = _interopRequireDefault(_ParseQuery);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = _interopRequireDefault(_ParseRelation);

var _unique = require('./unique');

var _unique2 = _interopRequireDefault(_unique);

var _unsavedChildren = require('./unsavedChildren');

var _unsavedChildren2 = _interopRequireDefault(_unsavedChildren);

// Mapping of class names to constructors, so we can populate objects from the
// server with appropriate subclasses of ParseObject
var classMap = {};

// Global counter for generating unique local Ids
var localCount = 0;
// Global counter for generating unique Ids for non-single-instance objects
var objectCount = 0;
// On web clients, objects are single-instance: any two objects with the same Id
// will have the same attributes. However, this may be dangerous default
// behavior in a server scenario
var singleInstance = !_CoreManager2['default'].get('IS_NODE');

/**
 * Creates a new model with defined attributes.
 *
 * <p>You won't normally call this method directly.  It is recommended that
 * you use a subclass of <code>Parse.Object</code> instead, created by calling
 * <code>extend</code>.</p>
 *
 * <p>However, if you don't want to use a subclass, or aren't sure which
 * subclass is appropriate, you can use this form:<pre>
 *     var object = new Parse.Object("ClassName");
 * </pre>
 * That is basically equivalent to:<pre>
 *     var MyClass = Parse.Object.extend("ClassName");
 *     var object = new MyClass();
 * </pre></p>
 *
 * @class Parse.Object
 * @constructor
 * @param {String} className The class name for the object
 * @param {Object} attributes The initial set of data to store in the object.
 * @param {Object} options The options for this object instance.
 */

var ParseObject = (function () {
  function ParseObject(className, attributes, options) {
    _classCallCheck(this, ParseObject);

    var toSet = null;
    this._objCount = objectCount++;
    if (typeof className === 'string') {
      this.className = className;
      if (attributes && typeof attributes === 'object') {
        toSet = attributes;
      }
    } else if (className && typeof className === 'object') {
      this.className = className.className;
      toSet = {};
      for (var attr in className) {
        if (attr !== 'className') {
          toSet[attr] = className[attr];
        }
      }
      if (attributes && typeof attributes === 'object') {
        options = attributes;
      }
    }
    if (toSet && !this.set(toSet, options)) {
      throw new Error('Can\'t create an invalid Parse Object');
    }
    // Enable legacy initializers
    if (typeof this.initialize === 'function') {
      this.initialize.apply(this, arguments);
    }
  }

  /** Prototype getters / setters **/

  _createClass(ParseObject, [{
    key: '_getId',

    /** Private methods **/

    /**
     * Returns a local or server Id used uniquely identify this object
     */
    value: function _getId() {
      if (typeof this.id === 'string') {
        return this.id;
      }
      if (typeof this._localId === 'string') {
        return this._localId;
      }
      var localId = 'local' + String(localCount++);
      this._localId = localId;
      return localId;
    }

    /**
     * Returns a local or server Id used to pull data from the Object State store
     * If single instance objects are disabled, it will use the object's unique
     * count to separate its data from other objects with the same server Id.
     */
  }, {
    key: '_getStateIdentifier',
    value: function _getStateIdentifier() {
      if (typeof this.id === 'string') {
        if (singleInstance) {
          return this.id;
        }
        return this.id + '_' + String(this._objCount);
      }
      return this._getId();
    }
  }, {
    key: '_getServerData',
    value: function _getServerData() {
      return ObjectState.getServerData(this.className, this._getStateIdentifier());
    }
  }, {
    key: '_clearServerData',
    value: function _clearServerData() {
      var serverData = this._getServerData();
      var unset = {};
      for (var attr in serverData) {
        unset[attr] = undefined;
      }
      ObjectState.setServerData(this.className, this._getStateIdentifier(), unset);
    }
  }, {
    key: '_getPendingOps',
    value: function _getPendingOps() {
      return ObjectState.getPendingOps(this.className, this._getStateIdentifier());
    }
  }, {
    key: '_clearPendingOps',
    value: function _clearPendingOps() {
      var pending = this._getPendingOps();
      var latest = pending[pending.length - 1];
      var keys = _Object$keys(latest);
      keys.forEach(function (key) {
        delete latest[key];
      });
    }
  }, {
    key: '_getDirtyObjectAttributes',
    value: function _getDirtyObjectAttributes() {
      var attributes = this.attributes;
      var objectCache = ObjectState.getObjectCache(this.className, this._getStateIdentifier());
      var dirty = {};
      for (var attr in attributes) {
        var val = attributes[attr];
        if (val && typeof val === 'object' && !(val instanceof ParseObject) && !(val instanceof _ParseFile2['default']) && !(val instanceof _ParseRelation2['default'])) {
          // Due to the way browsers construct maps, the key order will not change
          // unless the object is changed
          var json = (0, _encode2['default'])(val, false, true);
          var stringified = JSON.stringify(json);
          if (objectCache[attr] !== stringified) {
            dirty[attr] = val;
          }
        }
      }
      return dirty;
    }
  }, {
    key: '_toFullJSON',
    value: function _toFullJSON(seen) {
      var json = this.toJSON(seen);
      json.__type = 'Object';
      json.className = this.className;
      return json;
    }
  }, {
    key: '_getSaveJSON',
    value: function _getSaveJSON() {
      var pending = this._getPendingOps();
      var dirtyObjects = this._getDirtyObjectAttributes();
      var json = {};
      var attr;
      for (attr in dirtyObjects) {
        json[attr] = new _ParseOp.SetOp(dirtyObjects[attr]).toJSON();
      }
      for (attr in pending[0]) {
        json[attr] = pending[0][attr].toJSON();
      }
      return json;
    }
  }, {
    key: '_getSaveParams',
    value: function _getSaveParams() {
      var method = this.id ? 'PUT' : 'POST';
      var body = this._getSaveJSON();
      var path = 'classes/' + this.className;
      if (this.id) {
        path += '/' + this.id;
      } else if (this.className === '_User') {
        path = 'users';
      }
      return {
        method: method,
        body: body,
        path: path
      };
    }
  }, {
    key: '_finishFetch',
    value: function _finishFetch(serverData) {
      if (!this.id && serverData.objectId) {
        this.id = serverData.objectId;
      }
      ObjectState.initializeState(this.className, this._getStateIdentifier());
      var decoded = {};
      for (var attr in serverData) {
        if (attr === 'ACL') {
          decoded[attr] = new _ParseACL2['default'](serverData[attr]);
        } else if (attr !== 'objectId') {
          decoded[attr] = (0, _decode2['default'])(serverData[attr]);
          if (decoded[attr] instanceof _ParseRelation2['default']) {
            decoded[attr]._ensureParentAndKey(this, attr);
          }
        }
      }
      if (decoded.createdAt && typeof decoded.createdAt === 'string') {
        decoded.createdAt = (0, _parseDate2['default'])(decoded.createdAt);
      }
      if (decoded.updatedAt && typeof decoded.updatedAt === 'string') {
        decoded.updatedAt = (0, _parseDate2['default'])(decoded.updatedAt);
      }
      if (!decoded.updatedAt && decoded.createdAt) {
        decoded.updatedAt = decoded.createdAt;
      }
      ObjectState.commitServerChanges(this.className, this._getStateIdentifier(), decoded);
    }
  }, {
    key: '_setExisted',
    value: function _setExisted(existed) {
      var state = ObjectState.getState(this.className, this._getStateIdentifier());
      if (state) {
        state.existed = existed;
      }
    }
  }, {
    key: '_migrateId',
    value: function _migrateId(serverId) {
      if (this._localId && serverId) {
        var oldState = ObjectState.removeState(this.className, this._getStateIdentifier());
        this.id = serverId;
        delete this._localId;
        if (oldState) {
          ObjectState.initializeState(this.className, this._getStateIdentifier(), oldState);
        }
      }
    }
  }, {
    key: '_handleSaveResponse',
    value: function _handleSaveResponse(response, status) {
      var changes = {};
      var attr;
      var pending = ObjectState.popPendingState(this.className, this._getStateIdentifier());
      for (attr in pending) {
        if (pending[attr] instanceof _ParseOp.RelationOp) {
          changes[attr] = pending[attr].applyTo(undefined, this, attr);
        } else if (!(attr in response)) {
          // Only SetOps and UnsetOps should not come back with results
          changes[attr] = pending[attr].applyTo(undefined);
        }
      }
      for (attr in response) {
        if ((attr === 'createdAt' || attr === 'updatedAt') && typeof response[attr] === 'string') {
          changes[attr] = (0, _parseDate2['default'])(response[attr]);
        } else if (attr !== 'objectId') {
          changes[attr] = (0, _decode2['default'])(response[attr]);
        }
      }
      if (changes.createdAt && !changes.updatedAt) {
        changes.updatedAt = changes.createdAt;
      }

      this._migrateId(response.objectId);

      if (status !== 201) {
        this._setExisted(true);
      }

      ObjectState.commitServerChanges(this.className, this._getStateIdentifier(), changes);
    }
  }, {
    key: '_handleSaveError',
    value: function _handleSaveError() {
      var pending = this._getPendingOps();
      ObjectState.mergeFirstPendingState(this.className, this._getStateIdentifier());
    }

    /** Public methods **/

  }, {
    key: 'initialize',
    value: function initialize() {}
    // NOOP

    /**
     * Returns a JSON version of the object suitable for saving to Parse.
     * @method toJSON
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON(seen) {
      var seenEntry = this.id ? this.className + ':' + this.id : this;
      var seen = seen || [seenEntry];
      var json = {};
      var attrs = this.attributes;
      for (var attr in attrs) {
        if ((attr === 'createdAt' || attr === 'updatedAt') && attrs[attr].toJSON) {
          json[attr] = attrs[attr].toJSON();
        } else {
          json[attr] = (0, _encode2['default'])(attrs[attr], false, false, seen);
        }
      }
      var pending = this._getPendingOps();
      for (var attr in pending[0]) {
        json[attr] = pending[0][attr].toJSON();
      }

      if (this.id) {
        json.objectId = this.id;
      }
      return json;
    }

    /**
     * Determines whether this ParseObject is equal to another ParseObject
     * @method equals
     * @return {Boolean}
     */
  }, {
    key: 'equals',
    value: function equals(other) {
      if (this === other) {
        return true;
      }
      return other instanceof ParseObject && this.className === other.className && this.id === other.id && typeof this.id !== 'undefined';
    }

    /**
     * Returns true if this object has been modified since its last
     * save/refresh.  If an attribute is specified, it returns true only if that
     * particular attribute has been modified since the last save/refresh.
     * @method dirty
     * @param {String} attr An attribute name (optional).
     * @return {Boolean}
     */
  }, {
    key: 'dirty',
    value: function dirty(attr) {
      if (!this.id) {
        return true;
      }
      var pendingOps = this._getPendingOps();
      var dirtyObjects = this._getDirtyObjectAttributes();
      if (attr) {
        if (dirtyObjects.hasOwnProperty(attr)) {
          return true;
        }
        for (var i = 0; i < pendingOps.length; i++) {
          if (pendingOps[i].hasOwnProperty(attr)) {
            return true;
          }
        }
        return false;
      }
      if (_Object$keys(pendingOps[0]).length !== 0) {
        return true;
      }
      if (_Object$keys(dirtyObjects).length !== 0) {
        return true;
      }
      return false;
    }

    /**
     * Returns an array of keys that have been modified since last save/refresh
     * @method dirtyKeys
     * @return {Array of string}
     */
  }, {
    key: 'dirtyKeys',
    value: function dirtyKeys() {
      var pendingOps = this._getPendingOps();
      var keys = {};
      for (var i = 0; i < pendingOps.length; i++) {
        for (var attr in pendingOps[i]) {
          keys[attr] = true;
        }
      }
      var dirtyObjects = this._getDirtyObjectAttributes();
      for (var attr in dirtyObjects) {
        keys[attr] = true;
      }
      return _Object$keys(keys);
    }

    /**
     * Gets a Pointer referencing this Object.
     * @method toPointer
     * @return {Object}
     */
  }, {
    key: 'toPointer',
    value: function toPointer() {
      if (!this.id) {
        throw new Error('Cannot create a pointer to an unsaved ParseObject');
      }
      return {
        __type: 'Pointer',
        className: this.className,
        objectId: this.id
      };
    }

    /**
     * Gets the value of an attribute.
     * @method get
     * @param {String} attr The string name of an attribute.
     */
  }, {
    key: 'get',
    value: function get(attr) {
      return this.attributes[attr];
    }

    /**
     * Gets a relation on the given class for the attribute.
     * @method relation
     * @param String attr The attribute to get the relation for.
     */
  }, {
    key: 'relation',
    value: function relation(attr) {
      var value = this.get(attr);
      if (value) {
        if (!(value instanceof _ParseRelation2['default'])) {
          throw new Error('Called relation() on non-relation field ' + attr);
        }
        value._ensureParentAndKey(this, attr);
        return value;
      }
      return new _ParseRelation2['default'](this, attr);
    }

    /**
     * Gets the HTML-escaped value of an attribute.
     * @method escape
     * @param {String} attr The string name of an attribute.
     */
  }, {
    key: 'escape',
    value: function escape(attr) {
      var val = this.attributes[attr];
      if (val == null) {
        return '';
      }
      var str = val;
      if (typeof val !== 'string') {
        if (typeof val.toString !== 'function') {
          return '';
        }
        val = val.toString();
      }
      return (0, _escape3['default'])(val);
    }

    /**
     * Returns <code>true</code> if the attribute contains a value that is not
     * null or undefined.
     * @method has
     * @param {String} attr The string name of the attribute.
     * @return {Boolean}
     */
  }, {
    key: 'has',
    value: function has(attr) {
      var attributes = this.attributes;
      if (attributes.hasOwnProperty(attr)) {
        return attributes[attr] != null;
      }
      return false;
    }

    /**
     * Sets a hash of model attributes on the object.
     *
     * <p>You can call it with an object containing keys and values, or with one
     * key and value.  For example:<pre>
     *   gameTurn.set({
     *     player: player1,
     *     diceRoll: 2
     *   }, {
     *     error: function(gameTurnAgain, error) {
     *       // The set failed validation.
     *     }
     *   });
     *
     *   game.set("currentPlayer", player2, {
     *     error: function(gameTurnAgain, error) {
     *       // The set failed validation.
     *     }
     *   });
     *
     *   game.set("finished", true);</pre></p>
     *
     * @method set
     * @param {String} key The key to set.
     * @param {} value The value to give it.
     * @param {Object} options A set of options for the set.
     *     The only supported option is <code>error</code>.
     * @return {Boolean} true if the set succeeded.
     */
  }, {
    key: 'set',
    value: function set(key, value, options) {
      var changes = {};
      var newOps = {};
      if (key && typeof key === 'object') {
        changes = key;
        options = value;
      } else if (typeof key === 'string') {
        changes[key] = value;
      } else {
        return this;
      }

      options = options || {};
      var readonly = [];
      if (typeof this.constructor.readOnlyAttributes === 'function') {
        readonly = readonly.concat(this.constructor.readOnlyAttributes());
      }
      for (var k in changes) {
        if (k === 'createdAt' || k === 'updatedAt') {
          // This property is read-only, but for legacy reasons we silently
          // ignore it
          continue;
        }
        if (readonly.indexOf(k) > -1) {
          throw new Error('Cannot modify readonly attribute: ' + k);
        }
        if (options.unset) {
          newOps[k] = new _ParseOp.UnsetOp();
        } else if (changes[k] instanceof _ParseOp.Op) {
          newOps[k] = changes[k];
        } else if (changes[k] && typeof changes[k] === 'object' && typeof changes[k].__op === 'string') {
          newOps[k] = (0, _ParseOp.opFromJSON)(changes[k]);
        } else if (k === 'objectId' || k === 'id') {
          this.id = changes[k];
        } else if (k === 'ACL' && typeof changes[k] === 'object' && !(changes[k] instanceof _ParseACL2['default'])) {
          newOps[k] = new _ParseOp.SetOp(new _ParseACL2['default'](changes[k]));
        } else {
          newOps[k] = new _ParseOp.SetOp(changes[k]);
        }
      }

      // Calculate new values
      var currentAttributes = this.attributes;
      var newValues = {};
      for (var attr in newOps) {
        if (newOps[attr] instanceof _ParseOp.RelationOp) {
          newValues[attr] = newOps[attr].applyTo(currentAttributes[attr], this, attr);
        } else if (!(newOps[attr] instanceof _ParseOp.UnsetOp)) {
          newValues[attr] = newOps[attr].applyTo(currentAttributes[attr]);
        }
      }

      // Validate changes
      if (!options.ignoreValidation) {
        var validation = this.validate(newValues);
        if (validation) {
          if (typeof options.error === 'function') {
            options.error(this, validation);
          }
          return false;
        }
      }

      // Consolidate Ops
      var pendingOps = this._getPendingOps();
      var last = pendingOps.length - 1;
      for (var attr in newOps) {
        var nextOp = newOps[attr].mergeWith(pendingOps[last][attr]);
        ObjectState.setPendingOp(this.className, this._getStateIdentifier(), attr, nextOp);
      }

      return this;
    }

    /**
     * Remove an attribute from the model. This is a noop if the attribute doesn't
     * exist.
     * @method unset
     * @param {String} attr The string name of an attribute.
     */
  }, {
    key: 'unset',
    value: function unset(attr, options) {
      options = options || {};
      options.unset = true;
      return this.set(attr, null, options);
    }

    /**
     * Atomically increments the value of the given attribute the next time the
     * object is saved. If no amount is specified, 1 is used by default.
     *
     * @method increment
     * @param attr {String} The key.
     * @param amount {Number} The amount to increment by (optional).
     */
  }, {
    key: 'increment',
    value: function increment(attr, amount) {
      if (typeof amount === 'undefined') {
        amount = 1;
      }
      if (typeof amount !== 'number') {
        throw new Error('Cannot increment by a non-numeric amount.');
      }
      return this.set(attr, new _ParseOp.IncrementOp(amount));
    }

    /**
     * Atomically add an object to the end of the array associated with a given
     * key.
     * @method add
     * @param attr {String} The key.
     * @param item {} The item to add.
     */
  }, {
    key: 'add',
    value: function add(attr, item) {
      return this.set(attr, new _ParseOp.AddOp([item]));
    }

    /**
     * Atomically add an object to the array associated with a given key, only
     * if it is not already present in the array. The position of the insert is
     * not guaranteed.
     *
     * @method addUnique
     * @param attr {String} The key.
     * @param item {} The object to add.
     */
  }, {
    key: 'addUnique',
    value: function addUnique(attr, item) {
      return this.set(attr, new _ParseOp.AddUniqueOp([item]));
    }

    /**
     * Atomically remove all instances of an object from the array associated
     * with a given key.
     *
     * @method remove
     * @param attr {String} The key.
     * @param item {} The object to remove.
     */
  }, {
    key: 'remove',
    value: function remove(attr, item) {
      return this.set(attr, new _ParseOp.RemoveOp([item]));
    }

    /**
     * Returns an instance of a subclass of Parse.Op describing what kind of
     * modification has been performed on this field since the last time it was
     * saved. For example, after calling object.increment("x"), calling
     * object.op("x") would return an instance of Parse.Op.Increment.
     *
     * @method op
     * @param attr {String} The key.
     * @returns {Parse.Op} The operation, or undefined if none.
     */
  }, {
    key: 'op',
    value: function op(attr) {
      var pending = this._getPendingOps();
      for (var i = pending.length; i--;) {
        if (pending[i][attr]) {
          return pending[i][attr];
        }
      }
    }

    /**
     * Creates a new model with identical attributes to this one.
     * @method clone
     * @return {Parse.Object}
     */
  }, {
    key: 'clone',
    value: function clone() {
      var clone = new this.constructor();
      if (clone.set) {
        clone.set(this.attributes);
      }
      if (!clone.className) {
        clone.className = this.className;
      }
      return clone;
    }

    /**
     * Returns true if this object has never been saved to Parse.
     * @method isNew
     * @return {Boolean}
     */
  }, {
    key: 'isNew',
    value: function isNew() {
      return !this.id;
    }

    /**
     * Returns true if this object was created by the Parse server when the
     * object might have already been there (e.g. in the case of a Facebook
     * login)
     * @method existed
     * @return {Boolean}
     */
  }, {
    key: 'existed',
    value: function existed() {
      if (!this.id) {
        return false;
      }
      var state = ObjectState.getState(this.className, this._getStateIdentifier());
      if (state) {
        return state.existed;
      }
      return false;
    }

    /**
     * Checks if the model is currently in a valid state.
     * @method isValid
     * @return {Boolean}
     */
  }, {
    key: 'isValid',
    value: function isValid() {
      return !this.validate(this.attributes);
    }

    /**
     * You should not call this function directly unless you subclass
     * <code>Parse.Object</code>, in which case you can override this method
     * to provide additional validation on <code>set</code> and
     * <code>save</code>.  Your implementation should return
     *
     * @method validate
     * @param {Object} attrs The current data to validate.
     * @return {} False if the data is valid.  An error object otherwise.
     * @see Parse.Object#set
     */
  }, {
    key: 'validate',
    value: function validate(attrs) {
      if (attrs.hasOwnProperty('ACL') && !(attrs.ACL instanceof _ParseACL2['default'])) {
        return new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'ACL must be a Parse ACL.');
      }
      for (var key in attrs) {
        if (!/^[A-Za-z][0-9A-Za-z_]*$/.test(key)) {
          return new _ParseError2['default'](_ParseError2['default'].INVALID_KEY_NAME);
        }
      }
      return false;
    }

    /**
     * Returns the ACL for this object.
     * @method getACL
     * @returns {Parse.ACL} An instance of Parse.ACL.
     * @see Parse.Object#get
     */
  }, {
    key: 'getACL',
    value: function getACL() {
      var acl = this.get('ACL');
      if (acl instanceof _ParseACL2['default']) {
        return acl;
      }
      return null;
    }

    /**
     * Sets the ACL to be used for this object.
     * @method setACL
     * @param {Parse.ACL} acl An instance of Parse.ACL.
     * @param {Object} options Optional Backbone-like options object to be
     *     passed in to set.
     * @return {Boolean} Whether the set passed validation.
     * @see Parse.Object#set
     */
  }, {
    key: 'setACL',
    value: function setACL(acl, options) {
      return this.set('ACL', acl, options);
    }

    /**
     * Clears all attributes on a model
     * @method clear
     */
  }, {
    key: 'clear',
    value: function clear() {
      var attributes = this.attributes;
      var erasable = {};
      var readonly = ['createdAt', 'updatedAt'];
      if (typeof this.constructor.readOnlyAttributes === 'function') {
        readonly = readonly.concat(this.constructor.readOnlyAttributes());
      }
      for (var attr in attributes) {
        if (readonly.indexOf(attr) < 0) {
          erasable[attr] = true;
        }
      }
      return this.set(erasable, { unset: true });
    }

    /**
     * Fetch the model from the server. If the server's representation of the
     * model differs from its current attributes, they will be overriden.
     *
     * @method fetch
     * @param {Object} options A Backbone-style callback object.
     * Valid options are:<ul>
     *   <li>success: A Backbone-style success callback.
     *   <li>error: An Backbone-style error callback.
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @return {Parse.Promise} A promise that is fulfilled when the fetch
     *     completes.
     */
  }, {
    key: 'fetch',
    value: function fetch(options) {
      options = options || {};
      var fetchOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        fetchOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        fetchOptions.sessionToken = options.sessionToken;
      }
      var controller = _CoreManager2['default'].getObjectController();
      return controller.fetch(this, true, fetchOptions)._thenRunCallbacks(options);
    }

    /**
     * Set a hash of model attributes, and save the model to the server.
     * updatedAt will be updated when the request returns.
     * You can either call it as:<pre>
     *   object.save();</pre>
     * or<pre>
     *   object.save(null, options);</pre>
     * or<pre>
     *   object.save(attrs, options);</pre>
     * or<pre>
     *   object.save(key, value, options);</pre>
     *
     * For example, <pre>
     *   gameTurn.save({
     *     player: "Jake Cutter",
     *     diceRoll: 2
     *   }, {
     *     success: function(gameTurnAgain) {
     *       // The save was successful.
     *     },
     *     error: function(gameTurnAgain, error) {
     *       // The save failed.  Error is an instance of Parse.Error.
     *     }
     *   });</pre>
     * or with promises:<pre>
     *   gameTurn.save({
     *     player: "Jake Cutter",
     *     diceRoll: 2
     *   }).then(function(gameTurnAgain) {
     *     // The save was successful.
     *   }, function(error) {
     *     // The save failed.  Error is an instance of Parse.Error.
     *   });</pre>
     *
     * @method save
     * @param {Object} options A Backbone-style callback object.
     * Valid options are:<ul>
     *   <li>success: A Backbone-style success callback.
     *   <li>error: An Backbone-style error callback.
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @return {Parse.Promise} A promise that is fulfilled when the save
     *     completes.
     */
  }, {
    key: 'save',
    value: function save(arg1, arg2, arg3) {
      var _this = this;

      var attrs;
      var options;
      if (typeof arg1 === 'object' || typeof arg1 === 'undefined') {
        attrs = arg1;
        options = arg2;
      } else {
        attrs = {};
        attrs[arg1] = arg2;
        options = arg3;
      }

      // Support save({ success: function() {}, error: function() {} })
      if (!options && attrs) {
        options = {};
        if (typeof attrs.success === 'function') {
          options.success = attrs.success;
          delete attrs.success;
        }
        if (typeof attrs.error === 'function') {
          options.error = attrs.error;
          delete attrs.error;
        }
      }

      if (attrs) {
        var validation = this.validate(attrs);
        if (validation) {
          if (options && typeof options.error === 'function') {
            options.error(this, validation);
          }
          return _ParsePromise2['default'].error(validation);
        }
        this.set(attrs, options);
      }

      options = options || {};
      var saveOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        saveOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        saveOptions.sessionToken = options.sessionToken;
      }

      var controller = _CoreManager2['default'].getObjectController();
      var unsaved = (0, _unsavedChildren2['default'])(this);
      return controller.save(unsaved, saveOptions).then(function () {
        return controller.save(_this, saveOptions);
      })._thenRunCallbacks(options, this);
    }

    /**
     * Destroy this model on the server if it was already persisted.
     * If `wait: true` is passed, waits for the server to respond
     * before removal.
     *
     * @method destroy
     * @param {Object} options A Backbone-style callback object.
     * Valid options are:<ul>
     *   <li>success: A Backbone-style success callback
     *   <li>error: An Backbone-style error callback.
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @return {Parse.Promise} A promise that is fulfilled when the destroy
     *     completes.
     */
  }, {
    key: 'destroy',
    value: function destroy(options) {
      options = options || {};
      var destroyOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        destroyOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        destroyOptions.sessionToken = options.sessionToken;
      }
      if (!this.id) {
        return _ParsePromise2['default'].as()._thenRunCallbacks(options);
      }
      return _CoreManager2['default'].getObjectController().destroy(this, destroyOptions)._thenRunCallbacks(options);
    }

    /** Static methods **/

  }, {
    key: 'attributes',
    get: function get() {
      return _Object$freeze(ObjectState.estimateAttributes(this.className, this._getStateIdentifier()));
    }

    /**
     * The first time this object was saved on the server.
     * @property createdAt
     * @type Date
     */
  }, {
    key: 'createdAt',
    get: function get() {
      return this._getServerData().createdAt;
    }

    /**
     * The last time this object was updated on the server.
     * @property updatedAt
     * @type Date
     */
  }, {
    key: 'updatedAt',
    get: function get() {
      return this._getServerData().updatedAt;
    }
  }], [{
    key: '_clearAllState',
    value: function _clearAllState() {
      ObjectState._clearAllState();
    }

    /**
     * Fetches the given list of Parse.Object.
     * If any error is encountered, stops and calls the error handler.
     *
     * <pre>
     *   Parse.Object.fetchAll([object1, object2, ...], {
     *     success: function(list) {
     *       // All the objects were fetched.
     *     },
     *     error: function(error) {
     *       // An error occurred while fetching one of the objects.
     *     },
     *   });
     * </pre>
     *
     * @method fetchAll
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {Object} options A Backbone-style callback object.
     * @static
     * Valid options are:<ul>
     *   <li>success: A Backbone-style success callback.
     *   <li>error: An Backbone-style error callback.
     * </ul>
     */
  }, {
    key: 'fetchAll',
    value: function fetchAll(list, options) {
      var options = options || {};

      var queryOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        queryOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        queryOptions.sessionToken = options.sessionToken;
      }
      return _CoreManager2['default'].getObjectController().fetch(list, true, queryOptions)._thenRunCallbacks(options);
    }

    /**
     * Fetches the given list of Parse.Object if needed.
     * If any error is encountered, stops and calls the error handler.
     *
     * <pre>
     *   Parse.Object.fetchAllIfNeeded([object1, ...], {
     *     success: function(list) {
     *       // Objects were fetched and updated.
     *     },
     *     error: function(error) {
     *       // An error occurred while fetching one of the objects.
     *     },
     *   });
     * </pre>
     *
     * @method fetchAllIfNeeded
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {Object} options A Backbone-style callback object.
     * @static
     * Valid options are:<ul>
     *   <li>success: A Backbone-style success callback.
     *   <li>error: An Backbone-style error callback.
     * </ul>
     */
  }, {
    key: 'fetchAllIfNeeded',
    value: function fetchAllIfNeeded(list, options) {
      var options = options || {};

      var queryOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        queryOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        queryOptions.sessionToken = options.sessionToken;
      }
      return _CoreManager2['default'].getObjectController().fetch(list, false, queryOptions)._thenRunCallbacks(options);
    }

    /**
     * Destroy the given list of models on the server if it was already persisted.
     *
     * <p>Unlike saveAll, if an error occurs while deleting an individual model,
     * this method will continue trying to delete the rest of the models if
     * possible, except in the case of a fatal error like a connection error.
     *
     * <p>In particular, the Parse.Error object returned in the case of error may
     * be one of two types:
     *
     * <ul>
     *   <li>A Parse.Error.AGGREGATE_ERROR. This object's "errors" property is an
     *       array of other Parse.Error objects. Each error object in this array
     *       has an "object" property that references the object that could not be
     *       deleted (for instance, because that object could not be found).</li>
     *   <li>A non-aggregate Parse.Error. This indicates a serious error that
     *       caused the delete operation to be aborted partway through (for
     *       instance, a connection failure in the middle of the delete).</li>
     * </ul>
     *
     * <pre>
     *   Parse.Object.destroyAll([object1, object2, ...], {
     *     success: function() {
     *       // All the objects were deleted.
     *     },
     *     error: function(error) {
     *       // An error occurred while deleting one or more of the objects.
     *       // If this is an aggregate error, then we can inspect each error
     *       // object individually to determine the reason why a particular
     *       // object was not deleted.
     *       if (error.code === Parse.Error.AGGREGATE_ERROR) {
     *         for (var i = 0; i < error.errors.length; i++) {
     *           console.log("Couldn't delete " + error.errors[i].object.id +
     *             "due to " + error.errors[i].message);
     *         }
     *       } else {
     *         console.log("Delete aborted because of " + error.message);
     *       }
     *     },
     *   });
     * </pre>
     *
     * @method destroyAll
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {Object} options A Backbone-style callback object.
     * @static
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @return {Parse.Promise} A promise that is fulfilled when the destroyAll
     *     completes.
     */
  }, {
    key: 'destroyAll',
    value: function destroyAll(list, options) {
      var options = options || {};

      var destroyOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        destroyOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        destroyOptions.sessionToken = options.sessionToken;
      }
      return _CoreManager2['default'].getObjectController().destroy(list, destroyOptions)._thenRunCallbacks(options);
    }

    /**
     * Saves the given list of Parse.Object.
     * If any error is encountered, stops and calls the error handler.
     *
     * <pre>
     *   Parse.Object.saveAll([object1, object2, ...], {
     *     success: function(list) {
     *       // All the objects were saved.
     *     },
     *     error: function(error) {
     *       // An error occurred while saving one of the objects.
     *     },
     *   });
     * </pre>
     *
     * @method saveAll
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {Object} options A Backbone-style callback object.
     * @static
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     */
  }, {
    key: 'saveAll',
    value: function saveAll(list, options) {
      var options = options || {};

      var saveOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        saveOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        saveOptions.sessionToken = options.sessionToken;
      }
      return _CoreManager2['default'].getObjectController().save(list, saveOptions)._thenRunCallbacks(options);
    }

    /**
     * Creates a reference to a subclass of Parse.Object with the given id. This
     * does not exist on Parse.Object, only on subclasses.
     *
     * <p>A shortcut for: <pre>
     *  var Foo = Parse.Object.extend("Foo");
     *  var pointerToFoo = new Foo();
     *  pointerToFoo.id = "myObjectId";
     * </pre>
     *
     * @method createWithoutData
     * @param {String} id The ID of the object to create a reference to.
     * @static
     * @return {Parse.Object} A Parse.Object reference.
     */
  }, {
    key: 'createWithoutData',
    value: function createWithoutData(id) {
      var obj = new this();
      obj.id = id;
      return obj;
    }

    /**
     * Creates a new instance of a Parse Object from a JSON representation.
     * @method fromJSON
     * @param {Object} json The JSON map of the Object's data
     * @static
     * @return {Parse.Object} A Parse.Object reference
     */
  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      if (!json.className) {
        throw new Error('Cannot create an object without a className');
      }
      var constructor = classMap[json.className];
      var o = constructor ? new constructor() : new ParseObject(json.className);
      var otherAttributes = {};
      for (var attr in json) {
        if (attr !== 'className' && attr !== '__type') {
          otherAttributes[attr] = json[attr];
        }
      }
      o._finishFetch(otherAttributes);
      if (json.objectId) {
        o._setExisted(true);
      }
      return o;
    }

    /**
     * Registers a subclass of Parse.Object with a specific class name.
     * When objects of that class are retrieved from a query, they will be
     * instantiated with this subclass.
     * This is only necessary when using ES6 subclassing.
     * @method registerSubclass
     * @param {String} className The class name of the subclass
     * @param {Class} constructor The subclass
     */
  }, {
    key: 'registerSubclass',
    value: function registerSubclass(className, constructor) {
      if (typeof className !== 'string') {
        throw new TypeError('The first argument must be a valid class name.');
      }
      if (typeof constructor === 'undefined') {
        throw new TypeError('You must supply a subclass constructor.');
      }
      if (typeof constructor !== 'function') {
        throw new TypeError('You must register the subclass constructor. ' + 'Did you attempt to register an instance of the subclass?');
      }
      classMap[className] = constructor;
      if (!constructor.className) {
        constructor.className = className;
      }
    }

    /**
     * Creates a new subclass of Parse.Object for the given Parse class name.
     *
     * <p>Every extension of a Parse class will inherit from the most recent
     * previous extension of that class. When a Parse.Object is automatically
     * created by parsing JSON, it will use the most recent extension of that
     * class.</p>
     *
     * <p>You should call either:<pre>
     *     var MyClass = Parse.Object.extend("MyClass", {
     *         <i>Instance methods</i>,
     *         initialize: function(attrs, options) {
     *             this.someInstanceProperty = [],
     *             <i>Other instance properties</i>
     *         }
     *     }, {
     *         <i>Class properties</i>
     *     });</pre>
     * or, for Backbone compatibility:<pre>
     *     var MyClass = Parse.Object.extend({
     *         className: "MyClass",
     *         <i>Instance methods</i>,
     *         initialize: function(attrs, options) {
     *             this.someInstanceProperty = [],
     *             <i>Other instance properties</i>
     *         }
     *     }, {
     *         <i>Class properties</i>
     *     });</pre></p>
     *
     * @method extend
     * @param {String} className The name of the Parse class backing this model.
     * @param {Object} protoProps Instance properties to add to instances of the
     *     class returned from this method.
     * @param {Object} classProps Class properties to add the class returned from
     *     this method.
     * @return {Class} A new subclass of Parse.Object.
     */
  }, {
    key: 'extend',
    value: function extend(className, protoProps, classProps) {
      if (typeof className !== 'string') {
        if (className && typeof className.className === 'string') {
          return ParseObject.extend(className.className, className, protoProps);
        } else {
          throw new Error('Parse.Object.extend\'s first argument should be the className.');
        }
      }
      var adjustedClassName = className;

      if (adjustedClassName === 'User' && _CoreManager2['default'].get('PERFORM_USER_REWRITE')) {
        adjustedClassName = '_User';
      }

      var parentProto = ParseObject.prototype;
      if (this.hasOwnProperty('__super__') && this.__super__) {
        parentProto = this.prototype;
      } else if (classMap[adjustedClassName]) {
        parentProto = classMap[adjustedClassName].prototype;
      }
      var ParseObjectSubclass = function ParseObjectSubclass(attributes, options) {
        this.className = adjustedClassName;
        this._objCount = objectCount++;
        if (attributes && typeof attributes === 'object') {
          if (!this.set(attributes || {}, options)) {
            throw new Error('Can\'t create an invalid Parse Object');
          }
        }
        // Enable legacy initializers
        if (typeof this.initialize === 'function') {
          this.initialize.apply(this, arguments);
        }
      };
      ParseObjectSubclass.className = adjustedClassName;
      ParseObjectSubclass.__super__ = parentProto;

      ParseObjectSubclass.prototype = _Object$create(parentProto, {
        constructor: {
          value: ParseObjectSubclass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });

      if (protoProps) {
        for (var prop in protoProps) {
          if (prop !== 'className') {
            _Object$defineProperty(ParseObjectSubclass.prototype, prop, {
              value: protoProps[prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      if (classProps) {
        for (var prop in classProps) {
          if (prop !== 'className') {
            _Object$defineProperty(ParseObjectSubclass, prop, {
              value: classProps[prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      ParseObjectSubclass.extend = function (name, protoProps, classProps) {
        if (typeof name === 'string') {
          return ParseObject.extend.call(ParseObjectSubclass, name, protoProps, classProps);
        }
        return ParseObject.extend.call(ParseObjectSubclass, adjustedClassName, name, protoProps);
      };
      ParseObjectSubclass.createWithoutData = ParseObject.createWithoutData;

      classMap[adjustedClassName] = ParseObjectSubclass;
      return ParseObjectSubclass;
    }

    /**
     * Enable single instance objects, where any local objects with the same Id
     * share the same attributes, and stay synchronized with each other.
     * This is disabled by default in server environments, since it can lead to
     * security issues.
     * @method enableSingleInstance
     */
  }, {
    key: 'enableSingleInstance',
    value: function enableSingleInstance() {
      singleInstance = true;
    }

    /**
     * Disable single instance objects, where any local objects with the same Id
     * share the same attributes, and stay synchronized with each other.
     * When disabled, you can have two instances of the same object in memory
     * without them sharing attributes.
     * @method disableSingleInstance
     */
  }, {
    key: 'disableSingleInstance',
    value: function disableSingleInstance() {
      singleInstance = false;
    }
  }]);

  return ParseObject;
})();

exports['default'] = ParseObject;

_CoreManager2['default'].setObjectController({
  fetch: function fetch(target, forceFetch, options) {
    if (Array.isArray(target)) {
      if (target.length < 1) {
        return _ParsePromise2['default'].as([]);
      }
      var objs = [];
      var ids = [];
      var className = null;
      var results = [];
      var error = null;
      target.forEach(function (el, i) {
        if (error) {
          return;
        }
        if (!className) {
          className = el.className;
        }
        if (className !== el.className) {
          error = new _ParseError2['default'](_ParseError2['default'].INVALID_CLASS_NAME, 'All objects should be of the same class');
        }
        if (!el.id) {
          error = new _ParseError2['default'](_ParseError2['default'].MISSING_OBJECT_ID, 'All objects must have an ID');
        }
        if (forceFetch || _Object$keys(el._getServerData()).length === 0) {
          ids.push(el.id);
          objs.push(el);
        }
        results.push(el);
      });
      if (error) {
        return _ParsePromise2['default'].error(error);
      }
      var query = new _ParseQuery2['default'](className);
      query.containedIn('objectId', ids);
      query._limit = ids.length;
      return query.find(options).then(function (objects) {
        var idMap = {};
        objects.forEach(function (o) {
          idMap[o.id] = o;
        });
        for (var i = 0; i < objs.length; i++) {
          var obj = objs[i];
          if (!obj || !obj.id || !idMap[obj.id]) {
            if (forceFetch) {
              return _ParsePromise2['default'].error(new _ParseError2['default'](_ParseError2['default'].OBJECT_NOT_FOUND, 'All objects must exist on the server.'));
            }
          }
        }
        if (!singleInstance) {
          // If single instance objects are disabled, we need to replace the
          for (var i = 0; i < results.length; i++) {
            var obj = results[i];
            if (obj && obj.id && idMap[obj.id]) {
              var id = obj.id;
              obj._finishFetch(idMap[id].toJSON());
              results[i] = idMap[id];
            }
          }
        }
        return _ParsePromise2['default'].as(results);
      });
    } else {
      var RESTController = _CoreManager2['default'].getRESTController();
      return RESTController.request('GET', 'classes/' + target.className + '/' + target._getId(), {}, options).then(function (response, status, xhr) {
        if (target instanceof ParseObject) {
          target._clearPendingOps();
          target._finishFetch(response);
        }
        return target;
      });
    }
  },

  destroy: function destroy(target, options) {
    var RESTController = _CoreManager2['default'].getRESTController();
    if (Array.isArray(target)) {
      if (target.length < 1) {
        return _ParsePromise2['default'].as([]);
      }
      var batches = [[]];
      target.forEach(function (obj) {
        if (!obj.id) {
          return;
        }
        batches[batches.length - 1].push(obj);
        if (batches[batches.length - 1].length >= 20) {
          batches.push([]);
        }
      });
      if (batches[batches.length - 1].length === 0) {
        // If the last batch is empty, remove it
        batches.pop();
      }
      var deleteCompleted = _ParsePromise2['default'].as();
      var errors = [];
      batches.forEach(function (batch) {
        deleteCompleted = deleteCompleted.then(function () {
          return RESTController.request('POST', 'batch', {
            requests: batch.map(function (obj) {
              return {
                method: 'DELETE',
                path: '/1/classes/' + obj.className + '/' + obj._getId(),
                body: {}
              };
            })
          }, options).then(function (results) {
            for (var i = 0; i < results.length; i++) {
              if (results[i] && results[i].hasOwnProperty('error')) {
                var err = new _ParseError2['default'](results[i].error.code, results[i].error.error);
                err.object = batch[i];
                errors.push(err);
              }
            }
          });
        });
      });
      return deleteCompleted.then(function () {
        if (errors.length) {
          var aggregate = new _ParseError2['default'](_ParseError2['default'].AGGREGATE_ERROR);
          aggregate.errors = errors;
          return _ParsePromise2['default'].error(aggregate);
        }
        return _ParsePromise2['default'].as(target);
      });
    } else if (target instanceof ParseObject) {
      return RESTController.request('DELETE', 'classes/' + target.className + '/' + target._getId(), {}, options).then(function () {
        return _ParsePromise2['default'].as(target);
      });
    }
    return _ParsePromise2['default'].as(target);
  },

  save: function save(target, options) {
    var RESTController = _CoreManager2['default'].getRESTController();
    if (Array.isArray(target)) {
      if (target.length < 1) {
        return _ParsePromise2['default'].as([]);
      }

      var unsaved = target.concat();
      for (var i = 0; i < target.length; i++) {
        if (target[i] instanceof ParseObject) {
          unsaved = unsaved.concat((0, _unsavedChildren2['default'])(target[i], true));
        }
      }
      unsaved = (0, _unique2['default'])(unsaved);

      var filesSaved = _ParsePromise2['default'].as();
      var pending = [];
      unsaved.forEach(function (el) {
        if (el instanceof _ParseFile2['default']) {
          filesSaved = filesSaved.then(function () {
            return el.save();
          });
        } else if (el instanceof ParseObject) {
          pending.push(el);
        }
      });

      return filesSaved.then(function () {
        var objectError = null;
        return _ParsePromise2['default']._continueWhile(function () {
          return pending.length > 0;
        }, function () {
          var batch = [];
          var nextPending = [];
          pending.forEach(function (el) {
            if (batch.length < 20 && (0, _canBeSerialized2['default'])(el)) {
              batch.push(el);
            } else {
              nextPending.push(el);
            }
          });
          pending = nextPending;
          if (batch.length < 1) {
            return _ParsePromise2['default'].error(new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'Tried to save a batch with a cycle.'));
          }

          // Queue up tasks for each object in the batch.
          // When every task is ready, the API request will execute
          var batchReturned = new _ParsePromise2['default']();
          var batchReady = [];
          var batchTasks = [];
          batch.forEach(function (obj, index) {
            var ready = new _ParsePromise2['default']();
            batchReady.push(ready);
            var task = function task() {
              ready.resolve();
              return batchReturned.then(function (responses, status) {
                if (responses[index].hasOwnProperty('success')) {
                  obj._handleSaveResponse(responses[index].success, status);
                } else {
                  if (!objectError && responses[index].hasOwnProperty('error')) {
                    var serverError = responses[index].error;
                    objectError = new _ParseError2['default'](serverError.code, serverError.error);
                    // Cancel the rest of the save
                    pending = [];
                  }
                  obj._handleSaveError();
                }
              });
            };
            ObjectState.pushPendingState(obj.className, obj._getStateIdentifier());
            batchTasks.push(ObjectState.enqueueTask(obj.className, obj._getStateIdentifier(), task));
          });

          _ParsePromise2['default'].when(batchReady).then(function () {
            // Kick off the batch request
            return RESTController.request('POST', 'batch', {
              requests: batch.map(function (obj) {
                var params = obj._getSaveParams();
                params.path = '/1/' + params.path;
                return params;
              })
            }, options);
          }).then(function (response, status, xhr) {
            batchReturned.resolve(response, status);
          });

          return _ParsePromise2['default'].when(batchTasks);
        }).then(function () {
          if (objectError) {
            return _ParsePromise2['default'].error(objectError);
          }
          return _ParsePromise2['default'].as(target);
        });
      });
    } else if (target instanceof ParseObject) {
      // copying target lets Flow guarantee the pointer isn't modified elsewhere
      var targetCopy = target;
      var task = function task() {
        var params = targetCopy._getSaveParams();
        return RESTController.request(params.method, params.path, params.body, options).then(function (response, status) {
          targetCopy._handleSaveResponse(response, status);
        }, function (error) {
          targetCopy._handleSaveError();
          return _ParsePromise2['default'].error(error);
        });
      };
      ObjectState.pushPendingState(target.className, target._getStateIdentifier());
      return ObjectState.enqueueTask(target.className, target._getStateIdentifier(), task).then(function () {
        return target;
      }, function (error) {
        return error;
      });
    }
    return _ParsePromise2['default'].as();
  }
});
module.exports = exports['default'];

/**
 * The ID of this object, unique within its class.
 * @property id
 * @type String
 */
},{"./CoreManager":5,"./ObjectState":8,"./ParseACL":10,"./ParseError":12,"./ParseFile":13,"./ParseOp":17,"./ParsePromise":18,"./ParseQuery":19,"./ParseRelation":20,"./canBeSerialized":30,"./decode":31,"./encode":32,"./equals":33,"./escape":34,"./parseDate":36,"./unique":37,"./unsavedChildren":38,"babel-runtime/core-js/object/create":39,"babel-runtime/core-js/object/define-property":40,"babel-runtime/core-js/object/freeze":41,"babel-runtime/core-js/object/keys":43,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/interop-require-default":49,"babel-runtime/helpers/interop-require-wildcard":50}],17:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.opFromJSON = opFromJSON;

var _arrayContainsObject = require('./arrayContainsObject');

var _arrayContainsObject2 = _interopRequireDefault(_arrayContainsObject);

var _decode = require('./decode');

var _decode2 = _interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = _interopRequireDefault(_ParseRelation);

var _unique = require('./unique');

var _unique2 = _interopRequireDefault(_unique);

function opFromJSON(json) {
  if (!json || !json.__op) {
    return null;
  }
  switch (json.__op) {
    case 'Delete':
      return new UnsetOp();
    case 'Increment':
      return new IncrementOp(json.amount);
    case 'Add':
      return new AddOp((0, _decode2['default'])(json.objects));
    case 'AddUnique':
      return new AddUniqueOp((0, _decode2['default'])(json.objects));
    case 'Remove':
      return new RemoveOp((0, _decode2['default'])(json.objects));
    case 'AddRelation':
      var toAdd = (0, _decode2['default'])(json.objects);
      if (!Array.isArray(toAdd)) {
        return new RelationOp([], []);
      }
      return new RelationOp(toAdd, []);
    case 'RemoveRelation':
      var toRemove = (0, _decode2['default'])(json.objects);
      if (!Array.isArray(toRemove)) {
        return new RelationOp([], []);
      }
      return new RelationOp([], toRemove);
    case 'Batch':
      var toAdd = [];
      var toRemove = [];
      for (var i = 0; i < json.ops.length; i++) {
        if (json.ops[i].__op === 'AddRelation') {
          toAdd = toAdd.concat((0, _decode2['default'])(json.ops[i].objects));
        } else if (json.ops[i].__op === 'RemoveRelation') {
          toRemove = toRemove.concat((0, _decode2['default'])(json.ops[i].objects));
        }
      }
      return new RelationOp(toAdd, toRemove);
  }
  return null;
}

var Op = (function () {
  function Op() {
    _classCallCheck(this, Op);
  }

  _createClass(Op, [{
    key: 'applyTo',

    // Empty parent class
    value: function applyTo(value) {}
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {}
  }, {
    key: 'toJSON',
    value: function toJSON() {}
  }]);

  return Op;
})();

exports.Op = Op;

var SetOp = (function (_Op) {
  _inherits(SetOp, _Op);

  function SetOp(value) {
    _classCallCheck(this, SetOp);

    _get(Object.getPrototypeOf(SetOp.prototype), 'constructor', this).call(this);
    this._value = value;
  }

  _createClass(SetOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      return this._value;
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      return new SetOp(this._value);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return (0, _encode2['default'])(this._value, false, true);
    }
  }]);

  return SetOp;
})(Op);

exports.SetOp = SetOp;

var UnsetOp = (function (_Op2) {
  _inherits(UnsetOp, _Op2);

  function UnsetOp() {
    _classCallCheck(this, UnsetOp);

    _get(Object.getPrototypeOf(UnsetOp.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(UnsetOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      return undefined;
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      return new UnsetOp();
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'Delete' };
    }
  }]);

  return UnsetOp;
})(Op);

exports.UnsetOp = UnsetOp;

var IncrementOp = (function (_Op3) {
  _inherits(IncrementOp, _Op3);

  function IncrementOp(amount) {
    _classCallCheck(this, IncrementOp);

    _get(Object.getPrototypeOf(IncrementOp.prototype), 'constructor', this).call(this);
    if (typeof amount !== 'number') {
      throw new TypeError('Increment Op must be initialized with a numeric amount.');
    }
    this._amount = amount;
  }

  _createClass(IncrementOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      if (typeof value === 'undefined') {
        return this._amount;
      }
      if (typeof value !== 'number') {
        throw new TypeError('Cannot increment a non-numeric value.');
      }
      return this._amount + value;
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      }
      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }
      if (previous instanceof UnsetOp) {
        return new SetOp(this._amount);
      }
      if (previous instanceof IncrementOp) {
        return new IncrementOp(this.applyTo(previous._amount));
      }
      throw new Error('Cannot merge Increment Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'Increment', amount: this._amount };
    }
  }]);

  return IncrementOp;
})(Op);

exports.IncrementOp = IncrementOp;

var AddOp = (function (_Op4) {
  _inherits(AddOp, _Op4);

  function AddOp(value) {
    _classCallCheck(this, AddOp);

    _get(Object.getPrototypeOf(AddOp.prototype), 'constructor', this).call(this);
    this._value = Array.isArray(value) ? value : [value];
  }

  _createClass(AddOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      if (value == null) {
        return this._value;
      }
      if (Array.isArray(value)) {
        return value.concat(this._value);
      }
      throw new Error('Cannot add elements to a non-array value');
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      }
      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }
      if (previous instanceof UnsetOp) {
        return new SetOp(this._value);
      }
      if (previous instanceof AddOp) {
        return new AddOp(this.applyTo(previous._value));
      }
      throw new Error('Cannot merge Add Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'Add', objects: (0, _encode2['default'])(this._value, false, true) };
    }
  }]);

  return AddOp;
})(Op);

exports.AddOp = AddOp;

var AddUniqueOp = (function (_Op5) {
  _inherits(AddUniqueOp, _Op5);

  function AddUniqueOp(value) {
    _classCallCheck(this, AddUniqueOp);

    _get(Object.getPrototypeOf(AddUniqueOp.prototype), 'constructor', this).call(this);
    this._value = (0, _unique2['default'])(Array.isArray(value) ? value : [value]);
  }

  _createClass(AddUniqueOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      if (value == null) {
        return this._value || [];
      }
      if (Array.isArray(value)) {
        // copying value lets Flow guarantee the pointer isn't modified elsewhere
        var valueCopy = value;
        var toAdd = [];
        this._value.forEach(function (v) {
          if (v instanceof _ParseObject2['default']) {
            if (!(0, _arrayContainsObject2['default'])(valueCopy, v)) {
              toAdd.push(v);
            }
          } else {
            if (valueCopy.indexOf(v) < 0) {
              toAdd.push(v);
            }
          }
        });
        return value.concat(toAdd);
      }
      throw new Error('Cannot add elements to a non-array value');
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      }
      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }
      if (previous instanceof UnsetOp) {
        return new SetOp(this._value);
      }
      if (previous instanceof AddUniqueOp) {
        return new AddUniqueOp(this.applyTo(previous._value));
      }
      throw new Error('Cannot merge AddUnique Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'AddUnique', objects: (0, _encode2['default'])(this._value, false, true) };
    }
  }]);

  return AddUniqueOp;
})(Op);

exports.AddUniqueOp = AddUniqueOp;

var RemoveOp = (function (_Op6) {
  _inherits(RemoveOp, _Op6);

  function RemoveOp(value) {
    _classCallCheck(this, RemoveOp);

    _get(Object.getPrototypeOf(RemoveOp.prototype), 'constructor', this).call(this);
    this._value = (0, _unique2['default'])(Array.isArray(value) ? value : [value]);
  }

  _createClass(RemoveOp, [{
    key: 'applyTo',
    value: function applyTo(value) {
      if (value == null) {
        return [];
      }
      if (Array.isArray(value)) {
        var i = value.indexOf(this._value);
        var removed = value.concat([]);
        for (var i = 0; i < this._value.length; i++) {
          var index = removed.indexOf(this._value[i]);
          while (index > -1) {
            removed.splice(index, 1);
            index = removed.indexOf(this._value[i]);
          }
          if (this._value[i] instanceof _ParseObject2['default'] && this._value[i].id) {
            for (var j = 0; j < removed.length; j++) {
              if (removed[j] instanceof _ParseObject2['default'] && this._value[i].id === removed[j].id) {
                removed.splice(j, 1);
                j--;
              }
            }
          }
        }
        return removed;
      }
      throw new Error('Cannot remove elements from a non-array value');
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      }
      if (previous instanceof SetOp) {
        return new SetOp(this.applyTo(previous._value));
      }
      if (previous instanceof UnsetOp) {
        return new UnsetOp();
      }
      if (previous instanceof RemoveOp) {
        var uniques = previous._value.concat([]);
        for (var i = 0; i < this._value.length; i++) {
          if (this._value[i] instanceof _ParseObject2['default']) {
            if (!(0, _arrayContainsObject2['default'])(uniques, this._value[i])) {
              uniques.push(this._value[i]);
            }
          } else {
            if (uniques.indexOf(this._value[i]) < 0) {
              uniques.push(this._value[i]);
            }
          }
        }
        return new RemoveOp(uniques);
      }
      throw new Error('Cannot merge Remove Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { __op: 'Remove', objects: (0, _encode2['default'])(this._value, false, true) };
    }
  }]);

  return RemoveOp;
})(Op);

exports.RemoveOp = RemoveOp;

var RelationOp = (function (_Op7) {
  _inherits(RelationOp, _Op7);

  function RelationOp(adds, removes) {
    _classCallCheck(this, RelationOp);

    _get(Object.getPrototypeOf(RelationOp.prototype), 'constructor', this).call(this);
    this._targetClassName = null;

    if (Array.isArray(adds)) {
      this.relationsToAdd = (0, _unique2['default'])(adds.map(this._extractId, this));
    }

    if (Array.isArray(removes)) {
      this.relationsToRemove = (0, _unique2['default'])(removes.map(this._extractId, this));
    }
  }

  _createClass(RelationOp, [{
    key: '_extractId',
    value: function _extractId(obj) {
      if (typeof obj === 'string') {
        return obj;
      }
      if (!obj.id) {
        throw new Error('You cannot add or remove an unsaved Parse Object from a relation');
      }
      if (!this._targetClassName) {
        this._targetClassName = obj.className;
      }
      if (this._targetClassName !== obj.className) {
        throw new Error('Tried to create a Relation with 2 different object types: ' + this._targetClassName + ' and ' + obj.className + '.');
      }
      return obj.id;
    }
  }, {
    key: 'applyTo',
    value: function applyTo(value, object, key) {
      if (!value) {
        var parent = new _ParseObject2['default'](object.className);
        if (object.id && object.id.indexOf('local') === 0) {
          parent._localId = object.id;
        } else if (object.id) {
          parent.id = object.id;
        }
        var relation = new _ParseRelation2['default'](parent, key);
        relation.targetClassName = this._targetClassName;
        return relation;
      }
      if (value instanceof _ParseRelation2['default']) {
        if (this._targetClassName) {
          if (value.targetClassName) {
            if (this._targetClassName !== value.targetClassName) {
              throw new Error('Related object must be a ' + value.targetClassName + ', but a ' + this._targetClassName + ' was passed in.');
            }
          } else {
            value.targetClassName = this._targetClassName;
          }
        }
        return value;
      } else {
        throw new Error('Relation cannot be applied to a non-relation field');
      }
    }
  }, {
    key: 'mergeWith',
    value: function mergeWith(previous) {
      if (!previous) {
        return this;
      } else if (previous instanceof UnsetOp) {
        throw new Error('You cannot modify a relation after deleting it.');
      } else if (previous instanceof RelationOp) {
        if (previous._targetClassName && previous._targetClassName !== this._targetClassName) {
          throw new Error('Related object must be of class ' + previous._targetClassName + ', but ' + (this._targetClassName || 'null') + ' was passed in.');
        }
        var newAdd = previous.relationsToAdd.concat([]);
        this.relationsToRemove.forEach(function (r) {
          var index = newAdd.indexOf(r);
          if (index > -1) {
            newAdd.splice(index, 1);
          }
        });
        this.relationsToAdd.forEach(function (r) {
          var index = newAdd.indexOf(r);
          if (index < 0) {
            newAdd.push(r);
          }
        });

        var newRemove = previous.relationsToRemove.concat([]);
        this.relationsToAdd.forEach(function (r) {
          var index = newRemove.indexOf(r);
          if (index > -1) {
            newRemove.splice(index, 1);
          }
        });
        this.relationsToRemove.forEach(function (r) {
          var index = newRemove.indexOf(r);
          if (index < 0) {
            newRemove.push(r);
          }
        });

        var newRelation = new RelationOp(newAdd, newRemove);
        newRelation._targetClassName = this._targetClassName;
        return newRelation;
      }
      throw new Error('Cannot merge Relation Op with the previous Op');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this = this;

      var idToPointer = function idToPointer(id) {
        return {
          __type: 'Pointer',
          className: _this._targetClassName,
          objectId: id
        };
      };

      var adds = null;
      var removes = null;
      var pointers = null;

      if (this.relationsToAdd.length > 0) {
        pointers = this.relationsToAdd.map(idToPointer);
        adds = { __op: 'AddRelation', objects: pointers };
      }
      if (this.relationsToRemove.length > 0) {
        pointers = this.relationsToRemove.map(idToPointer);
        removes = { __op: 'RemoveRelation', objects: pointers };
      }

      if (adds && removes) {
        return { __op: 'Batch', ops: [adds, removes] };
      }

      return adds || removes || {};
    }
  }]);

  return RelationOp;
})(Op);

exports.RelationOp = RelationOp;
},{"./ParseObject":16,"./ParseRelation":20,"./arrayContainsObject":29,"./decode":31,"./encode":32,"./unique":37,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/get":47,"babel-runtime/helpers/inherits":48,"babel-runtime/helpers/interop-require-default":49}],18:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _isPromisesAPlusCompliant = false;

/**
 * A Promise is returned by async methods as a hook to provide callbacks to be
 * called when the async task is fulfilled.
 *
 * <p>Typical usage would be like:<pre>
 *    query.find().then(function(results) {
 *      results[0].set("foo", "bar");
 *      return results[0].saveAsync();
 *    }).then(function(result) {
 *      console.log("Updated " + result.id);
 *    });
 * </pre></p>
 *
 * @class Parse.Promise
 * @constructor
 */

var ParsePromise = (function () {
  function ParsePromise() {
    _classCallCheck(this, ParsePromise);

    this._resolved = false;
    this._rejected = false;
    this._resolvedCallbacks = [];
    this._rejectedCallbacks = [];
  }

  /**
   * Marks this promise as fulfilled, firing any callbacks waiting on it.
   * @method resolve
   * @param {Object} result the result to pass to the callbacks.
   */

  _createClass(ParsePromise, [{
    key: 'resolve',
    value: function resolve() {
      if (this._resolved || this._rejected) {
        throw new Error('A promise was resolved even though it had already been ' + (this._resolved ? 'resolved' : 'rejected') + '.');
      }
      this._resolved = true;

      for (var _len = arguments.length, results = Array(_len), _key = 0; _key < _len; _key++) {
        results[_key] = arguments[_key];
      }

      this._result = results;
      for (var i = 0; i < this._resolvedCallbacks.length; i++) {
        this._resolvedCallbacks[i].apply(this, results);
      }

      this._resolvedCallbacks = [];
      this._rejectedCallbacks = [];
    }

    /**
     * Marks this promise as fulfilled, firing any callbacks waiting on it.
     * @method reject
     * @param {Object} error the error to pass to the callbacks.
     */
  }, {
    key: 'reject',
    value: function reject(error) {
      if (this._resolved || this._rejected) {
        throw new Error('A promise was resolved even though it had already been ' + (this._resolved ? 'resolved' : 'rejected') + '.');
      }
      this._rejected = true;
      this._error = error;
      for (var i = 0; i < this._rejectedCallbacks.length; i++) {
        this._rejectedCallbacks[i](error);
      }
      this._resolvedCallbacks = [];
      this._rejectedCallbacks = [];
    }

    /**
     * Adds callbacks to be called when this promise is fulfilled. Returns a new
     * Promise that will be fulfilled when the callback is complete. It allows
     * chaining. If the callback itself returns a Promise, then the one returned
     * by "then" will not be fulfilled until that one returned by the callback
     * is fulfilled.
     * @method then
     * @param {Function} resolvedCallback Function that is called when this
     * Promise is resolved. Once the callback is complete, then the Promise
     * returned by "then" will also be fulfilled.
     * @param {Function} rejectedCallback Function that is called when this
     * Promise is rejected with an error. Once the callback is complete, then
     * the promise returned by "then" with be resolved successfully. If
     * rejectedCallback is null, or it returns a rejected Promise, then the
     * Promise returned by "then" will be rejected with that error.
     * @return {Parse.Promise} A new Promise that will be fulfilled after this
     * Promise is fulfilled and either callback has completed. If the callback
     * returned a Promise, then this Promise will not be fulfilled until that
     * one is.
     */
  }, {
    key: 'then',
    value: function then(resolvedCallback, rejectedCallback) {
      var _this = this;

      var promise = new ParsePromise();

      var wrappedResolvedCallback = function wrappedResolvedCallback() {
        for (var _len2 = arguments.length, results = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          results[_key2] = arguments[_key2];
        }

        if (typeof resolvedCallback === 'function') {
          if (_isPromisesAPlusCompliant) {
            try {
              results = [resolvedCallback.apply(this, results)];
            } catch (e) {
              results = [ParsePromise.error(e)];
            }
          } else {
            results = [resolvedCallback.apply(this, results)];
          }
        }
        if (results.length === 1 && ParsePromise.is(results[0])) {
          results[0].then(function () {
            promise.resolve.apply(promise, arguments);
          }, function (error) {
            promise.reject(error);
          });
        } else {
          promise.resolve.apply(promise, results);
        }
      };

      var wrappedRejectedCallback = function wrappedRejectedCallback(error) {
        var result = [];
        if (typeof rejectedCallback === 'function') {
          if (_isPromisesAPlusCompliant) {
            try {
              result = [rejectedCallback(error)];
            } catch (e) {
              result = [ParsePromise.error(e)];
            }
          } else {
            result = [rejectedCallback(error)];
          }
          if (result.length === 1 && ParsePromise.is(result[0])) {
            result[0].then(function () {
              promise.resolve.apply(promise, arguments);
            }, function (error) {
              promise.reject(error);
            });
          } else {
            if (_isPromisesAPlusCompliant) {
              promise.resolve.apply(promise, result);
            } else {
              promise.reject(result[0]);
            }
          }
        } else {
          promise.reject(error);
        }
      };

      var runLater = function runLater(fn) {
        fn.call();
      };
      if (_isPromisesAPlusCompliant) {
        if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
          runLater = function (fn) {
            process.nextTick(fn);
          };
        } else if (typeof setTimeout === 'function') {
          runLater = function (fn) {
            setTimeout(fn, 0);
          };
        }
      }

      if (this._resolved) {
        runLater(function () {
          wrappedResolvedCallback.apply(_this, _this._result);
        });
      } else if (this._rejected) {
        runLater(function () {
          wrappedRejectedCallback(_this._error);
        });
      } else {
        this._resolvedCallbacks.push(wrappedResolvedCallback);
        this._rejectedCallbacks.push(wrappedRejectedCallback);
      }

      return promise;
    }

    /**
     * Add handlers to be called when the promise
     * is either resolved or rejected
     * @method always
     */
  }, {
    key: 'always',
    value: function always(callback) {
      return this.then(callback, callback);
    }

    /**
     * Add handlers to be called when the Promise object is resolved
     * @method done
     */
  }, {
    key: 'done',
    value: function done(callback) {
      return this.then(callback);
    }

    /**
     * Add handlers to be called when the Promise object is rejected
     * @method fail
     */
  }, {
    key: 'fail',
    value: function fail(callback) {
      return this.then(null, callback);
    }

    /**
     * Run the given callbacks after this promise is fulfilled.
     * @method _thenRunCallbacks
     * @param optionsOrCallback {} A Backbone-style options callback, or a
     * callback function. If this is an options object and contains a "model"
     * attributes, that will be passed to error callbacks as the first argument.
     * @param model {} If truthy, this will be passed as the first result of
     * error callbacks. This is for Backbone-compatability.
     * @return {Parse.Promise} A promise that will be resolved after the
     * callbacks are run, with the same result as this.
     */
  }, {
    key: '_thenRunCallbacks',
    value: function _thenRunCallbacks(optionsOrCallback, model) {
      var options = {};
      if (typeof optionsOrCallback === 'function') {
        options.success = function (result) {
          optionsOrCallback(result, null);
        };
        options.error = function (error) {
          optionsOrCallback(null, error);
        };
      } else if (typeof optionsOrCallback === 'object') {
        if (typeof optionsOrCallback.success === 'function') {
          options.success = optionsOrCallback.success;
        }
        if (typeof optionsOrCallback.error === 'function') {
          options.error = optionsOrCallback.error;
        }
      }

      return this.then(function () {
        for (var _len3 = arguments.length, results = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          results[_key3] = arguments[_key3];
        }

        if (options.success) {
          options.success.apply(this, results);
        }
        return ParsePromise.as.apply(ParsePromise, arguments);
      }, function (error) {
        if (options.error) {
          if (typeof model !== 'undefined') {
            options.error(model, error);
          } else {
            options.error(error);
          }
        }
        // By explicitly returning a rejected Promise, this will work with
        // either jQuery or Promises/A+ semantics.
        return ParsePromise.error(error);
      });
    }

    /**
     * Adds a callback function that should be called regardless of whether
     * this promise failed or succeeded. The callback will be given either the
     * array of results for its first argument, or the error as its second,
     * depending on whether this Promise was rejected or resolved. Returns a
     * new Promise, like "then" would.
     * @method _continueWith
     * @param {Function} continuation the callback.
     */
  }, {
    key: '_continueWith',
    value: function _continueWith(continuation) {
      return this.then(function () {
        return continuation(arguments, null);
      }, function (error) {
        return continuation(null, error);
      });
    }

    /**
     * Returns true iff the given object fulfils the Promise interface.
     * @method is
     * @param {Object} promise The object to test
     * @static
     * @return {Boolean}
     */
  }], [{
    key: 'is',
    value: function is(promise) {
      return promise != null && typeof promise.then === 'function';
    }

    /**
     * Returns a new promise that is resolved with a given value.
     * @method as
     * @param value The value to resolve the promise with
     * @static
     * @return {Parse.Promise} the new promise.
     */
  }, {
    key: 'as',
    value: function as() {
      var promise = new ParsePromise();

      for (var _len4 = arguments.length, values = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        values[_key4] = arguments[_key4];
      }

      promise.resolve.apply(promise, values);
      return promise;
    }

    /**
     * Returns a new promise that is rejected with a given error.
     * @method error
     * @param error The error to reject the promise with
     * @static
     * @return {Parse.Promise} the new promise.
     */
  }, {
    key: 'error',
    value: function error() {
      var promise = new ParsePromise();

      for (var _len5 = arguments.length, errors = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        errors[_key5] = arguments[_key5];
      }

      promise.reject.apply(promise, errors);
      return promise;
    }

    /**
     * Returns a new promise that is fulfilled when all of the input promises
     * are resolved. If any promise in the list fails, then the returned promise
     * will be rejected with an array containing the error from each promise.
     * If they all succeed, then the returned promise will succeed, with the
     * results being the results of all the input
     * promises. For example: <pre>
     *   var p1 = Parse.Promise.as(1);
     *   var p2 = Parse.Promise.as(2);
     *   var p3 = Parse.Promise.as(3);
     *
     *   Parse.Promise.when(p1, p2, p3).then(function(r1, r2, r3) {
     *     console.log(r1);  // prints 1
     *     console.log(r2);  // prints 2
     *     console.log(r3);  // prints 3
     *   });</pre>
     *
     * The input promises can also be specified as an array: <pre>
     *   var promises = [p1, p2, p3];
     *   Parse.Promise.when(promises).then(function(r1, r2, r3) {
     *     console.log(r1);  // prints 1
     *     console.log(r2);  // prints 2
     *     console.log(r3);  // prints 3
     *   });
     * </pre>
     * @method when
     * @param {Array} promises a list of promises to wait for.
     * @static
     * @return {Parse.Promise} the new promise.
     */
  }, {
    key: 'when',
    value: function when(promises) {
      var objects;
      if (Array.isArray(promises)) {
        objects = promises;
      } else {
        objects = arguments;
      }

      var total = objects.length;
      var hadError = false;
      var results = [];
      var errors = [];
      results.length = objects.length;
      errors.length = objects.length;

      if (total === 0) {
        return ParsePromise.as.apply(this, results);
      }

      var promise = new ParsePromise();

      var resolveOne = function resolveOne() {
        total--;
        if (total <= 0) {
          if (hadError) {
            promise.reject(errors);
          } else {
            promise.resolve.apply(promise, results);
          }
        }
      };

      var chain = function chain(object, index) {
        if (ParsePromise.is(object)) {
          object.then(function (result) {
            results[index] = result;
            resolveOne();
          }, function (error) {
            errors[index] = error;
            hadError = true;
            resolveOne();
          });
        } else {
          results[i] = object;
          resolveOne();
        }
      };
      for (var i = 0; i < objects.length; i++) {
        chain(objects[i], i);
      }

      return promise;
    }

    /**
     * Runs the given asyncFunction repeatedly, as long as the predicate
     * function returns a truthy value. Stops repeating if asyncFunction returns
     * a rejected promise.
     * @method _continueWhile
     * @param {Function} predicate should return false when ready to stop.
     * @param {Function} asyncFunction should return a Promise.
     * @static
     */
  }, {
    key: '_continueWhile',
    value: function _continueWhile(predicate, asyncFunction) {
      if (predicate()) {
        return asyncFunction().then(function () {
          return ParsePromise._continueWhile(predicate, asyncFunction);
        });
      }
      return ParsePromise.as();
    }
  }, {
    key: 'isPromisesAPlusCompliant',
    value: function isPromisesAPlusCompliant() {
      return _isPromisesAPlusCompliant;
    }
  }, {
    key: 'enableAPlusCompliant',
    value: function enableAPlusCompliant() {
      _isPromisesAPlusCompliant = true;
    }
  }, {
    key: 'disableAPlusCompliant',
    value: function disableAPlusCompliant() {
      _isPromisesAPlusCompliant = false;
    }
  }]);

  return ParsePromise;
})();

exports['default'] = ParsePromise;
module.exports = exports['default'];
}).call(this,require('_process'))

},{"_process":1,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46}],19:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParseGeoPoint = require('./ParseGeoPoint');

var _ParseGeoPoint2 = _interopRequireDefault(_ParseGeoPoint);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

/**
 * Converts a string into a regex that matches it.
 * Surrounding with \Q .. \E does this, we just need to escape any \E's in
 * the text separately.
 */
function quote(s) {
  return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
}

/**
 * Creates a new parse Parse.Query for the given Parse.Object subclass.
 * @class Parse.Query
 * @constructor
 * @param {} objectClass An instance of a subclass of Parse.Object, or a Parse className string.
 *
 * <p>Parse.Query defines a query that is used to fetch Parse.Objects. The
 * most common use case is finding all objects that match a query through the
 * <code>find</code> method. For example, this sample code fetches all objects
 * of class <code>MyClass</code>. It calls a different function depending on
 * whether the fetch succeeded or not.
 *
 * <pre>
 * var query = new Parse.Query(MyClass);
 * query.find({
 *   success: function(results) {
 *     // results is an array of Parse.Object.
 *   },
 *
 *   error: function(error) {
 *     // error is an instance of Parse.Error.
 *   }
 * });</pre></p>
 *
 * <p>A Parse.Query can also be used to retrieve a single object whose id is
 * known, through the get method. For example, this sample code fetches an
 * object of class <code>MyClass</code> and id <code>myId</code>. It calls a
 * different function depending on whether the fetch succeeded or not.
 *
 * <pre>
 * var query = new Parse.Query(MyClass);
 * query.get(myId, {
 *   success: function(object) {
 *     // object is an instance of Parse.Object.
 *   },
 *
 *   error: function(object, error) {
 *     // error is an instance of Parse.Error.
 *   }
 * });</pre></p>
 *
 * <p>A Parse.Query can also be used to count the number of objects that match
 * the query without retrieving all of those objects. For example, this
 * sample code counts the number of objects of the class <code>MyClass</code>
 * <pre>
 * var query = new Parse.Query(MyClass);
 * query.count({
 *   success: function(number) {
 *     // There are number instances of MyClass.
 *   },
 *
 *   error: function(error) {
 *     // error is an instance of Parse.Error.
 *   }
 * });</pre></p>
 */

var ParseQuery = (function () {
  function ParseQuery(objectClass) {
    _classCallCheck(this, ParseQuery);

    if (typeof objectClass === 'string') {
      if (objectClass === 'User' && _CoreManager2['default'].get('PERFORM_USER_REWRITE')) {
        this.className = '_User';
      } else {
        this.className = objectClass;
      }
    } else if (objectClass instanceof _ParseObject2['default']) {
      this.className = objectClass.className;
    } else if (typeof objectClass === 'function') {
      if (typeof objectClass.className === 'string') {
        this.className = objectClass.className;
      } else {
        var obj = new objectClass();
        this.className = obj.className;
      }
    } else {
      throw new TypeError('A ParseQuery must be constructed with a ParseObject or class name.');
    }

    this._where = {};
    this._include = [];
    this._limit = -1; // negative limit is not sent in the server request
    this._skip = 0;
    this._extraOptions = {};
  }

  /**
   * Adds constraint that at least one of the passed in queries matches.
   * @method _orQuery
   * @param {Array} queries
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */

  _createClass(ParseQuery, [{
    key: '_orQuery',
    value: function _orQuery(queries) {
      var queryJSON = queries.map(function (q) {
        return q.toJSON().where;
      });

      this._where.$or = queryJSON;
      return this;
    }

    /**
     * Helper for condition queries
     */
  }, {
    key: '_addCondition',
    value: function _addCondition(key, condition, value) {
      if (!this._where[key] || typeof this._where[key] === 'string') {
        this._where[key] = {};
      }
      this._where[key][condition] = (0, _encode2['default'])(value, false, true);
      return this;
    }

    /**
     * Returns a JSON representation of this query.
     * @method toJSON
     * @return {Object} The JSON representation of the query.
     */
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var params = {
        where: this._where
      };

      if (this._include.length) {
        params.include = this._include.join(',');
      }
      if (this._select) {
        params.keys = this._select.join(',');
      }
      if (this._limit >= 0) {
        params.limit = this._limit;
      }
      if (this._skip > 0) {
        params.skip = this._skip;
      }
      if (this._order) {
        params.order = this._order.join(',');
      }
      for (var key in this._extraOptions) {
        params[key] = this._extraOptions[key];
      }

      return params;
    }

    /**
     * Constructs a Parse.Object whose id is already known by fetching data from
     * the server.  Either options.success or options.error is called when the
     * find completes.
     *
     * @method get
     * @param {String} objectId The id of the object to be fetched.
     * @param {Object} options A Backbone-style options object.
     * Valid options are:<ul>
     *   <li>success: A Backbone-style success callback
     *   <li>error: An Backbone-style error callback.
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     *
     * @return {Parse.Promise} A promise that is resolved with the result when
     * the query completes.
     */
  }, {
    key: 'get',
    value: function get(objectId, options) {
      this.equalTo('objectId', objectId);

      var firstOptions = {};
      if (options && options.hasOwnProperty('useMasterKey')) {
        firstOptions.useMasterKey = options.useMasterKey;
      }
      if (options && options.hasOwnProperty('sessionToken')) {
        firstOptions.sessionToken = options.sessionToken;
      }

      return this.first(firstOptions).then(function (response) {
        if (response) {
          return response;
        }

        var errorObject = new _ParseError2['default'](_ParseError2['default'].OBJECT_NOT_FOUND, 'Object not found.');
        return _ParsePromise2['default'].error(errorObject);
      })._thenRunCallbacks(options, null);
    }

    /**
     * Retrieves a list of ParseObjects that satisfy this query.
     * Either options.success or options.error is called when the find
     * completes.
     *
     * @method find
     * @param {Object} options A Backbone-style options object. Valid options
     * are:<ul>
     *   <li>success: Function to call when the find completes successfully.
     *   <li>error: Function to call when the find fails.
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     *
     * @return {Parse.Promise} A promise that is resolved with the results when
     * the query completes.
     */
  }, {
    key: 'find',
    value: function find(options) {
      var _this = this;

      options = options || {};

      var findOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      var controller = _CoreManager2['default'].getQueryController();

      return controller.find(this.className, this.toJSON(), findOptions).then(function (response) {
        return response.results.map(function (data) {
          data.className = _this.className;
          return _ParseObject2['default'].fromJSON(data);
        });
      })._thenRunCallbacks(options);
    }

    /**
     * Counts the number of objects that match this query.
     * Either options.success or options.error is called when the count
     * completes.
     *
     * @method count
     * @param {Object} options A Backbone-style options object. Valid options
     * are:<ul>
     *   <li>success: Function to call when the count completes successfully.
     *   <li>error: Function to call when the find fails.
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     *
     * @return {Parse.Promise} A promise that is resolved with the count when
     * the query completes.
     */
  }, {
    key: 'count',
    value: function count(options) {
      options = options || {};

      var findOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      var controller = _CoreManager2['default'].getQueryController();

      var params = this.toJSON();
      params.limit = 0;
      params.count = 1;

      return controller.find(this.className, params, findOptions).then(function (result) {
        return result.count;
      })._thenRunCallbacks(options);
    }

    /**
     * Retrieves at most one Parse.Object that satisfies this query.
     *
     * Either options.success or options.error is called when it completes.
     * success is passed the object if there is one. otherwise, undefined.
     *
     * @method first
     * @param {Object} options A Backbone-style options object. Valid options
     * are:<ul>
     *   <li>success: Function to call when the find completes successfully.
     *   <li>error: Function to call when the find fails.
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     *
     * @return {Parse.Promise} A promise that is resolved with the object when
     * the query completes.
     */
  }, {
    key: 'first',
    value: function first(options) {
      var _this2 = this;

      options = options || {};

      var findOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      var controller = _CoreManager2['default'].getQueryController();

      var params = this.toJSON();
      params.limit = 1;

      return controller.find(this.className, params, findOptions).then(function (response) {
        var objects = response.results;
        if (!objects[0]) {
          return undefined;
        }
        objects[0].className = _this2.className;
        return _ParseObject2['default'].fromJSON(objects[0]);
      })._thenRunCallbacks(options);
    }

    /**
     * Iterates over each result of a query, calling a callback for each one. If
     * the callback returns a promise, the iteration will not continue until
     * that promise has been fulfilled. If the callback returns a rejected
     * promise, then iteration will stop with that error. The items are
     * processed in an unspecified order. The query may not have any sort order,
     * and may not use limit or skip.
     * @method each
     * @param {Function} callback Callback that will be called with each result
     *     of the query.
     * @param {Object} options An optional Backbone-like options object with
     *     success and error callbacks that will be invoked once the iteration
     *     has finished.
     * @return {Parse.Promise} A promise that will be fulfilled once the
     *     iteration has completed.
     */
  }, {
    key: 'each',
    value: function each(callback, options) {
      options = options || {};

      if (this._order || this._skip || this._limit >= 0) {
        return _ParsePromise2['default'].error('Cannot iterate on a query with sort, skip, or limit.')._thenRunCallbacks(options);
      }

      var promise = new _ParsePromise2['default']();

      var query = new ParseQuery(this.className);
      // We can override the batch size from the options.
      // This is undocumented, but useful for testing.
      query._limit = options.batchSize || 100;
      query._include = this._include.map(function (i) {
        return i;
      });
      if (this._select) {
        query._select = this._select.map(function (s) {
          return s;
        });
      }

      query._where = {};
      for (var attr in this._where) {
        var val = this._where[attr];
        if (Array.isArray(val)) {
          query._where[attr] = val.map(function (v) {
            return v;
          });
        } else if (val && typeof val === 'object') {
          var conditionMap = {};
          query._where[attr] = conditionMap;
          for (var cond in val) {
            conditionMap[cond] = val[cond];
          }
        } else {
          query._where[attr] = val;
        }
      }

      query.ascending('objectId');

      var findOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        findOptions.useMasterKey = options.useMasterKey;
      }
      if (options.hasOwnProperty('sessionToken')) {
        findOptions.sessionToken = options.sessionToken;
      }

      var finished = false;
      return _ParsePromise2['default']._continueWhile(function () {
        return !finished;
      }, function () {
        return query.find(findOptions).then(function (results) {
          var callbacksDone = _ParsePromise2['default'].as();
          results.forEach(function (result) {
            callbacksDone = callbacksDone.then(function () {
              return callback(result);
            });
          });

          return callbacksDone.then(function () {
            if (results.length >= query._limit) {
              query.greaterThan('objectId', results[results.length - 1].id);
            } else {
              finished = true;
            }
          });
        });
      })._thenRunCallbacks(options);
    }

    /** Query Conditions **/

    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be equal to the provided value.
     * @method equalTo
     * @param {String} key The key to check.
     * @param value The value that the Parse.Object must contain.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'equalTo',
    value: function equalTo(key, value) {
      if (typeof value === 'undefined') {
        return this.doesNotExist(key);
      }

      this._where[key] = (0, _encode2['default'])(value, false, true);
      return this;
    }

    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be not equal to the provided value.
     * @method notEqualTo
     * @param {String} key The key to check.
     * @param value The value that must not be equalled.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'notEqualTo',
    value: function notEqualTo(key, value) {
      return this._addCondition(key, '$ne', value);
    }

    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be less than the provided value.
     * @method lessThan
     * @param {String} key The key to check.
     * @param value The value that provides an upper bound.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'lessThan',
    value: function lessThan(key, value) {
      return this._addCondition(key, '$lt', value);
    }

    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be greater than the provided value.
     * @method greaterThan
     * @param {String} key The key to check.
     * @param value The value that provides an lower bound.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'greaterThan',
    value: function greaterThan(key, value) {
      return this._addCondition(key, '$gt', value);
    }

    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be less than or equal to the provided value.
     * @method lessThanOrEqualTo
     * @param {String} key The key to check.
     * @param value The value that provides an upper bound.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'lessThanOrEqualTo',
    value: function lessThanOrEqualTo(key, value) {
      return this._addCondition(key, '$lte', value);
    }

    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be greater than or equal to the provided value.
     * @method greaterThanOrEqualTo
     * @param {String} key The key to check.
     * @param value The value that provides an lower bound.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'greaterThanOrEqualTo',
    value: function greaterThanOrEqualTo(key, value) {
      return this._addCondition(key, '$gte', value);
    }

    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be contained in the provided list of values.
     * @method containedIn
     * @param {String} key The key to check.
     * @param {Array} values The values that will match.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'containedIn',
    value: function containedIn(key, value) {
      return this._addCondition(key, '$in', value);
    }

    /**
     * Adds a constraint to the query that requires a particular key's value to
     * not be contained in the provided list of values.
     * @method notContainedIn
     * @param {String} key The key to check.
     * @param {Array} values The values that will not match.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'notContainedIn',
    value: function notContainedIn(key, value) {
      return this._addCondition(key, '$nin', value);
    }

    /**
     * Adds a constraint to the query that requires a particular key's value to
     * contain each one of the provided list of values.
     * @method containsAll
     * @param {String} key The key to check.  This key's value must be an array.
     * @param {Array} values The values that will match.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'containsAll',
    value: function containsAll(key, values) {
      return this._addCondition(key, '$all', values);
    }

    /**
     * Adds a constraint for finding objects that contain the given key.
     * @method exists
     * @param {String} key The key that should exist.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'exists',
    value: function exists(key) {
      return this._addCondition(key, '$exists', true);
    }

    /**
     * Adds a constraint for finding objects that do not contain a given key.
     * @method doesNotExist
     * @param {String} key The key that should not exist
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'doesNotExist',
    value: function doesNotExist(key) {
      return this._addCondition(key, '$exists', false);
    }

    /**
     * Adds a regular expression constraint for finding string values that match
     * the provided regular expression.
     * This may be slow for large datasets.
     * @method matches
     * @param {String} key The key that the string to match is stored in.
     * @param {RegExp} regex The regular expression pattern to match.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'matches',
    value: function matches(key, regex, modifiers) {
      this._addCondition(key, '$regex', regex);
      if (!modifiers) {
        modifiers = '';
      }
      if (regex.ignoreCase) {
        modifiers += 'i';
      }
      if (regex.multiline) {
        modifiers += 'm';
      }
      if (modifiers.length) {
        this._addCondition(key, '$options', modifiers);
      }
      return this;
    }

    /**
     * Adds a constraint that requires that a key's value matches a Parse.Query
     * constraint.
     * @method matchesQuery
     * @param {String} key The key that the contains the object to match the
     *                     query.
     * @param {Parse.Query} query The query that should match.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'matchesQuery',
    value: function matchesQuery(key, query) {
      var queryJSON = query.toJSON();
      queryJSON.className = query.className;
      return this._addCondition(key, '$inQuery', queryJSON);
    }

    /**
     * Adds a constraint that requires that a key's value not matches a
     * Parse.Query constraint.
     * @method doesNotMatchQuery
     * @param {String} key The key that the contains the object to match the
     *                     query.
     * @param {Parse.Query} query The query that should not match.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'doesNotMatchQuery',
    value: function doesNotMatchQuery(key, query) {
      var queryJSON = query.toJSON();
      queryJSON.className = query.className;
      return this._addCondition(key, '$notInQuery', queryJSON);
    }

    /**
     * Adds a constraint that requires that a key's value matches a value in
     * an object returned by a different Parse.Query.
     * @method matchesKeyInQuery
     * @param {String} key The key that contains the value that is being
     *                     matched.
     * @param {String} queryKey The key in the objects returned by the query to
     *                          match against.
     * @param {Parse.Query} query The query to run.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'matchesKeyInQuery',
    value: function matchesKeyInQuery(key, queryKey, query) {
      var queryJSON = query.toJSON();
      queryJSON.className = query.className;
      return this._addCondition(key, '$select', {
        key: queryKey,
        query: queryJSON
      });
    }

    /**
     * Adds a constraint that requires that a key's value not match a value in
     * an object returned by a different Parse.Query.
     * @method doesNotMatchKeyInQuery
     * @param {String} key The key that contains the value that is being
     *                     excluded.
     * @param {String} queryKey The key in the objects returned by the query to
     *                          match against.
     * @param {Parse.Query} query The query to run.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'doesNotMatchKeyInQuery',
    value: function doesNotMatchKeyInQuery(key, queryKey, query) {
      var queryJSON = query.toJSON();
      queryJSON.className = query.className;
      return this._addCondition(key, '$dontSelect', {
        key: queryKey,
        query: queryJSON
      });
    }

    /**
     * Adds a constraint for finding string values that contain a provided
     * string.  This may be slow for large datasets.
     * @method contains
     * @param {String} key The key that the string to match is stored in.
     * @param {String} substring The substring that the value must contain.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'contains',
    value: function contains(key, value) {
      if (typeof value !== 'string') {
        throw new Error('The value being searched for must be a string.');
      }
      return this._addCondition(key, '$regex', quote(value));
    }

    /**
     * Adds a constraint for finding string values that start with a provided
     * string.  This query will use the backend index, so it will be fast even
     * for large datasets.
     * @method startsWith
     * @param {String} key The key that the string to match is stored in.
     * @param {String} prefix The substring that the value must start with.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'startsWith',
    value: function startsWith(key, value) {
      if (typeof value !== 'string') {
        throw new Error('The value being searched for must be a string.');
      }
      return this._addCondition(key, '$regex', '^' + quote(value));
    }

    /**
     * Adds a constraint for finding string values that end with a provided
     * string.  This will be slow for large datasets.
     * @method endsWith
     * @param {String} key The key that the string to match is stored in.
     * @param {String} suffix The substring that the value must end with.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'endsWith',
    value: function endsWith(key, value) {
      if (typeof value !== 'string') {
        throw new Error('The value being searched for must be a string.');
      }
      return this._addCondition(key, '$regex', quote(value) + '$');
    }

    /**
     * Adds a proximity based constraint for finding objects with key point
     * values near the point given.
     * @method near
     * @param {String} key The key that the Parse.GeoPoint is stored in.
     * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'near',
    value: function near(key, point) {
      if (!(point instanceof _ParseGeoPoint2['default'])) {
        // Try to cast it as a GeoPoint
        point = new _ParseGeoPoint2['default'](point);
      }
      return this._addCondition(key, '$nearSphere', point);
    }

    /**
     * Adds a proximity based constraint for finding objects with key point
     * values near the point given and within the maximum distance given.
     * @method withinRadians
     * @param {String} key The key that the Parse.GeoPoint is stored in.
     * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
     * @param {Number} maxDistance Maximum distance (in radians) of results to
     *   return.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'withinRadians',
    value: function withinRadians(key, point, distance) {
      this.near(key, point);
      return this._addCondition(key, '$maxDistance', distance);
    }

    /**
     * Adds a proximity based constraint for finding objects with key point
     * values near the point given and within the maximum distance given.
     * Radius of earth used is 3958.8 miles.
     * @method withinMiles
     * @param {String} key The key that the Parse.GeoPoint is stored in.
     * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
     * @param {Number} maxDistance Maximum distance (in miles) of results to
     *     return.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'withinMiles',
    value: function withinMiles(key, point, distance) {
      return this.withinRadians(key, point, distance / 3958.8);
    }

    /**
     * Adds a proximity based constraint for finding objects with key point
     * values near the point given and within the maximum distance given.
     * Radius of earth used is 6371.0 kilometers.
     * @method withinKilometers
     * @param {String} key The key that the Parse.GeoPoint is stored in.
     * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
     * @param {Number} maxDistance Maximum distance (in kilometers) of results
     *     to return.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'withinKilometers',
    value: function withinKilometers(key, point, distance) {
      return this.withinRadians(key, point, distance / 6371.0);
    }

    /**
     * Adds a constraint to the query that requires a particular key's
     * coordinates be contained within a given rectangular geographic bounding
     * box.
     * @method withinGeoBox
     * @param {String} key The key to be constrained.
     * @param {Parse.GeoPoint} southwest
     *     The lower-left inclusive corner of the box.
     * @param {Parse.GeoPoint} northeast
     *     The upper-right inclusive corner of the box.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'withinGeoBox',
    value: function withinGeoBox(key, southwest, northeast) {
      if (!(southwest instanceof _ParseGeoPoint2['default'])) {
        southwest = new _ParseGeoPoint2['default'](southwest);
      }
      if (!(northeast instanceof _ParseGeoPoint2['default'])) {
        northeast = new _ParseGeoPoint2['default'](northeast);
      }
      this._addCondition(key, '$within', { '$box': [southwest, northeast] });
      return this;
    }

    /** Query Orderings **/

    /**
     * Sorts the results in ascending order by the given key.
     *
     * @method ascending
     * @param {(String|String[]|...String} key The key to order by, which is a
     * string of comma separated values, or an Array of keys, or multiple keys.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'ascending',
    value: function ascending() {
      this._order = [];

      for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
        keys[_key] = arguments[_key];
      }

      return this.addAscending.apply(this, keys);
    }

    /**
     * Sorts the results in ascending order by the given key,
     * but can also add secondary sort descriptors without overwriting _order.
     *
     * @method addAscending
     * @param {(String|String[]|...String} key The key to order by, which is a
     * string of comma separated values, or an Array of keys, or multiple keys.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'addAscending',
    value: function addAscending() {
      var _this3 = this;

      if (!this._order) {
        this._order = [];
      }

      for (var _len2 = arguments.length, keys = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        keys[_key2] = arguments[_key2];
      }

      keys.forEach(function (key) {
        if (Array.isArray(key)) {
          key = key.join();
        }
        _this3._order = _this3._order.concat(key.replace(/\s/g, '').split(','));
      });

      return this;
    }

    /**
     * Sorts the results in descending order by the given key.
     *
     * @method descending
     * @param {(String|String[]|...String} key The key to order by, which is a
     * string of comma separated values, or an Array of keys, or multiple keys.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'descending',
    value: function descending() {
      this._order = [];

      for (var _len3 = arguments.length, keys = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        keys[_key3] = arguments[_key3];
      }

      return this.addDescending.apply(this, keys);
    }

    /**
     * Sorts the results in descending order by the given key,
     * but can also add secondary sort descriptors without overwriting _order.
     *
     * @method addDescending
     * @param {(String|String[]|...String} key The key to order by, which is a
     * string of comma separated values, or an Array of keys, or multiple keys.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'addDescending',
    value: function addDescending() {
      var _this4 = this;

      if (!this._order) {
        this._order = [];
      }

      for (var _len4 = arguments.length, keys = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        keys[_key4] = arguments[_key4];
      }

      keys.forEach(function (key) {
        if (Array.isArray(key)) {
          key = key.join();
        }
        _this4._order = _this4._order.concat(key.replace(/\s/g, '').split(',').map(function (k) {
          return '-' + k;
        }));
      });

      return this;
    }

    /** Query Options **/

    /**
     * Sets the number of results to skip before returning any results.
     * This is useful for pagination.
     * Default is to skip zero results.
     * @method skip
     * @param {Number} n the number of results to skip.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'skip',
    value: function skip(n) {
      if (typeof n !== 'number' || n < 0) {
        throw new Error('You can only skip by a positive number');
      }
      this._skip = n;
      return this;
    }

    /**
     * Sets the limit of the number of results to return. The default limit is
     * 100, with a maximum of 1000 results being returned at a time.
     * @method limit
     * @param {Number} n the number of results to limit to.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'limit',
    value: function limit(n) {
      if (typeof n !== 'number') {
        throw new Error('You can only set the limit to a numeric value');
      }
      this._limit = n;
      return this;
    }

    /**
     * Includes nested Parse.Objects for the provided key.  You can use dot
     * notation to specify which fields in the included object are also fetched.
     * @method include
     * @param {String} key The name of the key to include.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'include',
    value: function include() {
      var _this5 = this;

      for (var _len5 = arguments.length, keys = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        keys[_key5] = arguments[_key5];
      }

      keys.forEach(function (key) {
        if (Array.isArray(key)) {
          _this5._include = _this5._include.concat(key);
        } else {
          _this5._include.push(key);
        }
      });
      return this;
    }

    /**
     * Restricts the fields of the returned Parse.Objects to include only the
     * provided keys.  If this is called multiple times, then all of the keys
     * specified in each of the calls will be included.
     * @method select
     * @param {Array} keys The names of the keys to include.
     * @return {Parse.Query} Returns the query, so you can chain this call.
     */
  }, {
    key: 'select',
    value: function select() {
      var _this6 = this;

      if (!this._select) {
        this._select = [];
      }

      for (var _len6 = arguments.length, keys = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        keys[_key6] = arguments[_key6];
      }

      keys.forEach(function (key) {
        if (Array.isArray(key)) {
          _this6._select = _this6._select.concat(key);
        } else {
          _this6._select.push(key);
        }
      });
      return this;
    }

    /**
     * Constructs a Parse.Query that is the OR of the passed in queries.  For
     * example:
     * <pre>var compoundQuery = Parse.Query.or(query1, query2, query3);</pre>
     *
     * will create a compoundQuery that is an or of the query1, query2, and
     * query3.
     * @method or
     * @param {...Parse.Query} var_args The list of queries to OR.
     * @static
     * @return {Parse.Query} The query that is the OR of the passed in queries.
     */
  }], [{
    key: 'or',
    value: function or() {
      var className = null;

      for (var _len7 = arguments.length, queries = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        queries[_key7] = arguments[_key7];
      }

      queries.forEach(function (q) {
        if (!className) {
          className = q.className;
        }

        if (className !== q.className) {
          throw new Error('All queries must be for the same class.');
        }
      });

      var query = new ParseQuery(className);
      query._orQuery(queries);
      return query;
    }
  }]);

  return ParseQuery;
})();

exports['default'] = ParseQuery;

_CoreManager2['default'].setQueryController({
  find: function find(className, params, options) {
    var RESTController = _CoreManager2['default'].getRESTController();

    return RESTController.request('GET', 'classes/' + className, params, options);
  }
});
module.exports = exports['default'];
},{"./CoreManager":5,"./ParseError":12,"./ParseGeoPoint":14,"./ParseObject":16,"./ParsePromise":18,"./encode":32,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/interop-require-default":49}],20:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ParseOp = require('./ParseOp');

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParseQuery = require('./ParseQuery');

var _ParseQuery2 = _interopRequireDefault(_ParseQuery);

/**
 * Creates a new Relation for the given parent object and key. This
 * constructor should rarely be used directly, but rather created by
 * Parse.Object.relation.
 * @class Parse.Relation
 * @constructor
 * @param {Parse.Object} parent The parent of this relation.
 * @param {String} key The key for this relation on the parent.
 *
 * <p>
 * A class that is used to access all of the children of a many-to-many
 * relationship.  Each instance of Parse.Relation is associated with a
 * particular parent object and key.
 * </p>
 */

var ParseRelation = (function () {
  function ParseRelation(parent, key) {
    _classCallCheck(this, ParseRelation);

    this.parent = parent;
    this.key = key;
    this.targetClassName = null;
  }

  /**
   * Makes sure that this relation has the right parent and key.
   */

  _createClass(ParseRelation, [{
    key: '_ensureParentAndKey',
    value: function _ensureParentAndKey(parent, key) {
      this.key = this.key || key;
      if (this.key !== key) {
        throw new Error('Internal Error. Relation retrieved from two different keys.');
      }
      if (this.parent) {
        if (this.parent.className !== parent.className) {
          throw new Error('Internal Error. Relation retrieved from two different Objects.');
        }
        if (this.parent.id) {
          if (this.parent.id !== parent.id) {
            throw new Error('Internal Error. Relation retrieved from two different Objects.');
          }
        } else if (parent.id) {
          this.parent = parent;
        }
      } else {
        this.parent = parent;
      }
    }

    /**
     * Adds a Parse.Object or an array of Parse.Objects to the relation.
     * @method add
     * @param {} objects The item or items to add.
     */
  }, {
    key: 'add',
    value: function add(objects) {
      if (!Array.isArray(objects)) {
        objects = [objects];
      }

      var change = new _ParseOp.RelationOp(objects, []);
      this.parent.set(this.key, change);
      this.targetClassName = change._targetClassName;
      return this.parent;
    }

    /**
     * Removes a Parse.Object or an array of Parse.Objects from this relation.
     * @method remove
     * @param {} objects The item or items to remove.
     */
  }, {
    key: 'remove',
    value: function remove(objects) {
      if (!Array.isArray(objects)) {
        objects = [objects];
      }

      var change = new _ParseOp.RelationOp([], objects);
      this.parent.set(this.key, change);
      this.targetClassName = change._targetClassName;
    }

    /**
     * Returns a JSON version of the object suitable for saving to disk.
     * @method toJSON
     * @return {Object}
     */
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        __type: 'Relation',
        className: this.targetClassName
      };
    }

    /**
     * Returns a Parse.Query that is limited to objects in this
     * relation.
     * @method query
     * @return {Parse.Query}
     */
  }, {
    key: 'query',
    value: function query() {
      var query;
      if (!this.targetClassName) {
        query = new _ParseQuery2['default'](this.parent.className);
        query._extraOptions.redirectClassNameForKey = this.key;
      } else {
        query = new _ParseQuery2['default'](this.targetClassName);
      }
      query._addCondition('$relatedTo', 'object', {
        __type: 'Pointer',
        className: this.parent.className,
        objectId: this.parent.id
      });
      query._addCondition('$relatedTo', 'key', this.key);

      return query;
    }
  }]);

  return ParseRelation;
})();

exports['default'] = ParseRelation;
module.exports = exports['default'];
},{"./ParseObject":16,"./ParseOp":17,"./ParseQuery":19,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/interop-require-default":49}],21:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

/**
 * Represents a Role on the Parse server. Roles represent groupings of
 * Users for the purposes of granting permissions (e.g. specifying an ACL
 * for an Object). Roles are specified by their sets of child users and
 * child roles, all of which are granted any permissions that the parent
 * role has.
 *
 * <p>Roles must have a name (which cannot be changed after creation of the
 * role), and must specify an ACL.</p>
 * @class Parse.Role
 * @constructor
 * @param {String} name The name of the Role to create.
 * @param {Parse.ACL} acl The ACL for this role. Roles must have an ACL.
 * A Parse.Role is a local representation of a role persisted to the Parse
 * cloud.
 */
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ParseACL = require('./ParseACL');

var _ParseACL2 = _interopRequireDefault(_ParseACL);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = _interopRequireDefault(_ParseObject2);

var ParseRole = (function (_ParseObject) {
  _inherits(ParseRole, _ParseObject);

  function ParseRole(name, acl) {
    _classCallCheck(this, ParseRole);

    _get(Object.getPrototypeOf(ParseRole.prototype), 'constructor', this).call(this, '_Role');
    if (typeof name === 'string' && acl instanceof _ParseACL2['default']) {
      this.setName(name);
      this.setACL(acl);
    }
  }

  /**
   * Gets the name of the role.  You can alternatively call role.get("name")
   *
   * @method getName
   * @return {String} the name of the role.
   */

  _createClass(ParseRole, [{
    key: 'getName',
    value: function getName() {
      return this.get('name');
    }

    /**
     * Sets the name for a role. This value must be set before the role has
     * been saved to the server, and cannot be set once the role has been
     * saved.
     *
     * <p>
     *   A role's name can only contain alphanumeric characters, _, -, and
     *   spaces.
     * </p>
     *
     * <p>This is equivalent to calling role.set("name", name)</p>
     *
     * @method setName
     * @param {String} name The name of the role.
     * @param {Object} options Standard options object with success and error
     *     callbacks.
     */
  }, {
    key: 'setName',
    value: function setName(name, options) {
      return this.set('name', name, options);
    }

    /**
     * Gets the Parse.Relation for the Parse.Users that are direct
     * children of this role. These users are granted any privileges that this
     * role has been granted (e.g. read or write access through ACLs). You can
     * add or remove users from the role through this relation.
     *
     * <p>This is equivalent to calling role.relation("users")</p>
     *
     * @method getUsers
     * @return {Parse.Relation} the relation for the users belonging to this
     *     role.
     */
  }, {
    key: 'getUsers',
    value: function getUsers() {
      return this.relation('users');
    }

    /**
     * Gets the Parse.Relation for the Parse.Roles that are direct
     * children of this role. These roles' users are granted any privileges that
     * this role has been granted (e.g. read or write access through ACLs). You
     * can add or remove child roles from this role through this relation.
     *
     * <p>This is equivalent to calling role.relation("roles")</p>
     *
     * @method getRoles
     * @return {Parse.Relation} the relation for the roles belonging to this
     *     role.
     */
  }, {
    key: 'getRoles',
    value: function getRoles() {
      return this.relation('roles');
    }
  }, {
    key: 'validate',
    value: function validate(attrs, options) {
      var isInvalid = _get(Object.getPrototypeOf(ParseRole.prototype), 'validate', this).call(this, attrs, options);
      if (isInvalid) {
        return isInvalid;
      }

      if ('name' in attrs && attrs.name !== this.getName()) {
        var newName = attrs.name;
        if (this.id && this.id !== attrs.objectId) {
          // Check to see if the objectId being set matches this.id
          // This happens during a fetch -- the id is set before calling fetch
          // Let the name be set in this case
          return new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'A role\'s name can only be set before it has been saved.');
        }
        if (typeof newName !== 'string') {
          return new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'A role\'s name must be a String.');
        }
        if (!/^[0-9a-zA-Z\-_ ]+$/.test(newName)) {
          return new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'A role\'s name can be only contain alphanumeric characters, _, ' + '-, and spaces.');
        }
      }
      return false;
    }
  }]);

  return ParseRole;
})(_ParseObject3['default']);

exports['default'] = ParseRole;

_ParseObject3['default'].registerSubclass('_Role', ParseRole);
module.exports = exports['default'];
},{"./ParseACL":10,"./ParseError":12,"./ParseObject":16,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/get":47,"babel-runtime/helpers/inherits":48,"babel-runtime/helpers/interop-require-default":49}],22:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

/**
 * @class Parse.Session
 * @constructor
 *
 * <p>A Parse.Session object is a local representation of a revocable session.
 * This class is a subclass of a Parse.Object, and retains the same
 * functionality of a Parse.Object.</p>
 */
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _isRevocableSession = require('./isRevocableSession');

var _isRevocableSession2 = _interopRequireDefault(_isRevocableSession);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = _interopRequireDefault(_ParseObject2);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _ParseUser = require('./ParseUser');

var _ParseUser2 = _interopRequireDefault(_ParseUser);

var ParseSession = (function (_ParseObject) {
  _inherits(ParseSession, _ParseObject);

  function ParseSession(attributes) {
    _classCallCheck(this, ParseSession);

    _get(Object.getPrototypeOf(ParseSession.prototype), 'constructor', this).call(this, '_Session');
    if (attributes && typeof attributes === 'object') {
      if (!this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Session');
      }
    }
  }

  /**
   * Returns the session token string.
   * @method getSessionToken
   * @return {String}
   */

  _createClass(ParseSession, [{
    key: 'getSessionToken',
    value: function getSessionToken() {
      return this.get('sessionToken');
    }
  }], [{
    key: 'readOnlyAttributes',
    value: function readOnlyAttributes() {
      return ['createdWith', 'expiresAt', 'installationId', 'restricted', 'sessionToken', 'user'];
    }

    /**
     * Retrieves the Session object for the currently logged in session.
     * @method current
     * @static
     * @return {Parse.Promise} A promise that is resolved with the Parse.Session
     *   object after it has been fetched. If there is no current user, the
     *   promise will be rejected.
     */
  }, {
    key: 'current',
    value: function current(options) {
      options = options || {};
      var controller = _CoreManager2['default'].getSessionController();

      var sessionOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        sessionOptions.useMasterKey = options.useMasterKey;
      }
      return _ParseUser2['default'].currentAsync().then(function (user) {
        if (!user) {
          return _ParsePromise2['default'].error('There is no current user.');
        }
        var token = user.getSessionToken();
        sessionOptions.sessionToken = user.getSessionToken();
        return controller.getSession(sessionOptions);
      });
    }

    /**
     * Determines whether the current session token is revocable.
     * This method is useful for migrating Express.js or Node.js web apps to
     * use revocable sessions. If you are migrating an app that uses the Parse
     * SDK in the browser only, please use Parse.User.enableRevocableSession()
     * instead, so that sessions can be automatically upgraded.
     * @method isCurrentSessionRevocable
     * @static
     * @return {Boolean}
     */
  }, {
    key: 'isCurrentSessionRevocable',
    value: function isCurrentSessionRevocable() {
      var currentUser = _ParseUser2['default'].current();
      if (currentUser) {
        return (0, _isRevocableSession2['default'])(currentUser.getSessionToken() || '');
      }
      return false;
    }
  }]);

  return ParseSession;
})(_ParseObject3['default']);

exports['default'] = ParseSession;

_ParseObject3['default'].registerSubclass('_Session', ParseSession);

_CoreManager2['default'].setSessionController({
  getSession: function getSession(options) {
    var RESTController = _CoreManager2['default'].getRESTController();
    var session = new ParseSession();

    return RESTController.request('GET', 'sessions/me', {}, options).then(function (sessionData) {
      session._finishFetch(sessionData);
      session._setExisted(true);
      return session;
    });
  }
});
module.exports = exports['default'];
},{"./CoreManager":5,"./ParseObject":16,"./ParsePromise":18,"./ParseUser":23,"./isRevocableSession":35,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/get":47,"babel-runtime/helpers/inherits":48,"babel-runtime/helpers/interop-require-default":49}],23:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _isRevocableSession = require('./isRevocableSession');

var _isRevocableSession2 = _interopRequireDefault(_isRevocableSession);

var _ObjectState = require('./ObjectState');

var ObjectState = _interopRequireWildcard(_ObjectState);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = _interopRequireDefault(_ParseObject2);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _ParseSession = require('./ParseSession');

var _ParseSession2 = _interopRequireDefault(_ParseSession);

var _Storage = require('./Storage');

var _Storage2 = _interopRequireDefault(_Storage);

var CURRENT_USER_KEY = 'currentUser';
var canUseCurrentUser = !_CoreManager2['default'].get('IS_NODE');
var currentUserCacheMatchesDisk = false;
var currentUserCache = null;

var authProviders = {};

/**
 * @class Parse.User
 * @constructor
 *
 * <p>A Parse.User object is a local representation of a user persisted to the
 * Parse cloud. This class is a subclass of a Parse.Object, and retains the
 * same functionality of a Parse.Object, but also extends it with various
 * user specific methods, like authentication, signing up, and validation of
 * uniqueness.</p>
 */

var ParseUser = (function (_ParseObject) {
  _inherits(ParseUser, _ParseObject);

  function ParseUser(attributes) {
    _classCallCheck(this, ParseUser);

    _get(Object.getPrototypeOf(ParseUser.prototype), 'constructor', this).call(this, '_User');
    if (attributes && typeof attributes === 'object') {
      if (!this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Parse User');
      }
    }
  }

  /**
   * Request a revocable session token to replace the older style of token.
   * @method _upgradeToRevocableSession
   * @param {Object} options A Backbone-style options object.
   * @return {Parse.Promise} A promise that is resolved when the replacement
   *   token has been fetched.
   */

  _createClass(ParseUser, [{
    key: '_upgradeToRevocableSession',
    value: function _upgradeToRevocableSession(options) {
      options = options || {};

      var upgradeOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        upgradeOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager2['default'].getUserController();
      return controller.upgradeToRevocableSession(this, upgradeOptions)._thenRunCallbacks(options);
    }

    /**
     * Unlike in the Android/iOS SDKs, logInWith is unnecessary, since you can
     * call linkWith on the user (even if it doesn't exist yet on the server).
     * @method _linkWith
     */
  }, {
    key: '_linkWith',
    value: function _linkWith(provider, options) {
      var _this = this;

      var authType;
      if (typeof provider === 'string') {
        authType = provider;
        provider = authProviders[provider];
      } else {
        authType = provider.getAuthType();
      }
      if (options && options.hasOwnProperty('authData')) {
        var authData = this.get('authData') || {};
        authData[authType] = options.authData;

        var controller = _CoreManager2['default'].getUserController();
        return controller.linkWith(this, authData)._thenRunCallbacks(options, this);
      } else {
        var promise = new _ParsePromise2['default']();
        provider.authenticate({
          success: function success(provider, result) {
            var opts = {};
            opts.authData = result;
            if (options.success) {
              opts.success = options.success;
            }
            if (options.error) {
              opts.error = options.error;
            }
            _this._linkWith(provider, opts).then(function () {
              promise.resolve(_this);
            }, function (error) {
              promise.reject(error);
            });
          },
          error: function error(provider, _error) {
            if (options.error) {
              options.error(_this, _error);
            }
            promise.reject(_error);
          }
        });
        return promise;
      }
    }

    /**
     * Synchronizes auth data for a provider (e.g. puts the access token in the
     * right place to be used by the Facebook SDK).
     * @method _synchronizeAuthData
     */
  }, {
    key: '_synchronizeAuthData',
    value: function _synchronizeAuthData(provider) {
      if (!this.isCurrent() || !provider) {
        return;
      }
      var authType;
      if (typeof provider === 'string') {
        authType = provider;
        provider = authProviders[authType];
      } else {
        authType = provider.getAuthType();
      }
      var authData = this.get('authData');
      if (!provider || typeof authData !== 'object') {
        return;
      }
      var success = provider.restoreAuthentication(authData[authType]);
      if (!success) {
        this._unlinkFrom(provider);
      }
    }

    /**
     * Synchronizes authData for all providers.
     * @method _synchronizeAllAuthData
     */
  }, {
    key: '_synchronizeAllAuthData',
    value: function _synchronizeAllAuthData() {
      var authData = this.get('authData');
      if (typeof authData !== 'object') {
        return;
      }

      for (var key in authData) {
        this._synchronizeAuthData(key);
      }
    }

    /**
     * Removes null values from authData (which exist temporarily for
     * unlinking)
     * @method _cleanupAuthData
     */
  }, {
    key: '_cleanupAuthData',
    value: function _cleanupAuthData() {
      if (!this.isCurrent()) {
        return;
      }
      var authData = this.get('authData');
      if (typeof authData !== 'object') {
        return;
      }

      for (var key in authData) {
        if (!authData[key]) {
          delete authData[key];
        }
      }
    }

    /**
     * Unlinks a user from a service.
     * @method _unlinkFrom
     */
  }, {
    key: '_unlinkFrom',
    value: function _unlinkFrom(provider, options) {
      var _this2 = this;

      var authType;
      if (typeof provider === 'string') {
        authType = provider;
        provider = authProviders[provider];
      } else {
        authType = provider.getAuthType();
      }
      return this._linkWith(provider, { authData: null }).then(function () {
        _this2._synchronizeAuthData(provider);
        return _ParsePromise2['default'].as(_this2);
      })._thenRunCallbacks(options);
    }

    /**
     * Checks whether a user is linked to a service.
     * @method _isLinked
     */
  }, {
    key: '_isLinked',
    value: function _isLinked(provider) {
      var authType;
      if (typeof provider === 'string') {
        authType = provider;
      } else {
        authType = provider.getAuthType();
      }
      var authData = this.get('authData') || {};
      return !!authData[authType];
    }

    /**
     * Deauthenticates all providers.
     * @method _logOutWithAll
     */
  }, {
    key: '_logOutWithAll',
    value: function _logOutWithAll() {
      var authData = this.get('authData');
      if (typeof authData !== 'object') {
        return;
      }

      for (var key in authData) {
        this._logOutWith(key);
      }
    }

    /**
     * Deauthenticates a single provider (e.g. removing access tokens from the
     * Facebook SDK).
     * @method _logOutWith
     */
  }, {
    key: '_logOutWith',
    value: function _logOutWith(provider) {
      if (!this.isCurrent()) {
        return;
      }
      if (typeof provider === 'string') {
        provider = authProviders[provider];
      }
      if (provider && provider.deauthenticate) {
        provider.deauthenticate();
      }
    }

    /**
     * Returns true if <code>current</code> would return this user.
     * @method isCurrent
     * @return {Boolean}
     */
  }, {
    key: 'isCurrent',
    value: function isCurrent() {
      var current = ParseUser.current();
      return !!current && current.id === this.id;
    }

    /**
     * Returns get("username").
     * @method getUsername
     * @return {String}
     */
  }, {
    key: 'getUsername',
    value: function getUsername() {
      return this.get('username');
    }

    /**
     * Calls set("username", username, options) and returns the result.
     * @method setUsername
     * @param {String} username
     * @param {Object} options A Backbone-style options object.
     * @return {Boolean}
     */
  }, {
    key: 'setUsername',
    value: function setUsername(username) {
      // Strip anonymity, even we do not support anonymous user in js SDK, we may
      // encounter anonymous user created by android/iOS in cloud code.
      var authData = this.get('authData');
      if (authData && authData.hasOwnProperty('anonymous')) {
        // We need to set anonymous to null instead of deleting it in order to remove it from Parse.
        authData.anonymous = null;
      }
      this.set('username', username);
    }

    /**
     * Calls set("password", password, options) and returns the result.
     * @method setPassword
     * @param {String} password
     * @param {Object} options A Backbone-style options object.
     * @return {Boolean}
     */
  }, {
    key: 'setPassword',
    value: function setPassword(password) {
      this.set('password', password);
    }

    /**
     * Returns get("email").
     * @method getEmail
     * @return {String}
     */
  }, {
    key: 'getEmail',
    value: function getEmail() {
      return this.get('email');
    }

    /**
     * Calls set("email", email, options) and returns the result.
     * @method setEmail
     * @param {String} email
     * @param {Object} options A Backbone-style options object.
     * @return {Boolean}
     */
  }, {
    key: 'setEmail',
    value: function setEmail(email) {
      this.set('email', email);
    }

    /**
     * Returns the session token for this user, if the user has been logged in,
     * or if it is the result of a query with the master key. Otherwise, returns
     * undefined.
     * @method getSessionToken
     * @return {String} the session token, or undefined
     */
  }, {
    key: 'getSessionToken',
    value: function getSessionToken() {
      return this.get('sessionToken');
    }

    /**
     * Checks whether this user is the current user and has been authenticated.
     * @method authenticated
     * @return (Boolean) whether this user is the current user and is logged in.
     */
  }, {
    key: 'authenticated',
    value: function authenticated() {
      var current = ParseUser.current();
      return !!this.get('sessionToken') && !!current && current.id === this.id;
    }

    /**
     * Signs up a new user. You should call this instead of save for
     * new Parse.Users. This will create a new Parse.User on the server, and
     * also persist the session on disk so that you can access the user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling signUp.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @method signUp
     * @param {Object} attrs Extra fields to set on the new user, or null.
     * @param {Object} options A Backbone-style options object.
     * @return {Parse.Promise} A promise that is fulfilled when the signup
     *     finishes.
     */
  }, {
    key: 'signUp',
    value: function signUp(attrs, options) {
      options = options || {};

      var signupOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        signupOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager2['default'].getUserController();
      return controller.signUp(this, attrs, signupOptions)._thenRunCallbacks(options, this);
    }

    /**
     * Logs in a Parse.User. On success, this saves the session to disk,
     * so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling logIn.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @method logIn
     * @param {Object} options A Backbone-style options object.
     * @return {Parse.Promise} A promise that is fulfilled with the user when
     *     the login is complete.
     */
  }, {
    key: 'logIn',
    value: function logIn(options) {
      options = options || {};

      var loginOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        loginOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager2['default'].getUserController();
      return controller.logIn(this, loginOptions)._thenRunCallbacks(options, this);
    }

    /**
     * Wrap the default save behavior with functionality to save to local
     * storage if this is current user.
     */
  }, {
    key: 'save',
    value: function save() {
      var _this3 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _get(Object.getPrototypeOf(ParseUser.prototype), 'save', this).apply(this, args).then(function () {
        if (_this3.isCurrent()) {
          return _CoreManager2['default'].getUserController().updateUserOnDisk(_this3);
        }
        return _this3;
      });
    }

    /**
     * Wrap the default fetch behavior with functionality to save to local
     * storage if this is current user.
     */
  }, {
    key: 'fetch',
    value: function fetch() {
      var _this4 = this;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _get(Object.getPrototypeOf(ParseUser.prototype), 'fetch', this).apply(this, args).then(function () {
        if (_this4.isCurrent()) {
          return _CoreManager2['default'].getUserController().updateUserOnDisk(_this4);
        }
        return _this4;
      });
    }
  }], [{
    key: 'readOnlyAttributes',
    value: function readOnlyAttributes() {
      return ['sessionToken'];
    }

    /**
     * Adds functionality to the existing Parse.User class
     * @method extend
     * @param {Object} protoProps A set of properties to add to the prototype
     * @param {Object} classProps A set of static properties to add to the class
     * @static
     * @return {Class} The newly extended Parse.User class
     */
  }, {
    key: 'extend',
    value: function extend(protoProps, classProps) {
      if (protoProps) {
        for (var prop in protoProps) {
          if (prop !== 'className') {
            _Object$defineProperty(ParseUser.prototype, prop, {
              value: protoProps[prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      if (classProps) {
        for (var prop in classProps) {
          if (prop !== 'className') {
            _Object$defineProperty(ParseUser, prop, {
              value: classProps[prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      return ParseUser;
    }

    /**
     * Retrieves the currently logged in ParseUser with a valid session,
     * either from memory or localStorage, if necessary.
     * @method current
     * @static
     * @return {Parse.Object} The currently logged in Parse.User.
     */
  }, {
    key: 'current',
    value: function current() {
      if (!canUseCurrentUser) {
        return null;
      }
      var controller = _CoreManager2['default'].getUserController();
      return controller.currentUser();
    }

    /**
     * Retrieves the currently logged in ParseUser from asynchronous Storage.
     * @method currentAsync
     * @static
     * @return {Parse.Promise} A Promise that is resolved with the currently
     *   logged in Parse User
     */
  }, {
    key: 'currentAsync',
    value: function currentAsync() {
      if (!canUseCurrentUser) {
        return _ParsePromise2['default'].as(null);
      }
      var controller = _CoreManager2['default'].getUserController();
      return controller.currentUserAsync();
    }

    /**
     * Signs up a new user with a username (or email) and password.
     * This will create a new Parse.User on the server, and also persist the
     * session in localStorage so that you can access the user using
     * {@link #current}.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @method signUp
     * @param {String} username The username (or email) to sign up with.
     * @param {String} password The password to sign up with.
     * @param {Object} attrs Extra fields to set on the new user.
     * @param {Object} options A Backbone-style options object.
     * @static
     * @return {Parse.Promise} A promise that is fulfilled with the user when
     *     the signup completes.
     */
  }, {
    key: 'signUp',
    value: function signUp(username, password, attrs, options) {
      attrs = attrs || {};
      attrs.username = username;
      attrs.password = password;
      var user = new ParseUser(attrs);
      return user.signUp({}, options);
    }

    /**
     * Logs in a user with a username (or email) and password. On success, this
     * saves the session to disk, so you can retrieve the currently logged in
     * user using <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @method logIn
     * @param {String} username The username (or email) to log in with.
     * @param {String} password The password to log in with.
     * @param {Object} options A Backbone-style options object.
     * @static
     * @return {Parse.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     */
  }, {
    key: 'logIn',
    value: function logIn(username, password, options) {
      var user = new ParseUser();
      user._finishFetch({ username: username, password: password });
      return user.logIn(options);
    }

    /**
     * Logs in a user with a session token. On success, this saves the session
     * to disk, so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @method become
     * @param {String} sessionToken The sessionToken to log in with.
     * @param {Object} options A Backbone-style options object.
     * @static
     * @return {Parse.Promise} A promise that is fulfilled with the user when
     *     the login completes.
     */
  }, {
    key: 'become',
    value: function become(sessionToken, options) {
      if (!canUseCurrentUser) {
        throw new Error('It is not memory-safe to become a user in a server environment');
      }
      options = options || {};

      var becomeOptions = {
        sessionToken: sessionToken
      };
      if (options.hasOwnProperty('useMasterKey')) {
        becomeOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager2['default'].getUserController();
      return controller.become(becomeOptions)._thenRunCallbacks(options);
    }
  }, {
    key: 'logInWith',
    value: function logInWith(provider, options) {
      return ParseUser._logInWith(provider, options);
    }

    /**
     * Logs out the currently logged in user session. This will remove the
     * session from disk, log out of linked services, and future calls to
     * <code>current</code> will return <code>null</code>.
     * @method logOut
     * @static
     * @return {Parse.Promise} A promise that is resolved when the session is
     *   destroyed on the server.
     */
  }, {
    key: 'logOut',
    value: function logOut() {
      if (!canUseCurrentUser) {
        throw new Error('There is no current user user on a node.js server environment.');
      }

      var controller = _CoreManager2['default'].getUserController();
      return controller.logOut();
    }

    /**
     * Requests a password reset email to be sent to the specified email address
     * associated with the user account. This email allows the user to securely
     * reset their password on the Parse site.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
     * @method requestPasswordReset
     * @param {String} email The email address associated with the user that
     *     forgot their password.
     * @param {Object} options A Backbone-style options object.
     * @static
     */
  }, {
    key: 'requestPasswordReset',
    value: function requestPasswordReset(email, options) {
      options = options || {};

      var requestOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        requestOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager2['default'].getUserController();
      return controller.requestPasswordReset(email, requestOptions)._thenRunCallbacks(options);
    }

    /**
     * Allow someone to define a custom User class without className
     * being rewritten to _User. The default behavior is to rewrite
     * User to _User for legacy reasons. This allows developers to
     * override that behavior.
     *
     * @method allowCustomUserClass
     * @param {Boolean} isAllowed Whether or not to allow custom User class
     * @static
     */
  }, {
    key: 'allowCustomUserClass',
    value: function allowCustomUserClass(isAllowed) {
      _CoreManager2['default'].set('PERFORM_USER_REWRITE', !isAllowed);
    }

    /**
     * Allows a legacy application to start using revocable sessions. If the
     * current session token is not revocable, a request will be made for a new,
     * revocable session.
     * It is not necessary to call this method from cloud code unless you are
     * handling user signup or login from the server side. In a cloud code call,
     * this function will not attempt to upgrade the current token.
     * @method enableRevocableSession
     * @param {Object} options A Backbone-style options object.
     * @static
     * @return {Parse.Promise} A promise that is resolved when the process has
     *   completed. If a replacement session token is requested, the promise
     *   will be resolved after a new token has been fetched.
     */
  }, {
    key: 'enableRevocableSession',
    value: function enableRevocableSession(options) {
      options = options || {};
      _CoreManager2['default'].set('FORCE_REVOCABLE_SESSION', true);
      if (canUseCurrentUser) {
        var current = ParseUser.current();
        if (current) {
          return current._upgradeToRevocableSession(options);
        }
      }
      return _ParsePromise2['default'].as()._thenRunCallbacks(options);
    }

    /**
     * Enables the use of become or the current user in a server
     * environment. These features are disabled by default, since they depend on
     * global objects that are not memory-safe for most servers.
     * @method enableUnsafeCurrentUser
     * @static
     */
  }, {
    key: 'enableUnsafeCurrentUser',
    value: function enableUnsafeCurrentUser() {
      canUseCurrentUser = true;
    }

    /**
     * Disables the use of become or the current user in any environment.
     * These features are disabled on servers by default, since they depend on
     * global objects that are not memory-safe for most servers.
     * @method disableUnsafeCurrentUser
     * @static
     */
  }, {
    key: 'disableUnsafeCurrentUser',
    value: function disableUnsafeCurrentUser() {
      canUseCurrentUser = false;
    }
  }, {
    key: '_registerAuthenticationProvider',
    value: function _registerAuthenticationProvider(provider) {
      authProviders[provider.getAuthType()] = provider;
      // Synchronize the current user with the auth provider.
      ParseUser.currentAsync().then(function (current) {
        if (current) {
          current._synchronizeAuthData(provider.getAuthType());
        }
      });
    }
  }, {
    key: '_logInWith',
    value: function _logInWith(provider, options) {
      var user = new ParseUser();
      return user._linkWith(provider, options);
    }
  }, {
    key: '_clearCache',
    value: function _clearCache() {
      currentUserCache = null;
      currentUserCacheMatchesDisk = false;
    }
  }, {
    key: '_setCurrentUserCache',
    value: function _setCurrentUserCache(user) {
      currentUserCache = user;
    }
  }]);

  return ParseUser;
})(_ParseObject3['default']);

exports['default'] = ParseUser;

_ParseObject3['default'].registerSubclass('_User', ParseUser);

var DefaultController = {
  updateUserOnDisk: function updateUserOnDisk(user) {
    var path = _Storage2['default'].generatePath(CURRENT_USER_KEY);
    var json = user.toJSON();
    json.className = '_User';
    return _Storage2['default'].setItemAsync(path, JSON.stringify(json)).then(function () {
      return user;
    });
  },

  setCurrentUser: function setCurrentUser(user) {
    currentUserCache = user;
    user._cleanupAuthData();
    user._synchronizeAllAuthData();
    return DefaultController.updateUserOnDisk(user);
  },

  currentUser: function currentUser() {
    if (currentUserCache) {
      return currentUserCache;
    }
    if (currentUserCacheMatchesDisk) {
      return null;
    }
    if (_Storage2['default'].async()) {
      throw new Error('Cannot call currentUser() when using a platform with an async ' + 'storage system. Call currentUserAsync() instead.');
    }
    var path = _Storage2['default'].generatePath(CURRENT_USER_KEY);
    var userData = _Storage2['default'].getItem(path);
    currentUserCacheMatchesDisk = true;
    if (!userData) {
      currentUserCache = null;
      return null;
    }
    userData = JSON.parse(userData);
    if (!userData.className) {
      userData.className = '_User';
    }
    if (userData._id) {
      if (userData.objectId !== userData._id) {
        userData.objectId = userData._id;
      }
      delete userData._id;
    }
    if (userData._sessionToken) {
      userData.sessionToken = userData._sessionToken;
      delete userData._sessionToken;
    }
    var current = ParseUser.fromJSON(userData);
    currentUserCache = current;
    current._synchronizeAllAuthData();
    return current;
  },

  currentUserAsync: function currentUserAsync() {
    if (currentUserCache) {
      return _ParsePromise2['default'].as(currentUserCache);
    }
    if (currentUserCacheMatchesDisk) {
      return _ParsePromise2['default'].as(null);
    }
    var path = _Storage2['default'].generatePath(CURRENT_USER_KEY);
    return _Storage2['default'].getItemAsync(path).then(function (userData) {
      currentUserCacheMatchesDisk = true;
      if (!userData) {
        currentUserCache = null;
        return _ParsePromise2['default'].as(null);
      }
      userData = JSON.parse(userData);
      if (!userData.className) {
        userData.className = '_User';
      }
      if (userData._id) {
        if (userData.objectId !== userData._id) {
          userData.objectId = userData._id;
        }
        delete userData._id;
      }
      if (userData._sessionToken) {
        userData.sessionToken = userData._sessionToken;
        delete userData._sessionToken;
      }
      var current = ParseUser.fromJSON(userData);
      currentUserCache = current;
      current._synchronizeAllAuthData();
      return _ParsePromise2['default'].as(current);
    });
  },

  signUp: function signUp(user, attrs, options) {
    var username = attrs && attrs.username || user.get('username');
    var password = attrs && attrs.password || user.get('password');

    if (!username || !username.length) {
      return _ParsePromise2['default'].error(new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'Cannot sign up user with an empty name.'));
    }
    if (!password || !password.length) {
      return _ParsePromise2['default'].error(new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'Cannot sign up user with an empty password.'));
    }

    return user.save(attrs, options).then(function () {
      // Clear the password field
      user._finishFetch({ password: undefined });

      if (canUseCurrentUser) {
        return DefaultController.setCurrentUser(user);
      }
      return user;
    });
  },

  logIn: function logIn(user, options) {
    var RESTController = _CoreManager2['default'].getRESTController();
    var auth = {
      username: user.get('username'),
      password: user.get('password')
    };
    return RESTController.request('GET', 'login', auth, options).then(function (response, status) {
      user._migrateId(response.objectId);
      user._setExisted(true);
      ObjectState.setPendingOp(user.className, user._getId(), 'username', undefined);
      ObjectState.setPendingOp(user.className, user._getId(), 'password', undefined);
      response.password = undefined;
      user._finishFetch(response);
      if (!canUseCurrentUser) {
        // We can't set the current user, so just return the one we logged in
        return _ParsePromise2['default'].as(user);
      }
      return DefaultController.setCurrentUser(user);
    });
  },

  become: function become(options) {
    var user = new ParseUser();
    var RESTController = _CoreManager2['default'].getRESTController();
    return RESTController.request('GET', 'users/me', {}, options).then(function (response, status) {
      user._finishFetch(response);
      user._setExisted(true);
      return DefaultController.setCurrentUser(user);
    });
  },

  logOut: function logOut() {
    return DefaultController.currentUserAsync().then(function (currentUser) {
      var path = _Storage2['default'].generatePath(CURRENT_USER_KEY);
      var promise = _Storage2['default'].removeItemAsync(path);
      var RESTController = _CoreManager2['default'].getRESTController();
      if (currentUser !== null) {
        var currentSession = currentUser.getSessionToken();
        if (currentSession && (0, _isRevocableSession2['default'])(currentSession)) {
          promise = promise.then(function () {
            return RESTController.request('POST', 'logout', {}, { sessionToken: currentSession });
          });
        }
        currentUser._logOutWithAll();
        currentUser._finishFetch({ sessionToken: undefined });
      }
      currentUserCacheMatchesDisk = true;
      currentUserCache = null;

      return promise;
    });
  },

  requestPasswordReset: function requestPasswordReset(email, options) {
    var RESTController = _CoreManager2['default'].getRESTController();
    return RESTController.request('POST', 'requestPasswordReset', { email: email }, options);
  },

  upgradeToRevocableSession: function upgradeToRevocableSession(user, options) {
    var token = user.getSessionToken();
    if (!token) {
      return _ParsePromise2['default'].error(new _ParseError2['default'](_ParseError2['default'].SESSION_MISSING, 'Cannot upgrade a user with no session token'));
    }

    options.sessionToken = token;

    var RESTController = _CoreManager2['default'].getRESTController();
    return RESTController.request('POST', 'upgradeToRevocableSession', {}, options).then(function (result) {
      var session = new _ParseSession2['default']();
      session._finishFetch(result);
      user._finishFetch({ sessionToken: session.getSessionToken() });
      if (user.isCurrent()) {
        return DefaultController.setCurrentUser(user);
      }
      return _ParsePromise2['default'].as(user);
    });
  },

  linkWith: function linkWith(user, authData) {
    return user.save({ authData: authData }).then(function () {
      if (canUseCurrentUser) {
        return DefaultController.setCurrentUser(user);
      }
      return user;
    });
  }
};

_CoreManager2['default'].setUserController(DefaultController);
module.exports = exports['default'];
},{"./CoreManager":5,"./ObjectState":8,"./ParseError":12,"./ParseObject":16,"./ParsePromise":18,"./ParseSession":22,"./Storage":26,"./isRevocableSession":35,"babel-runtime/core-js/object/define-property":40,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/get":47,"babel-runtime/helpers/inherits":48,"babel-runtime/helpers/interop-require-default":49,"babel-runtime/helpers/interop-require-wildcard":50}],24:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.send = send;

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _ParseQuery = require('./ParseQuery');

var _ParseQuery2 = _interopRequireDefault(_ParseQuery);

/**
 * Contains functions to deal with Push in Parse.
 * @class Parse.Push
 * @static
 */

/**
 * Sends a push notification.
 * @method send
 * @param {Object} data -  The data of the push notification.  Valid fields
 * are:
 *   <ol>
 *     <li>channels - An Array of channels to push to.</li>
 *     <li>push_time - A Date object for when to send the push.</li>
 *     <li>expiration_time -  A Date object for when to expire
 *         the push.</li>
 *     <li>expiration_interval - The seconds from now to expire the push.</li>
 *     <li>where - A Parse.Query over Parse.Installation that is used to match
 *         a set of installations to push to.</li>
 *     <li>data - The data to send as part of the push</li>
 *   <ol>
 * @param {Object} options An object that has an optional success function,
 * that takes no arguments and will be called on a successful push, and
 * an error function that takes a Parse.Error and will be called if the push
 * failed.
 * @return {Parse.Promise} A promise that is fulfilled when the push request
 *     completes.
 */

function send(data, options) {
  options = options || {};

  if (data.where && data.where instanceof _ParseQuery2['default']) {
    data.where = data.where.toJSON().where;
  }

  if (data.push_time && typeof data.push_time === 'object') {
    data.push_time = data.push_time.toJSON();
  }

  if (data.expiration_time && typeof data.expiration_time === 'object') {
    data.expiration_time = data.expiration_time.toJSON();
  }

  if (data.expiration_time && data.expiration_interval) {
    throw new Error('expiration_time and expiration_interval cannot both be set.');
  }

  return _CoreManager2['default'].getPushController().send(data, {
    useMasterKey: options.useMasterKey
  })._thenRunCallbacks(options);
}

_CoreManager2['default'].setPushController({
  send: function send(data, options) {
    var RESTController = _CoreManager2['default'].getRESTController();

    var request = RESTController.request('POST', 'push', data, { useMasterKey: !!options.useMasterKey });

    return request._thenRunCallbacks(options);
  }
});
},{"./CoreManager":5,"./ParseQuery":19,"babel-runtime/helpers/interop-require-default":49}],25:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _Storage = require('./Storage');

var _Storage2 = _interopRequireDefault(_Storage);

var XHR = null;
if (typeof XMLHttpRequest !== 'undefined') {
  XHR = XMLHttpRequest;
}

var useXDomainRequest = false;
if (typeof XDomainRequest !== 'undefined' && !('withCredentials' in new XMLHttpRequest())) {
  useXDomainRequest = true;
}

function ajaxIE9(method, url, data) {
  var promise = new _ParsePromise2['default']();
  var xdr = new XDomainRequest();
  xdr.onload = function () {
    var response;
    try {
      response = JSON.parse(xdr.responseText);
    } catch (e) {
      promise.reject(e);
    }
    promise.resolve(response);
  };
  xdr.onerror = xdr.ontimeout = function () {
    // Let's fake a real error message.
    var fakeResponse = {
      responseText: JSON.stringify({
        code: _ParseError2['default'].X_DOMAIN_REQUEST,
        error: 'IE\'s XDomainRequest does not supply error info.'
      })
    };
    promise.reject(fakeResponse);
  };
  xdr.onprogress = function () {};
  xdr.open(method, url);
  xdr.send(data);
  return promise;
}

var RESTController = {
  ajax: function ajax(method, url, data, headers) {
    if (useXDomainRequest) {
      return ajaxIE9(method, url, data, headers);
    }

    var promise = new _ParsePromise2['default']();
    var attempts = 0;

    var dispatch = function dispatch() {
      if (XHR == null) {
        throw new Error('Cannot make a request: No definition of XMLHttpRequest was found.');
      }
      var handled = false;
      var xhr = new XHR();

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4 || handled) {
          return;
        }
        handled = true;

        if (xhr.status >= 200 && xhr.status < 300) {
          var response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            promise.reject(e);
          }
          promise.resolve(response, xhr.status, xhr);
        } else if (xhr.status >= 500 || xhr.status === 0) {
          // retry on 5XX or node-xmlhttprequest error
          if (++attempts < _CoreManager2['default'].get('REQUEST_ATTEMPT_LIMIT')) {
            // Exponentially-growing random delay
            var delay = Math.round(Math.random() * 125 * Math.pow(2, attempts));
            setTimeout(dispatch, delay);
          } else if (xhr.status === 0) {
            promise.reject('Unable to connect to the Parse API');
          } else {
            // After the retry limit is reached, fail
            promise.reject(xhr);
          }
        } else {
          promise.reject(xhr);
        }
      };

      headers = headers || {};
      headers['Content-Type'] = 'text/plain'; // Avoid pre-flight
      if (_CoreManager2['default'].get('IS_NODE')) {
        headers['User-Agent'] = 'Parse/' + _CoreManager2['default'].get('VERSION') + ' (NodeJS ' + process.versions.node + ')';
      }

      xhr.open(method, url, true);
      for (var h in headers) {
        xhr.setRequestHeader(h, headers[h]);
      }
      xhr.send(data);
    };
    dispatch();

    return promise;
  },

  request: function request(method, path, data, options) {
    options = options || {};
    var url = _CoreManager2['default'].get('SERVER_URL');
    if (url[url.length - 1] !== '/') {
      url += '/';
    }
    url += path;

    var payload = {};
    if (data && typeof data === 'object') {
      for (var k in data) {
        payload[k] = data[k];
      }
    }

    if (method !== 'POST') {
      payload._method = method;
      method = 'POST';
    }

    payload._ApplicationId = _CoreManager2['default'].get('APPLICATION_ID');
    payload._JavaScriptKey = _CoreManager2['default'].get('JAVASCRIPT_KEY');
    payload._ClientVersion = _CoreManager2['default'].get('VERSION');

    var useMasterKey = options.useMasterKey;
    if (typeof useMasterKey === 'undefined') {
      useMasterKey = _CoreManager2['default'].get('USE_MASTER_KEY');
    }
    if (useMasterKey) {
      if (_CoreManager2['default'].get('MASTER_KEY')) {
        delete payload._JavaScriptKey;
        payload._MasterKey = _CoreManager2['default'].get('MASTER_KEY');
      } else {
        throw new Error('Cannot use the Master Key, it has not been provided.');
      }
    }

    if (_CoreManager2['default'].get('FORCE_REVOCABLE_SESSION')) {
      payload._RevocableSession = '1';
    }

    var installationController = _CoreManager2['default'].getInstallationController();

    return installationController.currentInstallationId().then(function (iid) {
      payload._InstallationId = iid;
      var userController = _CoreManager2['default'].getUserController();
      if (options && typeof options.sessionToken === 'string') {
        return _ParsePromise2['default'].as(options.sessionToken);
      } else if (userController) {
        return userController.currentUserAsync().then(function (user) {
          if (user) {
            return _ParsePromise2['default'].as(user.getSessionToken());
          }
          return _ParsePromise2['default'].as(null);
        });
      }
      return _ParsePromise2['default'].as(null);
    }).then(function (token) {
      if (token) {
        payload._SessionToken = token;
      }

      var payloadString = JSON.stringify(payload);

      return RESTController.ajax(method, url, payloadString);
    }).then(null, function (response) {
      // Transform the error into an instance of ParseError by trying to parse
      // the error string as JSON
      var error;
      if (response && response.responseText) {
        try {
          var errorJSON = JSON.parse(response.responseText);
          error = new _ParseError2['default'](errorJSON.code, errorJSON.error);
        } catch (e) {
          // If we fail to parse the error text, that's okay.
          error = new _ParseError2['default'](_ParseError2['default'].INVALID_JSON, 'Received an error with invalid JSON from Parse: ' + response.responseText);
        }
      } else {
        error = new _ParseError2['default'](_ParseError2['default'].CONNECTION_FAILED, 'XMLHttpRequest failed: ' + JSON.stringify(response));
      }

      return _ParsePromise2['default'].error(error);
    });
  },

  _setXHR: function _setXHR(xhr) {
    XHR = xhr;
  }
};

module.exports = RESTController;
}).call(this,require('_process'))

},{"./CoreManager":5,"./ParseError":12,"./ParsePromise":18,"./Storage":26,"_process":1,"babel-runtime/helpers/interop-require-default":49}],26:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

module.exports = {
  async: function async() {
    var controller = _CoreManager2['default'].getStorageController();
    return !!controller.async;
  },

  getItem: function getItem(path) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }
    return controller.getItem(path);
  },

  getItemAsync: function getItemAsync(path) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      return controller.getItemAsync(path);
    }
    return _ParsePromise2['default'].as(controller.getItem(path));
  },

  setItem: function setItem(path, value) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }
    return controller.setItem(path, value);
  },

  setItemAsync: function setItemAsync(path, value) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      return controller.setItemAsync(path, value);
    }
    return _ParsePromise2['default'].as(controller.setItem(path, value));
  },

  removeItem: function removeItem(path) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }
    return controller.removeItem(path);
  },

  removeItemAsync: function removeItemAsync(path) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      return controller.removeItemAsync(path);
    }
    return _ParsePromise2['default'].as(controller.removeItem(path));
  },

  generatePath: function generatePath(path) {
    if (!_CoreManager2['default'].get('APPLICATION_ID')) {
      throw new Error('You need to call Parse.initialize before using Parse.');
    }
    if (typeof path !== 'string') {
      throw new Error('Tried to get a Storage path that was not a String.');
    }
    if (path[0] === '/') {
      path = path.substr(1);
    }
    return 'Parse/' + _CoreManager2['default'].get('APPLICATION_ID') + '/' + path;
  },

  _clear: function _clear() {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.hasOwnProperty('clear')) {
      controller.clear();
    }
  }
};

_CoreManager2['default'].setStorageController(require('./StorageController.browser'));
},{"./CoreManager":5,"./ParsePromise":18,"./StorageController.browser":27,"babel-runtime/helpers/interop-require-default":49}],27:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

module.exports = {
  async: 0,

  getItem: function getItem(path) {
    return localStorage.getItem(path);
  },

  setItem: function setItem(path, value) {
    localStorage.setItem(path, value);
  },

  removeItem: function removeItem(path) {
    localStorage.removeItem(path);
  },

  clear: function clear() {
    localStorage.clear();
  }
};
},{"./ParsePromise":18,"babel-runtime/helpers/interop-require-default":49}],28:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

module.exports = (function () {
  function TaskQueue() {
    _classCallCheck(this, TaskQueue);

    this.queue = [];
  }

  _createClass(TaskQueue, [{
    key: 'enqueue',
    value: function enqueue(task) {
      var _this = this;

      var taskComplete = new _ParsePromise2['default']();
      this.queue.push({
        task: task,
        _completion: taskComplete
      });
      if (this.queue.length === 1) {
        task().then(function () {
          _this._dequeue();
          taskComplete.resolve();
        }, function (error) {
          _this._dequeue();
          taskComplete.reject(error);
        });
      }
      return taskComplete;
    }
  }, {
    key: '_dequeue',
    value: function _dequeue() {
      var _this2 = this;

      this.queue.shift();
      if (this.queue.length) {
        var next = this.queue[0];
        next.task().then(function () {
          _this2._dequeue();
          next._completion.resolve();
        }, function (error) {
          _this2._dequeue();
          next._completion.reject(error);
        });
      }
    }
  }]);

  return TaskQueue;
})();
},{"./ParsePromise":18,"babel-runtime/helpers/class-call-check":45,"babel-runtime/helpers/create-class":46,"babel-runtime/helpers/interop-require-default":49}],29:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = arrayContainsObject;

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

function arrayContainsObject(array, object) {
  if (array.indexOf(object) > -1) {
    return true;
  }
  for (var i = 0; i < array.length; i++) {
    if (array[i] instanceof _ParseObject2['default'] && array[i].className === object.className && array[i]._getId() === object._getId()) {
      return true;
    }
  }
  return false;
}

module.exports = exports['default'];
},{"./ParseObject":16,"babel-runtime/helpers/interop-require-default":49}],30:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = canBeSerialized;

var _ParseFile = require('./ParseFile');

var _ParseFile2 = _interopRequireDefault(_ParseFile);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = _interopRequireDefault(_ParseRelation);

function canBeSerialized(obj) {
  if (!(obj instanceof _ParseObject2['default'])) {
    return true;
  }
  var attributes = obj.attributes;
  for (var attr in attributes) {
    var val = attributes[attr];
    if (!canBeSerializedHelper(val)) {
      return false;
    }
  }
  return true;
}

function canBeSerializedHelper(value) {
  if (typeof value !== 'object') {
    return true;
  }
  if (value instanceof _ParseRelation2['default']) {
    return true;
  }
  if (value instanceof _ParseObject2['default']) {
    return !!value.id;
  }
  if (value instanceof _ParseFile2['default']) {
    if (value.url()) {
      return true;
    }
    return false;
  }
  if (Array.isArray(value)) {
    for (var i = 0; i < value.length; i++) {
      if (!canBeSerializedHelper(value[i])) {
        return false;
      }
    }
    return true;
  }
  for (var k in value) {
    if (!canBeSerializedHelper(value[k])) {
      return false;
    }
  }
  return true;
}
module.exports = exports['default'];
},{"./ParseFile":13,"./ParseObject":16,"./ParseRelation":20,"babel-runtime/helpers/interop-require-default":49}],31:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = decode;

var _ParseACL = require('./ParseACL');

var _ParseACL2 = _interopRequireDefault(_ParseACL);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = _interopRequireDefault(_ParseFile);

var _ParseGeoPoint = require('./ParseGeoPoint');

var _ParseGeoPoint2 = _interopRequireDefault(_ParseGeoPoint);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParseOp = require('./ParseOp');

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = _interopRequireDefault(_ParseRelation);

function decode(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    var dup = [];
    value.forEach(function (v, i) {
      dup[i] = decode(v);
    });
    return dup;
  }
  if (typeof value.__op === 'string') {
    return (0, _ParseOp.opFromJSON)(value);
  }
  if (value.__type === 'Pointer' && value.className) {
    return _ParseObject2['default'].fromJSON(value);
  }
  if (value.__type === 'Object' && value.className) {
    return _ParseObject2['default'].fromJSON(value);
  }
  if (value.__type === 'Relation') {
    // The parent and key fields will be populated by the parent
    var relation = new _ParseRelation2['default'](null, null);
    relation.targetClassName = value.className;
    return relation;
  }
  if (value.__type === 'Date') {
    return new Date(value.iso);
  }
  if (value.__type === 'File') {
    return _ParseFile2['default'].fromJSON(value);
  }
  if (value.__type === 'GeoPoint') {
    return new _ParseGeoPoint2['default']({
      latitude: value.latitude,
      longitude: value.longitude
    });
  }
  var copy = {};
  for (var k in value) {
    copy[k] = decode(value[k]);
  }
  return copy;
}

module.exports = exports['default'];
},{"./ParseACL":10,"./ParseFile":13,"./ParseGeoPoint":14,"./ParseObject":16,"./ParseOp":17,"./ParseRelation":20,"babel-runtime/helpers/interop-require-default":49}],32:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ParseACL = require('./ParseACL');

var _ParseACL2 = _interopRequireDefault(_ParseACL);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = _interopRequireDefault(_ParseFile);

var _ParseGeoPoint = require('./ParseGeoPoint');

var _ParseGeoPoint2 = _interopRequireDefault(_ParseGeoPoint);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParseOp = require('./ParseOp');

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = _interopRequireDefault(_ParseRelation);

var toString = Object.prototype.toString;

function encode(value, disallowObjects, forcePointers, seen) {
  if (value instanceof _ParseObject2['default']) {
    if (disallowObjects) {
      throw new Error('Parse Objects not allowed here');
    }
    var seenEntry = value.id ? value.className + ':' + value.id : value;
    if (forcePointers || !seen || seen.indexOf(seenEntry) > -1 || value.dirty() || _Object$keys(value._getServerData()).length < 1) {
      return value.toPointer();
    }
    seen = seen.concat(seenEntry);
    return value._toFullJSON(seen);
  }
  if (value instanceof _ParseOp.Op || value instanceof _ParseACL2['default'] || value instanceof _ParseGeoPoint2['default'] || value instanceof _ParseRelation2['default']) {
    return value.toJSON();
  }
  if (value instanceof _ParseFile2['default']) {
    if (!value.url()) {
      throw new Error('Tried to encode an unsaved file.');
    }
    return value.toJSON();
  }
  if (toString.call(value) === '[object Date]') {
    if (isNaN(value)) {
      throw new Error('Tried to encode an invalid date.');
    }
    return { __type: 'Date', iso: value.toJSON() };
  }
  if (toString.call(value) === '[object RegExp]' && typeof value.source === 'string') {
    return value.source;
  }

  if (Array.isArray(value)) {
    return value.map(function (v) {
      return encode(v, disallowObjects, forcePointers, seen);
    });
  }

  if (value && typeof value === 'object') {
    var output = {};
    for (var k in value) {
      output[k] = encode(value[k], disallowObjects, forcePointers, seen);
    }
    return output;
  }

  return value;
}

exports['default'] = function (value, disallowObjects, forcePointers, seen) {
  return encode(value, !!disallowObjects, !!forcePointers, seen || []);
};

module.exports = exports['default'];
},{"./ParseACL":10,"./ParseFile":13,"./ParseGeoPoint":14,"./ParseObject":16,"./ParseOp":17,"./ParseRelation":20,"babel-runtime/core-js/object/keys":43,"babel-runtime/helpers/interop-require-default":49}],33:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = equals;

var _ParseACL = require('./ParseACL');

var _ParseACL2 = _interopRequireDefault(_ParseACL);

var _ParseFile = require('./ParseFile');

var _ParseFile2 = _interopRequireDefault(_ParseFile);

var _ParseGeoPoint = require('./ParseGeoPoint');

var _ParseGeoPoint2 = _interopRequireDefault(_ParseGeoPoint);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

function equals(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }

  if (!a || typeof a !== 'object') {
    // a is a primitive
    return a === b;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (var i = a.length; i--;) {
      if (!equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if (a instanceof _ParseACL2['default'] || a instanceof _ParseFile2['default'] || a instanceof _ParseGeoPoint2['default'] || a instanceof _ParseObject2['default']) {
    return a.equals(b);
  }

  if (_Object$keys(a).length !== _Object$keys(b).length) {
    return false;
  }
  for (var k in a) {
    if (!equals(a[k], b[k])) {
      return false;
    }
  }
  return true;
}

module.exports = exports['default'];
},{"./ParseACL":10,"./ParseFile":13,"./ParseGeoPoint":14,"./ParseObject":16,"babel-runtime/core-js/object/keys":43,"babel-runtime/helpers/interop-require-default":49}],34:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = escape;

function escape(str) {
  return str.replace(/[&<>\/'"]/g, function (char) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '/': '&#x2F;',
      '\'': '&#x27;',
      '"': '&quot;'
    })[char];
  });
}

module.exports = exports['default'];
},{}],35:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = isRevocableSession;

function isRevocableSession(token) {
  return token.indexOf('r:') > -1;
}

module.exports = exports['default'];
},{}],36:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = parseDate;

function parseDate(iso8601) {
  var regexp = new RegExp('^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})' + 'T' + '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})' + '(.([0-9]+))?' + 'Z$');
  var match = regexp.exec(iso8601);
  if (!match) {
    return null;
  }

  var year = match[1] || 0;
  var month = (match[2] || 1) - 1;
  var day = match[3] || 0;
  var hour = match[4] || 0;
  var minute = match[5] || 0;
  var second = match[6] || 0;
  var milli = match[8] || 0;

  return new Date(Date.UTC(year, month, day, hour, minute, second, milli));
}

module.exports = exports['default'];
},{}],37:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = unique;

var _arrayContainsObject = require('./arrayContainsObject');

var _arrayContainsObject2 = _interopRequireDefault(_arrayContainsObject);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

function unique(arr) {
  var uniques = [];
  arr.forEach(function (value) {
    if (value instanceof _ParseObject2['default']) {
      if (!(0, _arrayContainsObject2['default'])(uniques, value)) {
        uniques.push(value);
      }
    } else {
      if (uniques.indexOf(value) < 0) {
        uniques.push(value);
      }
    }
  });
  return uniques;
}

module.exports = exports['default'];
},{"./ParseObject":16,"./arrayContainsObject":29,"babel-runtime/helpers/interop-require-default":49}],38:[function(require,module,exports){
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = unsavedChildren;

var _ParseFile = require('./ParseFile');

var _ParseFile2 = _interopRequireDefault(_ParseFile);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = _interopRequireDefault(_ParseRelation);

/**
 * Return an array of unsaved children, which are either Parse Objects or Files.
 * If it encounters any dirty Objects without Ids, it will throw an exception.
 */

function unsavedChildren(obj, allowDeepUnsaved) {
  var encountered = {
    objects: {},
    files: []
  };
  var identifier = obj.className + ':' + obj._getId();
  encountered.objects[identifier] = obj.dirty() ? obj : true;
  var attributes = obj.attributes;
  for (var attr in attributes) {
    if (typeof attributes[attr] === 'object') {
      traverse(attributes[attr], encountered, false, !!allowDeepUnsaved);
    }
  }
  var unsaved = [];
  for (var id in encountered.objects) {
    if (id !== identifier && encountered.objects[id] !== true) {
      unsaved.push(encountered.objects[id]);
    }
  }
  return unsaved.concat(encountered.files);
}

function traverse(obj, encountered, shouldThrow, allowDeepUnsaved) {
  if (obj instanceof _ParseObject2['default']) {
    if (!obj.id && shouldThrow) {
      throw new Error('Cannot create a pointer to an unsaved Object.');
    }
    var identifier = obj.className + ':' + obj._getId();
    if (!encountered.objects[identifier]) {
      encountered.objects[identifier] = obj.dirty() ? obj : true;
      var attributes = obj.attributes;
      for (var attr in attributes) {
        if (typeof attributes[attr] === 'object') {
          traverse(attributes[attr], encountered, !allowDeepUnsaved, allowDeepUnsaved);
        }
      }
    }
    return;
  }
  if (obj instanceof _ParseFile2['default']) {
    if (!obj.url() && encountered.files.indexOf(obj) < 0) {
      encountered.files.push(obj);
    }
    return;
  }
  if (obj instanceof _ParseRelation2['default']) {
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach(function (el) {
      traverse(el, encountered, shouldThrow, allowDeepUnsaved);
    });
  }
  for (var k in obj) {
    if (typeof obj[k] === 'object') {
      traverse(obj[k], encountered, shouldThrow, allowDeepUnsaved);
    }
  }
}
module.exports = exports['default'];
},{"./ParseFile":13,"./ParseObject":16,"./ParseRelation":20,"babel-runtime/helpers/interop-require-default":49}],39:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":51}],40:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":52}],41:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/freeze"), __esModule: true };
},{"core-js/library/fn/object/freeze":53}],42:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":54}],43:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":55}],44:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":56}],45:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],46:[function(require,module,exports){
"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      _Object$defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/object/define-property":40}],47:[function(require,module,exports){
"use strict";

var _Object$getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor")["default"];

exports["default"] = function get(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;
    _again = false;
    if (object === null) object = Function.prototype;

    var desc = _Object$getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
        _x2 = property;
        _x3 = receiver;
        _again = true;
        desc = parent = undefined;
        continue _function;
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  }
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/get-own-property-descriptor":42}],48:[function(require,module,exports){
"use strict";

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

var _Object$setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of")["default"];

exports["default"] = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = _Object$create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/create":39,"babel-runtime/core-js/object/set-prototype-of":44}],49:[function(require,module,exports){
"use strict";

exports["default"] = function (obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
};

exports.__esModule = true;
},{}],50:[function(require,module,exports){
"use strict";

exports["default"] = function (obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj["default"] = obj;
    return newObj;
  }
};

exports.__esModule = true;
},{}],51:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":68}],52:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":68}],53:[function(require,module,exports){
require('../../modules/es6.object.freeze');
module.exports = require('../../modules/$.core').Object.freeze;
},{"../../modules/$.core":60,"../../modules/es6.object.freeze":73}],54:[function(require,module,exports){
var $ = require('../../modules/$');
require('../../modules/es6.object.get-own-property-descriptor');
module.exports = function getOwnPropertyDescriptor(it, key){
  return $.getDesc(it, key);
};
},{"../../modules/$":68,"../../modules/es6.object.get-own-property-descriptor":74}],55:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/$.core').Object.keys;
},{"../../modules/$.core":60,"../../modules/es6.object.keys":75}],56:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/$.core').Object.setPrototypeOf;
},{"../../modules/$.core":60,"../../modules/es6.object.set-prototype-of":76}],57:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],58:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":67}],59:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],60:[function(require,module,exports){
var core = module.exports = {version: '1.2.6'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],61:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./$.a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./$.a-function":57}],62:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],63:[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , ctx       = require('./$.ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
};
// type bitmap
$export.F = 1;  // forced
$export.G = 2;  // global
$export.S = 4;  // static
$export.P = 8;  // proto
$export.B = 16; // bind
$export.W = 32; // wrap
module.exports = $export;
},{"./$.core":60,"./$.ctx":61,"./$.global":65}],64:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],65:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],66:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./$.cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./$.cof":59}],67:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],68:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],69:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./$.export')
  , core    = require('./$.core')
  , fails   = require('./$.fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./$.core":60,"./$.export":63,"./$.fails":64}],70:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var getDesc  = require('./$').getDesc
  , isObject = require('./$.is-object')
  , anObject = require('./$.an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./$.ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./$":68,"./$.an-object":58,"./$.ctx":61,"./$.is-object":67}],71:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./$.iobject')
  , defined = require('./$.defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./$.defined":62,"./$.iobject":66}],72:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./$.defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./$.defined":62}],73:[function(require,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = require('./$.is-object');

require('./$.object-sap')('freeze', function($freeze){
  return function freeze(it){
    return $freeze && isObject(it) ? $freeze(it) : it;
  };
});
},{"./$.is-object":67,"./$.object-sap":69}],74:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./$.to-iobject');

require('./$.object-sap')('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./$.object-sap":69,"./$.to-iobject":71}],75:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./$.to-object');

require('./$.object-sap')('keys', function($keys){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"./$.object-sap":69,"./$.to-object":72}],76:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./$.export');
$export($export.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.export":63,"./$.set-proto":70}],77:[function(require,module,exports){
(function (process){
/*!
 * Vue.js v1.0.12
 * (c) 2015 Evan You
 * Released under the MIT License.
 */
'use strict';

function set(obj, key, val) {
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return;
  }
  if (obj._isVue) {
    set(obj._data, key, val);
    return;
  }
  var ob = obj.__ob__;
  if (!ob) {
    obj[key] = val;
    return;
  }
  ob.convert(key, val);
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._proxy(key);
      vm._digest();
    }
  }
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 *
 * @param {Object} obj
 * @param {String} key
 */

function del(obj, key) {
  if (!hasOwn(obj, key)) {
    return;
  }
  delete obj[key];
  var ob = obj.__ob__;
  if (!ob) {
    return;
  }
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._unproxy(key);
      vm._digest();
    }
  }
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Check whether the object has the property.
 *
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Check if an expression is a literal value.
 *
 * @param {String} exp
 * @return {Boolean}
 */

var literalValueRE = /^\s?(true|false|[\d\.]+|'[^']*'|"[^"]*")\s?$/;

function isLiteral(exp) {
  return literalValueRE.test(exp);
}

/**
 * Check if a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

function _toString(value) {
  return value == null ? '' : value.toString();
}

/**
 * Check and convert possible numeric strings to numbers
 * before setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

function toNumber(value) {
  if (typeof value !== 'string') {
    return value;
  } else {
    var parsed = Number(value);
    return isNaN(parsed) ? value : parsed;
  }
}

/**
 * Convert string boolean literals into real booleans.
 *
 * @param {*} value
 * @return {*|Boolean}
 */

function toBoolean(value) {
  return value === 'true' ? true : value === 'false' ? false : value;
}

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

function stripQuotes(str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? str.slice(1, -1) : str;
}

/**
 * Camelize a hyphen-delmited string.
 *
 * @param {String} str
 * @return {String}
 */

var camelizeRE = /-(\w)/g;

function camelize(str) {
  return str.replace(camelizeRE, toUpper);
}

function toUpper(_, c) {
  return c ? c.toUpperCase() : '';
}

/**
 * Hyphenate a camelCase string.
 *
 * @param {String} str
 * @return {String}
 */

var hyphenateRE = /([a-z\d])([A-Z])/g;

function hyphenate(str) {
  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
}

/**
 * Converts hyphen/underscore/slash delimitered names into
 * camelized classNames.
 *
 * e.g. my-component => MyComponent
 *      some_else    => SomeElse
 *      some/comp    => SomeComp
 *
 * @param {String} str
 * @return {String}
 */

var classifyRE = /(?:^|[-_\/])(\w)/g;

function classify(str) {
  return str.replace(classifyRE, toUpper);
}

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

function bind$1(fn, ctx) {
  return function (a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  };
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
 */

function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

function extend(to, from) {
  var keys = Object.keys(from);
  var i = keys.length;
  while (i--) {
    to[keys[i]] = from[keys[i]];
  }
  return to;
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';

function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var isArray = Array.isArray;

/**
 * Define a non-enumerable property
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Debounce a function so it only gets called after the
 * input stops arriving after the given wait period.
 *
 * @param {Function} func
 * @param {Number} wait
 * @return {Function} - the debounced function
 */

function _debounce(func, wait) {
  var timeout, args, context, timestamp, result;
  var later = function later() {
    var last = Date.now() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    }
  };
  return function () {
    context = this;
    args = arguments;
    timestamp = Date.now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    return result;
  };
}

/**
 * Manual indexOf because it's slightly faster than
 * native.
 *
 * @param {Array} arr
 * @param {*} obj
 */

function indexOf(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) return i;
  }
  return -1;
}

/**
 * Make a cancellable version of an async callback.
 *
 * @param {Function} fn
 * @return {Function}
 */

function cancellable(fn) {
  var cb = function cb() {
    if (!cb.cancelled) {
      return fn.apply(this, arguments);
    }
  };
  cb.cancel = function () {
    cb.cancelled = true;
  };
  return cb;
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 *
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 */

function looseEqual(a, b) {
  /* eslint-disable eqeqeq */
  return a == b || (isObject(a) && isObject(b) ? JSON.stringify(a) === JSON.stringify(b) : false);
  /* eslint-enable eqeqeq */
}

var hasProto = ('__proto__' in {});

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

var isIE9 = inBrowser && navigator.userAgent.toLowerCase().indexOf('msie 9.0') > 0;

var isAndroid = inBrowser && navigator.userAgent.toLowerCase().indexOf('android') > 0;

var transitionProp = undefined;
var transitionEndEvent = undefined;
var animationProp = undefined;
var animationEndEvent = undefined;

// Transition property/event sniffing
if (inBrowser && !isIE9) {
  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
  transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition';
  transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
  animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation';
  animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend';
}

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;
  function nextTickHandler() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }
  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined') {
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(counter);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = counter;
    };
  } else {
    timerFunc = setTimeout;
  }
  return function (cb, ctx) {
    var func = ctx ? function () {
      cb.call(ctx);
    } : cb;
    callbacks.push(func);
    if (pending) return;
    pending = true;
    timerFunc(nextTickHandler, 0);
  };
})();

function Cache(limit) {
  this.size = 0;
  this.limit = limit;
  this.head = this.tail = undefined;
  this._keymap = Object.create(null);
}

var p = Cache.prototype;

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var entry = {
    key: key,
    value: value
  };
  this._keymap[key] = entry;
  if (this.tail) {
    this.tail.newer = entry;
    entry.older = this.tail;
  } else {
    this.head = entry;
  }
  this.tail = entry;
  if (this.size === this.limit) {
    return this.shift();
  } else {
    this.size++;
  }
};

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head;
  if (entry) {
    this.head = this.head.newer;
    this.head.older = undefined;
    entry.newer = entry.older = undefined;
    this._keymap[entry.key] = undefined;
  }
  return entry;
};

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key];
  if (entry === undefined) return;
  if (entry === this.tail) {
    return returnEntry ? entry : entry.value;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer;
    }
    entry.newer.older = entry.older; // C <-- E.
  }
  if (entry.older) {
    entry.older.newer = entry.newer; // C. --> E
  }
  entry.newer = undefined; // D --x
  entry.older = this.tail; // D. --> E
  if (this.tail) {
    this.tail.newer = entry; // E. <-- D
  }
  this.tail = entry;
  return returnEntry ? entry : entry.value;
};

var cache$1 = new Cache(1000);
var filterTokenRE = /[^\s'"]+|'[^']*'|"[^"]*"/g;
var reservedArgRE = /^in$|^-?\d+/;

/**
 * Parser state
 */

var str;
var dir;
var c;
var prev;
var i;
var l;
var lastFilterIndex;
var inSingle;
var inDouble;
var curly;
var square;
var paren;
/**
 * Push a filter to the current directive object
 */

function pushFilter() {
  var exp = str.slice(lastFilterIndex, i).trim();
  var filter;
  if (exp) {
    filter = {};
    var tokens = exp.match(filterTokenRE);
    filter.name = tokens[0];
    if (tokens.length > 1) {
      filter.args = tokens.slice(1).map(processFilterArg);
    }
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter);
  }
  lastFilterIndex = i + 1;
}

/**
 * Check if an argument is dynamic and strip quotes.
 *
 * @param {String} arg
 * @return {Object}
 */

function processFilterArg(arg) {
  if (reservedArgRE.test(arg)) {
    return {
      value: toNumber(arg),
      dynamic: false
    };
  } else {
    var stripped = stripQuotes(arg);
    var dynamic = stripped === arg;
    return {
      value: dynamic ? arg : stripped,
      dynamic: dynamic
    };
  }
}

/**
 * Parse a directive value and extract the expression
 * and its filters into a descriptor.
 *
 * Example:
 *
 * "a + 1 | uppercase" will yield:
 * {
 *   expression: 'a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} str
 * @return {Object}
 */

function parseDirective(s) {

  var hit = cache$1.get(s);
  if (hit) {
    return hit;
  }

  // reset parser state
  str = s;
  inSingle = inDouble = false;
  curly = square = paren = 0;
  lastFilterIndex = 0;
  dir = {};

  for (i = 0, l = str.length; i < l; i++) {
    prev = c;
    c = str.charCodeAt(i);
    if (inSingle) {
      // check single quote
      if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle;
    } else if (inDouble) {
      // check double quote
      if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble;
    } else if (c === 0x7C && // pipe
    str.charCodeAt(i + 1) !== 0x7C && str.charCodeAt(i - 1) !== 0x7C) {
      if (dir.expression == null) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        dir.expression = str.slice(0, i).trim();
      } else {
        // already has filter
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22:
          inDouble = true;break; // "
        case 0x27:
          inSingle = true;break; // '
        case 0x28:
          paren++;break; // (
        case 0x29:
          paren--;break; // )
        case 0x5B:
          square++;break; // [
        case 0x5D:
          square--;break; // ]
        case 0x7B:
          curly++;break; // {
        case 0x7D:
          curly--;break; // }
      }
    }
  }

  if (dir.expression == null) {
    dir.expression = str.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  cache$1.put(s, dir);
  return dir;
}

var directive = Object.freeze({
  parseDirective: parseDirective
});

var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
var cache = undefined;
var tagRE = undefined;
var htmlRE = undefined;
/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex(str) {
  return str.replace(regexEscapeRE, '\\$&');
}

function compileRegex() {
  var open = escapeRegex(config.delimiters[0]);
  var close = escapeRegex(config.delimiters[1]);
  var unsafeOpen = escapeRegex(config.unsafeDelimiters[0]);
  var unsafeClose = escapeRegex(config.unsafeDelimiters[1]);
  tagRE = new RegExp(unsafeOpen + '(.+?)' + unsafeClose + '|' + open + '(.+?)' + close, 'g');
  htmlRE = new RegExp('^' + unsafeOpen + '.*' + unsafeClose + '$');
  // reset cache
  cache = new Cache(1000);
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

function parseText(text) {
  if (!cache) {
    compileRegex();
  }
  var hit = cache.get(text);
  if (hit) {
    return hit;
  }
  text = text.replace(/\n/g, '');
  if (!tagRE.test(text)) {
    return null;
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, html, value, first, oneTime;
  /* eslint-disable no-cond-assign */
  while (match = tagRE.exec(text)) {
    /* eslint-enable no-cond-assign */
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      });
    }
    // tag token
    html = htmlRE.test(match[0]);
    value = html ? match[1] : match[2];
    first = value.charCodeAt(0);
    oneTime = first === 42; // *
    value = oneTime ? value.slice(1) : value;
    tokens.push({
      tag: true,
      value: value.trim(),
      html: html,
      oneTime: oneTime
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    });
  }
  cache.put(text, tokens);
  return tokens;
}

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @return {String}
 */

function tokensToExp(tokens) {
  if (tokens.length > 1) {
    return tokens.map(function (token) {
      return formatToken(token);
    }).join('+');
  } else {
    return formatToken(tokens[0], true);
  }
}

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Boolean} single
 * @return {String}
 */

function formatToken(token, single) {
  return token.tag ? inlineFilters(token.value, single) : '"' + token.value + '"';
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @param {Boolean} single
 * @return {String}
 */

var filterRE$1 = /[^|]\|[^|]/;
function inlineFilters(exp, single) {
  if (!filterRE$1.test(exp)) {
    return single ? exp : '(' + exp + ')';
  } else {
    var dir = parseDirective(exp);
    if (!dir.filters) {
      return '(' + exp + ')';
    } else {
      return 'this._applyFilters(' + dir.expression + // value
      ',null,' + // oldValue (null for read)
      JSON.stringify(dir.filters) + // filter descriptors
      ',false)'; // write?
    }
  }
}

/**
 * Replace all interpolation tags in a piece of text.
 *
 * @param {String} text
 * @return {String}
 */

function removeTags(text) {
  return text.replace(tagRE, '');
}

var text$1 = Object.freeze({
  compileRegex: compileRegex,
  parseText: parseText,
  tokensToExp: tokensToExp,
  removeTags: removeTags
});

var delimiters = ['{{', '}}'];
var unsafeDelimiters = ['{{{', '}}}'];

var config = Object.defineProperties({

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Whether or not to handle fully object properties which
   * are already backed by getters and seters. Depending on
   * use case and environment, this might introduce non-neglible
   * performance penalties.
   */
  convertAllProperties: false,

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true,

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: ['component', 'directive', 'elementDirective', 'filter', 'transition', 'partial'],

  /**
   * prop binding modes
   */

  _propBindingModes: {
    ONE_WAY: 0,
    TWO_WAY: 1,
    ONE_TIME: 2
  },

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100

}, {
  delimiters: { /**
                 * Interpolation delimiters. Changing these would trigger
                 * the text parser to re-compile the regular expressions.
                 *
                 * @type {Array<String>}
                 */

    get: function get() {
      return delimiters;
    },
    set: function set(val) {
      delimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  },
  unsafeDelimiters: {
    get: function get() {
      return unsafeDelimiters;
    },
    set: function set(val) {
      unsafeDelimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  }
});

var warn = undefined;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var hasConsole = typeof console !== 'undefined';
    warn = function (msg, e) {
      if (hasConsole && (!config.silent || config.debug)) {
        console.warn('[Vue warn]: ' + msg);
        /* istanbul ignore if */
        if (config.debug) {
          if (e) {
            throw e;
          } else {
            console.warn(new Error('Warning Stack Trace').stack);
          }
        }
      }
    };
  })();
}

/**
 * Append with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function appendWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    target.appendChild(el);
  }, vm, cb);
}

/**
 * InsertBefore with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function beforeWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    before(el, target);
  }, vm, cb);
}

/**
 * Remove with transition.
 *
 * @param {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function removeWithTransition(el, vm, cb) {
  applyTransition(el, -1, function () {
    remove(el);
  }, vm, cb);
}

/**
 * Apply transitions with an operation callback.
 *
 * @param {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function applyTransition(el, direction, op, vm, cb) {
  var transition = el.__v_trans;
  if (!transition ||
  // skip if there are no js hooks and CSS transition is
  // not supported
  !transition.hooks && !transitionEndEvent ||
  // skip transitions for initial compile
  !vm._isCompiled ||
  // if the vm is being manipulated by a parent directive
  // during the parent's compilation phase, skip the
  // animation.
  vm.$parent && !vm.$parent._isCompiled) {
    op();
    if (cb) cb();
    return;
  }
  var action = direction > 0 ? 'enter' : 'leave';
  transition[action](op, cb);
}

/**
 * Query an element selector if it's not an element already.
 *
 * @param {String|Element} el
 * @return {Element}
 */

function query(el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn('Cannot find element: ' + selector);
    }
  }
  return el;
}

/**
 * Check if a node is in the document.
 * Note: document.documentElement.contains should work here
 * but always returns false for comment nodes in phantomjs,
 * making unit tests difficult. This is fixed by doing the
 * contains() check on the node's parentNode instead of
 * the node itself.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function inDoc(node) {
  var doc = document.documentElement;
  var parent = node && node.parentNode;
  return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
}

/**
 * Get and remove an attribute from a node.
 *
 * @param {Node} node
 * @param {String} _attr
 */

function getAttr(node, _attr) {
  var val = node.getAttribute(_attr);
  if (val !== null) {
    node.removeAttribute(_attr);
  }
  return val;
}

/**
 * Get an attribute with colon or v-bind: prefix.
 *
 * @param {Node} node
 * @param {String} name
 * @return {String|null}
 */

function getBindAttr(node, name) {
  var val = getAttr(node, ':' + name);
  if (val === null) {
    val = getAttr(node, 'v-bind:' + name);
  }
  return val;
}

/**
 * Check the presence of a bind attribute.
 *
 * @param {Node} node
 * @param {String} name
 * @return {Boolean}
 */

function hasBindAttr(node, name) {
  return node.hasAttribute(name) || node.hasAttribute(':' + name) || node.hasAttribute('v-bind:' + name);
}

/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target
 */

function before(el, target) {
  target.parentNode.insertBefore(el, target);
}

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target
 */

function after(el, target) {
  if (target.nextSibling) {
    before(el, target.nextSibling);
  } else {
    target.parentNode.appendChild(el);
  }
}

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

function remove(el) {
  el.parentNode.removeChild(el);
}

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target
 */

function prepend(el, target) {
  if (target.firstChild) {
    before(el, target.firstChild);
  } else {
    target.appendChild(el);
  }
}

/**
 * Replace target with el
 *
 * @param {Element} target
 * @param {Element} el
 */

function replace(target, el) {
  var parent = target.parentNode;
  if (parent) {
    parent.replaceChild(el, target);
  }
}

/**
 * Add event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

function on$1(el, event, cb) {
  el.addEventListener(event, cb);
}

/**
 * Remove event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

function off(el, event, cb) {
  el.removeEventListener(event, cb);
}

/**
 * In IE9, setAttribute('class') will result in empty class
 * if the element also has the :class attribute; However in
 * PhantomJS, setting `className` does not work on SVG elements...
 * So we have to do a conditional check here.
 *
 * @param {Element} el
 * @param {String} cls
 */

function setClass(el, cls) {
  /* istanbul ignore if */
  if (isIE9 && !(el instanceof SVGElement)) {
    el.className = cls;
  } else {
    el.setAttribute('class', cls);
  }
}

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function addClass(el, cls) {
  if (el.classList) {
    el.classList.add(cls);
  } else {
    var cur = ' ' + (el.getAttribute('class') || '') + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      setClass(el, (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function removeClass(el, cls) {
  if (el.classList) {
    el.classList.remove(cls);
  } else {
    var cur = ' ' + (el.getAttribute('class') || '') + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    setClass(el, cur.trim());
  }
  if (!el.className) {
    el.removeAttribute('class');
  }
}

/**
 * Extract raw content inside an element into a temporary
 * container div
 *
 * @param {Element} el
 * @param {Boolean} asFragment
 * @return {Element}
 */

function extractContent(el, asFragment) {
  var child;
  var rawContent;
  /* istanbul ignore if */
  if (isTemplate(el) && el.content instanceof DocumentFragment) {
    el = el.content;
  }
  if (el.hasChildNodes()) {
    trimNode(el);
    rawContent = asFragment ? document.createDocumentFragment() : document.createElement('div');
    /* eslint-disable no-cond-assign */
    while (child = el.firstChild) {
      /* eslint-enable no-cond-assign */
      rawContent.appendChild(child);
    }
  }
  return rawContent;
}

/**
 * Trim possible empty head/tail textNodes inside a parent.
 *
 * @param {Node} node
 */

function trimNode(node) {
  trim(node, node.firstChild);
  trim(node, node.lastChild);
}

function trim(parent, node) {
  if (node && node.nodeType === 3 && !node.data.trim()) {
    parent.removeChild(node);
  }
}

/**
 * Check if an element is a template tag.
 * Note if the template appears inside an SVG its tagName
 * will be in lowercase.
 *
 * @param {Element} el
 */

function isTemplate(el) {
  return el.tagName && el.tagName.toLowerCase() === 'template';
}

/**
 * Create an "anchor" for performing dom insertion/removals.
 * This is used in a number of scenarios:
 * - fragment instance
 * - v-html
 * - v-if
 * - v-for
 * - component
 *
 * @param {String} content
 * @param {Boolean} persist - IE trashes empty textNodes on
 *                            cloneNode(true), so in certain
 *                            cases the anchor needs to be
 *                            non-empty to be persisted in
 *                            templates.
 * @return {Comment|Text}
 */

function createAnchor(content, persist) {
  var anchor = config.debug ? document.createComment(content) : document.createTextNode(persist ? ' ' : '');
  anchor.__vue_anchor = true;
  return anchor;
}

/**
 * Find a component ref attribute that starts with $.
 *
 * @param {Element} node
 * @return {String|undefined}
 */

var refRE = /^v-ref:/;

function findRef(node) {
  if (node.hasAttributes()) {
    var attrs = node.attributes;
    for (var i = 0, l = attrs.length; i < l; i++) {
      var name = attrs[i].name;
      if (refRE.test(name)) {
        return camelize(name.replace(refRE, ''));
      }
    }
  }
}

/**
 * Map a function to a range of nodes .
 *
 * @param {Node} node
 * @param {Node} end
 * @param {Function} op
 */

function mapNodeRange(node, end, op) {
  var next;
  while (node !== end) {
    next = node.nextSibling;
    op(node);
    node = next;
  }
  op(end);
}

/**
 * Remove a range of nodes with transition, store
 * the nodes in a fragment with correct ordering,
 * and call callback when done.
 *
 * @param {Node} start
 * @param {Node} end
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Function} cb
 */

function removeNodeRange(start, end, vm, frag, cb) {
  var done = false;
  var removed = 0;
  var nodes = [];
  mapNodeRange(start, end, function (node) {
    if (node === end) done = true;
    nodes.push(node);
    removeWithTransition(node, vm, onRemoved);
  });
  function onRemoved() {
    removed++;
    if (done && removed >= nodes.length) {
      for (var i = 0; i < nodes.length; i++) {
        frag.appendChild(nodes[i]);
      }
      cb && cb();
    }
  }
}

var commonTagRE = /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/;
var reservedTagRE = /^(slot|partial|component)$/;

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function checkComponentAttr(el, options) {
  var tag = el.tagName.toLowerCase();
  var hasAttrs = el.hasAttributes();
  if (!commonTagRE.test(tag) && !reservedTagRE.test(tag)) {
    if (resolveAsset(options, 'components', tag)) {
      return { id: tag };
    } else {
      var is = hasAttrs && getIsBinding(el);
      if (is) {
        return is;
      } else if (process.env.NODE_ENV !== 'production') {
        if (tag.indexOf('-') > -1 || /HTMLUnknownElement/.test(el.toString()) &&
        // Chrome returns unknown for several HTML5 elements.
        // https://code.google.com/p/chromium/issues/detail?id=540526
        !/^(data|time|rtc|rb)$/.test(tag)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly?');
        }
      }
    }
  } else if (hasAttrs) {
    return getIsBinding(el);
  }
}

/**
 * Get "is" binding from an element.
 *
 * @param {Element} el
 * @return {Object|undefined}
 */

function getIsBinding(el) {
  // dynamic syntax
  var exp = getAttr(el, 'is');
  if (exp != null) {
    return { id: exp };
  } else {
    exp = getBindAttr(el, 'is');
    if (exp != null) {
      return { id: exp, dynamic: true };
    }
  }
}

/**
 * Set a prop's initial value on a vm and its data object.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function initProp(vm, prop, value) {
  var key = prop.path;
  value = coerceProp(prop, value);
  vm[key] = vm._data[key] = assertProp(prop, value) ? value : undefined;
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {*} value
 */

function assertProp(prop, value) {
  // if a prop is not provided and is not required,
  // skip the check.
  if (prop.raw === null && !prop.required) {
    return true;
  }
  var options = prop.options;
  var type = options.type;
  var valid = true;
  var expectedType;
  if (type) {
    if (type === String) {
      expectedType = 'string';
      valid = typeof value === expectedType;
    } else if (type === Number) {
      expectedType = 'number';
      valid = typeof value === 'number';
    } else if (type === Boolean) {
      expectedType = 'boolean';
      valid = typeof value === 'boolean';
    } else if (type === Function) {
      expectedType = 'function';
      valid = typeof value === 'function';
    } else if (type === Object) {
      expectedType = 'object';
      valid = isPlainObject(value);
    } else if (type === Array) {
      expectedType = 'array';
      valid = isArray(value);
    } else {
      valid = value instanceof type;
    }
  }
  if (!valid) {
    process.env.NODE_ENV !== 'production' && warn('Invalid prop: type check failed for ' + prop.path + '="' + prop.raw + '".' + ' Expected ' + formatType(expectedType) + ', got ' + formatValue(value) + '.');
    return false;
  }
  var validator = options.validator;
  if (validator) {
    if (!validator.call(null, value)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop: custom validator check failed for ' + prop.path + '="' + prop.raw + '"');
      return false;
    }
  }
  return true;
}

/**
 * Force parsing value with coerce option.
 *
 * @param {*} value
 * @param {Object} options
 * @return {*}
 */

function coerceProp(prop, value) {
  var coerce = prop.options.coerce;
  if (!coerce) {
    return value;
  }
  // coerce is a function
  return coerce(value);
}

function formatType(val) {
  return val ? val.charAt(0).toUpperCase() + val.slice(1) : 'custom type';
}

function formatValue(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = config.optionMergeStrategies = Object.create(null);

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData(to, from) {
  var key, toVal, fromVal;
  for (key in from) {
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isObject(toVal) && isObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.');
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(childVal.call(this), parentVal.call(this));
    };
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
};

/**
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== 'function') {
    process.env.NODE_ENV !== 'production' && warn('The "el" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.');
    return;
  }
  var ret = childVal || parentVal;
  // invoke the element factory if this is instance merge
  return vm && typeof ret === 'function' ? ret.call(vm) : ret;
};

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.init = strats.created = strats.ready = strats.attached = strats.detached = strats.beforeCompile = strats.compiled = strats.beforeDestroy = strats.destroyed = function (parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
};

/**
 * 0.11 deprecation warning
 */

strats.paramAttributes = function () {
  /* istanbul ignore next */
  process.env.NODE_ENV !== 'production' && warn('"paramAttributes" option has been deprecated in 0.12. ' + 'Use "props" instead.');
};

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

function mergeAssets(parentVal, childVal) {
  var res = Object.create(parentVal);
  return childVal ? extend(res, guardArrayAssets(childVal)) : res;
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Events & Watchers.
 *
 * Events & watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch = strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent ? parent.concat(child) : [child];
  }
  return ret;
};

/**
 * Other object hashes.
 */

strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret;
};

/**
 * Default strategy.
 */

var defaultStrat = function defaultStrat(parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} options
 */

function guardComponents(options) {
  if (options.components) {
    var components = options.components = guardArrayAssets(options.components);
    var def;
    var ids = Object.keys(components);
    for (var i = 0, l = ids.length; i < l; i++) {
      var key = ids[i];
      if (commonTagRE.test(key) || reservedTagRE.test(key)) {
        process.env.NODE_ENV !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
        continue;
      }
      def = components[key];
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def);
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 *
 * @param {Object} options
 */

function guardProps(options) {
  var props = options.props;
  var i, val;
  if (isArray(props)) {
    options.props = {};
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        options.props[val] = null;
      } else if (val.name) {
        options.props[val.name] = val;
      }
    }
  } else if (isPlainObject(props)) {
    var keys = Object.keys(props);
    i = keys.length;
    while (i--) {
      val = props[keys[i]];
      if (typeof val === 'function') {
        props[keys[i]] = { type: val };
      }
    }
  }
}

/**
 * Guard an Array-format assets option and converted it
 * into the key-value Object format.
 *
 * @param {Object|Array} assets
 * @return {Object}
 */

function guardArrayAssets(assets) {
  if (isArray(assets)) {
    var res = {};
    var i = assets.length;
    var asset;
    while (i--) {
      asset = assets[i];
      var id = typeof asset === 'function' ? asset.options && asset.options.name || asset.id : asset.name || asset.id;
      if (!id) {
        process.env.NODE_ENV !== 'production' && warn('Array-syntax assets must provide a "name" or "id" field.');
      } else {
        res[id] = asset;
      }
    }
    return res;
  }
  return assets;
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

function mergeOptions(parent, child, vm) {
  guardComponents(child);
  guardProps(child);
  var options = {};
  var key;
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm);
    }
  }
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options;
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 *
 * @param {Object} options
 * @param {String} type
 * @param {String} id
 * @return {Object|Function}
 */

function resolveAsset(options, type, id) {
  var assets = options[type];
  var camelizedId;
  return assets[id] ||
  // camelCase ID
  assets[camelizedId = camelize(id)] ||
  // Pascal Case ID
  assets[camelizedId.charAt(0).toUpperCase() + camelizedId.slice(1)];
}

/**
 * Assert asset exists
 */

function assertAsset(val, type, id) {
  if (!val) {
    process.env.NODE_ENV !== 'production' && warn('Failed to resolve ' + type + ': ' + id);
  }
}

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break;
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

def(arrayProto, '$set', function $set(index, val) {
  if (index >= this.length) {
    this.length = index + 1;
  }
  return this.splice(index, 1, val)[0];
});

/**
 * Convenience method to remove the element at given index.
 *
 * @param {Number} index
 * @param {*} val
 */

def(arrayProto, '$remove', function $remove(item) {
  /* istanbul ignore if */
  if (!this.length) return;
  var index = indexOf(this, item);
  if (index > -1) {
    return this.splice(index, 1);
  }
});

var uid$3 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */
function Dep() {
  this.id = uid$3++;
  this.subs = [];
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.removeSub = function (sub) {
  this.subs.$remove(sub);
};

/**
 * Add self as a dependency to the target watcher.
 */

Dep.prototype.depend = function () {
  Dep.target.addDep(this);
};

/**
 * Notify all subscribers of a new value.
 */

Dep.prototype.notify = function () {
  // stablize the subscriber list first
  var subs = toArray(this.subs);
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @constructor
 */

function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  def(value, '__ob__', this);
  if (isArray(value)) {
    var augment = hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
}

// Instance methods

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 *
 * @param {Object} obj
 */

Observer.prototype.walk = function (obj) {
  var keys = Object.keys(obj);
  var i = keys.length;
  while (i--) {
    this.convert(keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

Observer.prototype.observeArray = function (items) {
  var i = items.length;
  while (i--) {
    observe(items[i]);
  }
};

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

Observer.prototype.convert = function (key, val) {
  defineReactive(this.value, key, val);
};

/**
 * Add an owner vm, so that when $set/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

Observer.prototype.addVm = function (vm) {
  (this.vms || (this.vms = [])).push(vm);
};

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

Observer.prototype.removeVm = function (vm) {
  this.vms.$remove(vm);
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function protoAugment(target, src) {
  target.__proto__ = src;
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment(target, src, keys) {
  var i = keys.length;
  var key;
  while (i--) {
    key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @param {Vue} [vm]
 * @return {Observer|undefined}
 * @static
 */

function observe(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if ((isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (ob && vm) {
    ob.addVm(vm);
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 */

function defineReactive(obj, key, val) {
  var dep = new Dep();

  // cater for pre-defined getter/setters
  var getter, setter;
  if (config.convertAllProperties) {
    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return;
    }
    getter = property && property.get;
    setter = property && property.set;
  }

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (isArray(value)) {
          for (var e, i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

var util = Object.freeze({
	defineReactive: defineReactive,
	set: set,
	del: del,
	hasOwn: hasOwn,
	isLiteral: isLiteral,
	isReserved: isReserved,
	_toString: _toString,
	toNumber: toNumber,
	toBoolean: toBoolean,
	stripQuotes: stripQuotes,
	camelize: camelize,
	hyphenate: hyphenate,
	classify: classify,
	bind: bind$1,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	def: def,
	debounce: _debounce,
	indexOf: indexOf,
	cancellable: cancellable,
	looseEqual: looseEqual,
	isArray: isArray,
	hasProto: hasProto,
	inBrowser: inBrowser,
	isIE9: isIE9,
	isAndroid: isAndroid,
	get transitionProp () { return transitionProp; },
	get transitionEndEvent () { return transitionEndEvent; },
	get animationProp () { return animationProp; },
	get animationEndEvent () { return animationEndEvent; },
	nextTick: nextTick,
	query: query,
	inDoc: inDoc,
	getAttr: getAttr,
	getBindAttr: getBindAttr,
	hasBindAttr: hasBindAttr,
	before: before,
	after: after,
	remove: remove,
	prepend: prepend,
	replace: replace,
	on: on$1,
	off: off,
	setClass: setClass,
	addClass: addClass,
	removeClass: removeClass,
	extractContent: extractContent,
	trimNode: trimNode,
	isTemplate: isTemplate,
	createAnchor: createAnchor,
	findRef: findRef,
	mapNodeRange: mapNodeRange,
	removeNodeRange: removeNodeRange,
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	assertAsset: assertAsset,
	checkComponentAttr: checkComponentAttr,
	initProp: initProp,
	assertProp: assertProp,
	coerceProp: coerceProp,
	commonTagRE: commonTagRE,
	reservedTagRE: reservedTagRE,
	get warn () { return warn; }
});

var uid = 0;

function initMixin (Vue) {

  /**
   * The main init sequence. This is called for every
   * instance, including ones that are created from extended
   * constructors.
   *
   * @param {Object} options - this options object should be
   *                           the result of merging class
   *                           options and the options passed
   *                           in to the constructor.
   */

  Vue.prototype._init = function (options) {

    options = options || {};

    this.$el = null;
    this.$parent = options.parent;
    this.$root = this.$parent ? this.$parent.$root : this;
    this.$children = [];
    this.$refs = {}; // child vm references
    this.$els = {}; // element references
    this._watchers = []; // all watchers as an array
    this._directives = []; // all directives

    // a uid
    this._uid = uid++;

    // a flag to avoid this being observed
    this._isVue = true;

    // events bookkeeping
    this._events = {}; // registered callbacks
    this._eventsCount = {}; // for $broadcast optimization

    // fragment instance properties
    this._isFragment = false;
    this._fragment = // @type {DocumentFragment}
    this._fragmentStart = // @type {Text|Comment}
    this._fragmentEnd = null; // @type {Text|Comment}

    // lifecycle state
    this._isCompiled = this._isDestroyed = this._isReady = this._isAttached = this._isBeingDestroyed = false;
    this._unlinkFn = null;

    // context:
    // if this is a transcluded component, context
    // will be the common parent vm of this instance
    // and its host.
    this._context = options._context || this.$parent;

    // scope:
    // if this is inside an inline v-for, the scope
    // will be the intermediate scope created for this
    // repeat fragment. this is used for linking props
    // and container directives.
    this._scope = options._scope;

    // fragment:
    // if this instance is compiled inside a Fragment, it
    // needs to reigster itself as a child of that fragment
    // for attach/detach to work properly.
    this._frag = options._frag;
    if (this._frag) {
      this._frag.children.push(this);
    }

    // push self into parent / transclusion host
    if (this.$parent) {
      this.$parent.$children.push(this);
    }

    // merge options.
    options = this.$options = mergeOptions(this.constructor.options, options, this);

    // set ref
    this._updateRef();

    // initialize data as empty object.
    // it will be filled up in _initScope().
    this._data = {};

    // call init hook
    this._callHook('init');

    // initialize data observation and scope inheritance.
    this._initState();

    // setup event system and option events.
    this._initEvents();

    // call created hook
    this._callHook('created');

    // if `el` option is passed, start compilation.
    if (options.el) {
      this.$mount(options.el);
    }
  };
}

var pathCache = new Cache(1000);

// actions
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// states
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;

var pathStateMachine = [];

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND]
};

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
};

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
};

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
};

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
};

/**
 * Determine the type of a character in a keypath.
 *
 * @param {Char} ch
 * @return {String} type
 */

function getPathCharType(ch) {
  if (ch === undefined) {
    return 'eof';
  }

  var code = ch.charCodeAt(0);

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30:
      // 0
      return ch;

    case 0x5F: // _
    case 0x24:
      // $
      return 'ident';

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0: // No-break space
    case 0xFEFF: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029:
      // Paragraph Separator
      return 'ws';
  }

  // a-z, A-Z
  if (code >= 0x61 && code <= 0x7A || code >= 0x41 && code <= 0x5A) {
    return 'ident';
  }

  // 1-9
  if (code >= 0x31 && code <= 0x39) {
    return 'number';
  }

  return 'else';
}

/**
 * Format a subPath, return its plain form if it is
 * a literal string or number. Otherwise prepend the
 * dynamic indicator (*).
 *
 * @param {String} path
 * @return {String}
 */

function formatSubPath(path) {
  var trimmed = path.trim();
  // invalid leading 0
  if (path.charAt(0) === '0' && isNaN(path)) {
    return false;
  }
  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed;
}

/**
 * Parse a string path into an array of segments
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parse(path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c, newChar, key, type, transition, action, typeMap;

  var actions = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote() {
    var nextChar = path[index + 1];
    if (mode === IN_SINGLE_QUOTE && nextChar === "'" || mode === IN_DOUBLE_QUOTE && nextChar === '"') {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true;
    }
  }

  while (mode != null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue;
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      return; // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined ? c : newChar;
      if (action() === false) {
        return;
      }
    }

    if (mode === AFTER_PATH) {
      keys.raw = path;
      return keys;
    }
  }
}

/**
 * External parse that check for a cache hit first
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parsePath(path) {
  var hit = pathCache.get(path);
  if (!hit) {
    hit = parse(path);
    if (hit) {
      pathCache.put(path, hit);
    }
  }
  return hit;
}

/**
 * Get from an object from a path string
 *
 * @param {Object} obj
 * @param {String} path
 */

function getPath(obj, path) {
  return parseExpression(path).get(obj);
}

/**
 * Warn against setting non-existent root path on a vm.
 */

var warnNonExistent;
if (process.env.NODE_ENV !== 'production') {
  warnNonExistent = function (path) {
    warn('You are setting a non-existent path "' + path.raw + '" ' + 'on a vm instance. Consider pre-initializing the property ' + 'with the "data" option for more reliable reactivity ' + 'and better performance.');
  };
}

/**
 * Set on an object from a path
 *
 * @param {Object} obj
 * @param {String | Array} path
 * @param {*} val
 */

function setPath(obj, path, val) {
  var original = obj;
  if (typeof path === 'string') {
    path = parse(path);
  }
  if (!path || !isObject(obj)) {
    return false;
  }
  var last, key;
  for (var i = 0, l = path.length; i < l; i++) {
    last = obj;
    key = path[i];
    if (key.charAt(0) === '*') {
      key = parseExpression(key.slice(1)).get.call(original, original);
    }
    if (i < l - 1) {
      obj = obj[key];
      if (!isObject(obj)) {
        obj = {};
        if (process.env.NODE_ENV !== 'production' && last._isVue) {
          warnNonExistent(path);
        }
        set(last, key, obj);
      }
    } else {
      if (isArray(obj)) {
        obj.$set(key, val);
      } else if (key in obj) {
        obj[key] = val;
      } else {
        if (process.env.NODE_ENV !== 'production' && obj._isVue) {
          warnNonExistent(path);
        }
        set(obj, key, val);
      }
    }
  }
  return true;
}

var path = Object.freeze({
  parsePath: parsePath,
  getPath: getPath,
  setPath: setPath
});

var expressionCache = new Cache(1000);

var allowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,' + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' + 'encodeURIComponent,parseInt,parseFloat';
var allowedKeywordsRE = new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)');

// keywords that don't make sense inside expressions
var improperKeywords = 'break,case,class,catch,const,continue,debugger,default,' + 'delete,do,else,export,extends,finally,for,function,if,' + 'import,in,instanceof,let,return,super,switch,throw,try,' + 'var,while,with,yield,enum,await,implements,package,' + 'proctected,static,interface,private,public';
var improperKeywordsRE = new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)');

var wsRE = /\s/g;
var newlineRE = /\n/g;
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|new |typeof |void /g;
var restoreRE = /"(\d+)"/g;
var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
var booleanLiteralRE = /^(?:true|false)$/;

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = [];

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save(str, isString) {
  var i = saved.length;
  saved[i] = isString ? str.replace(newlineRE, '\\n') : str;
  return '"' + i + '"';
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite(raw) {
  var c = raw.charAt(0);
  var path = raw.slice(1);
  if (allowedKeywordsRE.test(path)) {
    return raw;
  } else {
    path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path;
    return c + 'scope.' + path;
  }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore(str, i) {
  return saved[i];
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and generate getter/setter functions.
 *
 * @param {String} exp
 * @return {Function}
 */

function compileGetter(exp) {
  if (improperKeywordsRE.test(exp)) {
    process.env.NODE_ENV !== 'production' && warn('Avoid using reserved keywords in expression: ' + exp);
  }
  // reset state
  saved.length = 0;
  // save strings and object literal keys
  var body = exp.replace(saveRE, save).replace(wsRE, '');
  // rewrite all paths
  // pad 1 space here becaue the regex matches 1 extra char
  body = (' ' + body).replace(identRE, rewrite).replace(restoreRE, restore);
  return makeGetterFn(body);
}

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetterFn(body) {
  try {
    return new Function('scope', 'return ' + body + ';');
  } catch (e) {
    process.env.NODE_ENV !== 'production' && warn('Invalid expression. ' + 'Generated function body: ' + body);
  }
}

/**
 * Compile a setter function for the expression.
 *
 * @param {String} exp
 * @return {Function|undefined}
 */

function compileSetter(exp) {
  var path = parsePath(exp);
  if (path) {
    return function (scope, val) {
      setPath(scope, path, val);
    };
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid setter expression: ' + exp);
  }
}

/**
 * Parse an expression into re-written getter/setters.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

function parseExpression(exp, needSet) {
  exp = exp.trim();
  // try cache
  var hit = expressionCache.get(exp);
  if (hit) {
    if (needSet && !hit.set) {
      hit.set = compileSetter(hit.exp);
    }
    return hit;
  }
  var res = { exp: exp };
  res.get = isSimplePath(exp) && exp.indexOf('[') < 0
  // optimized super simple getter
  ? makeGetterFn('scope.' + exp)
  // dynamic getter
  : compileGetter(exp);
  if (needSet) {
    res.set = compileSetter(exp);
  }
  expressionCache.put(exp, res);
  return res;
}

/**
 * Check if an expression is a simple path.
 *
 * @param {String} exp
 * @return {Boolean}
 */

function isSimplePath(exp) {
  return pathTestRE.test(exp) &&
  // don't treat true/false as paths
  !booleanLiteralRE.test(exp) &&
  // Math constants e.g. Math.PI, Math.E etc.
  exp.slice(0, 5) !== 'Math.';
}

var expression = Object.freeze({
  parseExpression: parseExpression,
  isSimplePath: isSimplePath
});

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.
var queue = [];
var userQueue = [];
var has = {};
var circular = {};
var waiting = false;
var internalQueueDepleted = false;

/**
 * Reset the batcher's state.
 */

function resetBatcherState() {
  queue = [];
  userQueue = [];
  has = {};
  circular = {};
  waiting = internalQueueDepleted = false;
}

/**
 * Flush both queues and run the watchers.
 */

function flushBatcherQueue() {
  runBatcherQueue(queue);
  internalQueueDepleted = true;
  runBatcherQueue(userQueue);
  // dev tool hook
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production') {
    if (inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('flush');
    }
  }
  resetBatcherState();
}

/**
 * Run the watchers in a single queue.
 *
 * @param {Array} queue
 */

function runBatcherQueue(queue) {
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (var i = 0; i < queue.length; i++) {
    var watcher = queue[i];
    var id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        queue.splice(has[id], 1);
        warn('You may have an infinite update loop for watcher ' + 'with expression: ' + watcher.expression);
      }
    }
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

function pushWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    // if an internal watcher is pushed, but the internal
    // queue is already depleted, we run it immediately.
    if (internalQueueDepleted && !watcher.user) {
      watcher.run();
      return;
    }
    // push watcher into appropriate queue
    var q = watcher.user ? userQueue : queue;
    has[id] = q.length;
    q.push(watcher);
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushBatcherQueue);
    }
  }
}

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String} expression
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 *                 - {Function} [postProcess]
 * @constructor
 */
function Watcher(vm, expOrFn, cb, options) {
  // mix in options
  if (options) {
    extend(this, options);
  }
  var isFn = typeof expOrFn === 'function';
  this.vm = vm;
  vm._watchers.push(this);
  this.expression = isFn ? expOrFn.toString() : expOrFn;
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = Object.create(null);
  this.newDeps = null;
  this.prevError = null; // for async error stacks
  // parse expression for getter/setter
  if (isFn) {
    this.getter = expOrFn;
    this.setter = undefined;
  } else {
    var res = parseExpression(expOrFn, this.twoWay);
    this.getter = res.get;
    this.setter = res.set;
  }
  this.value = this.lazy ? undefined : this.get();
  // state for avoiding false triggers for deep and Array
  // watchers during vm._digest()
  this.queued = this.shallow = false;
}

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

Watcher.prototype.addDep = function (dep) {
  var id = dep.id;
  if (!this.newDeps[id]) {
    this.newDeps[id] = dep;
    if (!this.deps[id]) {
      this.deps[id] = dep;
      dep.addSub(this);
    }
  }
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */

Watcher.prototype.get = function () {
  this.beforeGet();
  var scope = this.scope || this.vm;
  var value;
  try {
    value = this.getter.call(scope, scope);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating expression "' + this.expression + '". ' + (config.debug ? '' : 'Turn on debug mode to see stack trace.'), e);
    }
  }
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  if (this.preProcess) {
    value = this.preProcess(value);
  }
  if (this.filters) {
    value = scope._applyFilters(value, null, this.filters, false);
  }
  if (this.postProcess) {
    value = this.postProcess(value);
  }
  this.afterGet();
  return value;
};

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

Watcher.prototype.set = function (value) {
  var scope = this.scope || this.vm;
  if (this.filters) {
    value = scope._applyFilters(value, this.value, this.filters, true);
  }
  try {
    this.setter.call(scope, scope, value);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating setter "' + this.expression + '"', e);
    }
  }
  // two-way sync for v-for alias
  var forContext = scope.$forContext;
  if (forContext && forContext.alias === this.expression) {
    if (forContext.filters) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using two-way binding on ' + 'a v-for alias (' + this.expression + '), and the ' + 'v-for has filters. This will not work properly. ' + 'Either remove the filters or use an array of ' + 'objects and bind to object properties instead.');
      return;
    }
    forContext._withLock(function () {
      if (scope.$key) {
        // original is an object
        forContext.rawValue[scope.$key] = value;
      } else {
        forContext.rawValue.$set(scope.$index, value);
      }
    });
  }
};

/**
 * Prepare for dependency collection.
 */

Watcher.prototype.beforeGet = function () {
  Dep.target = this;
  this.newDeps = Object.create(null);
};

/**
 * Clean up for dependency collection.
 */

Watcher.prototype.afterGet = function () {
  Dep.target = null;
  var ids = Object.keys(this.deps);
  var i = ids.length;
  while (i--) {
    var id = ids[i];
    if (!this.newDeps[id]) {
      this.deps[id].removeSub(this);
    }
  }
  this.deps = this.newDeps;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 *
 * @param {Boolean} shallow
 */

Watcher.prototype.update = function (shallow) {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync || !config.async) {
    this.run();
  } else {
    // if queued, only overwrite shallow with non-shallow,
    // but not the other way around.
    this.shallow = this.queued ? shallow ? this.shallow : false : !!shallow;
    this.queued = true;
    // record before-push error stack in debug mode
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.debug) {
      this.prevError = new Error('[vue] async stack trace');
    }
    pushWatcher(this);
  }
};

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

Watcher.prototype.run = function () {
  if (this.active) {
    var value = this.get();
    if (value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated; but only do so if this is a
    // non-shallow update (caused by a vm digest).
    (isObject(value) || this.deep) && !this.shallow) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      // in debug + async mode, when a watcher callbacks
      // throws, we also throw the saved before-push error
      // so the full cross-tick stack trace is available.
      var prevError = this.prevError;
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.debug && prevError) {
        this.prevError = null;
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          nextTick(function () {
            throw prevError;
          }, 0);
          throw e;
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
    this.queued = this.shallow = false;
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */

Watcher.prototype.evaluate = function () {
  // avoid overwriting another watcher that is being
  // collected.
  var current = Dep.target;
  this.value = this.get();
  this.dirty = false;
  Dep.target = current;
};

/**
 * Depend on all deps collected by this watcher.
 */

Watcher.prototype.depend = function () {
  var depIds = Object.keys(this.deps);
  var i = depIds.length;
  while (i--) {
    this.deps[depIds[i]].depend();
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */

Watcher.prototype.teardown = function () {
  if (this.active) {
    // remove self from vm's watcher list
    // we can skip this if the vm if being destroyed
    // which can improve teardown performance.
    if (!this.vm._isBeingDestroyed) {
      this.vm._watchers.$remove(this);
    }
    var depIds = Object.keys(this.deps);
    var i = depIds.length;
    while (i--) {
      this.deps[depIds[i]].removeSub(this);
    }
    this.active = false;
    this.vm = this.cb = this.value = null;
  }
};

/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {*} val
 */

function traverse(val) {
  var i, keys;
  if (isArray(val)) {
    i = val.length;
    while (i--) traverse(val[i]);
  } else if (isObject(val)) {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) traverse(val[keys[i]]);
  }
}

var cloak = {
  bind: function bind() {
    var el = this.el;
    this.vm.$once('hook:compiled', function () {
      el.removeAttribute('v-cloak');
    });
  }
};

var ref = {
  bind: function bind() {
    process.env.NODE_ENV !== 'production' && warn('v-ref:' + this.arg + ' must be used on a child ' + 'component. Found on <' + this.el.tagName.toLowerCase() + '>.');
  }
};

var el = {

  priority: 1500,

  bind: function bind() {
    /* istanbul ignore if */
    if (!this.arg) {
      return;
    }
    var id = this.id = camelize(this.arg);
    var refs = (this._scope || this.vm).$els;
    if (hasOwn(refs, id)) {
      refs[id] = this.el;
    } else {
      defineReactive(refs, id, this.el);
    }
  },

  unbind: function unbind() {
    var refs = (this._scope || this.vm).$els;
    if (refs[this.id] === this.el) {
      refs[this.id] = null;
    }
  }
};

var prefixes = ['-webkit-', '-moz-', '-ms-'];
var camelPrefixes = ['Webkit', 'Moz', 'ms'];
var importantRE = /!important;?$/;
var propCache = Object.create(null);

var testEl = null;

var style = {

  deep: true,

  update: function update(value) {
    if (typeof value === 'string') {
      this.el.style.cssText = value;
    } else if (isArray(value)) {
      this.handleObject(value.reduce(extend, {}));
    } else {
      this.handleObject(value || {});
    }
  },

  handleObject: function handleObject(value) {
    // cache object styles so that only changed props
    // are actually updated.
    var cache = this.cache || (this.cache = {});
    var name, val;
    for (name in cache) {
      if (!(name in value)) {
        this.handleSingle(name, null);
        delete cache[name];
      }
    }
    for (name in value) {
      val = value[name];
      if (val !== cache[name]) {
        cache[name] = val;
        this.handleSingle(name, val);
      }
    }
  },

  handleSingle: function handleSingle(prop, value) {
    prop = normalize(prop);
    if (!prop) return; // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += '';
    if (value) {
      var isImportant = importantRE.test(value) ? 'important' : '';
      if (isImportant) {
        value = value.replace(importantRE, '').trim();
      }
      this.el.style.setProperty(prop, value, isImportant);
    } else {
      this.el.style.removeProperty(prop);
    }
  }

};

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize(prop) {
  if (propCache[prop]) {
    return propCache[prop];
  }
  var res = prefix(prop);
  propCache[prop] = propCache[res] = res;
  return res;
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix(prop) {
  prop = hyphenate(prop);
  var camel = camelize(prop);
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1);
  if (!testEl) {
    testEl = document.createElement('div');
  }
  if (camel in testEl.style) {
    return prop;
  }
  var i = prefixes.length;
  var prefixed;
  while (i--) {
    prefixed = camelPrefixes[i] + upper;
    if (prefixed in testEl.style) {
      return prefixes[i] + prop;
    }
  }
}

// xlink
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xlinkRE = /^xlink:/;

// check for attributes that prohibit interpolations
var disallowedInterpAttrRE = /^v-|^:|^@|^(is|transition|transition-mode|debounce|track-by|stagger|enter-stagger|leave-stagger)$/;

// these attributes should also set their corresponding properties
// because they only affect the initial state of the element
var attrWithPropsRE = /^(value|checked|selected|muted)$/;

// these attributes should set a hidden property for
// binding v-model to object values
var modelProps = {
  value: '_value',
  'true-value': '_trueValue',
  'false-value': '_falseValue'
};

var bind = {

  priority: 850,

  bind: function bind() {
    var attr = this.arg;
    var tag = this.el.tagName;
    // should be deep watch on object mode
    if (!attr) {
      this.deep = true;
    }
    // handle interpolation bindings
    if (this.descriptor.interp) {
      // only allow binding on native attributes
      if (disallowedInterpAttrRE.test(attr) || attr === 'name' && (tag === 'PARTIAL' || tag === 'SLOT')) {
        process.env.NODE_ENV !== 'production' && warn(attr + '="' + this.descriptor.raw + '": ' + 'attribute interpolation is not allowed in Vue.js ' + 'directives and special attributes.');
        this.el.removeAttribute(attr);
        this.invalid = true;
      }

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production') {
        var raw = attr + '="' + this.descriptor.raw + '": ';
        // warn src
        if (attr === 'src') {
          warn(raw + 'interpolation in "src" attribute will cause ' + 'a 404 request. Use v-bind:src instead.');
        }

        // warn style
        if (attr === 'style') {
          warn(raw + 'interpolation in "style" attribute will cause ' + 'the attribute to be discarded in Internet Explorer. ' + 'Use v-bind:style instead.');
        }
      }
    }
  },

  update: function update(value) {
    if (this.invalid) {
      return;
    }
    var attr = this.arg;
    if (this.arg) {
      this.handleSingle(attr, value);
    } else {
      this.handleObject(value || {});
    }
  },

  // share object handler with v-bind:class
  handleObject: style.handleObject,

  handleSingle: function handleSingle(attr, value) {
    if (!this.descriptor.interp && attrWithPropsRE.test(attr) && attr in this.el) {
      this.el[attr] = attr === 'value' ? value == null // IE9 will set input.value to "null" for null...
      ? '' : value : value;
    }
    // set model props
    var modelProp = modelProps[attr];
    if (modelProp) {
      this.el[modelProp] = value;
      // update v-model if present
      var model = this.el.__v_model;
      if (model) {
        model.listener();
      }
    }
    // do not set value attribute for textarea
    if (attr === 'value' && this.el.tagName === 'TEXTAREA') {
      this.el.removeAttribute(attr);
      return;
    }
    // update attribute
    if (value != null && value !== false) {
      if (xlinkRE.test(attr)) {
        this.el.setAttributeNS(xlinkNS, attr, value);
      } else {
        this.el.setAttribute(attr, value);
      }
    } else {
      this.el.removeAttribute(attr);
    }
  }
};

// keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  'delete': 46,
  up: 38,
  left: 37,
  right: 39,
  down: 40
};

function keyFilter(handler, keys) {
  var codes = keys.map(function (key) {
    var charCode = key.charCodeAt(0);
    if (charCode > 47 && charCode < 58) {
      return parseInt(key, 10);
    }
    if (key.length === 1) {
      charCode = key.toUpperCase().charCodeAt(0);
      if (charCode > 64 && charCode < 91) {
        return charCode;
      }
    }
    return keyCodes[key];
  });
  return function keyHandler(e) {
    if (codes.indexOf(e.keyCode) > -1) {
      return handler.call(this, e);
    }
  };
}

function stopFilter(handler) {
  return function stopHandler(e) {
    e.stopPropagation();
    return handler.call(this, e);
  };
}

function preventFilter(handler) {
  return function preventHandler(e) {
    e.preventDefault();
    return handler.call(this, e);
  };
}

var on = {

  acceptStatement: true,
  priority: 700,

  bind: function bind() {
    // deal with iframes
    if (this.el.tagName === 'IFRAME' && this.arg !== 'load') {
      var self = this;
      this.iframeBind = function () {
        on$1(self.el.contentWindow, self.arg, self.handler);
      };
      this.on('load', this.iframeBind);
    }
  },

  update: function update(handler) {
    // stub a noop for v-on with no value,
    // e.g. @mousedown.prevent
    if (!this.descriptor.raw) {
      handler = function () {};
    }

    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('v-on:' + this.arg + '="' + this.expression + '" expects a function value, ' + 'got ' + handler);
      return;
    }

    // apply modifiers
    if (this.modifiers.stop) {
      handler = stopFilter(handler);
    }
    if (this.modifiers.prevent) {
      handler = preventFilter(handler);
    }
    // key filter
    var keys = Object.keys(this.modifiers).filter(function (key) {
      return key !== 'stop' && key !== 'prevent';
    });
    if (keys.length) {
      handler = keyFilter(handler, keys);
    }

    this.reset();
    this.handler = handler;

    if (this.iframeBind) {
      this.iframeBind();
    } else {
      on$1(this.el, this.arg, this.handler);
    }
  },

  reset: function reset() {
    var el = this.iframeBind ? this.el.contentWindow : this.el;
    if (this.handler) {
      off(el, this.arg, this.handler);
    }
  },

  unbind: function unbind() {
    this.reset();
  }
};

var checkbox = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      return el.hasOwnProperty('_value') ? el._value : self.params.number ? toNumber(el.value) : el.value;
    };

    function getBooleanValue() {
      var val = el.checked;
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue;
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue;
      }
      return val;
    }

    this.listener = function () {
      var model = self._watcher.value;
      if (isArray(model)) {
        var val = self.getValue();
        if (el.checked) {
          if (indexOf(model, val) < 0) {
            model.push(val);
          }
        } else {
          model.$remove(val);
        }
      } else {
        self.set(getBooleanValue());
      }
    };

    this.on('change', this.listener);
    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    var el = this.el;
    if (isArray(value)) {
      el.checked = indexOf(value, this.getValue()) > -1;
    } else {
      if (el.hasOwnProperty('_trueValue')) {
        el.checked = looseEqual(value, el._trueValue);
      } else {
        el.checked = !!value;
      }
    }
  }
};

var select = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    // method to force update DOM using latest value.
    this.forceUpdate = function () {
      if (self._watcher) {
        self.update(self._watcher.get());
      }
    };

    // check if this is a multiple select
    var multiple = this.multiple = el.hasAttribute('multiple');

    // attach listener
    this.listener = function () {
      var value = getValue(el, multiple);
      value = self.params.number ? isArray(value) ? value.map(toNumber) : toNumber(value) : value;
      self.set(value);
    };
    this.on('change', this.listener);

    // if has initial value, set afterBind
    var initValue = getValue(el, multiple, true);
    if (multiple && initValue.length || !multiple && initValue !== null) {
      this.afterBind = this.listener;
    }

    // All major browsers except Firefox resets
    // selectedIndex with value -1 to 0 when the element
    // is appended to a new parent, therefore we have to
    // force a DOM update whenever that happens...
    this.vm.$on('hook:attached', this.forceUpdate);
  },

  update: function update(value) {
    var el = this.el;
    el.selectedIndex = -1;
    var multi = this.multiple && isArray(value);
    var options = el.options;
    var i = options.length;
    var op, val;
    while (i--) {
      op = options[i];
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      /* eslint-disable eqeqeq */
      op.selected = multi ? indexOf$1(value, val) > -1 : looseEqual(value, val);
      /* eslint-enable eqeqeq */
    }
  },

  unbind: function unbind() {
    /* istanbul ignore next */
    this.vm.$off('hook:attached', this.forceUpdate);
  }
};

/**
 * Get select value
 *
 * @param {SelectElement} el
 * @param {Boolean} multi
 * @param {Boolean} init
 * @return {Array|*}
 */

function getValue(el, multi, init) {
  var res = multi ? [] : null;
  var op, val, selected;
  for (var i = 0, l = el.options.length; i < l; i++) {
    op = el.options[i];
    selected = init ? op.hasAttribute('selected') : op.selected;
    if (selected) {
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      if (multi) {
        res.push(val);
      } else {
        return val;
      }
    }
  }
  return res;
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with custom equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf$1(arr, val) {
  var i = arr.length;
  while (i--) {
    if (looseEqual(arr[i], val)) {
      return i;
    }
  }
  return -1;
}

var radio = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      // value overwrite via v-bind:value
      if (el.hasOwnProperty('_value')) {
        return el._value;
      }
      var val = el.value;
      if (self.params.number) {
        val = toNumber(val);
      }
      return val;
    };

    this.listener = function () {
      self.set(self.getValue());
    };
    this.on('change', this.listener);

    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    this.el.checked = looseEqual(value, this.getValue());
  }
};

var text$2 = {

  bind: function bind() {
    var self = this;
    var el = this.el;
    var isRange = el.type === 'range';
    var lazy = this.params.lazy;
    var number = this.params.number;
    var debounce = this.params.debounce;

    // handle composition events.
    //   http://blog.evanyou.me/2014/01/03/composition-event/
    // skip this for Android because it handles composition
    // events quite differently. Android doesn't trigger
    // composition events for language input methods e.g.
    // Chinese, but instead triggers them for spelling
    // suggestions... (see Discussion/#162)
    var composing = false;
    if (!isAndroid && !isRange) {
      this.on('compositionstart', function () {
        composing = true;
      });
      this.on('compositionend', function () {
        composing = false;
        // in IE11 the "compositionend" event fires AFTER
        // the "input" event, so the input handler is blocked
        // at the end... have to call it here.
        //
        // #1327: in lazy mode this is unecessary.
        if (!lazy) {
          self.listener();
        }
      });
    }

    // prevent messing with the input when user is typing,
    // and force update on blur.
    this.focused = false;
    if (!isRange) {
      this.on('focus', function () {
        self.focused = true;
      });
      this.on('blur', function () {
        self.focused = false;
        // do not sync value after fragment removal (#2017)
        if (!self._frag || self._frag.inserted) {
          self.rawListener();
        }
      });
    }

    // Now attach the main listener
    this.listener = this.rawListener = function () {
      if (composing || !self._bound) {
        return;
      }
      var val = number || isRange ? toNumber(el.value) : el.value;
      self.set(val);
      // force update on next tick to avoid lock & same value
      // also only update when user is not typing
      nextTick(function () {
        if (self._bound && !self.focused) {
          self.update(self._watcher.value);
        }
      });
    };

    // apply debounce
    if (debounce) {
      this.listener = _debounce(this.listener, debounce);
    }

    // Support jQuery events, since jQuery.trigger() doesn't
    // trigger native events in some cases and some plugins
    // rely on $.trigger()
    //
    // We want to make sure if a listener is attached using
    // jQuery, it is also removed with jQuery, that's why
    // we do the check for each directive instance and
    // store that check result on itself. This also allows
    // easier test coverage control by unsetting the global
    // jQuery variable in tests.
    this.hasjQuery = typeof jQuery === 'function';
    if (this.hasjQuery) {
      jQuery(el).on('change', this.listener);
      if (!lazy) {
        jQuery(el).on('input', this.listener);
      }
    } else {
      this.on('change', this.listener);
      if (!lazy) {
        this.on('input', this.listener);
      }
    }

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && isIE9) {
      this.on('cut', function () {
        nextTick(self.listener);
      });
      this.on('keyup', function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener();
        }
      });
    }

    // set initial value if present
    if (el.hasAttribute('value') || el.tagName === 'TEXTAREA' && el.value.trim()) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    this.el.value = _toString(value);
  },

  unbind: function unbind() {
    var el = this.el;
    if (this.hasjQuery) {
      jQuery(el).off('change', this.listener);
      jQuery(el).off('input', this.listener);
    }
  }
};

var handlers = {
  text: text$2,
  radio: radio,
  select: select,
  checkbox: checkbox
};

var model = {

  priority: 800,
  twoWay: true,
  handlers: handlers,
  params: ['lazy', 'number', 'debounce'],

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   */

  bind: function bind() {
    // friendly warning...
    this.checkFilters();
    if (this.hasRead && !this.hasWrite) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using a read-only filter with ' + 'v-model. You might want to use a two-way filter ' + 'to ensure correct behavior.');
    }
    var el = this.el;
    var tag = el.tagName;
    var handler;
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text;
    } else if (tag === 'SELECT') {
      handler = handlers.select;
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text;
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-model does not support element type: ' + tag);
      return;
    }
    el.__v_model = this;
    handler.bind.call(this);
    this.update = handler.update;
    this._unbind = handler.unbind;
  },

  /**
   * Check read/write filter stats.
   */

  checkFilters: function checkFilters() {
    var filters = this.filters;
    if (!filters) return;
    var i = filters.length;
    while (i--) {
      var filter = resolveAsset(this.vm.$options, 'filters', filters[i].name);
      if (typeof filter === 'function' || filter.read) {
        this.hasRead = true;
      }
      if (filter.write) {
        this.hasWrite = true;
      }
    }
  },

  unbind: function unbind() {
    this.el.__v_model = null;
    this._unbind && this._unbind();
  }
};

var show = {

  bind: function bind() {
    // check else block
    var next = this.el.nextElementSibling;
    if (next && getAttr(next, 'v-else') !== null) {
      this.elseEl = next;
    }
  },

  update: function update(value) {
    this.apply(this.el, value);
    if (this.elseEl) {
      this.apply(this.elseEl, !value);
    }
  },

  apply: function apply(el, value) {
    if (inDoc(el)) {
      applyTransition(el, value ? 1 : -1, toggle, this.vm);
    } else {
      toggle();
    }
    function toggle() {
      el.style.display = value ? '' : 'none';
    }
  }
};

var templateCache = new Cache(1000);
var idSelectorCache = new Cache(1000);

var map = {
  efault: [0, '', ''],
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>']
};

map.td = map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option = map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead = map.tbody = map.colgroup = map.caption = map.tfoot = [1, '<table>', '</table>'];

map.g = map.defs = map.symbol = map.use = map.image = map.text = map.circle = map.ellipse = map.line = map.path = map.polygon = map.polyline = map.rect = [1, '<svg ' + 'xmlns="http://www.w3.org/2000/svg" ' + 'xmlns:xlink="http://www.w3.org/1999/xlink" ' + 'xmlns:ev="http://www.w3.org/2001/xml-events"' + 'version="1.1">', '</svg>'];

/**
 * Check if a node is a supported template node with a
 * DocumentFragment content.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isRealTemplate(node) {
  return isTemplate(node) && node.content instanceof DocumentFragment;
}

var tagRE$1 = /<([\w:]+)/;
var entityRE = /&#?\w+?;/;

/**
 * Convert a string template to a DocumentFragment.
 * Determines correct wrapping by tag types. Wrapping
 * strategy found in jQuery & component/domify.
 *
 * @param {String} templateString
 * @param {Boolean} raw
 * @return {DocumentFragment}
 */

function stringToFragment(templateString, raw) {
  // try a cache hit first
  var hit = templateCache.get(templateString);
  if (hit) {
    return hit;
  }

  var frag = document.createDocumentFragment();
  var tagMatch = templateString.match(tagRE$1);
  var entityMatch = entityRE.test(templateString);

  if (!tagMatch && !entityMatch) {
    // text only, return a single text node.
    frag.appendChild(document.createTextNode(templateString));
  } else {

    var tag = tagMatch && tagMatch[1];
    var wrap = map[tag] || map.efault;
    var depth = wrap[0];
    var prefix = wrap[1];
    var suffix = wrap[2];
    var node = document.createElement('div');

    if (!raw) {
      templateString = templateString.trim();
    }
    node.innerHTML = prefix + templateString + suffix;
    while (depth--) {
      node = node.lastChild;
    }

    var child;
    /* eslint-disable no-cond-assign */
    while (child = node.firstChild) {
      /* eslint-enable no-cond-assign */
      frag.appendChild(child);
    }
  }

  templateCache.put(templateString, frag);
  return frag;
}

/**
 * Convert a template node to a DocumentFragment.
 *
 * @param {Node} node
 * @return {DocumentFragment}
 */

function nodeToFragment(node) {
  // if its a template tag and the browser supports it,
  // its content is already a document fragment.
  if (isRealTemplate(node)) {
    trimNode(node.content);
    return node.content;
  }
  // script template
  if (node.tagName === 'SCRIPT') {
    return stringToFragment(node.textContent);
  }
  // normal node, clone it to avoid mutating the original
  var clonedNode = cloneNode(node);
  var frag = document.createDocumentFragment();
  var child;
  /* eslint-disable no-cond-assign */
  while (child = clonedNode.firstChild) {
    /* eslint-enable no-cond-assign */
    frag.appendChild(child);
  }
  trimNode(frag);
  return frag;
}

// Test for the presence of the Safari template cloning bug
// https://bugs.webkit.org/showug.cgi?id=137755
var hasBrokenTemplate = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var a = document.createElement('div');
    a.innerHTML = '<template>1</template>';
    return !a.cloneNode(true).firstChild.innerHTML;
  } else {
    return false;
  }
})();

// Test for IE10/11 textarea placeholder clone bug
var hasTextareaCloneBug = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var t = document.createElement('textarea');
    t.placeholder = 't';
    return t.cloneNode(true).value === 't';
  } else {
    return false;
  }
})();

/**
 * 1. Deal with Safari cloning nested <template> bug by
 *    manually cloning all template instances.
 * 2. Deal with IE10/11 textarea placeholder bug by setting
 *    the correct value after cloning.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

function cloneNode(node) {
  if (!node.querySelectorAll) {
    return node.cloneNode();
  }
  var res = node.cloneNode(true);
  var i, original, cloned;
  /* istanbul ignore if */
  if (hasBrokenTemplate) {
    var tempClone = res;
    if (isRealTemplate(node)) {
      node = node.content;
      tempClone = res.content;
    }
    original = node.querySelectorAll('template');
    if (original.length) {
      cloned = tempClone.querySelectorAll('template');
      i = cloned.length;
      while (i--) {
        cloned[i].parentNode.replaceChild(cloneNode(original[i]), cloned[i]);
      }
    }
  }
  /* istanbul ignore if */
  if (hasTextareaCloneBug) {
    if (node.tagName === 'TEXTAREA') {
      res.value = node.value;
    } else {
      original = node.querySelectorAll('textarea');
      if (original.length) {
        cloned = res.querySelectorAll('textarea');
        i = cloned.length;
        while (i--) {
          cloned[i].value = original[i].value;
        }
      }
    }
  }
  return res;
}

/**
 * Process the template option and normalizes it into a
 * a DocumentFragment that can be used as a partial or a
 * instance template.
 *
 * @param {*} template
 *        Possible values include:
 *        - DocumentFragment object
 *        - Node object of type Template
 *        - id selector: '#some-template-id'
 *        - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} shouldClone
 * @param {Boolean} raw
 *        inline HTML interpolation. Do not check for id
 *        selector and keep whitespace in the string.
 * @return {DocumentFragment|undefined}
 */

function parseTemplate(template, shouldClone, raw) {
  var node, frag;

  // if the template is already a document fragment,
  // do nothing
  if (template instanceof DocumentFragment) {
    trimNode(template);
    return shouldClone ? cloneNode(template) : template;
  }

  if (typeof template === 'string') {
    // id selector
    if (!raw && template.charAt(0) === '#') {
      // id selector can be cached too
      frag = idSelectorCache.get(template);
      if (!frag) {
        node = document.getElementById(template.slice(1));
        if (node) {
          frag = nodeToFragment(node);
          // save selector to cache
          idSelectorCache.put(template, frag);
        }
      }
    } else {
      // normal string template
      frag = stringToFragment(template, raw);
    }
  } else if (template.nodeType) {
    // a direct node
    frag = nodeToFragment(template);
  }

  return frag && shouldClone ? cloneNode(frag) : frag;
}

var template = Object.freeze({
  cloneNode: cloneNode,
  parseTemplate: parseTemplate
});

/**
 * Abstraction for a partially-compiled fragment.
 * Can optionally compile content with a child scope.
 *
 * @param {Function} linker
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Vue} [host]
 * @param {Object} [scope]
 */
function Fragment(linker, vm, frag, host, scope, parentFrag) {
  this.children = [];
  this.childFrags = [];
  this.vm = vm;
  this.scope = scope;
  this.inserted = false;
  this.parentFrag = parentFrag;
  if (parentFrag) {
    parentFrag.childFrags.push(this);
  }
  this.unlink = linker(vm, frag, host, scope, this);
  var single = this.single = frag.childNodes.length === 1 &&
  // do not go single mode if the only node is an anchor
  !frag.childNodes[0].__vue_anchor;
  if (single) {
    this.node = frag.childNodes[0];
    this.before = singleBefore;
    this.remove = singleRemove;
  } else {
    this.node = createAnchor('fragment-start');
    this.end = createAnchor('fragment-end');
    this.frag = frag;
    prepend(this.node, frag);
    frag.appendChild(this.end);
    this.before = multiBefore;
    this.remove = multiRemove;
  }
  this.node.__vfrag__ = this;
}

/**
 * Call attach/detach for all components contained within
 * this fragment. Also do so recursively for all child
 * fragments.
 *
 * @param {Function} hook
 */

Fragment.prototype.callHook = function (hook) {
  var i, l;
  for (i = 0, l = this.children.length; i < l; i++) {
    hook(this.children[i]);
  }
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    this.childFrags[i].callHook(hook);
  }
};

/**
 * Destroy the fragment.
 */

Fragment.prototype.destroy = function () {
  if (this.parentFrag) {
    this.parentFrag.childFrags.$remove(this);
  }
  this.unlink();
};

/**
 * Insert fragment before target, single node version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function singleBefore(target, withTransition) {
  this.inserted = true;
  var method = withTransition !== false ? beforeWithTransition : before;
  method(this.node, target, this.vm);
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, single node version
 */

function singleRemove() {
  this.inserted = false;
  var shouldCallRemove = inDoc(this.node);
  var self = this;
  self.callHook(destroyChild);
  removeWithTransition(this.node, this.vm, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Insert fragment before target, multi-nodes version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function multiBefore(target, withTransition) {
  this.inserted = true;
  var vm = this.vm;
  var method = withTransition !== false ? beforeWithTransition : before;
  mapNodeRange(this.node, this.end, function (node) {
    method(node, target, vm);
  });
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, multi-nodes version
 */

function multiRemove() {
  this.inserted = false;
  var self = this;
  var shouldCallRemove = inDoc(this.node);
  self.callHook(destroyChild);
  removeNodeRange(this.node, this.end, this.vm, this.frag, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Call attach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function attach(child) {
  if (!child._isAttached) {
    child._callHook('attached');
  }
}

/**
 * Call destroy for all contained instances,
 * with remove:false and defer:true.
 * Defer is necessary because we need to
 * keep the children to call detach hooks
 * on them.
 *
 * @param {Vue} child
 */

function destroyChild(child) {
  child.$destroy(false, true);
}

/**
 * Call detach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function detach(child) {
  if (child._isAttached) {
    child._callHook('detached');
  }
}

var linkerCache = new Cache(5000);

/**
 * A factory that can be used to create instances of a
 * fragment. Caches the compiled linker if possible.
 *
 * @param {Vue} vm
 * @param {Element|String} el
 */
function FragmentFactory(vm, el) {
  this.vm = vm;
  var template;
  var isString = typeof el === 'string';
  if (isString || isTemplate(el)) {
    template = parseTemplate(el, true);
  } else {
    template = document.createDocumentFragment();
    template.appendChild(el);
  }
  this.template = template;
  // linker can be cached, but only for components
  var linker;
  var cid = vm.constructor.cid;
  if (cid > 0) {
    var cacheId = cid + (isString ? el : el.outerHTML);
    linker = linkerCache.get(cacheId);
    if (!linker) {
      linker = compile(template, vm.$options, true);
      linkerCache.put(cacheId, linker);
    }
  } else {
    linker = compile(template, vm.$options, true);
  }
  this.linker = linker;
}

/**
 * Create a fragment instance with given host and scope.
 *
 * @param {Vue} host
 * @param {Object} scope
 * @param {Fragment} parentFrag
 */

FragmentFactory.prototype.create = function (host, scope, parentFrag) {
  var frag = cloneNode(this.template);
  return new Fragment(this.linker, this.vm, frag, host, scope, parentFrag);
};

var vIf = {

  priority: 2000,

  bind: function bind() {
    var el = this.el;
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling;
      if (next && getAttr(next, 'v-else') !== null) {
        remove(next);
        this.elseFactory = new FragmentFactory(this.vm, next);
      }
      // check main block
      this.anchor = createAnchor('v-if');
      replace(el, this.anchor);
      this.factory = new FragmentFactory(this.vm, el);
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-if="' + this.expression + '" cannot be ' + 'used on an instance root element.');
      this.invalid = true;
    }
  },

  update: function update(value) {
    if (this.invalid) return;
    if (value) {
      if (!this.frag) {
        this.insert();
      }
    } else {
      this.remove();
    }
  },

  insert: function insert() {
    if (this.elseFrag) {
      this.elseFrag.remove();
      this.elseFrag = null;
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag);
    this.frag.before(this.anchor);
  },

  remove: function remove() {
    if (this.frag) {
      this.frag.remove();
      this.frag = null;
    }
    if (this.elseFactory && !this.elseFrag) {
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag);
      this.elseFrag.before(this.anchor);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
  }
};

var uid$1 = 0;

var vFor = {

  priority: 2000,

  params: ['track-by', 'stagger', 'enter-stagger', 'leave-stagger'],

  bind: function bind() {
    // support "item in items" syntax
    var inMatch = this.expression.match(/(.*) in (.*)/);
    if (inMatch) {
      var itMatch = inMatch[1].match(/\((.*),(.*)\)/);
      if (itMatch) {
        this.iterator = itMatch[1].trim();
        this.alias = itMatch[2].trim();
      } else {
        this.alias = inMatch[1].trim();
      }
      this.expression = inMatch[2];
    }

    if (!this.alias) {
      process.env.NODE_ENV !== 'production' && warn('Alias is required in v-for.');
      return;
    }

    // uid as a cache identifier
    this.id = '__v-for__' + ++uid$1;

    // check if this is an option list,
    // so that we know if we need to update the <select>'s
    // v-model when the option list has changed.
    // because v-model has a lower priority than v-for,
    // the v-model is not bound here yet, so we have to
    // retrive it in the actual updateModel() function.
    var tag = this.el.tagName;
    this.isOption = (tag === 'OPTION' || tag === 'OPTGROUP') && this.el.parentNode.tagName === 'SELECT';

    // setup anchor nodes
    this.start = createAnchor('v-for-start');
    this.end = createAnchor('v-for-end');
    replace(this.el, this.end);
    before(this.start, this.end);

    // cache
    this.cache = Object.create(null);

    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el);
  },

  update: function update(data) {
    this.diff(data);
    this.updateRef();
    this.updateModel();
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   */

  diff: function diff(data) {
    // check if the Array was converted from an Object
    var item = data[0];
    var convertedFromObject = this.fromObject = isObject(item) && hasOwn(item, '$key') && hasOwn(item, '$value');

    var trackByKey = this.params.trackBy;
    var oldFrags = this.frags;
    var frags = this.frags = new Array(data.length);
    var alias = this.alias;
    var iterator = this.iterator;
    var start = this.start;
    var end = this.end;
    var inDocument = inDoc(start);
    var init = !oldFrags;
    var i, l, frag, key, value, primitive;

    // First pass, go through the new Array and fill up
    // the new frags array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      item = data[i];
      key = convertedFromObject ? item.$key : null;
      value = convertedFromObject ? item.$value : item;
      primitive = !isObject(value);
      frag = !init && this.getCachedFrag(value, i, key);
      if (frag) {
        // reusable fragment
        frag.reused = true;
        // update $index
        frag.scope.$index = i;
        // update $key
        if (key) {
          frag.scope.$key = key;
        }
        // update iterator
        if (iterator) {
          frag.scope[iterator] = key !== null ? key : i;
        }
        // update data for track-by, object repeat &
        // primitive values.
        if (trackByKey || convertedFromObject || primitive) {
          frag.scope[alias] = value;
        }
      } else {
        // new isntance
        frag = this.create(value, alias, i, key);
        frag.fresh = !init;
      }
      frags[i] = frag;
      if (init) {
        frag.before(end);
      }
    }

    // we're done for the initial render.
    if (init) {
      return;
    }

    // Second pass, go through the old fragments and
    // destroy those who are not reused (and remove them
    // from cache)
    var removalIndex = 0;
    var totalRemoved = oldFrags.length - frags.length;
    for (i = 0, l = oldFrags.length; i < l; i++) {
      frag = oldFrags[i];
      if (!frag.reused) {
        this.deleteCachedFrag(frag);
        this.remove(frag, removalIndex++, totalRemoved, inDocument);
      }
    }

    // Final pass, move/insert new fragments into the
    // right place.
    var targetPrev, prevEl, currentPrev;
    var insertionIndex = 0;
    for (i = 0, l = frags.length; i < l; i++) {
      frag = frags[i];
      // this is the frag that we should be after
      targetPrev = frags[i - 1];
      prevEl = targetPrev ? targetPrev.staggerCb ? targetPrev.staggerAnchor : targetPrev.end || targetPrev.node : start;
      if (frag.reused && !frag.staggerCb) {
        currentPrev = findPrevFrag(frag, start, this.id);
        if (currentPrev !== targetPrev && (!currentPrev ||
        // optimization for moving a single item.
        // thanks to suggestions by @livoras in #1807
        findPrevFrag(currentPrev, start, this.id) !== targetPrev)) {
          this.move(frag, prevEl);
        }
      } else {
        // new instance, or still in stagger.
        // insert with updated stagger index.
        this.insert(frag, insertionIndex++, prevEl, inDocument);
      }
      frag.reused = frag.fresh = false;
    }
  },

  /**
   * Create a new fragment instance.
   *
   * @param {*} value
   * @param {String} alias
   * @param {Number} index
   * @param {String} [key]
   * @return {Fragment}
   */

  create: function create(value, alias, index, key) {
    var host = this._host;
    // create iteration scope
    var parentScope = this._scope || this.vm;
    var scope = Object.create(parentScope);
    // ref holder for the scope
    scope.$refs = Object.create(parentScope.$refs);
    scope.$els = Object.create(parentScope.$els);
    // make sure point $parent to parent scope
    scope.$parent = parentScope;
    // for two-way binding on alias
    scope.$forContext = this;
    // define scope properties
    defineReactive(scope, alias, value);
    defineReactive(scope, '$index', index);
    if (key) {
      defineReactive(scope, '$key', key);
    } else if (scope.$key) {
      // avoid accidental fallback
      def(scope, '$key', null);
    }
    if (this.iterator) {
      defineReactive(scope, this.iterator, key !== null ? key : index);
    }
    var frag = this.factory.create(host, scope, this._frag);
    frag.forId = this.id;
    this.cacheFrag(value, frag, index, key);
    return frag;
  },

  /**
   * Update the v-ref on owner vm.
   */

  updateRef: function updateRef() {
    var ref = this.descriptor.ref;
    if (!ref) return;
    var hash = (this._scope || this.vm).$refs;
    var refs;
    if (!this.fromObject) {
      refs = this.frags.map(findVmFromFrag);
    } else {
      refs = {};
      this.frags.forEach(function (frag) {
        refs[frag.scope.$key] = findVmFromFrag(frag);
      });
    }
    hash[ref] = refs;
  },

  /**
   * For option lists, update the containing v-model on
   * parent <select>.
   */

  updateModel: function updateModel() {
    if (this.isOption) {
      var parent = this.start.parentNode;
      var model = parent && parent.__v_model;
      if (model) {
        model.forceUpdate();
      }
    }
  },

  /**
   * Insert a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Node} prevEl
   * @param {Boolean} inDocument
   */

  insert: function insert(frag, index, prevEl, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
    }
    var staggerAmount = this.getStagger(frag, index, null, 'enter');
    if (inDocument && staggerAmount) {
      // create an anchor and insert it synchronously,
      // so that we can resolve the correct order without
      // worrying about some elements not inserted yet
      var anchor = frag.staggerAnchor;
      if (!anchor) {
        anchor = frag.staggerAnchor = createAnchor('stagger-anchor');
        anchor.__vfrag__ = frag;
      }
      after(anchor, prevEl);
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.before(anchor);
        remove(anchor);
      });
      setTimeout(op, staggerAmount);
    } else {
      frag.before(prevEl.nextSibling);
    }
  },

  /**
   * Remove a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {Boolean} inDocument
   */

  remove: function remove(frag, index, total, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
      // it's not possible for the same frag to be removed
      // twice, so if we have a pending stagger callback,
      // it means this frag is queued for enter but removed
      // before its transition started. Since it is already
      // destroyed, we can just leave it in detached state.
      return;
    }
    var staggerAmount = this.getStagger(frag, index, total, 'leave');
    if (inDocument && staggerAmount) {
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.remove();
      });
      setTimeout(op, staggerAmount);
    } else {
      frag.remove();
    }
  },

  /**
   * Move a fragment to a new position.
   * Force no transition.
   *
   * @param {Fragment} frag
   * @param {Node} prevEl
   */

  move: function move(frag, prevEl) {
    frag.before(prevEl.nextSibling, false);
  },

  /**
   * Cache a fragment using track-by or the object key.
   *
   * @param {*} value
   * @param {Fragment} frag
   * @param {Number} index
   * @param {String} [key]
   */

  cacheFrag: function cacheFrag(value, frag, index, key) {
    var trackByKey = this.params.trackBy;
    var cache = this.cache;
    var primitive = !isObject(value);
    var id;
    if (key || trackByKey || primitive) {
      id = trackByKey ? trackByKey === '$index' ? index : value[trackByKey] : key || value;
      if (!cache[id]) {
        cache[id] = frag;
      } else if (trackByKey !== '$index') {
        process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
      }
    } else {
      id = this.id;
      if (hasOwn(value, id)) {
        if (value[id] === null) {
          value[id] = frag;
        } else {
          process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
        }
      } else {
        def(value, id, frag);
      }
    }
    frag.raw = value;
  },

  /**
   * Get a cached fragment from the value/index/key
   *
   * @param {*} value
   * @param {Number} index
   * @param {String} key
   * @return {Fragment}
   */

  getCachedFrag: function getCachedFrag(value, index, key) {
    var trackByKey = this.params.trackBy;
    var primitive = !isObject(value);
    var frag;
    if (key || trackByKey || primitive) {
      var id = trackByKey ? trackByKey === '$index' ? index : value[trackByKey] : key || value;
      frag = this.cache[id];
    } else {
      frag = value[this.id];
    }
    if (frag && (frag.reused || frag.fresh)) {
      process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
    }
    return frag;
  },

  /**
   * Delete a fragment from cache.
   *
   * @param {Fragment} frag
   */

  deleteCachedFrag: function deleteCachedFrag(frag) {
    var value = frag.raw;
    var trackByKey = this.params.trackBy;
    var scope = frag.scope;
    var index = scope.$index;
    // fix #948: avoid accidentally fall through to
    // a parent repeater which happens to have $key.
    var key = hasOwn(scope, '$key') && scope.$key;
    var primitive = !isObject(value);
    if (trackByKey || key || primitive) {
      var id = trackByKey ? trackByKey === '$index' ? index : value[trackByKey] : key || value;
      this.cache[id] = null;
    } else {
      value[this.id] = null;
      frag.raw = null;
    }
  },

  /**
   * Get the stagger amount for an insertion/removal.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {String} type
   */

  getStagger: function getStagger(frag, index, total, type) {
    type = type + 'Stagger';
    var trans = frag.node.__v_trans;
    var hooks = trans && trans.hooks;
    var hook = hooks && (hooks[type] || hooks.stagger);
    return hook ? hook.call(frag, index, total) : index * parseInt(this.params[type] || this.params.stagger, 10);
  },

  /**
   * Pre-process the value before piping it through the
   * filters. This is passed to and called by the watcher.
   */

  _preProcess: function _preProcess(value) {
    // regardless of type, store the un-filtered raw value.
    this.rawValue = value;
    return value;
  },

  /**
   * Post-process the value after it has been piped through
   * the filters. This is passed to and called by the watcher.
   *
   * It is necessary for this to be called during the
   * wathcer's dependency collection phase because we want
   * the v-for to update when the source Object is mutated.
   */

  _postProcess: function _postProcess(value) {
    if (isArray(value)) {
      return value;
    } else if (isPlainObject(value)) {
      // convert plain object to array.
      var keys = Object.keys(value);
      var i = keys.length;
      var res = new Array(i);
      var key;
      while (i--) {
        key = keys[i];
        res[i] = {
          $key: key,
          $value: value[key]
        };
      }
      return res;
    } else {
      if (typeof value === 'number') {
        value = range(value);
      }
      return value || [];
    }
  },

  unbind: function unbind() {
    if (this.descriptor.ref) {
      (this._scope || this.vm).$refs[this.descriptor.ref] = null;
    }
    if (this.frags) {
      var i = this.frags.length;
      var frag;
      while (i--) {
        frag = this.frags[i];
        this.deleteCachedFrag(frag);
        frag.destroy();
      }
    }
  }
};

/**
 * Helper to find the previous element that is a fragment
 * anchor. This is necessary because a destroyed frag's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its inserted flag
 * should have been set to false so we can skip them.
 *
 * If this is a block repeat, we want to make sure we only
 * return frag that is bound to this v-for. (see #929)
 *
 * @param {Fragment} frag
 * @param {Comment|Text} anchor
 * @param {String} id
 * @return {Fragment}
 */

function findPrevFrag(frag, anchor, id) {
  var el = frag.node.previousSibling;
  /* istanbul ignore if */
  if (!el) return;
  frag = el.__vfrag__;
  while ((!frag || frag.forId !== id || !frag.inserted) && el !== anchor) {
    el = el.previousSibling;
    /* istanbul ignore if */
    if (!el) return;
    frag = el.__vfrag__;
  }
  return frag;
}

/**
 * Find a vm from a fragment.
 *
 * @param {Fragment} frag
 * @return {Vue|undefined}
 */

function findVmFromFrag(frag) {
  var node = frag.node;
  // handle multi-node frag
  if (frag.end) {
    while (!node.__vue__ && node !== frag.end && node.nextSibling) {
      node = node.nextSibling;
    }
  }
  return node.__vue__;
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range(n) {
  var i = -1;
  var ret = new Array(n);
  while (++i < n) {
    ret[i] = i;
  }
  return ret;
}

if (process.env.NODE_ENV !== 'production') {
  vFor.warnDuplicate = function (value) {
    warn('Duplicate value found in v-for="' + this.descriptor.raw + '": ' + JSON.stringify(value) + '. Use track-by="$index" if ' + 'you are expecting duplicate values.');
  };
}

var html = {

  bind: function bind() {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = [];
      // replace the placeholder with proper anchor
      this.anchor = createAnchor('v-html');
      replace(this.el, this.anchor);
    }
  },

  update: function update(value) {
    value = _toString(value);
    if (this.nodes) {
      this.swap(value);
    } else {
      this.el.innerHTML = value;
    }
  },

  swap: function swap(value) {
    // remove old nodes
    var i = this.nodes.length;
    while (i--) {
      remove(this.nodes[i]);
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = parseTemplate(value, true, true);
    // save a reference to these nodes so we can remove later
    this.nodes = toArray(frag.childNodes);
    before(frag, this.anchor);
  }
};

var text = {

  bind: function bind() {
    this.attr = this.el.nodeType === 3 ? 'data' : 'textContent';
  },

  update: function update(value) {
    this.el[this.attr] = _toString(value);
  }
};

// must export plain object
var publicDirectives = {
  text: text,
  html: html,
  'for': vFor,
  'if': vIf,
  show: show,
  model: model,
  on: on,
  bind: bind,
  el: el,
  ref: ref,
  cloak: cloak
};

var queue$1 = [];
var queued = false;

/**
 * Push a job into the queue.
 *
 * @param {Function} job
 */

function pushJob(job) {
  queue$1.push(job);
  if (!queued) {
    queued = true;
    nextTick(flush);
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush() {
  // Force layout
  var f = document.documentElement.offsetHeight;
  for (var i = 0; i < queue$1.length; i++) {
    queue$1[i]();
  }
  queue$1 = [];
  queued = false;
  // dummy return, so js linters don't complain about
  // unused variable f
  return f;
}

var TYPE_TRANSITION = 1;
var TYPE_ANIMATION = 2;
var transDurationProp = transitionProp + 'Duration';
var animDurationProp = animationProp + 'Duration';

/**
 * A Transition object that encapsulates the state and logic
 * of the transition.
 *
 * @param {Element} el
 * @param {String} id
 * @param {Object} hooks
 * @param {Vue} vm
 */
function Transition(el, id, hooks, vm) {
  this.id = id;
  this.el = el;
  this.enterClass = id + '-enter';
  this.leaveClass = id + '-leave';
  this.hooks = hooks;
  this.vm = vm;
  // async state
  this.pendingCssEvent = this.pendingCssCb = this.cancel = this.pendingJsCb = this.op = this.cb = null;
  this.justEntered = false;
  this.entered = this.left = false;
  this.typeCache = {};
  // bind
  var self = this;['enterNextTick', 'enterDone', 'leaveNextTick', 'leaveDone'].forEach(function (m) {
    self[m] = bind$1(self[m], self);
  });
}

var p$1 = Transition.prototype;

/**
 * Start an entering transition.
 *
 * 1. enter transition triggered
 * 2. call beforeEnter hook
 * 3. add enter class
 * 4. insert/show element
 * 5. call enter hook (with possible explicit js callback)
 * 6. reflow
 * 7. based on transition type:
 *    - transition:
 *        remove class now, wait for transitionend,
 *        then done if there's no explicit js callback.
 *    - animation:
 *        wait for animationend, remove class,
 *        then done if there's no explicit js callback.
 *    - no css transition:
 *        done now if there's no explicit js callback.
 * 8. wait for either done or js callback, then call
 *    afterEnter hook.
 *
 * @param {Function} op - insert/show the element
 * @param {Function} [cb]
 */

p$1.enter = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeEnter');
  this.cb = cb;
  addClass(this.el, this.enterClass);
  op();
  this.entered = false;
  this.callHookWithCb('enter');
  if (this.entered) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.enterCancelled;
  pushJob(this.enterNextTick);
};

/**
 * The "nextTick" phase of an entering transition, which is
 * to be pushed into a queue and executed after a reflow so
 * that removing the class can trigger a CSS transition.
 */

p$1.enterNextTick = function () {

  // Important hack:
  // in Chrome, if a just-entered element is applied the
  // leave class while its interpolated property still has
  // a very small value (within one frame), Chrome will
  // skip the leave transition entirely and not firing the
  // transtionend event. Therefore we need to protected
  // against such cases using a one-frame timeout.
  this.justEntered = true;
  var self = this;
  setTimeout(function () {
    self.justEntered = false;
  }, 17);

  var enterDone = this.enterDone;
  var type = this.getCssTransitionType(this.enterClass);
  if (!this.pendingJsCb) {
    if (type === TYPE_TRANSITION) {
      // trigger transition by removing enter class now
      removeClass(this.el, this.enterClass);
      this.setupCssCb(transitionEndEvent, enterDone);
    } else if (type === TYPE_ANIMATION) {
      this.setupCssCb(animationEndEvent, enterDone);
    } else {
      enterDone();
    }
  } else if (type === TYPE_TRANSITION) {
    removeClass(this.el, this.enterClass);
  }
};

/**
 * The "cleanup" phase of an entering transition.
 */

p$1.enterDone = function () {
  this.entered = true;
  this.cancel = this.pendingJsCb = null;
  removeClass(this.el, this.enterClass);
  this.callHook('afterEnter');
  if (this.cb) this.cb();
};

/**
 * Start a leaving transition.
 *
 * 1. leave transition triggered.
 * 2. call beforeLeave hook
 * 3. add leave class (trigger css transition)
 * 4. call leave hook (with possible explicit js callback)
 * 5. reflow if no explicit js callback is provided
 * 6. based on transition type:
 *    - transition or animation:
 *        wait for end event, remove class, then done if
 *        there's no explicit js callback.
 *    - no css transition:
 *        done if there's no explicit js callback.
 * 7. wait for either done or js callback, then call
 *    afterLeave hook.
 *
 * @param {Function} op - remove/hide the element
 * @param {Function} [cb]
 */

p$1.leave = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeLeave');
  this.op = op;
  this.cb = cb;
  addClass(this.el, this.leaveClass);
  this.left = false;
  this.callHookWithCb('leave');
  if (this.left) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.leaveCancelled;
  // only need to handle leaveDone if
  // 1. the transition is already done (synchronously called
  //    by the user, which causes this.op set to null)
  // 2. there's no explicit js callback
  if (this.op && !this.pendingJsCb) {
    // if a CSS transition leaves immediately after enter,
    // the transitionend event never fires. therefore we
    // detect such cases and end the leave immediately.
    if (this.justEntered) {
      this.leaveDone();
    } else {
      pushJob(this.leaveNextTick);
    }
  }
};

/**
 * The "nextTick" phase of a leaving transition.
 */

p$1.leaveNextTick = function () {
  var type = this.getCssTransitionType(this.leaveClass);
  if (type) {
    var event = type === TYPE_TRANSITION ? transitionEndEvent : animationEndEvent;
    this.setupCssCb(event, this.leaveDone);
  } else {
    this.leaveDone();
  }
};

/**
 * The "cleanup" phase of a leaving transition.
 */

p$1.leaveDone = function () {
  this.left = true;
  this.cancel = this.pendingJsCb = null;
  this.op();
  removeClass(this.el, this.leaveClass);
  this.callHook('afterLeave');
  if (this.cb) this.cb();
  this.op = null;
};

/**
 * Cancel any pending callbacks from a previously running
 * but not finished transition.
 */

p$1.cancelPending = function () {
  this.op = this.cb = null;
  var hasPending = false;
  if (this.pendingCssCb) {
    hasPending = true;
    off(this.el, this.pendingCssEvent, this.pendingCssCb);
    this.pendingCssEvent = this.pendingCssCb = null;
  }
  if (this.pendingJsCb) {
    hasPending = true;
    this.pendingJsCb.cancel();
    this.pendingJsCb = null;
  }
  if (hasPending) {
    removeClass(this.el, this.enterClass);
    removeClass(this.el, this.leaveClass);
  }
  if (this.cancel) {
    this.cancel.call(this.vm, this.el);
    this.cancel = null;
  }
};

/**
 * Call a user-provided synchronous hook function.
 *
 * @param {String} type
 */

p$1.callHook = function (type) {
  if (this.hooks && this.hooks[type]) {
    this.hooks[type].call(this.vm, this.el);
  }
};

/**
 * Call a user-provided, potentially-async hook function.
 * We check for the length of arguments to see if the hook
 * expects a `done` callback. If true, the transition's end
 * will be determined by when the user calls that callback;
 * otherwise, the end is determined by the CSS transition or
 * animation.
 *
 * @param {String} type
 */

p$1.callHookWithCb = function (type) {
  var hook = this.hooks && this.hooks[type];
  if (hook) {
    if (hook.length > 1) {
      this.pendingJsCb = cancellable(this[type + 'Done']);
    }
    hook.call(this.vm, this.el, this.pendingJsCb);
  }
};

/**
 * Get an element's transition type based on the
 * calculated styles.
 *
 * @param {String} className
 * @return {Number}
 */

p$1.getCssTransitionType = function (className) {
  /* istanbul ignore if */
  if (!transitionEndEvent ||
  // skip CSS transitions if page is not visible -
  // this solves the issue of transitionend events not
  // firing until the page is visible again.
  // pageVisibility API is supported in IE10+, same as
  // CSS transitions.
  document.hidden ||
  // explicit js-only transition
  this.hooks && this.hooks.css === false ||
  // element is hidden
  isHidden(this.el)) {
    return;
  }
  var type = this.typeCache[className];
  if (type) return type;
  var inlineStyles = this.el.style;
  var computedStyles = window.getComputedStyle(this.el);
  var transDuration = inlineStyles[transDurationProp] || computedStyles[transDurationProp];
  if (transDuration && transDuration !== '0s') {
    type = TYPE_TRANSITION;
  } else {
    var animDuration = inlineStyles[animDurationProp] || computedStyles[animDurationProp];
    if (animDuration && animDuration !== '0s') {
      type = TYPE_ANIMATION;
    }
  }
  if (type) {
    this.typeCache[className] = type;
  }
  return type;
};

/**
 * Setup a CSS transitionend/animationend callback.
 *
 * @param {String} event
 * @param {Function} cb
 */

p$1.setupCssCb = function (event, cb) {
  this.pendingCssEvent = event;
  var self = this;
  var el = this.el;
  var onEnd = this.pendingCssCb = function (e) {
    if (e.target === el) {
      off(el, event, onEnd);
      self.pendingCssEvent = self.pendingCssCb = null;
      if (!self.pendingJsCb && cb) {
        cb();
      }
    }
  };
  on$1(el, event, onEnd);
};

/**
 * Check if an element is hidden - in that case we can just
 * skip the transition alltogether.
 *
 * @param {Element} el
 * @return {Boolean}
 */

function isHidden(el) {
  return !(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

var transition = {

  priority: 1100,

  update: function update(id, oldId) {
    var el = this.el;
    // resolve on owner vm
    var hooks = resolveAsset(this.vm.$options, 'transitions', id);
    id = id || 'v';
    // apply on closest vm
    el.__v_trans = new Transition(el, id, hooks, this.el.__vue__ || this.vm);
    if (oldId) {
      removeClass(el, oldId + '-transition');
    }
    addClass(el, id + '-transition');
  }
};

var bindingModes = config._propBindingModes;

var propDef = {

  bind: function bind() {

    var child = this.vm;
    var parent = child._context;
    // passed in from compiler directly
    var prop = this.descriptor.prop;
    var childKey = prop.path;
    var parentKey = prop.parentPath;
    var twoWay = prop.mode === bindingModes.TWO_WAY;

    var parentWatcher = this.parentWatcher = new Watcher(parent, parentKey, function (val) {
      val = coerceProp(prop, val);
      if (assertProp(prop, val)) {
        child[childKey] = val;
      }
    }, {
      twoWay: twoWay,
      filters: prop.filters,
      // important: props need to be observed on the
      // v-for scope if present
      scope: this._scope
    });

    // set the child initial value.
    initProp(child, prop, parentWatcher.value);

    // setup two-way binding
    if (twoWay) {
      // important: defer the child watcher creation until
      // the created hook (after data observation)
      var self = this;
      child.$once('hook:created', function () {
        self.childWatcher = new Watcher(child, childKey, function (val) {
          parentWatcher.set(val);
        }, {
          // ensure sync upward before parent sync down.
          // this is necessary in cases e.g. the child
          // mutates a prop array, then replaces it. (#1683)
          sync: true
        });
      });
    }
  },

  unbind: function unbind() {
    this.parentWatcher.teardown();
    if (this.childWatcher) {
      this.childWatcher.teardown();
    }
  }
};

var component = {

  priority: 1500,

  params: ['keep-alive', 'transition-mode', 'inline-template'],

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   <comp> or <div v-component="comp">
   *
   * - dynamic:
   *   <component :is="view">
   */

  bind: function bind() {
    if (!this.el.__vue__) {
      // keep-alive cache
      this.keepAlive = this.params.keepAlive;
      if (this.keepAlive) {
        this.cache = {};
      }
      // check inline-template
      if (this.params.inlineTemplate) {
        // extract inline template as a DocumentFragment
        this.inlineTemplate = extractContent(this.el, true);
      }
      // component resolution related state
      this.pendingComponentCb = this.Component = null;
      // transition related state
      this.pendingRemovals = 0;
      this.pendingRemovalCb = null;
      // create a ref anchor
      this.anchor = createAnchor('v-component');
      replace(this.el, this.anchor);
      // remove is attribute.
      // this is removed during compilation, but because compilation is
      // cached, when the component is used elsewhere this attribute
      // will remain at link time.
      this.el.removeAttribute('is');
      // remove ref, same as above
      if (this.descriptor.ref) {
        this.el.removeAttribute('v-ref:' + hyphenate(this.descriptor.ref));
      }
      // if static, build right now.
      if (this.literal) {
        this.setComponent(this.expression);
      }
    } else {
      process.env.NODE_ENV !== 'production' && warn('cannot mount component "' + this.expression + '" ' + 'on already mounted element: ' + this.el);
    }
  },

  /**
   * Public update, called by the watcher in the dynamic
   * literal scenario, e.g. <component :is="view">
   */

  update: function update(value) {
    if (!this.literal) {
      this.setComponent(value);
    }
  },

  /**
   * Switch dynamic components. May resolve the component
   * asynchronously, and perform transition based on
   * specified transition mode. Accepts a few additional
   * arguments specifically for vue-router.
   *
   * The callback is called when the full transition is
   * finished.
   *
   * @param {String} value
   * @param {Function} [cb]
   */

  setComponent: function setComponent(value, cb) {
    this.invalidatePending();
    if (!value) {
      // just remove current
      this.unbuild(true);
      this.remove(this.childVM, cb);
      this.childVM = null;
    } else {
      var self = this;
      this.resolveComponent(value, function () {
        self.mountComponent(cb);
      });
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   */

  resolveComponent: function resolveComponent(id, cb) {
    var self = this;
    this.pendingComponentCb = cancellable(function (Component) {
      self.ComponentName = Component.options.name || id;
      self.Component = Component;
      cb();
    });
    this.vm._resolveComponent(id, this.pendingComponentCb);
  },

  /**
   * Create a new instance using the current constructor and
   * replace the existing instance. This method doesn't care
   * whether the new component and the old one are actually
   * the same.
   *
   * @param {Function} [cb]
   */

  mountComponent: function mountComponent(cb) {
    // actual mount
    this.unbuild(true);
    var self = this;
    var activateHook = this.Component.options.activate;
    var cached = this.getCached();
    var newComponent = this.build();
    if (activateHook && !cached) {
      this.waitingFor = newComponent;
      activateHook.call(newComponent, function () {
        if (self.waitingFor !== newComponent) {
          return;
        }
        self.waitingFor = null;
        self.transition(newComponent, cb);
      });
    } else {
      // update ref for kept-alive component
      if (cached) {
        newComponent._updateRef();
      }
      this.transition(newComponent, cb);
    }
  },

  /**
   * When the component changes or unbinds before an async
   * constructor is resolved, we need to invalidate its
   * pending callback.
   */

  invalidatePending: function invalidatePending() {
    if (this.pendingComponentCb) {
      this.pendingComponentCb.cancel();
      this.pendingComponentCb = null;
    }
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @param {Object} [extraOptions]
   * @return {Vue} - the created instance
   */

  build: function build(extraOptions) {
    var cached = this.getCached();
    if (cached) {
      return cached;
    }
    if (this.Component) {
      // default options
      var options = {
        name: this.ComponentName,
        el: cloneNode(this.el),
        template: this.inlineTemplate,
        // make sure to add the child with correct parent
        // if this is a transcluded component, its parent
        // should be the transclusion host.
        parent: this._host || this.vm,
        // if no inline-template, then the compiled
        // linker can be cached for better performance.
        _linkerCachable: !this.inlineTemplate,
        _ref: this.descriptor.ref,
        _asComponent: true,
        _isRouterView: this._isRouterView,
        // if this is a transcluded component, context
        // will be the common parent vm of this instance
        // and its host.
        _context: this.vm,
        // if this is inside an inline v-for, the scope
        // will be the intermediate scope created for this
        // repeat fragment. this is used for linking props
        // and container directives.
        _scope: this._scope,
        // pass in the owner fragment of this component.
        // this is necessary so that the fragment can keep
        // track of its contained components in order to
        // call attach/detach hooks for them.
        _frag: this._frag
      };
      // extra options
      // in 1.0.0 this is used by vue-router only
      /* istanbul ignore if */
      if (extraOptions) {
        extend(options, extraOptions);
      }
      var child = new this.Component(options);
      if (this.keepAlive) {
        this.cache[this.Component.cid] = child;
      }
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && this.el.hasAttribute('transition') && child._isFragment) {
        warn('Transitions will not work on a fragment instance. ' + 'Template: ' + child.$options.template);
      }
      return child;
    }
  },

  /**
   * Try to get a cached instance of the current component.
   *
   * @return {Vue|undefined}
   */

  getCached: function getCached() {
    return this.keepAlive && this.cache[this.Component.cid];
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   *
   * @param {Boolean} defer
   */

  unbuild: function unbuild(defer) {
    if (this.waitingFor) {
      this.waitingFor.$destroy();
      this.waitingFor = null;
    }
    var child = this.childVM;
    if (!child || this.keepAlive) {
      if (child) {
        // remove ref
        child._updateRef(true);
      }
      return;
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, defer);
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function remove(child, cb) {
    var keepAlive = this.keepAlive;
    if (child) {
      // we may have a component switch when a previous
      // component is still being transitioned out.
      // we want to trigger only one lastest insertion cb
      // when the existing transition finishes. (#1119)
      this.pendingRemovals++;
      this.pendingRemovalCb = cb;
      var self = this;
      child.$remove(function () {
        self.pendingRemovals--;
        if (!keepAlive) child._cleanup();
        if (!self.pendingRemovals && self.pendingRemovalCb) {
          self.pendingRemovalCb();
          self.pendingRemovalCb = null;
        }
      });
    } else if (cb) {
      cb();
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   * @param {Function} [cb]
   */

  transition: function transition(target, cb) {
    var self = this;
    var current = this.childVM;
    // for devtool inspection
    if (process.env.NODE_ENV !== 'production') {
      if (current) current._inactive = true;
      target._inactive = false;
    }
    this.childVM = target;
    switch (self.params.transitionMode) {
      case 'in-out':
        target.$before(self.anchor, function () {
          self.remove(current, cb);
        });
        break;
      case 'out-in':
        self.remove(current, function () {
          target.$before(self.anchor, cb);
        });
        break;
      default:
        self.remove(current);
        target.$before(self.anchor, cb);
    }
  },

  /**
   * Unbind.
   */

  unbind: function unbind() {
    this.invalidatePending();
    // Do not defer cleanup when unbinding
    this.unbuild();
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy();
      }
      this.cache = null;
    }
  }
};

var vClass = {

  deep: true,

  update: function update(value) {
    if (value && typeof value === 'string') {
      this.handleObject(stringToObject(value));
    } else if (isPlainObject(value)) {
      this.handleObject(value);
    } else if (isArray(value)) {
      this.handleArray(value);
    } else {
      this.cleanup();
    }
  },

  handleObject: function handleObject(value) {
    this.cleanup(value);
    var keys = this.prevKeys = Object.keys(value);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      if (value[key]) {
        addClass(this.el, key);
      } else {
        removeClass(this.el, key);
      }
    }
  },

  handleArray: function handleArray(value) {
    this.cleanup(value);
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        addClass(this.el, value[i]);
      }
    }
    this.prevKeys = value.slice();
  },

  cleanup: function cleanup(value) {
    if (this.prevKeys) {
      var i = this.prevKeys.length;
      while (i--) {
        var key = this.prevKeys[i];
        if (key && (!value || !contains$1(value, key))) {
          removeClass(this.el, key);
        }
      }
    }
  }
};

function stringToObject(value) {
  var res = {};
  var keys = value.trim().split(/\s+/);
  var i = keys.length;
  while (i--) {
    res[keys[i]] = true;
  }
  return res;
}

function contains$1(value, key) {
  return isArray(value) ? value.indexOf(key) > -1 : hasOwn(value, key);
}

var internalDirectives = {
  style: style,
  'class': vClass,
  component: component,
  prop: propDef,
  transition: transition
};

var propBindingModes = config._propBindingModes;
var empty = {};

// regexes
var identRE$1 = /^[$_a-zA-Z]+[\w$]*$/;
var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/;

/**
 * Compile props on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @return {Function} propsLinkFn
 */

function compileProps(el, propOptions) {
  var props = [];
  var names = Object.keys(propOptions);
  var i = names.length;
  var options, name, attr, value, path, parsed, prop;
  while (i--) {
    name = names[i];
    options = propOptions[name] || empty;

    if (process.env.NODE_ENV !== 'production' && name === '$data') {
      warn('Do not use $data as prop.');
      continue;
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = camelize(name);
    if (!identRE$1.test(path)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop key: "' + name + '". Prop keys ' + 'must be valid identifiers.');
      continue;
    }

    prop = {
      name: name,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY,
      raw: null
    };

    attr = hyphenate(name);
    // first check dynamic version
    if ((value = getBindAttr(el, attr)) === null) {
      if ((value = getBindAttr(el, attr + '.sync')) !== null) {
        prop.mode = propBindingModes.TWO_WAY;
      } else if ((value = getBindAttr(el, attr + '.once')) !== null) {
        prop.mode = propBindingModes.ONE_TIME;
      }
    }
    if (value !== null) {
      // has dynamic binding!
      prop.raw = value;
      parsed = parseDirective(value);
      value = parsed.expression;
      prop.filters = parsed.filters;
      // check binding type
      if (isLiteral(value)) {
        // for expressions containing literal numbers and
        // booleans, there's no need to setup a prop binding,
        // so we can optimize them as a one-time set.
        prop.optimizedLiteral = true;
      } else {
        prop.dynamic = true;
        // check non-settable path for two-way bindings
        if (process.env.NODE_ENV !== 'production' && prop.mode === propBindingModes.TWO_WAY && !settablePathRE.test(value)) {
          prop.mode = propBindingModes.ONE_WAY;
          warn('Cannot bind two-way prop with non-settable ' + 'parent path: ' + value);
        }
      }
      prop.parentPath = value;

      // warn required two-way
      if (process.env.NODE_ENV !== 'production' && options.twoWay && prop.mode !== propBindingModes.TWO_WAY) {
        warn('Prop "' + name + '" expects a two-way binding type.');
      }
    } else if ((value = getAttr(el, attr)) !== null) {
      // has literal binding!
      prop.raw = value;
    } else if (options.required) {
      // warn missing required
      process.env.NODE_ENV !== 'production' && warn('Missing required prop: ' + name);
    }
    // push prop
    props.push(prop);
  }
  return makePropsLinkFn(props);
}

/**
 * Build a function that applies props to a vm.
 *
 * @param {Array} props
 * @return {Function} propsLinkFn
 */

function makePropsLinkFn(props) {
  return function propsLinkFn(vm, scope) {
    // store resolved props info
    vm._props = {};
    var i = props.length;
    var prop, path, options, value, raw;
    while (i--) {
      prop = props[i];
      raw = prop.raw;
      path = prop.path;
      options = prop.options;
      vm._props[path] = prop;
      if (raw === null) {
        // initialize absent prop
        initProp(vm, prop, getDefault(vm, options));
      } else if (prop.dynamic) {
        // dynamic prop
        if (vm._context) {
          if (prop.mode === propBindingModes.ONE_TIME) {
            // one time binding
            value = (scope || vm._context).$get(prop.parentPath);
            initProp(vm, prop, value);
          } else {
            // dynamic binding
            vm._bindDir({
              name: 'prop',
              def: propDef,
              prop: prop
            }, null, null, scope); // el, host, scope
          }
        } else {
            process.env.NODE_ENV !== 'production' && warn('Cannot bind dynamic prop on a root instance' + ' with no parent: ' + prop.name + '="' + raw + '"');
          }
      } else if (prop.optimizedLiteral) {
        // optimized literal, cast it and just set once
        var stripped = stripQuotes(raw);
        value = stripped === raw ? toBoolean(toNumber(raw)) : stripped;
        initProp(vm, prop, value);
      } else {
        // string literal, but we need to cater for
        // Boolean props with no value
        value = options.type === Boolean && raw === '' ? true : raw;
        initProp(vm, prop, value);
      }
    }
  };
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} options
 * @return {*}
 */

function getDefault(vm, options) {
  // no default, return undefined
  if (!hasOwn(options, 'default')) {
    // absent boolean value defaults to false
    return options.type === Boolean ? false : undefined;
  }
  var def = options['default'];
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn('Object/Array as default prop values will be shared ' + 'across multiple instances. Use a factory function ' + 'to return the default value instead.');
  }
  // call factory function for non-Function types
  return typeof def === 'function' && options.type !== Function ? def.call(vm) : def;
}

// special binding prefixes
var bindRE = /^v-bind:|^:/;
var onRE = /^v-on:|^@/;
var argRE = /:(.*)$/;
var modifierRE = /\.[^\.]+/g;
var transitionRE = /^(v-bind:|:)?transition$/;

// terminal directives
var terminalDirectives = ['for', 'if'];

// default directive priority
var DEFAULT_PRIORITY = 1000;

/**
 * Compile a template and return a reusable composite link
 * function, which recursively contains more link functions
 * inside. This top level compile function would normally
 * be called on instance root nodes, but can also be used
 * for partial compilation if the partial argument is true.
 *
 * The returned composite link function, when called, will
 * return an unlink function that tearsdown all directives
 * created during the linking phase.
 *
 * @param {Element|DocumentFragment} el
 * @param {Object} options
 * @param {Boolean} partial
 * @return {Function}
 */

function compile(el, options, partial) {
  // link function for the node itself.
  var nodeLinkFn = partial || !options._asComponent ? compileNode(el, options) : null;
  // link function for the childNodes
  var childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && el.tagName !== 'SCRIPT' && el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null;

  /**
   * A composite linker function to be called on a already
   * compiled piece of DOM, which instantiates all directive
   * instances.
   *
   * @param {Vue} vm
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host] - host vm of transcluded content
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - link context fragment
   * @return {Function|undefined}
   */

  return function compositeLinkFn(vm, el, host, scope, frag) {
    // cache childNodes before linking parent, fix #657
    var childNodes = toArray(el.childNodes);
    // link
    var dirs = linkAndCapture(function compositeLinkCapturer() {
      if (nodeLinkFn) nodeLinkFn(vm, el, host, scope, frag);
      if (childLinkFn) childLinkFn(vm, childNodes, host, scope, frag);
    }, vm);
    return makeUnlinkFn(vm, dirs);
  };
}

/**
 * Apply a linker to a vm/element pair and capture the
 * directives created during the process.
 *
 * @param {Function} linker
 * @param {Vue} vm
 */

function linkAndCapture(linker, vm) {
  var originalDirCount = vm._directives.length;
  linker();
  var dirs = vm._directives.slice(originalDirCount);
  dirs.sort(directiveComparator);
  for (var i = 0, l = dirs.length; i < l; i++) {
    dirs[i]._bind();
  }
  return dirs;
}

/**
 * Directive priority sort comparator
 *
 * @param {Object} a
 * @param {Object} b
 */

function directiveComparator(a, b) {
  a = a.descriptor.def.priority || DEFAULT_PRIORITY;
  b = b.descriptor.def.priority || DEFAULT_PRIORITY;
  return a > b ? -1 : a === b ? 0 : 1;
}

/**
 * Linker functions return an unlink function that
 * tearsdown all directives instances generated during
 * the process.
 *
 * We create unlink functions with only the necessary
 * information to avoid retaining additional closures.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Vue} [context]
 * @param {Array} [contextDirs]
 * @return {Function}
 */

function makeUnlinkFn(vm, dirs, context, contextDirs) {
  return function unlink(destroying) {
    teardownDirs(vm, dirs, destroying);
    if (context && contextDirs) {
      teardownDirs(context, contextDirs);
    }
  };
}

/**
 * Teardown partial linked directives.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Boolean} destroying
 */

function teardownDirs(vm, dirs, destroying) {
  var i = dirs.length;
  while (i--) {
    dirs[i]._teardown();
    if (!destroying) {
      vm._directives.$remove(dirs[i]);
    }
  }
}

/**
 * Compile link props on an instance.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} props
 * @param {Object} [scope]
 * @return {Function}
 */

function compileAndLinkProps(vm, el, props, scope) {
  var propsLinkFn = compileProps(el, props);
  var propDirs = linkAndCapture(function () {
    propsLinkFn(vm, scope);
  }, vm);
  return makeUnlinkFn(vm, propDirs);
}

/**
 * Compile the root element of an instance.
 *
 * 1. attrs on context container (context scope)
 * 2. attrs on the component template root node, if
 *    replace:true (child scope)
 *
 * If this is a fragment instance, we only need to compile 1.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} options
 * @param {Object} contextOptions
 * @return {Function}
 */

function compileRoot(el, options, contextOptions) {
  var containerAttrs = options._containerAttrs;
  var replacerAttrs = options._replacerAttrs;
  var contextLinkFn, replacerLinkFn;

  // only need to compile other attributes for
  // non-fragment instances
  if (el.nodeType !== 11) {
    // for components, container and replacer need to be
    // compiled separately and linked in different scopes.
    if (options._asComponent) {
      // 2. container attributes
      if (containerAttrs && contextOptions) {
        contextLinkFn = compileDirectives(containerAttrs, contextOptions);
      }
      if (replacerAttrs) {
        // 3. replacer attributes
        replacerLinkFn = compileDirectives(replacerAttrs, options);
      }
    } else {
      // non-component, just compile as a normal element.
      replacerLinkFn = compileDirectives(el.attributes, options);
    }
  } else if (process.env.NODE_ENV !== 'production' && containerAttrs) {
    // warn container directives for fragment instances
    var names = containerAttrs.filter(function (attr) {
      // allow vue-loader/vueify scoped css attributes
      return attr.name.indexOf('_v-') < 0 &&
      // allow event listeners
      !onRE.test(attr.name) &&
      // allow slots
      attr.name !== 'slot';
    }).map(function (attr) {
      return '"' + attr.name + '"';
    });
    if (names.length) {
      var plural = names.length > 1;
      warn('Attribute' + (plural ? 's ' : ' ') + names.join(', ') + (plural ? ' are' : ' is') + ' ignored on component ' + '<' + options.el.tagName.toLowerCase() + '> because ' + 'the component is a fragment instance: ' + 'http://vuejs.org/guide/components.html#Fragment_Instance');
    }
  }

  return function rootLinkFn(vm, el, scope) {
    // link context scope dirs
    var context = vm._context;
    var contextDirs;
    if (context && contextLinkFn) {
      contextDirs = linkAndCapture(function () {
        contextLinkFn(context, el, null, scope);
      }, context);
    }

    // link self
    var selfDirs = linkAndCapture(function () {
      if (replacerLinkFn) replacerLinkFn(vm, el);
    }, vm);

    // return the unlink function that tearsdown context
    // container directives.
    return makeUnlinkFn(vm, selfDirs, context, contextDirs);
  };
}

/**
 * Compile a node and return a nodeLinkFn based on the
 * node type.
 *
 * @param {Node} node
 * @param {Object} options
 * @return {Function|null}
 */

function compileNode(node, options) {
  var type = node.nodeType;
  if (type === 1 && node.tagName !== 'SCRIPT') {
    return compileElement(node, options);
  } else if (type === 3 && node.data.trim()) {
    return compileTextNode(node, options);
  } else {
    return null;
  }
}

/**
 * Compile an element and return a nodeLinkFn.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|null}
 */

function compileElement(el, options) {
  // preprocess textareas.
  // textarea treats its text content as the initial value.
  // just bind it as an attr directive for value.
  if (el.tagName === 'TEXTAREA') {
    var tokens = parseText(el.value);
    if (tokens) {
      el.setAttribute(':value', tokensToExp(tokens));
      el.value = '';
    }
  }
  var linkFn;
  var hasAttrs = el.hasAttributes();
  // check terminal directives (for & if)
  if (hasAttrs) {
    linkFn = checkTerminalDirectives(el, options);
  }
  // check element directives
  if (!linkFn) {
    linkFn = checkElementDirectives(el, options);
  }
  // check component
  if (!linkFn) {
    linkFn = checkComponent(el, options);
  }
  // normal directives
  if (!linkFn && hasAttrs) {
    linkFn = compileDirectives(el.attributes, options);
  }
  return linkFn;
}

/**
 * Compile a textNode and return a nodeLinkFn.
 *
 * @param {TextNode} node
 * @param {Object} options
 * @return {Function|null} textNodeLinkFn
 */

function compileTextNode(node, options) {
  // skip marked text nodes
  if (node._skip) {
    return removeText;
  }

  var tokens = parseText(node.wholeText);
  if (!tokens) {
    return null;
  }

  // mark adjacent text nodes as skipped,
  // because we are using node.wholeText to compile
  // all adjacent text nodes together. This fixes
  // issues in IE where sometimes it splits up a single
  // text node into multiple ones.
  var next = node.nextSibling;
  while (next && next.nodeType === 3) {
    next._skip = true;
    next = next.nextSibling;
  }

  var frag = document.createDocumentFragment();
  var el, token;
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];
    el = token.tag ? processTextToken(token, options) : document.createTextNode(token.value);
    frag.appendChild(el);
  }
  return makeTextNodeLinkFn(tokens, frag, options);
}

/**
 * Linker for an skipped text node.
 *
 * @param {Vue} vm
 * @param {Text} node
 */

function removeText(vm, node) {
  remove(node);
}

/**
 * Process a single text token.
 *
 * @param {Object} token
 * @param {Object} options
 * @return {Node}
 */

function processTextToken(token, options) {
  var el;
  if (token.oneTime) {
    el = document.createTextNode(token.value);
  } else {
    if (token.html) {
      el = document.createComment('v-html');
      setTokenType('html');
    } else {
      // IE will clean up empty textNodes during
      // frag.cloneNode(true), so we have to give it
      // something here...
      el = document.createTextNode(' ');
      setTokenType('text');
    }
  }
  function setTokenType(type) {
    if (token.descriptor) return;
    var parsed = parseDirective(token.value);
    token.descriptor = {
      name: type,
      def: publicDirectives[type],
      expression: parsed.expression,
      filters: parsed.filters
    };
  }
  return el;
}

/**
 * Build a function that processes a textNode.
 *
 * @param {Array<Object>} tokens
 * @param {DocumentFragment} frag
 */

function makeTextNodeLinkFn(tokens, frag) {
  return function textNodeLinkFn(vm, el, host, scope) {
    var fragClone = frag.cloneNode(true);
    var childNodes = toArray(fragClone.childNodes);
    var token, value, node;
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i];
      value = token.value;
      if (token.tag) {
        node = childNodes[i];
        if (token.oneTime) {
          value = (scope || vm).$eval(value);
          if (token.html) {
            replace(node, parseTemplate(value, true));
          } else {
            node.data = value;
          }
        } else {
          vm._bindDir(token.descriptor, node, host, scope);
        }
      }
    }
    replace(el, fragClone);
  };
}

/**
 * Compile a node list and return a childLinkFn.
 *
 * @param {NodeList} nodeList
 * @param {Object} options
 * @return {Function|undefined}
 */

function compileNodeList(nodeList, options) {
  var linkFns = [];
  var nodeLinkFn, childLinkFn, node;
  for (var i = 0, l = nodeList.length; i < l; i++) {
    node = nodeList[i];
    nodeLinkFn = compileNode(node, options);
    childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && node.tagName !== 'SCRIPT' && node.hasChildNodes() ? compileNodeList(node.childNodes, options) : null;
    linkFns.push(nodeLinkFn, childLinkFn);
  }
  return linkFns.length ? makeChildLinkFn(linkFns) : null;
}

/**
 * Make a child link function for a node's childNodes.
 *
 * @param {Array<Function>} linkFns
 * @return {Function} childLinkFn
 */

function makeChildLinkFn(linkFns) {
  return function childLinkFn(vm, nodes, host, scope, frag) {
    var node, nodeLinkFn, childrenLinkFn;
    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
      node = nodes[n];
      nodeLinkFn = linkFns[i++];
      childrenLinkFn = linkFns[i++];
      // cache childNodes before linking parent, fix #657
      var childNodes = toArray(node.childNodes);
      if (nodeLinkFn) {
        nodeLinkFn(vm, node, host, scope, frag);
      }
      if (childrenLinkFn) {
        childrenLinkFn(vm, childNodes, host, scope, frag);
      }
    }
  };
}

/**
 * Check for element directives (custom elements that should
 * be resovled as terminal directives).
 *
 * @param {Element} el
 * @param {Object} options
 */

function checkElementDirectives(el, options) {
  var tag = el.tagName.toLowerCase();
  if (commonTagRE.test(tag)) return;
  // special case: give named slot a higher priority
  // than unnamed slots
  if (tag === 'slot' && hasBindAttr(el, 'name')) {
    tag = '_namedSlot';
  }
  var def = resolveAsset(options, 'elementDirectives', tag);
  if (def) {
    return makeTerminalNodeLinkFn(el, tag, '', options, def);
  }
}

/**
 * Check if an element is a component. If yes, return
 * a component link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|undefined}
 */

function checkComponent(el, options) {
  var component = checkComponentAttr(el, options);
  if (component) {
    var ref = findRef(el);
    var descriptor = {
      name: 'component',
      ref: ref,
      expression: component.id,
      def: internalDirectives.component,
      modifiers: {
        literal: !component.dynamic
      }
    };
    var componentLinkFn = function componentLinkFn(vm, el, host, scope, frag) {
      if (ref) {
        defineReactive((scope || vm).$refs, ref, null);
      }
      vm._bindDir(descriptor, el, host, scope, frag);
    };
    componentLinkFn.terminal = true;
    return componentLinkFn;
  }
}

/**
 * Check an element for terminal directives in fixed order.
 * If it finds one, return a terminal link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

function checkTerminalDirectives(el, options) {
  // skip v-pre
  if (getAttr(el, 'v-pre') !== null) {
    return skip;
  }
  // skip v-else block, but only if following v-if
  if (el.hasAttribute('v-else')) {
    var prev = el.previousElementSibling;
    if (prev && prev.hasAttribute('v-if')) {
      return skip;
    }
  }
  var value, dirName;
  for (var i = 0, l = terminalDirectives.length; i < l; i++) {
    dirName = terminalDirectives[i];
    /* eslint-disable no-cond-assign */
    if (value = el.getAttribute('v-' + dirName)) {
      return makeTerminalNodeLinkFn(el, dirName, value, options);
    }
    /* eslint-enable no-cond-assign */
  }
}

function skip() {}
skip.terminal = true;

/**
 * Build a node link function for a terminal directive.
 * A terminal link function terminates the current
 * compilation recursion and handles compilation of the
 * subtree in the directive.
 *
 * @param {Element} el
 * @param {String} dirName
 * @param {String} value
 * @param {Object} options
 * @param {Object} [def]
 * @return {Function} terminalLinkFn
 */

function makeTerminalNodeLinkFn(el, dirName, value, options, def) {
  var parsed = parseDirective(value);
  var descriptor = {
    name: dirName,
    expression: parsed.expression,
    filters: parsed.filters,
    raw: value,
    // either an element directive, or if/for
    def: def || publicDirectives[dirName]
  };
  // check ref for v-for and router-view
  if (dirName === 'for' || dirName === 'router-view') {
    descriptor.ref = findRef(el);
  }
  var fn = function terminalNodeLinkFn(vm, el, host, scope, frag) {
    if (descriptor.ref) {
      defineReactive((scope || vm).$refs, descriptor.ref, null);
    }
    vm._bindDir(descriptor, el, host, scope, frag);
  };
  fn.terminal = true;
  return fn;
}

/**
 * Compile the directives on an element and return a linker.
 *
 * @param {Array|NamedNodeMap} attrs
 * @param {Object} options
 * @return {Function}
 */

function compileDirectives(attrs, options) {
  var i = attrs.length;
  var dirs = [];
  var attr, name, value, rawName, rawValue, dirName, arg, modifiers, dirDef, tokens;
  while (i--) {
    attr = attrs[i];
    name = rawName = attr.name;
    value = rawValue = attr.value;
    tokens = parseText(value);
    // reset arg
    arg = null;
    // check modifiers
    modifiers = parseModifiers(name);
    name = name.replace(modifierRE, '');

    // attribute interpolations
    if (tokens) {
      value = tokensToExp(tokens);
      if (name === 'class') {
        pushDir('class', internalDirectives['class'], true);
      } else {
        arg = name;
        pushDir('bind', publicDirectives.bind, true);
      }
      // warn against mixing mustaches with v-bind
      if (process.env.NODE_ENV !== 'production') {
        if (name === 'class' && Array.prototype.some.call(attrs, function (attr) {
          return attr.name === ':class' || attr.name === 'v-bind:class';
        })) {
          warn('class="' + rawValue + '": Do not mix mustache interpolation ' + 'and v-bind for "class" on the same element. Use one or the other.');
        }
      }
    } else

      // special attribute: transition
      if (transitionRE.test(name)) {
        modifiers.literal = !bindRE.test(name);
        pushDir('transition', internalDirectives.transition);
      } else

        // event handlers
        if (onRE.test(name)) {
          arg = name.replace(onRE, '');
          pushDir('on', publicDirectives.on);
        } else

          // attribute bindings
          if (bindRE.test(name)) {
            dirName = name.replace(bindRE, '');
            if (dirName === 'style' || dirName === 'class') {
              pushDir(dirName, internalDirectives[dirName]);
            } else {
              arg = dirName;
              pushDir('bind', publicDirectives.bind);
            }
          } else

            // normal directives
            if (name.indexOf('v-') === 0) {
              // check arg
              arg = (arg = name.match(argRE)) && arg[1];
              if (arg) {
                name = name.replace(argRE, '');
              }
              // extract directive name
              dirName = name.slice(2);

              // skip v-else (when used with v-show)
              if (dirName === 'else') {
                continue;
              }

              dirDef = resolveAsset(options, 'directives', dirName);

              if (process.env.NODE_ENV !== 'production') {
                assertAsset(dirDef, 'directive', dirName);
              }

              if (dirDef) {
                pushDir(dirName, dirDef);
              }
            }
  }

  /**
   * Push a directive.
   *
   * @param {String} dirName
   * @param {Object|Function} def
   * @param {Boolean} [interp]
   */

  function pushDir(dirName, def, interp) {
    var parsed = parseDirective(value);
    dirs.push({
      name: dirName,
      attr: rawName,
      raw: rawValue,
      def: def,
      arg: arg,
      modifiers: modifiers,
      expression: parsed.expression,
      filters: parsed.filters,
      interp: interp
    });
  }

  if (dirs.length) {
    return makeNodeLinkFn(dirs);
  }
}

/**
 * Parse modifiers from directive attribute name.
 *
 * @param {String} name
 * @return {Object}
 */

function parseModifiers(name) {
  var res = Object.create(null);
  var match = name.match(modifierRE);
  if (match) {
    var i = match.length;
    while (i--) {
      res[match[i].slice(1)] = true;
    }
  }
  return res;
}

/**
 * Build a link function for all directives on a single node.
 *
 * @param {Array} directives
 * @return {Function} directivesLinkFn
 */

function makeNodeLinkFn(directives) {
  return function nodeLinkFn(vm, el, host, scope, frag) {
    // reverse apply because it's sorted low to high
    var i = directives.length;
    while (i--) {
      vm._bindDir(directives[i], el, host, scope, frag);
    }
  };
}

var specialCharRE = /[^\w\-:\.]/;

/**
 * Process an element or a DocumentFragment based on a
 * instance option object. This allows us to transclude
 * a template node/fragment before the instance is created,
 * so the processed fragment can then be cloned and reused
 * in v-for.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transclude(el, options) {
  // extract container attributes to pass them down
  // to compiler, because they need to be compiled in
  // parent scope. we are mutating the options object here
  // assuming the same object will be used for compile
  // right after this.
  if (options) {
    options._containerAttrs = extractAttrs(el);
  }
  // for template tags, what we want is its content as
  // a documentFragment (for fragment instances)
  if (isTemplate(el)) {
    el = parseTemplate(el);
  }
  if (options) {
    if (options._asComponent && !options.template) {
      options.template = '<slot></slot>';
    }
    if (options.template) {
      options._content = extractContent(el);
      el = transcludeTemplate(el, options);
    }
  }
  if (el instanceof DocumentFragment) {
    // anchors for fragment instance
    // passing in `persist: true` to avoid them being
    // discarded by IE during template cloning
    prepend(createAnchor('v-start', true), el);
    el.appendChild(createAnchor('v-end', true));
  }
  return el;
}

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transcludeTemplate(el, options) {
  var template = options.template;
  var frag = parseTemplate(template, true);
  if (frag) {
    var replacer = frag.firstChild;
    var tag = replacer.tagName && replacer.tagName.toLowerCase();
    if (options.replace) {
      /* istanbul ignore if */
      if (el === document.body) {
        process.env.NODE_ENV !== 'production' && warn('You are mounting an instance with a template to ' + '<body>. This will replace <body> entirely. You ' + 'should probably use `replace: false` here.');
      }
      // there are many cases where the instance must
      // become a fragment instance: basically anything that
      // can create more than 1 root nodes.
      if (
      // multi-children template
      frag.childNodes.length > 1 ||
      // non-element template
      replacer.nodeType !== 1 ||
      // single nested component
      tag === 'component' || resolveAsset(options, 'components', tag) || hasBindAttr(replacer, 'is') ||
      // element directive
      resolveAsset(options, 'elementDirectives', tag) ||
      // for block
      replacer.hasAttribute('v-for') ||
      // if block
      replacer.hasAttribute('v-if')) {
        return frag;
      } else {
        options._replacerAttrs = extractAttrs(replacer);
        mergeAttrs(el, replacer);
        return replacer;
      }
    } else {
      el.appendChild(frag);
      return el;
    }
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid template option: ' + template);
  }
}

/**
 * Helper to extract a component container's attributes
 * into a plain object array.
 *
 * @param {Element} el
 * @return {Array}
 */

function extractAttrs(el) {
  if (el.nodeType === 1 && el.hasAttributes()) {
    return toArray(el.attributes);
  }
}

/**
 * Merge the attributes of two elements, and make sure
 * the class names are merged properly.
 *
 * @param {Element} from
 * @param {Element} to
 */

function mergeAttrs(from, to) {
  var attrs = from.attributes;
  var i = attrs.length;
  var name, value;
  while (i--) {
    name = attrs[i].name;
    value = attrs[i].value;
    if (!to.hasAttribute(name) && !specialCharRE.test(name)) {
      to.setAttribute(name, value);
    } else if (name === 'class') {
      value.split(/\s+/).forEach(function (cls) {
        addClass(to, cls);
      });
    }
  }
}

var compiler = Object.freeze({
	compile: compile,
	compileAndLinkProps: compileAndLinkProps,
	compileRoot: compileRoot,
	transclude: transclude
});

function stateMixin (Vue) {

  /**
   * Accessor for `$data` property, since setting $data
   * requires observing the new object and updating
   * proxied properties.
   */

  Object.defineProperty(Vue.prototype, '$data', {
    get: function get() {
      return this._data;
    },
    set: function set(newData) {
      if (newData !== this._data) {
        this._setData(newData);
      }
    }
  });

  /**
   * Setup the scope of an instance, which contains:
   * - observed data
   * - computed properties
   * - user methods
   * - meta properties
   */

  Vue.prototype._initState = function () {
    this._initProps();
    this._initMeta();
    this._initMethods();
    this._initData();
    this._initComputed();
  };

  /**
   * Initialize props.
   */

  Vue.prototype._initProps = function () {
    var options = this.$options;
    var el = options.el;
    var props = options.props;
    if (props && !el) {
      process.env.NODE_ENV !== 'production' && warn('Props will not be compiled if no `el` option is ' + 'provided at instantiation.');
    }
    // make sure to convert string selectors into element now
    el = options.el = query(el);
    this._propsUnlinkFn = el && el.nodeType === 1 && props
    // props must be linked in proper scope if inside v-for
    ? compileAndLinkProps(this, el, props, this._scope) : null;
  };

  /**
   * Initialize the data.
   */

  Vue.prototype._initData = function () {
    var propsData = this._data;
    var optionsDataFn = this.$options.data;
    var optionsData = optionsDataFn && optionsDataFn();
    if (optionsData) {
      this._data = optionsData;
      for (var prop in propsData) {
        if (process.env.NODE_ENV !== 'production' && hasOwn(optionsData, prop)) {
          warn('Data field "' + prop + '" is already defined ' + 'as a prop. Use prop default value instead.');
        }
        if (this._props[prop].raw !== null || !hasOwn(optionsData, prop)) {
          set(optionsData, prop, propsData[prop]);
        }
      }
    }
    var data = this._data;
    // proxy data on instance
    var keys = Object.keys(data);
    var i, key;
    i = keys.length;
    while (i--) {
      key = keys[i];
      this._proxy(key);
    }
    // observe data
    observe(data, this);
  };

  /**
   * Swap the instance's $data. Called in $data's setter.
   *
   * @param {Object} newData
   */

  Vue.prototype._setData = function (newData) {
    newData = newData || {};
    var oldData = this._data;
    this._data = newData;
    var keys, key, i;
    // unproxy keys not present in new data
    keys = Object.keys(oldData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!(key in newData)) {
        this._unproxy(key);
      }
    }
    // proxy keys not already proxied,
    // and trigger change for changed values
    keys = Object.keys(newData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!hasOwn(this, key)) {
        // new property
        this._proxy(key);
      }
    }
    oldData.__ob__.removeVm(this);
    observe(newData, this);
    this._digest();
  };

  /**
   * Proxy a property, so that
   * vm.prop === vm._data.prop
   *
   * @param {String} key
   */

  Vue.prototype._proxy = function (key) {
    if (!isReserved(key)) {
      // need to store ref to self here
      // because these getter/setters might
      // be called by child scopes via
      // prototype inheritance.
      var self = this;
      Object.defineProperty(self, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key];
        },
        set: function proxySetter(val) {
          self._data[key] = val;
        }
      });
    }
  };

  /**
   * Unproxy a property.
   *
   * @param {String} key
   */

  Vue.prototype._unproxy = function (key) {
    if (!isReserved(key)) {
      delete this[key];
    }
  };

  /**
   * Force update on every watcher in scope.
   */

  Vue.prototype._digest = function () {
    for (var i = 0, l = this._watchers.length; i < l; i++) {
      this._watchers[i].update(true); // shallow updates
    }
  };

  /**
   * Setup computed properties. They are essentially
   * special getter/setters
   */

  function noop() {}
  Vue.prototype._initComputed = function () {
    var computed = this.$options.computed;
    if (computed) {
      for (var key in computed) {
        var userDef = computed[key];
        var def = {
          enumerable: true,
          configurable: true
        };
        if (typeof userDef === 'function') {
          def.get = makeComputedGetter(userDef, this);
          def.set = noop;
        } else {
          def.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, this) : bind$1(userDef.get, this) : noop;
          def.set = userDef.set ? bind$1(userDef.set, this) : noop;
        }
        Object.defineProperty(this, key, def);
      }
    }
  };

  function makeComputedGetter(getter, owner) {
    var watcher = new Watcher(owner, getter, null, {
      lazy: true
    });
    return function computedGetter() {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
  }

  /**
   * Setup instance methods. Methods must be bound to the
   * instance since they might be passed down as a prop to
   * child components.
   */

  Vue.prototype._initMethods = function () {
    var methods = this.$options.methods;
    if (methods) {
      for (var key in methods) {
        this[key] = bind$1(methods[key], this);
      }
    }
  };

  /**
   * Initialize meta information like $index, $key & $value.
   */

  Vue.prototype._initMeta = function () {
    var metas = this.$options._meta;
    if (metas) {
      for (var key in metas) {
        defineReactive(this, key, metas[key]);
      }
    }
  };
}

var eventRE = /^v-on:|^@/;

function eventsMixin (Vue) {

  /**
   * Setup the instance's option events & watchers.
   * If the value is a string, we pull it from the
   * instance's methods by name.
   */

  Vue.prototype._initEvents = function () {
    var options = this.$options;
    if (options._asComponent) {
      registerComponentEvents(this, options.el);
    }
    registerCallbacks(this, '$on', options.events);
    registerCallbacks(this, '$watch', options.watch);
  };

  /**
   * Register v-on events on a child component
   *
   * @param {Vue} vm
   * @param {Element} el
   */

  function registerComponentEvents(vm, el) {
    var attrs = el.attributes;
    var name, handler;
    for (var i = 0, l = attrs.length; i < l; i++) {
      name = attrs[i].name;
      if (eventRE.test(name)) {
        name = name.replace(eventRE, '');
        handler = (vm._scope || vm._context).$eval(attrs[i].value, true);
        vm.$on(name.replace(eventRE), handler);
      }
    }
  }

  /**
   * Register callbacks for option events and watchers.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {Object} hash
   */

  function registerCallbacks(vm, action, hash) {
    if (!hash) return;
    var handlers, key, i, j;
    for (key in hash) {
      handlers = hash[key];
      if (isArray(handlers)) {
        for (i = 0, j = handlers.length; i < j; i++) {
          register(vm, action, key, handlers[i]);
        }
      } else {
        register(vm, action, key, handlers);
      }
    }
  }

  /**
   * Helper to register an event/watch callback.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {String} key
   * @param {Function|String|Object} handler
   * @param {Object} [options]
   */

  function register(vm, action, key, handler, options) {
    var type = typeof handler;
    if (type === 'function') {
      vm[action](key, handler, options);
    } else if (type === 'string') {
      var methods = vm.$options.methods;
      var method = methods && methods[handler];
      if (method) {
        vm[action](key, method, options);
      } else {
        process.env.NODE_ENV !== 'production' && warn('Unknown method: "' + handler + '" when ' + 'registering callback for ' + action + ': "' + key + '".');
      }
    } else if (handler && type === 'object') {
      register(vm, action, key, handler.handler, handler);
    }
  }

  /**
   * Setup recursive attached/detached calls
   */

  Vue.prototype._initDOMHooks = function () {
    this.$on('hook:attached', onAttached);
    this.$on('hook:detached', onDetached);
  };

  /**
   * Callback to recursively call attached hook on children
   */

  function onAttached() {
    if (!this._isAttached) {
      this._isAttached = true;
      this.$children.forEach(callAttach);
    }
  }

  /**
   * Iterator to call attached hook
   *
   * @param {Vue} child
   */

  function callAttach(child) {
    if (!child._isAttached && inDoc(child.$el)) {
      child._callHook('attached');
    }
  }

  /**
   * Callback to recursively call detached hook on children
   */

  function onDetached() {
    if (this._isAttached) {
      this._isAttached = false;
      this.$children.forEach(callDetach);
    }
  }

  /**
   * Iterator to call detached hook
   *
   * @param {Vue} child
   */

  function callDetach(child) {
    if (child._isAttached && !inDoc(child.$el)) {
      child._callHook('detached');
    }
  }

  /**
   * Trigger all handlers for a hook
   *
   * @param {String} hook
   */

  Vue.prototype._callHook = function (hook) {
    var handlers = this.$options[hook];
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(this);
      }
    }
    this.$emit('hook:' + hook);
  };
}

function noop() {}

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {String} name
 * @param {Node} el
 * @param {Vue} vm
 * @param {Object} descriptor
 *                 - {String} name
 *                 - {Object} def
 *                 - {String} expression
 *                 - {Array<Object>} [filters]
 *                 - {Boolean} literal
 *                 - {String} attr
 *                 - {String} raw
 * @param {Object} def - directive definition object
 * @param {Vue} [host] - transclusion host component
 * @param {Object} [scope] - v-for scope
 * @param {Fragment} [frag] - owner fragment
 * @constructor
 */
function Directive(descriptor, vm, el, host, scope, frag) {
  this.vm = vm;
  this.el = el;
  // copy descriptor properties
  this.descriptor = descriptor;
  this.name = descriptor.name;
  this.expression = descriptor.expression;
  this.arg = descriptor.arg;
  this.modifiers = descriptor.modifiers;
  this.filters = descriptor.filters;
  this.literal = this.modifiers && this.modifiers.literal;
  // private
  this._locked = false;
  this._bound = false;
  this._listeners = null;
  // link context
  this._host = host;
  this._scope = scope;
  this._frag = frag;
  // store directives on node in dev mode
  if (process.env.NODE_ENV !== 'production' && this.el) {
    this.el._vue_directives = this.el._vue_directives || [];
    this.el._vue_directives.push(this);
  }
}

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 *
 * @param {Object} def
 */

Directive.prototype._bind = function () {
  var name = this.name;
  var descriptor = this.descriptor;

  // remove attribute
  if ((name !== 'cloak' || this.vm._isCompiled) && this.el && this.el.removeAttribute) {
    var attr = descriptor.attr || 'v-' + name;
    if (attr !== 'class') {
      this.el.removeAttribute(attr);
    } else {
      // for class interpolations, only remove the parts that
      // need to be interpolated.
      setClass(this.el, removeTags(this.el.getAttribute('class')).trim().replace(/\s+/g, ' '));
    }
  }

  // copy def properties
  var def = descriptor.def;
  if (typeof def === 'function') {
    this.update = def;
  } else {
    extend(this, def);
  }

  // setup directive params
  this._setupParams();

  // initial bind
  if (this.bind) {
    this.bind();
  }
  this._bound = true;

  if (this.literal) {
    this.update && this.update(descriptor.raw);
  } else if ((this.expression || this.modifiers) && (this.update || this.twoWay) && !this._checkStatement()) {
    // wrapped updater for context
    var dir = this;
    if (this.update) {
      this._update = function (val, oldVal) {
        if (!dir._locked) {
          dir.update(val, oldVal);
        }
      };
    } else {
      this._update = noop;
    }
    var preProcess = this._preProcess ? bind$1(this._preProcess, this) : null;
    var postProcess = this._postProcess ? bind$1(this._postProcess, this) : null;
    var watcher = this._watcher = new Watcher(this.vm, this.expression, this._update, // callback
    {
      filters: this.filters,
      twoWay: this.twoWay,
      deep: this.deep,
      preProcess: preProcess,
      postProcess: postProcess,
      scope: this._scope
    });
    // v-model with inital inline value need to sync back to
    // model instead of update to DOM on init. They would
    // set the afterBind hook to indicate that.
    if (this.afterBind) {
      this.afterBind();
    } else if (this.update) {
      this.update(watcher.value);
    }
  }
};

/**
 * Setup all param attributes, e.g. track-by,
 * transition-mode, etc...
 */

Directive.prototype._setupParams = function () {
  if (!this.params) {
    return;
  }
  var params = this.params;
  // swap the params array with a fresh object.
  this.params = Object.create(null);
  var i = params.length;
  var key, val, mappedKey;
  while (i--) {
    key = params[i];
    mappedKey = camelize(key);
    val = getBindAttr(this.el, key);
    if (val != null) {
      // dynamic
      this._setupParamWatcher(mappedKey, val);
    } else {
      // static
      val = getAttr(this.el, key);
      if (val != null) {
        this.params[mappedKey] = val === '' ? true : val;
      }
    }
  }
};

/**
 * Setup a watcher for a dynamic param.
 *
 * @param {String} key
 * @param {String} expression
 */

Directive.prototype._setupParamWatcher = function (key, expression) {
  var self = this;
  var called = false;
  var unwatch = (this._scope || this.vm).$watch(expression, function (val, oldVal) {
    self.params[key] = val;
    // since we are in immediate mode,
    // only call the param change callbacks if this is not the first update.
    if (called) {
      var cb = self.paramWatchers && self.paramWatchers[key];
      if (cb) {
        cb.call(self, val, oldVal);
      }
    } else {
      called = true;
    }
  }, {
    immediate: true
  });(this._paramUnwatchFns || (this._paramUnwatchFns = [])).push(unwatch);
};

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. on-click="a++"
 *
 * @return {Boolean}
 */

Directive.prototype._checkStatement = function () {
  var expression = this.expression;
  if (expression && this.acceptStatement && !isSimplePath(expression)) {
    var fn = parseExpression(expression).get;
    var scope = this._scope || this.vm;
    var handler = function handler(e) {
      scope.$event = e;
      fn.call(scope, scope);
      scope.$event = null;
    };
    if (this.filters) {
      handler = scope._applyFilters(handler, null, this.filters);
    }
    this.update(handler);
    return true;
  }
};

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @public
 */

Directive.prototype.set = function (value) {
  /* istanbul ignore else */
  if (this.twoWay) {
    this._withLock(function () {
      this._watcher.set(value);
    });
  } else if (process.env.NODE_ENV !== 'production') {
    warn('Directive.set() can only be used inside twoWay' + 'directives.');
  }
};

/**
 * Execute a function while preventing that function from
 * triggering updates on this directive instance.
 *
 * @param {Function} fn
 */

Directive.prototype._withLock = function (fn) {
  var self = this;
  self._locked = true;
  fn.call(self);
  nextTick(function () {
    self._locked = false;
  });
};

/**
 * Convenience method that attaches a DOM event listener
 * to the directive element and autometically tears it down
 * during unbind.
 *
 * @param {String} event
 * @param {Function} handler
 */

Directive.prototype.on = function (event, handler) {
  on$1(this.el, event, handler);(this._listeners || (this._listeners = [])).push([event, handler]);
};

/**
 * Teardown the watcher and call unbind.
 */

Directive.prototype._teardown = function () {
  if (this._bound) {
    this._bound = false;
    if (this.unbind) {
      this.unbind();
    }
    if (this._watcher) {
      this._watcher.teardown();
    }
    var listeners = this._listeners;
    var i;
    if (listeners) {
      i = listeners.length;
      while (i--) {
        off(this.el, listeners[i][0], listeners[i][1]);
      }
    }
    var unwatchFns = this._paramUnwatchFns;
    if (unwatchFns) {
      i = unwatchFns.length;
      while (i--) {
        unwatchFns[i]();
      }
    }
    if (process.env.NODE_ENV !== 'production' && this.el) {
      this.el._vue_directives.$remove(this);
    }
    this.vm = this.el = this._watcher = this._listeners = null;
  }
};

function lifecycleMixin (Vue) {

  /**
   * Update v-ref for component.
   *
   * @param {Boolean} remove
   */

  Vue.prototype._updateRef = function (remove) {
    var ref = this.$options._ref;
    if (ref) {
      var refs = (this._scope || this._context).$refs;
      if (remove) {
        if (refs[ref] === this) {
          refs[ref] = null;
        }
      } else {
        refs[ref] = this;
      }
    }
  };

  /**
   * Transclude, compile and link element.
   *
   * If a pre-compiled linker is available, that means the
   * passed in element will be pre-transcluded and compiled
   * as well - all we need to do is to call the linker.
   *
   * Otherwise we need to call transclude/compile/link here.
   *
   * @param {Element} el
   * @return {Element}
   */

  Vue.prototype._compile = function (el) {
    var options = this.$options;

    // transclude and init element
    // transclude can potentially replace original
    // so we need to keep reference; this step also injects
    // the template and caches the original attributes
    // on the container node and replacer node.
    var original = el;
    el = transclude(el, options);
    this._initElement(el);

    // handle v-pre on root node (#2026)
    if (el.nodeType === 1 && getAttr(el, 'v-pre') !== null) {
      return;
    }

    // root is always compiled per-instance, because
    // container attrs and props can be different every time.
    var contextOptions = this._context && this._context.$options;
    var rootLinker = compileRoot(el, options, contextOptions);

    // compile and link the rest
    var contentLinkFn;
    var ctor = this.constructor;
    // component compilation can be cached
    // as long as it's not using inline-template
    if (options._linkerCachable) {
      contentLinkFn = ctor.linker;
      if (!contentLinkFn) {
        contentLinkFn = ctor.linker = compile(el, options);
      }
    }

    // link phase
    // make sure to link root with prop scope!
    var rootUnlinkFn = rootLinker(this, el, this._scope);
    var contentUnlinkFn = contentLinkFn ? contentLinkFn(this, el) : compile(el, options)(this, el);

    // register composite unlink function
    // to be called during instance destruction
    this._unlinkFn = function () {
      rootUnlinkFn();
      // passing destroying: true to avoid searching and
      // splicing the directives
      contentUnlinkFn(true);
    };

    // finally replace original
    if (options.replace) {
      replace(original, el);
    }

    this._isCompiled = true;
    this._callHook('compiled');
    return el;
  };

  /**
   * Initialize instance element. Called in the public
   * $mount() method.
   *
   * @param {Element} el
   */

  Vue.prototype._initElement = function (el) {
    if (el instanceof DocumentFragment) {
      this._isFragment = true;
      this.$el = this._fragmentStart = el.firstChild;
      this._fragmentEnd = el.lastChild;
      // set persisted text anchors to empty
      if (this._fragmentStart.nodeType === 3) {
        this._fragmentStart.data = this._fragmentEnd.data = '';
      }
      this._fragment = el;
    } else {
      this.$el = el;
    }
    this.$el.__vue__ = this;
    this._callHook('beforeCompile');
  };

  /**
   * Create and bind a directive to an element.
   *
   * @param {String} name - directive name
   * @param {Node} node   - target node
   * @param {Object} desc - parsed directive descriptor
   * @param {Object} def  - directive definition object
   * @param {Vue} [host] - transclusion host component
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - owner fragment
   */

  Vue.prototype._bindDir = function (descriptor, node, host, scope, frag) {
    this._directives.push(new Directive(descriptor, this, node, host, scope, frag));
  };

  /**
   * Teardown an instance, unobserves the data, unbind all the
   * directives, turn off all the event listeners, etc.
   *
   * @param {Boolean} remove - whether to remove the DOM node.
   * @param {Boolean} deferCleanup - if true, defer cleanup to
   *                                 be called later
   */

  Vue.prototype._destroy = function (remove, deferCleanup) {
    if (this._isBeingDestroyed) {
      if (!deferCleanup) {
        this._cleanup();
      }
      return;
    }

    var destroyReady;
    var pendingRemoval;

    var self = this;
    // Cleanup should be called either synchronously or asynchronoysly as
    // callback of this.$remove(), or if remove and deferCleanup are false.
    // In any case it should be called after all other removing, unbinding and
    // turning of is done
    var cleanupIfPossible = function cleanupIfPossible() {
      if (destroyReady && !pendingRemoval && !deferCleanup) {
        self._cleanup();
      }
    };

    // remove DOM element
    if (remove && this.$el) {
      pendingRemoval = true;
      this.$remove(function () {
        pendingRemoval = false;
        cleanupIfPossible();
      });
    }

    this._callHook('beforeDestroy');
    this._isBeingDestroyed = true;
    var i;
    // remove self from parent. only necessary
    // if parent is not being destroyed as well.
    var parent = this.$parent;
    if (parent && !parent._isBeingDestroyed) {
      parent.$children.$remove(this);
      // unregister ref (remove: true)
      this._updateRef(true);
    }
    // destroy all children.
    i = this.$children.length;
    while (i--) {
      this.$children[i].$destroy();
    }
    // teardown props
    if (this._propsUnlinkFn) {
      this._propsUnlinkFn();
    }
    // teardown all directives. this also tearsdown all
    // directive-owned watchers.
    if (this._unlinkFn) {
      this._unlinkFn();
    }
    i = this._watchers.length;
    while (i--) {
      this._watchers[i].teardown();
    }
    // remove reference to self on $el
    if (this.$el) {
      this.$el.__vue__ = null;
    }

    destroyReady = true;
    cleanupIfPossible();
  };

  /**
   * Clean up to ensure garbage collection.
   * This is called after the leave transition if there
   * is any.
   */

  Vue.prototype._cleanup = function () {
    if (this._isDestroyed) {
      return;
    }
    // remove self from owner fragment
    // do it in cleanup so that we can call $destroy with
    // defer right when a fragment is about to be removed.
    if (this._frag) {
      this._frag.children.$remove(this);
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (this._data.__ob__) {
      this._data.__ob__.removeVm(this);
    }
    // Clean up references to private properties and other
    // instances. preserve reference to _data so that proxy
    // accessors still work. The only potential side effect
    // here is that mutating the instance after it's destroyed
    // may affect the state of other components that are still
    // observing the same object, but that seems to be a
    // reasonable responsibility for the user rather than
    // always throwing an error on them.
    this.$el = this.$parent = this.$root = this.$children = this._watchers = this._context = this._scope = this._directives = null;
    // call the last hook...
    this._isDestroyed = true;
    this._callHook('destroyed');
    // turn off all instance listeners.
    this.$off();
  };
}

function miscMixin (Vue) {

  /**
   * Apply a list of filter (descriptors) to a value.
   * Using plain for loops here because this will be called in
   * the getter of any watcher with filters so it is very
   * performance sensitive.
   *
   * @param {*} value
   * @param {*} [oldValue]
   * @param {Array} filters
   * @param {Boolean} write
   * @return {*}
   */

  Vue.prototype._applyFilters = function (value, oldValue, filters, write) {
    var filter, fn, args, arg, offset, i, l, j, k;
    for (i = 0, l = filters.length; i < l; i++) {
      filter = filters[i];
      fn = resolveAsset(this.$options, 'filters', filter.name);
      if (process.env.NODE_ENV !== 'production') {
        assertAsset(fn, 'filter', filter.name);
      }
      if (!fn) continue;
      fn = write ? fn.write : fn.read || fn;
      if (typeof fn !== 'function') continue;
      args = write ? [value, oldValue] : [value];
      offset = write ? 2 : 1;
      if (filter.args) {
        for (j = 0, k = filter.args.length; j < k; j++) {
          arg = filter.args[j];
          args[j + offset] = arg.dynamic ? this.$get(arg.value) : arg.value;
        }
      }
      value = fn.apply(this, args);
    }
    return value;
  };

  /**
   * Resolve a component, depending on whether the component
   * is defined normally or using an async factory function.
   * Resolves synchronously if already resolved, otherwise
   * resolves asynchronously and caches the resolved
   * constructor on the factory.
   *
   * @param {String} id
   * @param {Function} cb
   */

  Vue.prototype._resolveComponent = function (id, cb) {
    var factory = resolveAsset(this.$options, 'components', id);
    if (process.env.NODE_ENV !== 'production') {
      assertAsset(factory, 'component', id);
    }
    if (!factory) {
      return;
    }
    // async component factory
    if (!factory.options) {
      if (factory.resolved) {
        // cached
        cb(factory.resolved);
      } else if (factory.requested) {
        // pool callbacks
        factory.pendingCallbacks.push(cb);
      } else {
        factory.requested = true;
        var cbs = factory.pendingCallbacks = [cb];
        factory(function resolve(res) {
          if (isPlainObject(res)) {
            res = Vue.extend(res);
          }
          // cache resolved
          factory.resolved = res;
          // invoke callbacks
          for (var i = 0, l = cbs.length; i < l; i++) {
            cbs[i](res);
          }
        }, function reject(reason) {
          process.env.NODE_ENV !== 'production' && warn('Failed to resolve async component: ' + id + '. ' + (reason ? '\nReason: ' + reason : ''));
        });
      }
    } else {
      // normal component
      cb(factory);
    }
  };
}

function globalAPI (Vue) {

  /**
   * Expose useful internals
   */

  Vue.util = util;
  Vue.config = config;
  Vue.set = set;
  Vue['delete'] = del;
  Vue.nextTick = nextTick;

  /**
   * The following are exposed for advanced usage / plugins
   */

  Vue.compiler = compiler;
  Vue.FragmentFactory = FragmentFactory;
  Vue.internalDirectives = internalDirectives;
  Vue.parsers = {
    path: path,
    text: text$1,
    template: template,
    directive: directive,
    expression: expression
  };

  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */

  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   *
   * @param {Object} extendOptions
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var isFirstExtend = Super.cid === 0;
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor;
    }
    var name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]+$/.test(name)) {
        warn('Invalid component name: ' + name);
        name = null;
      }
    }
    var Sub = createClass(name || 'VueComponent');
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;
    // allow further extension
    Sub.extend = Super.extend;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub;
    }
    return Sub;
  };

  /**
   * A function that returns a sub-class constructor with the
   * given name. This gives us much nicer output when
   * logging instances in the console.
   *
   * @param {String} name
   * @return {Function}
   */

  function createClass(name) {
    return new Function('return function ' + classify(name) + ' (options) { this._init(options) }')();
  }

  /**
   * Plugin system
   *
   * @param {Object} plugin
   */

  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return;
    }
    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this;
  };

  /**
   * Apply a global mixin by merging it into the default
   * options.
   */

  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin);
  };

  /**
   * Create asset registration methods with the following
   * signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  config._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && (commonTagRE.test(id) || reservedTagRE.test(id))) {
            warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = id;
          definition = Vue.extend(definition);
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });
}

var filterRE = /[^|]\|[^|]/;

function dataAPI (Vue) {

  /**
   * Get the value from an expression on this vm.
   *
   * @param {String} exp
   * @param {Boolean} [asStatement]
   * @return {*}
   */

  Vue.prototype.$get = function (exp, asStatement) {
    var res = parseExpression(exp);
    if (res) {
      if (asStatement && !isSimplePath(exp)) {
        var self = this;
        return function statementHandler() {
          self.$arguments = toArray(arguments);
          res.get.call(self, self);
          self.$arguments = null;
        };
      } else {
        try {
          return res.get.call(this, this);
        } catch (e) {}
      }
    }
  };

  /**
   * Set the value from an expression on this vm.
   * The expression must be a valid left-hand
   * expression in an assignment.
   *
   * @param {String} exp
   * @param {*} val
   */

  Vue.prototype.$set = function (exp, val) {
    var res = parseExpression(exp, true);
    if (res && res.set) {
      res.set.call(this, this, val);
    }
  };

  /**
   * Delete a property on the VM
   *
   * @param {String} key
   */

  Vue.prototype.$delete = function (key) {
    del(this._data, key);
  };

  /**
   * Watch an expression, trigger callback when its
   * value changes.
   *
   * @param {String|Function} expOrFn
   * @param {Function} cb
   * @param {Object} [options]
   *                 - {Boolean} deep
   *                 - {Boolean} immediate
   * @return {Function} - unwatchFn
   */

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;
    var parsed;
    if (typeof expOrFn === 'string') {
      parsed = parseDirective(expOrFn);
      expOrFn = parsed.expression;
    }
    var watcher = new Watcher(vm, expOrFn, cb, {
      deep: options && options.deep,
      sync: options && options.sync,
      filters: parsed && parsed.filters
    });
    if (options && options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  };

  /**
   * Evaluate a text directive, including filters.
   *
   * @param {String} text
   * @param {Boolean} [asStatement]
   * @return {String}
   */

  Vue.prototype.$eval = function (text, asStatement) {
    // check for filters.
    if (filterRE.test(text)) {
      var dir = parseDirective(text);
      // the filter regex check might give false positive
      // for pipes inside strings, so it's possible that
      // we don't get any filters here
      var val = this.$get(dir.expression, asStatement);
      return dir.filters ? this._applyFilters(val, null, dir.filters) : val;
    } else {
      // no filter
      return this.$get(text, asStatement);
    }
  };

  /**
   * Interpolate a piece of template text.
   *
   * @param {String} text
   * @return {String}
   */

  Vue.prototype.$interpolate = function (text) {
    var tokens = parseText(text);
    var vm = this;
    if (tokens) {
      if (tokens.length === 1) {
        return vm.$eval(tokens[0].value) + '';
      } else {
        return tokens.map(function (token) {
          return token.tag ? vm.$eval(token.value) : token.value;
        }).join('');
      }
    } else {
      return text;
    }
  };

  /**
   * Log instance data as a plain JS object
   * so that it is easier to inspect in console.
   * This method assumes console is available.
   *
   * @param {String} [path]
   */

  Vue.prototype.$log = function (path) {
    var data = path ? getPath(this._data, path) : this._data;
    if (data) {
      data = clean(data);
    }
    // include computed fields
    if (!path) {
      for (var key in this.$options.computed) {
        data[key] = clean(this[key]);
      }
    }
    console.log(data);
  };

  /**
   * "clean" a getter/setter converted object into a plain
   * object copy.
   *
   * @param {Object} - obj
   * @return {Object}
   */

  function clean(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

function domAPI (Vue) {

  /**
   * Convenience on-instance nextTick. The callback is
   * auto-bound to the instance, and this avoids component
   * modules having to rely on the global Vue.
   *
   * @param {Function} fn
   */

  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this);
  };

  /**
   * Append instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$appendTo = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, append, appendWithTransition);
  };

  /**
   * Prepend instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$prependTo = function (target, cb, withTransition) {
    target = query(target);
    if (target.hasChildNodes()) {
      this.$before(target.firstChild, cb, withTransition);
    } else {
      this.$appendTo(target, cb, withTransition);
    }
    return this;
  };

  /**
   * Insert instance before target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$before = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, beforeWithCb, beforeWithTransition);
  };

  /**
   * Insert instance after target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$after = function (target, cb, withTransition) {
    target = query(target);
    if (target.nextSibling) {
      this.$before(target.nextSibling, cb, withTransition);
    } else {
      this.$appendTo(target.parentNode, cb, withTransition);
    }
    return this;
  };

  /**
   * Remove instance from DOM
   *
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$remove = function (cb, withTransition) {
    if (!this.$el.parentNode) {
      return cb && cb();
    }
    var inDocument = this._isAttached && inDoc(this.$el);
    // if we are not in document, no need to check
    // for transitions
    if (!inDocument) withTransition = false;
    var self = this;
    var realCb = function realCb() {
      if (inDocument) self._callHook('detached');
      if (cb) cb();
    };
    if (this._isFragment) {
      removeNodeRange(this._fragmentStart, this._fragmentEnd, this, this._fragment, realCb);
    } else {
      var op = withTransition === false ? removeWithCb : removeWithTransition;
      op(this.$el, this, realCb);
    }
    return this;
  };

  /**
   * Shared DOM insertion function.
   *
   * @param {Vue} vm
   * @param {Element} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition]
   * @param {Function} op1 - op for non-transition insert
   * @param {Function} op2 - op for transition insert
   * @return vm
   */

  function insert(vm, target, cb, withTransition, op1, op2) {
    target = query(target);
    var targetIsDetached = !inDoc(target);
    var op = withTransition === false || targetIsDetached ? op1 : op2;
    var shouldCallHook = !targetIsDetached && !vm._isAttached && !inDoc(vm.$el);
    if (vm._isFragment) {
      mapNodeRange(vm._fragmentStart, vm._fragmentEnd, function (node) {
        op(node, target, vm);
      });
      cb && cb();
    } else {
      op(vm.$el, target, vm, cb);
    }
    if (shouldCallHook) {
      vm._callHook('attached');
    }
    return vm;
  }

  /**
   * Check for selectors
   *
   * @param {String|Element} el
   */

  function query(el) {
    return typeof el === 'string' ? document.querySelector(el) : el;
  }

  /**
   * Append operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function append(el, target, vm, cb) {
    target.appendChild(el);
    if (cb) cb();
  }

  /**
   * InsertBefore operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function beforeWithCb(el, target, vm, cb) {
    before(el, target);
    if (cb) cb();
  }

  /**
   * Remove operation that takes a callback.
   *
   * @param {Node} el
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function removeWithCb(el, vm, cb) {
    remove(el);
    if (cb) cb();
  }
}

function eventsAPI (Vue) {

  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$on = function (event, fn) {
    (this._events[event] || (this._events[event] = [])).push(fn);
    modifyListenerCount(this, event, 1);
    return this;
  };

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$once = function (event, fn) {
    var self = this;
    function on() {
      self.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  };

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$off = function (event, fn) {
    var cbs;
    // all
    if (!arguments.length) {
      if (this.$parent) {
        for (event in this._events) {
          cbs = this._events[event];
          if (cbs) {
            modifyListenerCount(this, event, -cbs.length);
          }
        }
      }
      this._events = {};
      return this;
    }
    // specific event
    cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (arguments.length === 1) {
      modifyListenerCount(this, event, -cbs.length);
      this._events[event] = null;
      return this;
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        modifyListenerCount(this, event, -1);
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  };

  /**
   * Trigger an event on self.
   *
   * @param {String} event
   * @return {Boolean} shouldPropagate
   */

  Vue.prototype.$emit = function (event) {
    var cbs = this._events[event];
    var shouldPropagate = !cbs;
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        var res = cbs[i].apply(this, args);
        if (res === true) {
          shouldPropagate = true;
        }
      }
    }
    return shouldPropagate;
  };

  /**
   * Recursively broadcast an event to all children instances.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$broadcast = function (event) {
    // if no child has registered for this event,
    // then there's no need to broadcast.
    if (!this._eventsCount[event]) return;
    var children = this.$children;
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var shouldPropagate = child.$emit.apply(child, arguments);
      if (shouldPropagate) {
        child.$broadcast.apply(child, arguments);
      }
    }
    return this;
  };

  /**
   * Recursively propagate an event up the parent chain.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$dispatch = function () {
    this.$emit.apply(this, arguments);
    var parent = this.$parent;
    while (parent) {
      var shouldPropagate = parent.$emit.apply(parent, arguments);
      parent = shouldPropagate ? parent.$parent : null;
    }
    return this;
  };

  /**
   * Modify the listener counts on all parents.
   * This bookkeeping allows $broadcast to return early when
   * no child has listened to a certain event.
   *
   * @param {Vue} vm
   * @param {String} event
   * @param {Number} count
   */

  var hookRE = /^hook:/;
  function modifyListenerCount(vm, event, count) {
    var parent = vm.$parent;
    // hooks do not get broadcasted so no need
    // to do bookkeeping for them
    if (!parent || !count || hookRE.test(event)) return;
    while (parent) {
      parent._eventsCount[event] = (parent._eventsCount[event] || 0) + count;
      parent = parent.$parent;
    }
  }
}

function lifecycleAPI (Vue) {

  /**
   * Set instance target element and kick off the compilation
   * process. The passed in `el` can be a selector string, an
   * existing Element, or a DocumentFragment (for block
   * instances).
   *
   * @param {Element|DocumentFragment|string} el
   * @public
   */

  Vue.prototype.$mount = function (el) {
    if (this._isCompiled) {
      process.env.NODE_ENV !== 'production' && warn('$mount() should be called only once.');
      return;
    }
    el = query(el);
    if (!el) {
      el = document.createElement('div');
    }
    this._compile(el);
    this._initDOMHooks();
    if (inDoc(this.$el)) {
      this._callHook('attached');
      ready.call(this);
    } else {
      this.$once('hook:attached', ready);
    }
    return this;
  };

  /**
   * Mark an instance as ready.
   */

  function ready() {
    this._isAttached = true;
    this._isReady = true;
    this._callHook('ready');
  }

  /**
   * Teardown the instance, simply delegate to the internal
   * _destroy.
   */

  Vue.prototype.$destroy = function (remove, deferCleanup) {
    this._destroy(remove, deferCleanup);
  };

  /**
   * Partially compile a piece of DOM and return a
   * decompile function.
   *
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host]
   * @return {Function}
   */

  Vue.prototype.$compile = function (el, host, scope, frag) {
    return compile(el, this.$options, true)(this, el, host, scope, frag);
  };
}

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefixed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue(options) {
  this._init(options);
}

// install internals
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
miscMixin(Vue);

// install APIs
globalAPI(Vue);
dataAPI(Vue);
domAPI(Vue);
eventsAPI(Vue);
lifecycleAPI(Vue);

var convertArray = vFor._postProcess;

/**
 * Limit filter for arrays
 *
 * @param {Number} n
 * @param {Number} offset (Decimal expected)
 */

function limitBy(arr, n, offset) {
  offset = offset ? parseInt(offset, 10) : 0;
  return typeof n === 'number' ? arr.slice(offset, offset + n) : arr;
}

/**
 * Filter filter for arrays
 *
 * @param {String} search
 * @param {String} [delimiter]
 * @param {String} ...dataKeys
 */

function filterBy(arr, search, delimiter) {
  arr = convertArray(arr);
  if (search == null) {
    return arr;
  }
  if (typeof search === 'function') {
    return arr.filter(search);
  }
  // cast to lowercase string
  search = ('' + search).toLowerCase();
  // allow optional `in` delimiter
  // because why not
  var n = delimiter === 'in' ? 3 : 2;
  // extract and flatten keys
  var keys = toArray(arguments, n).reduce(function (prev, cur) {
    return prev.concat(cur);
  }, []);
  var res = [];
  var item, key, val, j;
  for (var i = 0, l = arr.length; i < l; i++) {
    item = arr[i];
    val = item && item.$value || item;
    j = keys.length;
    if (j) {
      while (j--) {
        key = keys[j];
        if (key === '$key' && contains(item.$key, search) || contains(getPath(val, key), search)) {
          res.push(item);
          break;
        }
      }
    } else if (contains(item, search)) {
      res.push(item);
    }
  }
  return res;
}

/**
 * Filter filter for arrays
 *
 * @param {String} sortKey
 * @param {String} reverse
 */

function orderBy(arr, sortKey, reverse) {
  arr = convertArray(arr);
  if (!sortKey) {
    return arr;
  }
  var order = reverse && reverse < 0 ? -1 : 1;
  // sort on a copy to avoid mutating original array
  return arr.slice().sort(function (a, b) {
    if (sortKey !== '$key') {
      if (isObject(a) && '$value' in a) a = a.$value;
      if (isObject(b) && '$value' in b) b = b.$value;
    }
    a = isObject(a) ? getPath(a, sortKey) : a;
    b = isObject(b) ? getPath(b, sortKey) : b;
    return a === b ? 0 : a > b ? order : -order;
  });
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains(val, search) {
  var i;
  if (isPlainObject(val)) {
    var keys = Object.keys(val);
    i = keys.length;
    while (i--) {
      if (contains(val[keys[i]], search)) {
        return true;
      }
    }
  } else if (isArray(val)) {
    i = val.length;
    while (i--) {
      if (contains(val[i], search)) {
        return true;
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1;
  }
}

var digitsRE = /(\d{3})(?=\d)/g;

// asset collections must be a plain object.
var filters = {

  orderBy: orderBy,
  filterBy: filterBy,
  limitBy: limitBy,

  /**
   * Stringify value.
   *
   * @param {Number} indent
   */

  json: {
    read: function read(value, indent) {
      return typeof value === 'string' ? value : JSON.stringify(value, null, Number(indent) || 2);
    },
    write: function write(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  },

  /**
   * 'abc' => 'Abc'
   */

  capitalize: function capitalize(value) {
    if (!value && value !== 0) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },

  /**
   * 'abc' => 'ABC'
   */

  uppercase: function uppercase(value) {
    return value || value === 0 ? value.toString().toUpperCase() : '';
  },

  /**
   * 'AbC' => 'abc'
   */

  lowercase: function lowercase(value) {
    return value || value === 0 ? value.toString().toLowerCase() : '';
  },

  /**
   * 12345 => $12,345.00
   *
   * @param {String} sign
   */

  currency: function currency(value, _currency) {
    value = parseFloat(value);
    if (!isFinite(value) || !value && value !== 0) return '';
    _currency = _currency != null ? _currency : '$';
    var stringified = Math.abs(value).toFixed(2);
    var _int = stringified.slice(0, -3);
    var i = _int.length % 3;
    var head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
    var _float = stringified.slice(-3);
    var sign = value < 0 ? '-' : '';
    return _currency + sign + head + _int.slice(i).replace(digitsRE, '$1,') + _float;
  },

  /**
   * 'item' => 'items'
   *
   * @params
   *  an array of strings corresponding to
   *  the single, double, triple ... forms of the word to
   *  be pluralized. When the number to be pluralized
   *  exceeds the length of the args, it will use the last
   *  entry in the array.
   *
   *  e.g. ['single', 'double', 'triple', 'multiple']
   */

  pluralize: function pluralize(value) {
    var args = toArray(arguments, 1);
    return args.length > 1 ? args[value % 10 - 1] || args[args.length - 1] : args[0] + (value === 1 ? '' : 's');
  },

  /**
   * Debounce a handler function.
   *
   * @param {Function} handler
   * @param {Number} delay = 300
   * @return {Function}
   */

  debounce: function debounce(handler, delay) {
    if (!handler) return;
    if (!delay) {
      delay = 300;
    }
    return _debounce(handler, delay);
  }
};

var partial = {

  priority: 1750,

  params: ['name'],

  // watch changes to name for dynamic partials
  paramWatchers: {
    name: function name(value) {
      vIf.remove.call(this);
      if (value) {
        this.insert(value);
      }
    }
  },

  bind: function bind() {
    this.anchor = createAnchor('v-partial');
    replace(this.el, this.anchor);
    this.insert(this.params.name);
  },

  insert: function insert(id) {
    var partial = resolveAsset(this.vm.$options, 'partials', id);
    if (process.env.NODE_ENV !== 'production') {
      assertAsset(partial, 'partial', id);
    }
    if (partial) {
      this.factory = new FragmentFactory(this.vm, partial);
      vIf.insert.call(this);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
  }
};

// This is the elementDirective that handles <content>
// transclusions. It relies on the raw content of an
// instance being stored as `$options._content` during
// the transclude phase.

// We are exporting two versions, one for named and one
// for unnamed, because the unnamed slots must be compiled
// AFTER all named slots have selected their content. So
// we need to give them different priorities in the compilation
// process. (See #1965)

var slot = {

  priority: 1750,

  bind: function bind() {
    var host = this.vm;
    var raw = host.$options._content;
    if (!raw) {
      this.fallback();
      return;
    }
    var context = host._context;
    var slotName = this.params && this.params.name;
    if (!slotName) {
      // Default slot
      this.tryCompile(extractFragment(raw.childNodes, raw, true), context, host);
    } else {
      // Named slot
      var selector = '[slot="' + slotName + '"]';
      var nodes = raw.querySelectorAll(selector);
      if (nodes.length) {
        this.tryCompile(extractFragment(nodes, raw), context, host);
      } else {
        this.fallback();
      }
    }
  },

  tryCompile: function tryCompile(content, context, host) {
    if (content.hasChildNodes()) {
      this.compile(content, context, host);
    } else {
      this.fallback();
    }
  },

  compile: function compile(content, context, host) {
    if (content && context) {
      var scope = host ? host._scope : this._scope;
      this.unlink = context.$compile(content, host, scope, this._frag);
    }
    if (content) {
      replace(this.el, content);
    } else {
      remove(this.el);
    }
  },

  fallback: function fallback() {
    this.compile(extractContent(this.el, true), this.vm);
  },

  unbind: function unbind() {
    if (this.unlink) {
      this.unlink();
    }
  }
};

var namedSlot = extend(extend({}, slot), {
  priority: slot.priority + 1,
  params: ['name']
});

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @param {Element} parent
 * @param {Boolean} main
 * @return {DocumentFragment}
 */

function extractFragment(nodes, parent, main) {
  var frag = document.createDocumentFragment();
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i];
    // if this is the main outlet, we want to skip all
    // previously selected nodes;
    // otherwise, we want to mark the node as selected.
    // clone the node so the original raw content remains
    // intact. this ensures proper re-compilation in cases
    // where the outlet is inside a conditional block
    if (main && !node.__v_selected) {
      append(node);
    } else if (!main && node.parentNode === parent) {
      node.__v_selected = true;
      append(node);
    }
  }
  return frag;

  function append(node) {
    if (isTemplate(node) && !node.hasAttribute('v-if') && !node.hasAttribute('v-for')) {
      node = parseTemplate(node);
    }
    node = cloneNode(node);
    frag.appendChild(node);
  }
}

var elementDirectives = {
  slot: slot,
  _namedSlot: namedSlot, // same as slot but with higher priority
  partial: partial
};

Vue.version = '1.0.12';

/**
 * Vue and every constructor that extends Vue has an
 * associated options object, which can be accessed during
 * compilation steps as `this.constructor.options`.
 *
 * These can be seen as the default options of every
 * Vue instance.
 */

Vue.options = {
  directives: publicDirectives,
  elementDirectives: elementDirectives,
  filters: filters,
  transitions: {},
  components: {},
  partials: {},
  replace: true
};

// devtools global hook
/* istanbul ignore if */
if (process.env.NODE_ENV !== 'production' && inBrowser) {
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', Vue);
  } else if (/Chrome\/\d+/.test(navigator.userAgent)) {
    console.log('Download the Vue Devtools for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
  }
}

module.exports = Vue;
}).call(this,require('_process'))

},{"_process":1}],78:[function(require,module,exports){
'use strict';

var _Util = require('./Util.js');

var _Util2 = _interopRequireDefault(_Util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Parse = require('parse');
var Vue = require('vue');

// Application entry point
window.onload = function () {

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
  });

  // 登録する
  Vue.component('visitor-info', VisitorInfo);

  // root インスタンスを作成する
  new Vue({
    el: '#visitor-list'
  });

  var date = _Util2.default.formatDate();
  console.log('[' + date + '] Application was launched.');

  // init Parse
  Parse.initialize("Ikzt3vnq6LwIKSb4WDP8RkOcUW3wRlsQuLUlrrFN", "mQTMG00TR3azol0UmAT6IIUH0uWFtppRDqDjNS5h");

  var TestObject = Parse.Object.extend("TestObject");
  var testObject = new TestObject();
  testObject.save({ foo: "bar" }).then(function (object) {
    console.log("yay! Parse worked");
  });
};

},{"./Util.js":79,"parse":2,"vue":77}],79:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Provide a utility method.
 */

var Util = (function () {
  function Util() {
    _classCallCheck(this, Util);
  }

  _createClass(Util, null, [{
    key: 'formatDate',

    /**
     * Converts the value of the Date object to its equivalent string representation using the specified format.
     *
     * @param {Date}   date   Date and time. Default is current date and time.
     * @param {String} format Date and time format string. Default is "YYYY-MM-DD hh:mm:ss.SSS".
     *
     * @return {String} Formatted string.
     *
     * @see http://qiita.com/osakanafish/items/c64fe8a34e7221e811d0
     */
    value: function formatDate(date, format) {
      date = date === undefined ? new Date() : date;
      format = format === undefined ? 'YYYY-MM-DD hh:mm:ss.SSS' : format;

      // Zero padding
      format = format.replace(/YYYY/g, date.getFullYear());
      format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
      format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
      format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
      format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
      format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));

      // Single digit
      format = format.replace(/M/g, date.getMonth() + 1);
      format = format.replace(/D/g, date.getDate());
      format = format.replace(/h/g, date.getHours());
      format = format.replace(/m/g, date.getMinutes());
      format = format.replace(/s/g, date.getSeconds());

      if (format.match(/S/g)) {
        var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
        for (var i = 0, max = format.match(/S/g).length; i < max; ++i) {
          format = format.replace(/S/, milliSeconds.substring(i, i + 1));
        }
      }

      return format;
    }
  }]);

  return Util;
})();

exports.default = Util;

},{}]},{},[78])
//# sourceMappingURL=bundle.js.map
