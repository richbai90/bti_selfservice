'use strict';

(function () {
  'use strict';

  var exports = {};
  /*!
   * JavaScript Cookie v2.2.0
   * https://github.com/js-cookie/js-cookie
   *
   * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
   * Released under the MIT license
   */
  !function(e){var n=!1;if("function"==typeof define&&define.amd&&(define(e),n=!0),"object"==typeof exports&&(exports.Cookies=e(),n=!0),!n){var o=window.Cookies,t=window.Cookies=e();t.noConflict=function(){return window.Cookies=o,t}}}(function(){function e(){for(var e=0,n={};e<arguments.length;e++){var o=arguments[e];for(var t in o)n[t]=o[t]}return n}function n(o){function t(n,r,i){var c;if("undefined"!=typeof document){if(arguments.length>1){if("number"==typeof(i=e({path:"/"},t.defaults,i)).expires){var a=new Date;a.setMilliseconds(a.getMilliseconds()+864e5*i.expires),i.expires=a}i["max-age"]=i.expires?0:null,i.expires=i.expires?i.expires.toUTCString():"";try{c=JSON.stringify(r),/^[\{\[]/.test(c)&&(r=c)}catch(e){}r=o.write?o.write(r,n):encodeURIComponent(String(r)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),n=(n=(n=encodeURIComponent(String(n))).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent)).replace(/[\(\)]/g,escape);var s="";for(var f in i)(i[f]||0===i[f])&&(s+="; "+f,!0!==i[f]&&(s+="="+i[f]));return document.cookie=n+"="+r+s}n||(c={});for(var p=document.cookie?document.cookie.split("; "):[],d=/(%[0-9A-Z]{2})+/g,u=0;u<p.length;u++){var l=p[u].split("="),C=l.slice(1).join("=");this.json||'"'!==C.charAt(0)||(C=C.slice(1,-1));try{var g=l[0].replace(d,decodeURIComponent);if(C=o.read?o.read(C,g):o(C,g)||C.replace(d,decodeURIComponent),this.json)try{C=JSON.parse(C)}catch(e){}if(n===g){c=C;break}n||(c[g]=C)}catch(e){}}return c}}return t.set=t,t.get=function(e){return t.call(t,e)},t.getJSON=function(){return t.apply({json:!0},[].slice.call(arguments))},t.defaults={},t.remove=function(n,o){t(n,"",e(o,{expires:-1}))},t.withConverter=n,t}return n(function(){})});

  angular.module('swSelfService').controller('SamlLoginController', SamlLoginController);

  SamlLoginController.$inject = ['$scope', '$state', '$timeout', 'SWSessionService', '$location', '$stateParams', '$cookies',];

  function SamlLoginController($scope, $state, $timeout, SWSessionService, $location, $stateParams, $cookies) {
    $scope.loginFailed = false;
    $scope.login = function () {
      $cookies.remove('saml_auth');
      if ($scope.loginFailed) {
        $scope.loginFailed = false;
        exports.Cookies.remove('ESPSessionState', { path: '/sw' });
        exports.Cookies.remove('saml_auth');
        $location.path('/'); // restart this process
      }
      $timeout(function () {
        if ($location.search.match(/[?&]LogoutState/)) {
          SWSessionService.logout(true);
          $scope.loginFailed = true;
        }
        SWSessionService.ssoLogin($stateParams.saml.claim, $stateParams.saml.config).then(function (auth) {
          if (auth) {
            auth === true ? $state.go('home') : $location.path(auth);
          } else {
            $scope.loginFailed = true;
          }
        }).catch(function () {

          $scope.loginFailed = true;

        });
      }, 500);
    };

    $scope.login();
  }
})();
//# sourceMappingURL=login.saml.ctrl.js.map