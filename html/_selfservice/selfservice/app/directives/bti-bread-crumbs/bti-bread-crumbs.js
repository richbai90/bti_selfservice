(() => {
  'use strict';

  angular.module('swSelfService').directive('btiBreadCrumbs', [() => ({
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
    link(scope, elem, attrs) {
      scope.crumbs = [];
      scope.ngModel.crumbs = angular.copy(scope.crumbs);
      const _this = scope;

      scope.$watch(scope.currentLevel, (newVal, oldVal) => {
        if (newVal) {
          if (_this.crumbs.filter(e => newVal.id === e.id).length) {
            let found = false;
            _this.crumbs = _this.crumbs.filter(e => {
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
  })]);
})();
//# sourceMappingURL=bti-bread-crumbs.js.map