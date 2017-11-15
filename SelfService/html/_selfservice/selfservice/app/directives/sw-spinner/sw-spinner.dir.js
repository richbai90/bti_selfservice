'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').directive('swSpinner', swSpinner);

  function swSpinner() {
    return {
      'restrict': 'E',
      'templateUrl': 'app/directives/sw-spinner/sw-spinner.tpl.html',
      'scope': {
        'isLoading': '=',
        'message': '@'
      }
    };
  }
})();
//# sourceMappingURL=sw-spinner.dir.js.map