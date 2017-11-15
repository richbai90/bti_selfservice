(function () {
  'use strict';
  angular
    .module('swSelfService')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$scope', 'store', '$state', 'SWSessionService', 'wssHelpers', 'shortcuts'];

  function DashboardController($scope, store, $state, SWSessionService, wssHelpers, shortcuts) {
    $scope.sessServ = SWSessionService;
    //Check for Active Session
    $scope.sessServ.checkActiveSession().then(function () {
      //get ss config from local storage
      $scope.wssConfig = store.get('wssConfig');
      $scope.instanceConfig = store.get('instanceConfig');
      $scope.sessionConfig = store.get('sessionConfig');
      $scope.welcomeTextOne = $scope.wssConfig.home_msg1;
      $scope.welcomeTextTwo = $scope.wssConfig.home_msg2;
      $scope.welcomeTextThree = $scope.wssConfig.home_msg3;
      $scope.twitterFeed = wssBranding.twitterFeed;

    }, function (error) {
    });



    $scope.shortcutClass = row => ('col-sm-12 col-md-' + Math.floor(12 / row.length));

    $scope.initDashboard = function () {
      $scope.canRaiseRequest = false;
      var objCustDetail = [];
      if (objCustDetail = store.get("custDetails")) {
        if (objCustDetail.authCount) SWSessionService.numAuths = objCustDetail.authCount;
      }

      $scope.canRaiseRequest = wssHelpers.hasWebflag('OPTION_CAN_LOG_CALLS');
      if ($scope.canRaiseRequest && SWSessionService.numAuths > 0) {
        $scope.navCardClass = "col-xs-12 col-sm-4 col-md-4 col-lg-5er";
        $scope.navCardClassBottomRow = "col-xs-12 col-sm-6 col-md-6 col-lg-5er";
      } else if ($scope.canRaiseRequest) {
        $scope.navCardClass = "col-xs-12 col-sm-6 col-md-3 col-lg-3";
        $scope.navCardClassBottomRow = "col-xs-12 col-sm-6 col-md-3 col-lg-3";
      } else if (SWSessionService.numAuths > 0) {
        $scope.navCardClass = "col-xs-12 col-sm-6 col-md-3 col-lg-3";
        $scope.navCardClassBottomRow = "col-xs-12 col-sm-6 col-md-3 col-lg-3";
      } else {
        $scope.navCardClass = "col-xs-12 col-sm-4 col-lg-4";
        $scope.navCardClassBottomRow = "col-xs-12 col-sm-4 col-lg-4";
      }

      wssHelpers.custDetails = objCustDetail;
      $scope.isManager = wssHelpers.isManager();

      $scope.shortcuts = shortcuts.initShortcuts($scope);
    };

    $scope.myDataSource = {
      chart: {
        xAxisName: "Month",
        yAxisName: "Requests Logged",
        theme: "zune"
      },
      data: [
        {
          label: "Jan",
          value: "4"
        },
        {
          label: "Feb",
          value: "8"
        },
        {
          label: "Mar",
          value: "7"
        },
        {
          label: "Apr",
          value: "5"
        },
        {
          label: "May",
          value: "9"
        },
        {
          label: "Jun",
          value: "5"
        }
      ]
    };

    $scope.raiseSupportRequest = function () {
      store.remove("currDataForm");
      $state.go('requestwizard');
    };


  }
})();
