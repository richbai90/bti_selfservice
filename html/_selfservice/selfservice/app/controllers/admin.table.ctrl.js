'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('AdminTableController', AdminTableController);

  AdminTableController.$inject = ['$rootScope', '$scope', '$uibModalInstance', 'SWSessionService', 'wssHelpers', 'wssLogging'];
  function AdminTableController($rootScope, $scope, $uibModalInstance, SWSessionService, wssHelpers, wssLogging) {
    $scope.tableSchema = wssHelpers.getTableSettings($rootScope.adminModalSchema);
    $scope.tableData = wssHelpers.getTableSettings($rootScope.adminModalContent);

    $scope.$on('AdminTableModalComplete', function (event, args) {
      if (angular.isDefined(args.responseType) && args.responseType === 'submit') {
        if (angular.isDefined($rootScope.adminModalNew) && $rootScope.adminModalNew) {
          wssHelpers.insertTableSettings($rootScope.adminModalContent, args.responseEditor).then(function (response) {
            $rootScope.adminModalNew = false;
            $uibModalInstance.close(args.responseType);
          }, function (error) {
            var toastType = "error";
            var toastBody = "Unable to add the configuration for this table.";
            var toastTitle = "Table Configuration Error!";
            wssLogging.sendToast(toastType, toastBody, toastTitle);
            $uibModalInstance.dismiss('cancel');
          });
        } else {
          wssHelpers.updateTableSettings($rootScope.adminModalContent, args.responseEditor).then(function (response) {
            $uibModalInstance.close(args.responseType);
          }, function (error) {
            var toastType = "error";
            var toastBody = "Unable to add the configuration for this table.";
            var toastTitle = "Table Configuration Error!";
            wssLogging.sendToast(toastType, toastBody, toastTitle);
            $uibModalInstance.dismiss('cancel');
          });
        }
      } else if (angular.isDefined(args.responseType) && args.responseType === 'reset') {
        wssHelpers.resetTableSettings($rootScope.adminModalContent).then(function (response) {
          $uibModalInstance.close(args.responseType);
        }, function (error) {
          var toastType = "error";
          var toastBody = 'Unable to reset the configuration for this table to its default settings.';
          var toastTitle = "Table Configuration Error!";
          wssLogging.sendToast(toastType, toastBody, toastTitle);
          $uibModalInstance.dismiss('cancel');
        });
      } else {
        $uibModalInstance.dismiss('cancel');
      }
    });
  }

  //Customer-Filtered Request List Controller
  angular.module('swSelfService').controller('AsyncButtonsController', AsyncButtonsController);
  AsyncButtonsController.$inject = ['$rootScope', '$scope'];
  function AsyncButtonsController($rootScope, $scope) {

    var buttonArgs = [];

    $scope.onSubmit = function () {
      buttonArgs.responseType = 'submit';
      buttonArgs.responseEditor = $scope.editor.getValue();
      buttonArgs.recordPage = $rootScope.adminModalContent;
      $rootScope.$broadcast('AdminTableModalComplete', buttonArgs);
    };

    $scope.onCancel = function () {
      buttonArgs.responseType = 'cancel';
      buttonArgs.recordPage = $rootScope.adminModalContent;
      $rootScope.$broadcast('AdminTableModalComplete', buttonArgs);
    };

    $scope.onReset = function () {
      if (confirm("This will reset the configuration of this table to its default settings. Do you wish to continue?")) {
        buttonArgs.responseType = 'reset';
        buttonArgs.recordPage = $rootScope.adminModalContent;
        $rootScope.$broadcast('AdminTableModalComplete', buttonArgs);
      }
    };
  }
})();
//# sourceMappingURL=admin.table.ctrl.js.map