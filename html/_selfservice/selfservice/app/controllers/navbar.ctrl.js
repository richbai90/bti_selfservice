(function () {
  'use strict';

  angular.module('swSelfService').controller('NavBarController', NavBarController);

  NavBarController.$inject = ['$scope', 'SWSessionService', '$state', 'wssLogging', 'store', 'shortcuts'];

  function NavBarController($scope, SWSessionService, $state, wssLogging, store, shortcuts) {
    $scope.brandLogo = wssBranding.logoImage;
    $scope.sessServ = SWSessionService;
    $scope.logoff = function () {
      //Check session, if active then get request details - this runs when the controller is initialised
      $scope.sessServ.previousLogin = true;
      $scope.sessServ.checkActiveSession().then(function () {

        $scope.sessServ.logoff().then(function (response) {}, function (error) {
          var toastType = "error";
          var toastBody = 'There has been an error in disconnecting your session. Please close your browser.';
          var toastTitle = "Session Logoff Error!";
          wssLogging.sendToast(toastType, toastBody, toastTitle);
          $state.go('login');
        });
      });
    };

    var objCustDetail = [];
    if (objCustDetail = store.get("custDetails")) {
      if (objCustDetail.authCount) $scope.sessServ.numAuths = objCustDetail.authCount;
    }

    $scope.activePage = function (stateLoc) {
      return stateLoc === $state.current.name;
    };

    $scope.raiseSupportRequest = function () {
      store.remove("currDataForm");
      $state.go('requestwizard');
    };

    $scope.shortcuts = shortcuts.initFlatShortcuts($scope);
  }
})();
//# sourceMappingURL=navbar.ctrl.js.map