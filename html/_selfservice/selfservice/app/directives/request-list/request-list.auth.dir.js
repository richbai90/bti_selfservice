'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').directive('requestListAuth', requestListAuth);
  requestListAuth.$inject = ['$window'];
  function requestListAuth($window) {
    return {
      restrict: 'E',
      template: '<div ng-include="searchwellTemplate"></div><div ng-include="templateUrl"></div>',
      link: function link(scope) {

        $window.onresize = function () {
          insertTemplate();
          scope.$apply();
        };
        insertTemplate();

        function insertTemplate() {
          scope.searchwellTemplate = 'templates/requests/lists/request-list.searchwell.auth.tpl.html';
          var screenWidth = $window.innerWidth;
          if (screenWidth < 768) {
            scope.templateUrl = 'templates/requests/lists/request-list.mobile.tpl.html';
          } else if (screenWidth >= 768) {
            scope.templateUrl = 'templates/requests/lists/request-list.tpl.html';
          }
        }
      }
    };
  }
})();
//# sourceMappingURL=request-list.auth.dir.js.map