(function () {
  'use strict';

  //Main Requests List controller

  angular.module('swSelfService').controller('RequestListCtrl', RequestListCtrl);
  RequestListCtrl.$inject = ['$rootScope', '$scope', '$state', 'RequestService', 'wssHelpers', '$uibModal'];
  function RequestListCtrl($rootScope, $scope, $state, RequestService, wssHelpers, $uibModal) {
    $scope.showCog = true;

    //Instantiate Request Service
    $scope.reqServ = RequestService;
    //Get state - for keeping Navbar state active with in child state views
    $rootScope.$state = $state;

    //Tab Management
    $scope.tabs = [];
    if (wssHelpers.hasWebflag('OPTION_CAN_VIEW_CALLS')) {
      $scope.tabs.push({ heading: "My Requests", route: "requests.myrequests", active: false });
    }
    if (wssHelpers.isManager()) {
      $scope.tabs.push({ heading: "My Teams Requests", route: "requests.teamrequests", active: false });
    }
    if (wssHelpers.hasWebflag('OPTION_CAN_VIEW_SITECALLS')) {
      $scope.tabs.push({ heading: "Site Requests", route: "requests.siterequests", active: false });
    }
    if (wssHelpers.hasWebflag('OPTION_CAN_VIEW_ORGCALLS')) {
      $scope.tabs.push({ heading: "Organisation Requests", route: "requests.orgrequests", active: false });
    }
    if (wssHelpers.hasWebflag('OPTION_CAN_VIEW_MULTI_ORGCALLS')) {
      $scope.tabs.push({ heading: "Related Organisation Requests", route: "requests.relorgrequests", active: false });
    }

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
          items: function () {
            return 'requests.' + $rootScope.recordPage;
          }
        }
      });
      modalInstance.result.then(function () {
        //Saved changes - broadcast message to refresh form
        $rootScope.$broadcast('AdminTableModalClose', args);
        $rootScope.adminModalSchema = '';
        $rootScope.adminModalContent = '';
      }, function () {
        //Modal cancelled
      });
    });

    //Watch for logout broadcast to clean up session-specific data ready for a new user
    $scope.$on('logout', function () {
      RequestService = {};
    });
  }

  //Customer-Filtered Request List Controller
  angular.module('swSelfService').controller('RequestListCustCtrl', RequestListCustCtrl);
  RequestListCustCtrl.$inject = ['$rootScope', '$scope', 'RequestListService', 'paginationService', 'SWSessionService', 'wssHelpers'];
  function RequestListCustCtrl($rootScope, $scope, RequestListService, paginationService, SWSessionService, wssHelpers) {
    //requestPage is the unique ID for the list pagination directive for this controller
    $scope.requestPage = 'cust';
    $scope.isWssAdmin = wssHelpers.hasWebflag('OPTION_ADMIN');
    $scope.custRequests = RequestListService;

    $scope.custRequests.selectedRequest = null;
    $scope.custRequests.loadingRequests = false;
    $scope.custRequests.totalRequests = 0;
    $scope.custRequests.sortColumn = 0;
    $scope.custRequests.sortOrder = false;
    $scope.modArgs = [];
    //Open Admin Table Modal - broadcast to be picked up and processed by parent controller
    $scope.openTableAdminModal = function () {
      $scope.modArgs.recordPage = $scope.requestPage;
      $rootScope.adminModalContent = 'table.requests.' + $scope.requestPage;
      $rootScope.$broadcast('AdminTableModalOpen', $scope.modArgs);
    };

    //Watch for Admin Table Modal Closing - refresh model if so
    $scope.$on('AdminTableModalClose', function (event, args) {
      if (args.recordPage === $scope.requestPage) {
        $scope.custRequests.outputConfigObject[$scope.requestPage] = [];
        $scope.custRequests.requestPage = $scope.requestPage;
        $scope.custRequests.getPagedRequests();
      }
    });

    //Check session, if active then get paged requests
    SWSessionService.checkActiveSession().then(function () {
      paginationService.setCurrentPage($scope.requestPage, 1);
      $scope.custRequests.search = '';
      $scope.custRequests.requestPage = $scope.requestPage;
      $scope.custRequests.pageNo = 1;
      $scope.custRequests.getPagedRequests();
    }, function () {
      //
    });
  }

  //Recent Request List Controller
  angular.module('swSelfService').controller('RequestListRecentCtrl', RequestListRecentCtrl);
  RequestListRecentCtrl.$inject = ['$scope', 'RequestService', 'RequestListService', 'SWSessionService', 'wssLogging'];
  function RequestListRecentCtrl($scope, RequestService, RequestListService, SWSessionService, wssLogging) {
    $scope.custRecentRequests = RequestService;
    $scope.custRecentRequests.RecentRequestsLoading = false;
    $scope.custRecentRequestList = RequestListService;
    $scope.custRecentRequestList.selectedRequest = null;

    //Check session, if active then get recent requests
    SWSessionService.checkActiveSession().then(function () {
      $scope.custRecentRequests.getRecentRequests().then(function (requests) {
        $scope.requestArray = requests;
      });
    });
  }

  //Site-Filtered Request List Controller
  angular.module('swSelfService').controller('RequestListSiteCtrl', RequestListSiteCtrl);

  RequestListSiteCtrl.$inject = ['$rootScope', '$scope', 'RequestListService', 'paginationService', 'SWSessionService', 'wssHelpers'];

  function RequestListSiteCtrl($rootScope, $scope, RequestListService, paginationService, SWSessionService, wssHelpers) {
    //requestPage is the unique ID for the list pagination directive for this controller
    $scope.requestPage = 'site';
    $scope.isWssAdmin = wssHelpers.hasWebflag('OPTION_ADMIN');
    $scope.custRequests = RequestListService;
    $scope.custRequests.selectedRequest = null;
    $scope.custRequests.loadingRequests = false;
    $scope.custRequests.sortColumn = 0;
    $scope.custRequests.sortOrder = false;

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

    //Check session, if active then get paged requests
    SWSessionService.checkActiveSession().then(function () {
      paginationService.setCurrentPage($scope.requestPage, 1);
      $scope.custRequests.search = '';
      $scope.custRequests.requestPage = $scope.requestPage;
    }, function () {
      //
    });
  }

  //Team-Filtered Request List Controller
  angular.module('swSelfService').controller('RequestListTeamCtrl', RequestListTeamCtrl);

  RequestListTeamCtrl.$inject = ['$rootScope', '$scope', 'RequestListService', 'paginationService', 'SWSessionService', 'wssHelpers'];

  function RequestListTeamCtrl($rootScope, $scope, RequestListService, paginationService, SWSessionService, wssHelpers) {
    //requestPage is the unique ID for the list pagination directive for this controller
    $scope.requestPage = 'team';
    $scope.isWssAdmin = wssHelpers.hasWebflag('OPTION_ADMIN');
    $scope.custRequests = RequestListService;
    $scope.custRequests.selectedRequest = null;
    $scope.custRequests.loadingRequests = false;
    $scope.custRequests.sortColumn = 0;
    $scope.custRequests.sortOrder = false;

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

    //Check session, if active then get paged requests
    SWSessionService.checkActiveSession().then(function () {
      paginationService.setCurrentPage($scope.requestPage, 1);
      $scope.custRequests.search = '';
      $scope.custRequests.requestPage = $scope.requestPage;
    }, function () {
      //
    });
  }

  //Organisation-Filtered Request List Controller
  angular.module('swSelfService').controller('RequestListOrgCtrl', RequestListOrgCtrl);

  RequestListOrgCtrl.$inject = ['$rootScope', '$scope', 'RequestListService', 'paginationService', 'SWSessionService', 'wssHelpers'];

  function RequestListOrgCtrl($rootScope, $scope, RequestListService, paginationService, SWSessionService, wssHelpers) {
    //requestPage is the unique ID for the list pagination directive for this controller
    $scope.requestPage = 'org';
    $scope.isWssAdmin = wssHelpers.hasWebflag('OPTION_ADMIN');
    $scope.custRequests = RequestListService;
    $scope.custRequests.selectedRequest = null;
    $scope.custRequests.loadingRequests = false;
    $scope.custRequests.sortColumn = 0;
    $scope.custRequests.sortOrder = false;

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

    //Check session, if active then get paged requests
    SWSessionService.checkActiveSession().then(function () {
      paginationService.setCurrentPage($scope.requestPage, 1);
      $scope.custRequests.search = '';
      $scope.custRequests.requestPage = $scope.requestPage;
    }, function () {
      //
    });
  }

  //Related Organisation-Filtered Request List Controller
  angular.module('swSelfService').controller('RequestListRelOrgCtrl', RequestListRelOrgCtrl);

  RequestListRelOrgCtrl.$inject = ['$rootScope', '$scope', 'RequestListService', 'paginationService', 'SWSessionService', 'wssHelpers'];

  function RequestListRelOrgCtrl($rootScope, $scope, RequestListService, paginationService, SWSessionService, wssHelpers) {
    //requestPage is the unique ID for the list pagination directive for this controller
    $scope.requestPage = 'relorg';
    $scope.isWssAdmin = wssHelpers.hasWebflag('OPTION_ADMIN');
    $scope.custRequests = RequestListService;
    $scope.custRequests.selectedRequest = null;
    $scope.custRequests.loadingRequests = false;
    $scope.custRequests.sortColumn = 0;
    $scope.custRequests.sortOrder = false;

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

    //Check session, if active then get paged requests
    SWSessionService.checkActiveSession().then(function () {
      paginationService.setCurrentPage($scope.requestPage, 1);
      $scope.custRequests.search = '';
      $scope.custRequests.requestPage = $scope.requestPage;
    }, function () {
      //
    });
  }
})();
//# sourceMappingURL=request.list.ctrl.js.map