'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('SamlLoginController', SamlLoginController);

  SamlLoginController.$inject = ['$scope', '$state', '$timeout', 'SWSessionService', '$location', '$stateParams', '$cookies', '$window',];

  function SamlLoginController($scope, $state, $timeout, SWSessionService, $location, $stateParams, $cookies, $window) {
    $scope.loginFailed = false;
    $scope.login = function () {
      $cookies.remove('saml_auth');
      if ($scope.loginFailed) {
        $scope.loginFailed = false;
        SWSessionService.getSSPSetup().then(function (config) {
			$window.location.href = config.returnAddress;
		})
      }
        if (location.search.match(/[?&](LogoutState=)[^-].+/)) {
          SWSessionService.logout(true);
          $scope.loginFailed = true;
		  $location.search('LogoutState', -1);
        }
        SWSessionService.ssoLogin($stateParams.saml.claim, $stateParams.saml.config).then(function (auth) {
          if (auth) {
            auth === true ? $state.go('home') : $location.path(auth);
          } else {
			  if(auth === '') {
				  $state.go('home');
			  } else {
					$scope.loginFailed = true;
			  }
           
          }
        }).catch(function () {

          $scope.loginFailed = true;

        });
      
    };

    $scope.login();
  }
})();
//# sourceMappingURL=login.saml.ctrl.js.map