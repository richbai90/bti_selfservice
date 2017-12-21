'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', 'sspConfig', '$state', 'saml_auth', '$timeout', 'store', '$cookies'];

  function LoginController($scope, sspConfig, $state, saml_auth, $timeout, store, $cookies) {
    //$scope.loggingIn allows the tracking of when a customer has clicked the Login button, to when the login process has finished.
    $scope.loggingIn = false;
    $scope.images = wssBranding.loginImage;
	
	if(store.get('refreshing') && $cookies['ESPSessionState']) {
		$timeout(function () {
			store.set('refreshing', false);
			$state.go(store.get('newState'));
		})
	} else {
	  if (angular.isDefined(sspConfig.ssoEnabled) && sspConfig.ssoEnabled === true) {
      if (sspConfig.type === 'saml') {
        $timeout(function () {
          $state.go('saml', { saml: { claim: saml_auth, config: sspConfig } });
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
	}
})();
//# sourceMappingURL=login.ctrl.js.map