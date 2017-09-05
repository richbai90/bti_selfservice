(function () {
  'use strict';

  angular.module('swSelfService').directive('wssRequestHeader', wssRequestHeader);
  function wssRequestHeader() {
    return {
      'transclude': true,
      'restrict': 'E',
      'templateUrl': 'app/directives/wss-request-header/wss-request-header.tpl.html',
      'scope': {
        'title': '@',
        'icon': '@',
        'stack': '@'
      }
    };
  }
})();
//# sourceMappingURL=wss-request-header.dir.js.map