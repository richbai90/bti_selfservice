(() => {
  'use strict';

  angular.module('swSelfService').directive('btiBreadCrumbs', [() => ({
    restrict: 'E',
    templateUrl: 'app/directives/bti-bread-crumbs/bti-bread-crumbs.tpl.html',
    scope: true,
    bindToController: {
      navigate: '=',
      currentLevel: '&',
      showTop: '='
    },

    controllerAs: 'breadCrumbs',
    controller($scope) {
      this.crumbs = [];
      const _this = this;

      $scope.$watch($scope.breadCrumbs.currentLevel, (newVal, oldVal) => {
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
        }
      });
    }
  })]);
})();
//# sourceMappingURL=bti-bread-crumbs.js.map