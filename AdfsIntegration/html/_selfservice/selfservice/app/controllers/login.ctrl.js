'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', 'sspConfig', '$state', 'saml_auth', '$timeout'];

  function LoginController($scope, sspConfig, $state, saml_auth, $timeout) {
    //$scope.loggingIn allows the tracking of when a customer has clicked the Login button, to when the login process has finished.
    $scope.loggingIn = false;
    $scope.images = wssBranding.loginImage;

    if (angular.isDefined(sspConfig.ssoEnabled) && sspConfig.ssoEnabled === true) {
      if (sspConfig.type === 'saml') {
        $timeout(function () {
          $state.go('saml', { saml: { claim: saml_auth } });
        });
      } else {
        $timeout(function () {
          $state.go('loginsso');
        });
      }
    } else {
      $timeout(function () {
        $state.go('loginmanual');
      });
    }
  }
})();
//# sourceMappingURL=login.ctrl.js.map