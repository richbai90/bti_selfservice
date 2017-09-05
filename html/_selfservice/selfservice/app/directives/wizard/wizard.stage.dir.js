(function () {
    'use strict';

    angular.module('swSelfService').directive('wizardStage', wizardStage);
    wizardStage.$inject = ['$q'];
    function wizardStage($q) {
        return {
            require: "^wizard",
            restrict: "E",
            transclude: true,
            scope: {
                title: "@",
                requiredStageNumber: "@",
                entered: "&",
                animation: "@"
            },
            template: "<ng-form name='stageForm' ng-show='isActive()'><ng-transclude></ng-transclude></ng-form>",
            link: function ($scope, element, attrs, wizardCtrl) {
                wizardCtrl.registerStage($scope);
                $scope.isActive = function () {
                    return $scope == wizardCtrl.getCurrentStage();
                };
                $scope.$on("$destroy", function () {
                    wizardCtrl.unregisterStage($scope);
                });
            }
        };
    }
})();
//# sourceMappingURL=wizard.stage.dir.js.map