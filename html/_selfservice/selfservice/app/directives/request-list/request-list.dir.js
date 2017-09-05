(function () {
  'use strict';

  angular.module('swSelfService').directive('requestList', requestList);
  requestList.$inject = ['$window'];
  function requestList($window) {
    return {
      restrict: 'E',
      template: '<div ng-include="searchwellTemplate"></div><div ng-include="templateUrl"></div>',
      link: function (scope) {

        $window.onresize = function () {
          insertTemplate();
          scope.$apply();
        };
        insertTemplate();

        function insertTemplate() {
          scope.searchwellTemplate = 'templates/requests/lists/request-list.searchwell.main.tpl.html';
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
//# sourceMappingURL=request-list.dir.js.map