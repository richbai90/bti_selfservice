'use strict';

(function () {
  'use strict';

  //Modal TreeView Controller

  angular.module('swSelfService').controller('ModalTreeCtrl', ModalTreeCtrl);
  ModalTreeCtrl.$inject = ['$scope', '$uibModalInstance', 'items', 'SWSessionService'];
  function ModalTreeCtrl($scope, $uibModalInstance, items, SWSessionService) {
    $scope.swtreedata = [];
    $scope.modalLoading = false;

    $scope.buildTree = function () {
      $scope.swtreedata = items.objTree;
    };

    $scope.my_tree_handler = function (branch) {
      $scope.currBranch = branch;
    };

    $scope.ok = function () {
      if (angular.isDefined($scope.currBranch)) {
        $uibModalInstance.close($scope.currBranch);
      } else {
        $uibModalInstance.dismiss('cancel');
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //Check session, if active then build tree in modal
    SWSessionService.checkActiveSession().then(function () {
      $scope.buildTree();
    }, function () {
      //Session error, cancel modal
      $uibModalInstance.dismiss('cancel');
    });
  }
})();
//# sourceMappingURL=modal.tree.ctrl.js.map