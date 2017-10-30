'use strict';

(function () {
  'use strict';

  //Main Authorisations Requests List controller

  angular.module('swSelfService').controller('RequestListAuthCtrl', RequestListAuthCtrl);
  RequestListAuthCtrl.$inject = ['$rootScope', '$scope', '$state', 'RequestService', 'wssHelpers', '$uibModal'];
  function RequestListAuthCtrl($rootScope, $scope, $state, RequestService, wssHelpers, $uibModal) {
    $scope.showCog = false;

    $scope.reqServ = RequestService;

    //Get state - for keeping Navbar state active with in child state views
    $rootScope.$state = $state;

    //Tab Management
    $scope.tabs = [];
    $scope.tabs.push({ heading: "Pending My Authorisation", route: "requestsauth.myauths", active: false });
    $scope.tabs.push({ heading: "Pending My Manager's Authorisation", route: "requestsauth.managerauths", active: false });

    $scope.go = function (route) {
      $state.go(route);
    };
    $scope.active = function (route) {
      return $state.is(route);
    };
    $scope.$on("$stateChangeSuccess", function () {
      $scope.tabs.forEach(function (tab) {
        tab.active = $scope.active(tab.route);
      });
    });

    //Look for child broadcast to open Table Admin modal
    $scope.$on('AdminTableModalOpen', function (event, args) {
      $rootScope.adminModalSchema = 'table.schema';
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'templates/admin/modal.tableconfig.tpl.html',
        controller: 'AdminTableController',
        size: 'lg',
        resolve: {
          items: function items() {
            return 'requests.' + $rootScope.recordPage;
          }
        }
      });
      modalInstance.result.then(function () {
        //Saved changes - broadcast message to refresh form
        $rootScope.$broadcast('AdminTableModalClose', args);
      }, function () {
        //Cancelled modal - do nothing
      });
    });

    //Watch for logout broadcast to clean up session-specific data ready for a new user
    $scope.$on('logout', function () {
      $scope.reqServ = {};
    });
  }

  //Your Authorisations Request List Controller
  angular.module('swSelfService').controller('RequestListMyAuthCtrl', RequestListMyAuthCtrl);
  RequestListMyAuthCtrl.$inject = ['$rootScope', '$scope', 'RequestListService', 'SWSessionService', 'wssHelpers'];
  function RequestListMyAuthCtrl($rootScope, $scope, RequestListService, SWSessionService, wssHelpers) {
    //requestPage is the unique ID for the list pagination directive for this controller
    $scope.requestPage = 'authyour';
    $scope.isWssAdmin = wssHelpers.hasWebflag('OPTION_ADMIN');
    $scope.custRequests = RequestListService;

    $scope.custRequests.loadingRequests = false;
    $scope.custRequests.selectedRequest = null;
    $scope.custRequests.totalRequests = 0;
    $scope.custRequests.pageNo = 1;

    //Open Admin Table Modal - broadcast to be picked up and processed by parent controller
    $scope.openTableAdminModal = function () {
      var args = [];
      args.recordPage = $scope.requestPage;
      $rootScope.adminModalContent = 'table.requests.' + $scope.requestPage;
      $rootScope.$broadcast('AdminTableModalOpen', args);
    };

    //Watch for Admin Table Modal Closing - refresh model if so
    $scope.$on('AdminTableModalClose', function (event, args) {
      if (args.recordPage === $scope.requestPage) {
        $scope.custRequests.outputConfigObject[$scope.requestPage] = [];
        $scope.custRequests.requestPage = $scope.requestPage;
        $scope.custRequests.getPagedRequests();
      }
    });

    //Watch for logout broadcast to clean up session-specific data ready for a new user
    $scope.$on('logout', function () {
      $scope.custRequests = {};
    });

    //Check session, if active then get paged requests
    SWSessionService.checkActiveSession().then(function () {
      $scope.custRequests.requestPage = $scope.requestPage;
      $scope.custRequests.pageNo = 1;
      $scope.custRequests.getPagedRequests();
    }, function () {
      //
    });
  }

  //Manager Authorisations Request List Controller
  angular.module('swSelfService').controller('RequestListManAuthCtrl', RequestListManAuthCtrl);

  RequestListManAuthCtrl.$inject = ['$rootScope', '$scope', 'RequestListService', 'SWSessionService', 'wssHelpers'];

  function RequestListManAuthCtrl($rootScope, $scope, RequestListService, SWSessionService, wssHelpers) {
    //requestPage is the unique ID for the list pagination directive for this controller
    $scope.requestPage = 'authmanager';
    $scope.isWssAdmin = wssHelpers.hasWebflag('OPTION_ADMIN');
    $scope.custRequests = RequestListService;

    $scope.custRequests.loadingRequests = false;
    $scope.custRequests.selectedRequest = null;

    //Open Admin Table Modal - broadcast to be picked up and processed by parent controller
    $scope.openTableAdminModal = function () {
      var args = [];
      args.recordPage = $scope.requestPage;
      $rootScope.adminModalContent = 'table.requests.' + $scope.requestPage;
      $rootScope.$broadcast('AdminTableModalOpen', args);
    };

    //Watch for Admin Table Modal Closing - refresh model if so
    $scope.$on('AdminTableModalClose', function (event, args) {
      if (args.recordPage === $scope.requestPage) {
        $scope.custRequests.outputConfigObject[$scope.requestPage] = [];
        $scope.custRequests.requestPage = $scope.requestPage;
        $scope.custRequests.getPagedRequests();
      }
    });

    //Watch for logout broadcast to clean up session-specific data ready for a new user
    $scope.$on('logout', function () {
      $scope.custRequests = {};
    });

    //Check session, if active then get paged requests
    SWSessionService.checkActiveSession().then(function () {
      $scope.custRequests.requestPage = $scope.requestPage;
    }, function () {
      //
    });
  }
})();
//# sourceMappingURL=request.list.auth.ctrl.js.map