'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').directive('wssPageHeader', wssPageHeader);
  function wssPageHeader() {
    return {
      'transclude': true,
      'restrict': 'E',
      'templateUrl': 'app/directives/wss-page-header/wss-page-header.tpl.html',
      'scope': {
        'title': '@',
        'icon': '@'
      }
    };
  }
})();
//# sourceMappingURL=wss-page-header.dir.js.map