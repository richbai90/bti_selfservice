'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('SamlLoginController', SamlLoginController);

  SamlLoginController.$inject = ['$scope', '$state', '$timeout', 'SWSessionService', '$location', '$stateParams', '$cookies',];

  function SamlLoginController($scope, $state, $timeout, SWSessionService, $location, $stateParams, $cookies) {
    $scope.loginFailed = false;
    $scope.login = function () {
      $cookies.remove('saml_auth');
      if ($scope.loginFailed) {
        $scope.loginFailed = false;
        $location.path('/'); // restart this process
      }
      $timeout(function () {
        if (angular.isDefined($location.search().LogoutState)) {
          SWSessionService.logout(true);
          $scope.loginFailed = true;
        }
        SWSessionService.ssoLogin($stateParams.saml.claim, $stateParams.saml.config).then(function (auth) {
          if (auth) {
            auth === true ? $state.go('home') : $location.path(auth);
          } else {
            $scope.loginFailed = true;
          }
        }).catch(function () {

          $scope.loginFailed = true;

        });
      }, 500);
    };

    $scope.login();
  }
})();
//# sourceMappingURL=login.saml.ctrl.js.map