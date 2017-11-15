'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('PasswordController', PasswordController);

  PasswordController.$inject = ['$scope', 'SWSessionService', '$state', '$stateParams', 'wssLogging'];
  function PasswordController($scope, SWSessionService, $state, $stateParams, wssLogging) {

    $scope.instance = SWSessionService.selfServiceInstance;
    $scope.token = $stateParams.token;
    $scope.images = wssBranding.loginImage;

    $scope.resetPassword = function () {
      var newUser = document.querySelector('#reset-user').value;
      var newPassword = document.querySelector('#reset-password').value;
      var newConfirmPassword = document.querySelector('#confirmpassword').value;

      if (newPassword != newConfirmPassword) {
        var toastType = "error";
        var toastBody = 'The passwords do not match.';
        var toastTitle = "Password mismatch!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
      } else {
        SWSessionService.resetCustomer_Password($scope.instance, newUser, $scope.token, newPassword);
        $state.go('login', { token: "" }, { reload: true });
      }
    };
  }
})();
//# sourceMappingURL=password.ctrl.js.map