(function () {
    'use strict';
    angular
        .module('swSelfService')
        .directive('wizard',wizard);
    wizard.$inject = ['$q'];
    function wizard($q)
    {
      return {
          restrict: "E",
          transclude: true,
          scope: {
              currentStage: "=",
              submit: "&"
          },
          templateUrl: "templates/wizard/wizard.main.tpl.html",
          controller: function($scope) {
              $scope.currentStage = $scope.currentStage || 0;
              $scope.getCurrentStage = function() {
                  return $scope.wizDataServ.wizardStages[$scope.currentStage];
              };
              this.getCurrentStage = $scope.getCurrentStage;
              $scope.goToStageByReference = function(stage) {
                  var stageNumber = $scope.wizDataServ.wizardStages.indexOf(stage);
                  return $scope.goToStage(stageNumber);
              };
              var isValidStageNumber = function(stageNumber) {
                  return stageNumber < $scope.wizDataServ.wizardStages.length && stageNumber >= 0;
              };
              $scope.canGoToStage = function(stageNumber) {
                  if (!isValidStageNumber(stageNumber)) {
                      return false;
                  }
                  var newStage = $scope.wizDataServ.wizardStages[stageNumber];
                  return $scope.getStageState(newStage) != $scope.stageStatesEnum.disabled;
              };
              $scope.goToStage = function(stageNumber) {
                  if ($scope.canGoToStage(stageNumber)) {
                      $scope.currentStage = stageNumber;
                      return true;
                  }
                  return false;
              };
              $scope.getStageState = function(stage) {
                  if (stage.requiredStageNumber && isValidStageNumber(stage.requiredStageNumber) && $scope.getStageState($scope.wizDataServ.wizardStages[stage.requiredStageNumber]) != $scope.stageStatesEnum.complete) {
                      return $scope.stageStatesEnum.disabled;
                  } else if (stage.stageForm.$valid) {
                      return $scope.stageStatesEnum.complete;
                  } else return $scope.stageStatesEnum.ready;
              };
              $scope.stageStatesEnum = {
                  disabled: 0,
                  ready: 1,
                  complete: 2
              };
              $scope.goToNext = function() {
                  $scope.goToStage($scope.currentStage + 1);
              };
              $scope.hasNext = function() {
                return $scope.wizDataServ.wizardStages.length > $scope.currentStage + 1 && $scope.getStageState($scope.wizDataServ.wizardStages[$scope.currentStage + 1]) != $scope.stageStatesEnum.disabled;
              };
              $scope.goToPrevious = function() {
                $scope.goToStage($scope.currentStage - 1);
              };
              $scope.hasPrevious = function() {
                return $scope.currentStage > 0;
              };

              $scope.wizDataServ.wizardStages = [];
              this.registerStage = function(stageScope) {
                $scope.wizDataServ.wizardStages.push(stageScope);
              };
              this.unregisterStage = function(stageScope) {
                var index = $scope.wizDataServ.wizardStages.indexOf(stageScope);
                if (index >= 0) {
                    $scope.wizDataServ.wizardStages.splice(index, 1);
                }
              };
              $scope.isSubmittable = function() {
                  return $scope.wizDataServ.wizardStages.every(function(stage) {
                      return $scope.getStageState(stage) == $scope.stageStatesEnum.complete;
                  });
              };
              $scope.submitting = false;
              $scope.onSubmitClicked = function() {
                  $scope.submitting = true;
                  $q.when($scope.submit()).then(function() {
                      $scope.submitting = false;
                  });
              };
              $scope.$watch("currentStage", function(newVal, oldVal) {
                  if (newVal != oldVal) {
                      if (!$scope.canGoToStage(newVal)) {
                          if (oldVal && $scope.canGoToStage(oldVal)) {
                              $scope.currentStage = oldVal;
                          } else $scope.currentStage = 0;
                      } else {
                          $scope.getCurrentStage().entered();
                      }
                  }
              });
              $scope.$watch("stages.length", function() {
                  if (!$scope.getCurrentStage()) {
                      $scope.currentStage = 0;
                  }
              }, true);
          }
      };
    }
})();
