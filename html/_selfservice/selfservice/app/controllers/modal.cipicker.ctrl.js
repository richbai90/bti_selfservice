'use strict';

(function () {
  'use strict';

  //Modal CI Picker Controller

  angular.module('swSelfService').controller('ModalCIPickerCtrl', ModalCIPickerCtrl);
  ModalCIPickerCtrl.$inject = ['$scope', '$uibModalInstance', 'items', 'SWSessionService', 'WizardDataService'];
  function ModalCIPickerCtrl($scope, $uibModalInstance, items, SWSessionService, WizardDataService) {
    $scope.wizServ = WizardDataService;
    $scope.ok = function () {
      $uibModalInstance.close($scope.arrAnswers);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ciSelected = function (intCIID, objCI) {
      $scope.arrAnswers[intCIID] = objCI.answer;
    };

    //Check session, if active then build tree in modal
    SWSessionService.checkActiveSession().then(function () {
      $scope.arrAnswers = [];
    }, function () {
      //Session error, cancel modal
      $uibModalInstance.dismiss('cancel');
    });
  }
})();
//# sourceMappingURL=modal.cipicker.ctrl.js.map