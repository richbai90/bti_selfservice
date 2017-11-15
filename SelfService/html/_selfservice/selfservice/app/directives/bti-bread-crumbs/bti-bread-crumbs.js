'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').directive('btiBreadCrumbs', [function () {
    return {
      restrict: 'E',
      templateUrl: 'app/directives/bti-bread-crumbs/bti-bread-crumbs.tpl.html',
      scope: {
        navigate: '=',
        currentLevel: '&',
        showTop: '=',
        ngModel: '=',
        crumbs: '&'
      },
      require: 'ngModel',
      link: function link(scope, elem, attrs) {
        scope.crumbs = [];
        scope.ngModel.crumbs = angular.copy(scope.crumbs);
        var _this = scope;

        scope.$watch(scope.currentLevel, function (newVal, oldVal) {
          if (newVal) {
            if (_this.crumbs.filter(function (e) {
              return newVal.id === e.id;
            }).length) {
              var found = false;
              _this.crumbs = _this.crumbs.filter(function (e) {
                if (!found) {
                  found = e.id === newVal.id;
                  return !found || found; //include the found item
                }
                return false;
              });
            } else {
              _this.crumbs.push(newVal);
            }
            scope.ngModel.crumbs = angular.copy(_this.crumbs);
          }
        });
      }
    };
  }]);
})();
//# sourceMappingURL=bti-bread-crumbs.js.map