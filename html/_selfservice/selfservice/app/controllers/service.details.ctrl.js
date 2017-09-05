(function () {
  'use strict';

  angular.module('swSelfService').controller('ServiceDetailsController', ServiceDetailsController);

  //ServiceDetailsController.$inject = ['$q','$scope','$rootScope','SWSessionService','$stateParams','ServiceDetailsService','$state', '$timeout', 'toaster','wssHelpers', '$previousState', 'store','$uibModal'];
  ServiceDetailsController.$inject = ['$q', '$scope', '$rootScope', 'SWSessionService', '$stateParams', 'ServiceDetailsService', '$state', '$timeout', 'toaster', 'wssHelpers', '$previousState', 'store', '$uibModal', '$window'];

  function ServiceDetailsController($q, $scope, $rootScope, SWSessionService, $stateParams, ServiceDetailsService, $state, $timeout, toaster, wssHelpers, $previousState, store, $uibModal, $window) {

    //debugger;
    var previousState = $previousState.get();
    var responseToController;
    $scope.isWssAdmin = wssHelpers.hasWebflag('OPTION_ADMIN');
    $scope.service_name = $stateParams.serviceName;
    $scope.service_id = $stateParams.serviceID;
    $scope.service_detail_service = ServiceDetailsService;
    $scope.main_service = SWSessionService;
    $scope.time_out = $timeout;
    $scope.windowWidth = $window.innerWidth;

    //Business overview information
    $scope.service_detail_service.getXMLMCInformation($scope.service_id, "business_overview").then(function (responseOverview) {
      //Once we have the information we storage 
      $scope.serviceInformation = responseOverview[0];

      //Getting the cost summary information. General
      $scope.service_detail_service.getXMLMCInformation($scope.service_id, "general_cost").then(function (responseCostGeneral) {
        $scope.costGeneral = responseCostGeneral[0];

        //Getting the cost summary information. Weekly
        $scope.service_detail_service.getXMLMCInformation($scope.service_id, "general_cost_week").then(function (responseWeekly) {
          if (responseWeekly.hasOwnProperty()) {
            $scope.costWeek = responseWeekly;
          } else {
            $scope.costWeek = "0.00";
          }

          //Getting the cost summary information. Monthly
          $scope.service_detail_service.getXMLMCInformation($scope.service_id, "general_cost_month").then(function (responseMonthly) {
            if (responseMonthly.hasOwnProperty()) $scope.costMonth = responseMonthly;else $scope.costMonth = "0.00";

            //Getting the cost summary information. Yearly
            $scope.service_detail_service.getXMLMCInformation($scope.service_id, "general_cost_year").then(function (responseYearly) {
              if (responseYearly.hasOwnProperty()) $scope.costYear = responseYearly;else $scope.costYear = "0.00";

              //Getting the request cost breakdown information.
              $scope.service_detail_service.getXMLMCInformation($scope.service_id, "request_breakdown").then(function (responseRCostBreakdown) {
                $scope.requestCostBreakdown = responseRCostBreakdown;

                //Getting the service cost breakdown information.
                $scope.service_detail_service.getXMLMCInformation($scope.service_id, "service_breakdown").then(function (responseSCostBreakdown) {
                  $scope.costServiceCostBreakdown = responseSCostBreakdown;
                }, function (error) {
                  console.log("Error getting Service Cost Breakdown Information from the server");
                });
              }, function (error) {
                console.log("Error getting Request Cost Breakdown Information from the server");
              });
            }, function (error) {
              console.log("Error getting General Cost Information Yearly from the server");
            });
          }, function (error) {
            console.log("Error getting General Cost Information Monthly from the server");
          });
        }, function (error) {
          console.log("Error getting General Cost Information Weekly from the server");
        });
      }, function (error) {
        console.log("Error getting General Cost Information from the server");
      });
    }, function (error) {
      console.log("Error getting Business OverView Information from the server");
    });

    $scope.setServiceListSelect = function (parameter) {

      //Execute calls XMLMC to get parent and child information
      if (parameter == "depend") {
        $scope.service_detail_service.getXMLMCInformation($scope.service_id, "parent_dependencies").then(function (parentResponse) {
          $scope.parentDependencies = parentResponse;
          $scope.service_detail_service.getXMLMCInformation($scope.service_id, "child_dependencies").then(function (childResponse) {
            $scope.childDependencies = childResponse;
          }, function (error) {
            console.log("Error getting child dependencies information");
          });
        }, function (error) {
          console.log("Error getting parent dependencies information");
        });
      }

      if (parameter == "opts") {
        $scope.service_detail_service.getXMLMCInformation($scope.service_id, "options_information").then(function (responseOptions) {
          $scope.serviceOptions = responseOptions;
        }, function (error) {
          console.log("Error getting service options information");
        });
      }

      if (parameter == "levls") {

        $scope.service_detail_service.getXMLMCInformation($scope.service_id, "levels_information").then(function (responseLevels) {
          $scope.serviceLevels = responseLevels;
        }, function (error) {
          console.log("Error getting service options information");
        });
      }
    };
  }
})();
//# sourceMappingURL=service.details.ctrl.js.map