'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('SamlLoginController', SamlLoginController);

  SamlLoginController.$inject = ['$scope', '$state', '$timeout', 'SWSessionService', '$location', '$stateParams'];

  function SamlLoginController($scope, $state, $timeout, SWSessionService, $location, $stateParams) {
    $timeout(function () {
      SWSessionService.ssoLogin($stateParams.saml.claim).then(function (auth) {
        if (auth) {
          auth === true ? $state.go('home') : $location.path(auth);
        } else {
          $state.go('loginmanual');
        }
      });
    });
  }
})();
//# sourceMappingURL=login.saml.ctrl.js.map