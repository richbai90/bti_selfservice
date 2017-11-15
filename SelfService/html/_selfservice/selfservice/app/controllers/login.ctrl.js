'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', 'SWSessionService', '$state'];

  function LoginController($scope, SWSessionService, $state) {
    //$scope.loggingIn allows the tracking of when a customer has clicked the Login button, to when the login process has finished.
    $scope.loggingIn = false;
    $scope.images = wssBranding.loginImage;

    if (!angular.isDefined(SWSessionService.sspConfig) || SWSessionService.sspConfig.length == 0) {
      SWSessionService.getSSPSetup().then(function (ssConfig) {
        if (angular.isDefined(ssConfig.ssoEnabled)) {
          if (ssConfig.ssoEnabled === true) {
            $state.go('loginsso');
          } else {
            $state.go('loginmanual');
          }
        } else {
          $state.go('loginmanual');
        }
      }, function (ssError) {
        $state.go('login');
      });
    } else {
      if (angular.isDefined(SWSessionService.sspConfig.ssoEnabled) && SWSessionService.sspConfig.ssoEnabled === true) {
        $state.go('loginsso');
      } else {
        $state.go('loginmanual');
      }
    }

    //Watch for logout broadcast to clean up session-specific data ready for a new user
    $scope.$on('logout', function () {
      //  SWSessionService = {};
    });
  }
})();
//# sourceMappingURL=login.ctrl.js.map