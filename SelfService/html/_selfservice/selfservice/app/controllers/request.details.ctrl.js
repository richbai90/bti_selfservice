'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('RequestDetailsController', RequestDetailsController);

  RequestDetailsController.$inject = ['$q', '$scope', '$rootScope', 'SWSessionService', '$stateParams', 'RequestDetailsService', '$state', 'RequestInteractService', 'wssHelpers', 'wssLogging', '$previousState', 'store', '$uibModal', '$timeout'];

  function RequestDetailsController($q, $scope, $rootScope, SWSessionService, $stateParams, RequestDetailsService, $state, RequestInteractService, wssHelpers, wssLogging, $previousState, store, $uibModal, $timeout) {
    //Get previous state
    var previousState = $previousState.get();
    $scope.isWssAdmin = wssHelpers.hasWebflag('OPTION_ADMIN');

    //-- Initialise Rating Stars
    $scope.ratingValue = null;
    $scope.ratingStates = [{ stateOn: 'fa fa-star fa-1x', stateOff: 'fa fa-star-o fa-1x' }, { stateOn: 'fa fa-star fa-1x', stateOff: 'fa fa-star-o fa-1x' }, { stateOn: 'fa fa-star fa-1x', stateOff: 'fa fa-star-o fa-1x' }];

    //Accordion Settings for side panel
    $scope.accStatus = {
      closeOthers: true,
      detailsOpen: true,
      bpmOpen: false,
      extDataOpen: false
    };

    //Booleans for view initialisation
    $scope.haveRights = false;
    $scope.authRequired = false;

    //Booleans for spinner directive control
    $scope.loadingRequest = true;
    $scope.loadingDiary = true;
    $scope.loadingAttachments = true;
    $scope.loadingAssets = true;
    $scope.loadingComponents = true;

    //Booleans for Ladda directive control
    $scope.ratingRequest = false;
    $scope.updatingRequest = false;
    $scope.closingRequest = false;
    $scope.cancellingRequest = false;
    $scope.addingFiles = false;
    $scope.authorisingRequest = false;

    $scope.updateType = '';
    $scope.callClass = '';
    $scope.classAssets = false;
    $scope.classComponents = false;

    $scope.workflowObject = [];
    $scope.workflowHasProgression = false;

    //Clean out the new file attachments model
    $scope.newFileAttachments = [];

    $scope.requestID = $stateParams.requestID;

    //Scope objects for details and interaction services
    $scope.requestService = RequestDetailsService;
    $scope.requestUpdateService = RequestInteractService;

    //Watch for logout broadcast to clean up session-specific data ready for a new user
    $scope.$on('logout', function () {
      $scope.requestService = {};
      $scope.requestUpdateService = {};
    });

    //Check size of files being attached
    $scope.checkFiles = function (event, reader, fileList) {
      $scope.addingFiles = true;
      if (fileList.size > 10000000) {
        var toastType = "error";
        var toastBody = "File [" + fileList.name + "] is too big!";
        var toastTitle = "File Size Error!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
        reader.abort();
      }
    };

    //
    $scope.filesAdded = function (event, reader, fileObjs, file) {
      $scope.addingFiles = false;
    };

    //back button function
    $scope.requestList = function () {
      if (previousState) {
        $state.go(previousState.state.name, {});
      } else {
        $state.go('home', {});
      }
    };

    //Process authorisation decision
    $scope.authRequest = function () {
      $scope.authorisingRequest = true;
      $scope.requestUpdateService.authoriseRequest($scope.requestID, $scope.authText, $scope.authDecision).then(function (response) {
        $scope.authRequired = false;
        $scope.authorisingRequest = false;
        var objNewCustDetails = store.get("custDetails");
        objNewCustDetails.authCount = SWSessionService.numAuths;
        store.set("custDetails", objNewCustDetails);
        wssLogging.sendToast('success', 'Your authorisation decision has been set successfully!');
        $scope.loadingDiary = true;
        //now we've authorised, get request details, diary and BPM output again to update the model
        $scope.requestService.getRequestDetails($scope.requestID).then(function () {
          $scope.requestService.getRequestDiary($scope.requestID).then(function () {
            $scope.buildBPMOutput();
            $scope.loadingDiary = false;
          });
        });
      }, function (error) {
        var toastType = "error";
        var toastBody = 'Authorisation of this request has failed.';
        var toastTitle = "Request Authorisation Failed!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
        $scope.authorisingRequest = false;
      });
    };

    ///Rate the request in the current scope
    $scope.rateRequest = function () {
      if ($scope.requestService.requestDetails.c_rating == $scope.ratingValue && $scope.requestService.requestDetails.c_ratingtxt == $scope.ratingText) {
        return;
      }
      $scope.ratingRequest = true;

      $scope.arrRating = {
        'origRating': $scope.requestService.requestDetails.c_rating,
        'newRating': $scope.ratingValue,
        'origText': $scope.requestService.requestDetails.c_ratingtxt,
        'newText': $scope.ratingText
      };

      $scope.requestUpdateService.updateRating($scope.requestID, $scope.arrRating).then(function (response) {
        wssLogging.sendToast('success', $scope.requestID + ' has been rated successfully!');
        $scope.loadingDiary = true;
        $scope.requestService.getRequestDiary($scope.requestID).then(function () {
          $scope.loadingDiary = false;
        });
        $scope.ratingRequest = false;
      }, function (error) {
        var toastType = "error";
        var toastBody = 'The rating of this request has failed.';
        var toastTitle = "Request Rating Failed!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
        $scope.ratingRequest = false;
      });
    };

    ///Update the request in the current scope
    $scope.updateRequest = function () {
      switch ($scope.updateType) {
        case "Update":
          $scope.updatingRequest = true;
          break;
        case "Close":
          $scope.closingRequest = true;
          break;
        case "Cancel":
          $scope.cancellingRequest = true;
          break;
      }

      //Monitor rating changes
      $scope.arrRating = {
        'origRating': $scope.requestService.requestDetails.c_rating,
        'newRating': $scope.ratingValue,
        'origText': $scope.requestService.requestDetails.c_ratingtxt,
        'newText': $scope.ratingText
      };

      $scope.requestUpdateService.updateRequest($scope.requestID, $scope.updatetxt, $scope.updateType, $scope.newFileAttachments).then(function (response) {
        $scope.newFileAttachments = [];
        var toastType = 'success';
        var toastBody = $scope.requestID + ' has been updated successfully!';
        wssLogging.sendToast(toastType, toastBody);
        $scope.loadingDiary = true;
        $scope.requestService.getRequestDiary($scope.requestID).then(function () {
          $scope.loadingDiary = false;
          $scope.requestService.getRequestAttachments($scope.requestID);
        });
        $timeout(function () {
          $scope.updatingRequest = false;
          $scope.closingRequest = false;
          $scope.cancellingRequest = false;
        }, 500);
      }, function (error) {
        var toastType = "error";
        var toastBody = 'The update of this request has failed.';
        if (error === "Unable to update this request as it in a status that cannot be updated.") {
          toastBody = error;
        }
        var toastTitle = "Request Update Failed!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
        $timeout(function () {
          $scope.updatingRequest = false;
          $scope.closingRequest = false;
          $scope.cancellingRequest = false;
        }, 500);
      });
      $scope.clearForm();
    };

    //Clear update form
    $scope.clearForm = function () {
      $scope.updateForm.$setPristine();
      $scope.updateForm.$setUntouched();
      $scope.updatetxt = '';
    };

    //Should Update panel be displayed?
    $scope.showUpdatePanel = function () {
      return wssHelpers.hasWebflag('OPTION_CAN_UPDATE_CALLS') && $scope.requestService.requestDetails.status != "16" && $scope.requestService.requestDetails.status != "17" && $scope.requestService.requestDetails.status != "18";
    };

    //Should authorisation panel be displayed?
    $scope.showAuthPanel = function () {
      return $scope.authRequired && wssHelpers.hasWebflag('OPTION_CAN_UPDATE_CALLS') && $scope.requestService.requestDetails.status != "16" && $scope.requestService.requestDetails.status != "17" && $scope.requestService.requestDetails.status != "18";
    };

    //Show the close request button?
    $scope.showClosure = function () {
      return wssHelpers.hasWebflag('OPTION_CAN_CLOSE_CALLS') && ($scope.callClass == 'Incident' || $scope.callClass == 'Change Request');
    };

    //Show the cancel request button?
    $scope.showCancellation = function () {
      return $scope.callClass === 'Service Request';
    };

    //Show the cost of request for Service Requests
    $scope.showRequestCost = function () {
      return $scope.callClass === 'Service Request';
    };

    //Show authorisation components
    $scope.showRequestAuthComponents = function () {
      if (!angular.isDefined($scope.authComponents)) {
        return false;
      }
      return $scope.callClass === 'Service Request' && $scope.authComponents.length > 0;
    };

    //Show the BPM accordion panel
    $scope.showBPM = function () {
      return angular.isDefined($scope.requestService.requestDetails.bpm_workflow_id) && $scope.requestService.requestDetails.bpm_workflow_id !== "";
    };

    //Show the BPM Extended Data accordion panel
    $scope.showExtData = function () {
      if (!angular.isDefined($scope.workflowObject.extendedData)) {
        return false;
      }
      return $scope.workflowObject.extendedData.length > 0;
    };

    //Pass back class for progression boxes
    $scope.progressTypeClass = function (prType) {
      return "bpm_pr_box_" + prType;
    };

    //Is current progress bar a spacer?
    $scope.progressSpacer = function (progress) {
      return progress.type === "";
    };

    //Build the data objects required to output the BPM and Extended Data accordions
    $scope.buildBPMOutput = function () {
      //Define workflow data object and children
      $scope.workflowObject = [];
      $scope.workflowObject.workflowProgression = [];
      $scope.workflowObject.extendedData = [];
      $scope.workflowObject.bpmDetails = [];
      $scope.workflowObject.workflowHasProgression = false;

      if (angular.isDefined($scope.requestService.requestDetails.bpm_progress_perc)) {
        $scope.workflowObject.progressPerc = $scope.requestService.requestDetails.bpm_progress_perc;
      } else {
        $scope.workflowObject.progressPerc = "0";
      }

      //BPM Details
      $scope.workflowObject.bpmDetails.push({
        title: 'Process',
        value: $scope.requestService.requestDetails.bpm_workflow_id
      });
      $scope.workflowObject.bpmDetails.push({
        title: 'Stage',
        value: $scope.requestService.requestDetails.bpm_stage_title
      });
      $scope.workflowObject.bpmDetails.push({
        title: 'Status',
        value: $scope.requestService.requestDetails.bpm_status_id
      });

      //Get workflow progression records
      $scope.requestService.getWorkflowProgression().then(function (progRecords) {
        //Get extended table data (if exists)
        $scope.workflowObject.extendedData = $scope.requestService.getBPMExtendedTableData();
        //Build progression bar data
        if (progRecords.length > 0) {
          $scope.workflowObject.workflowProgression = $scope.requestService.buildProgressionBars(progRecords);
          $scope.workflowObject.workflowHasProgression = true;
        }
      }, function (error) {
        var toastType = 'error';
        var toastBody = 'Unable to retrieve the workflow details for this request.';
        var toastTitle = 'Request Workflow Error';
        wssLogging.sendToast(toastType, toastBody, toastTitle);
      });
    };

    $scope.openTableAdminModal = function () {
      $rootScope.adminModalSchema = 'table.schema';
      $rootScope.adminModalContent = 'table.request.assets';
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

      }, function () {
        //Cancelled modal - do nothing
      });
    };

    //Check session, if active then get request details - this runs when the controller is initialised
    SWSessionService.checkActiveSession().then(function () {
      $scope.requestService.getRequestDetails($scope.requestID).then(function () {
        $scope.loadingRequest = false;
        $scope.haveRights = true;
        $scope.ratingValue = $scope.requestService.requestDetails.c_rating;
        $scope.ratingText = $scope.requestService.requestDetails.c_ratingtxt;
        $scope.callClass = $scope.requestService.requestDetails.callclass;

        //Does the request need authorising by the session customer?
        $scope.requestService.isRequestAuth().then(function (authResponse) {

          if (authResponse) {
            $scope.authRequired = true;
            $scope.authTitle = authResponse.title;
            $scope.authDescription = authResponse.description;
            $scope.compPrice = authResponse.request_comp_price;
            $scope.slaPrice = authResponse.request_sla_price;
            $scope.totalPrice = authResponse.request_price;
            $scope.authDecisions = [];
            $scope.authDecisions[0] = 'Authorised';
            $scope.authDecisions[1] = 'Rejected';
            if ($scope.requestService.custDetails.fk_manager != "") {
              $scope.authDecisions[2] = 'Pass to my manager';
            }
          }
        });

        //If Service Request, get service authorisation components
        if ($scope.callClass === 'Service Request') {
          $scope.authComponents = [];
          $scope.requestService.getRequestAuthComponents().then(function (authCompResponse) {
            $scope.authComponents = authCompResponse;
          });
        }
        //Build BPM object
        $scope.buildBPMOutput();

        //Get the call diary
        $scope.requestService.getRequestDiary($scope.requestID).then(function () {
          $scope.loadingDiary = false;

          //Show any relevant file attachments against the request
          $scope.requestService.getRequestAttachments($scope.requestID).then(function (response) {
            $scope.loadingAttachments = false;
          }, function (error) {
            $scope.loadingAttachments = false;
          });

          if ($scope.requestService.requestDetails.callclass == "Service Request") {
            $scope.classComponents = true;
            //Get request components for calls of class Service Request
            $scope.requestService.getRequestComponents($scope.requestID).then(function () {
              $scope.loadingComponents = false;
            });
          } else {
            $scope.classAssets = true;
            //Get request assets/services for calls of class !Service Request
            $scope.requestService.getAssetsTableStructure().then(function (response) {
              if (angular.isDefined(response.outputSQLColumns) && response.outputSQLColumns !== '') {
                $scope.requestService.getRequestAssets($scope.requestID).then(function () {
                  $scope.loadingAssets = false;
                }, function (error) {
                  $scope.loadingAssets = false;
                  var toastTitle = 'Asset Load Failed!';
                  var toastType = 'error';
                  var toastBody = 'The retrieval of the assets for this request has failed.';
                  wssLogging.sendToast(toastType, toastBody, toastTitle);
                });
              } else {
                var toastTitle = 'Affected Items Load Failed!';
                var toastType = 'error';
                var toastBody = 'No Schema could be loaded for the Affected Items table.';
                wssLogging.sendToast(toastType, toastBody, toastTitle);
              }
            }, function (error) {
              $scope.loadingAssets = false;
              var toastTitle = 'Affected Items Load Failed!';
              var toastType = 'error';
              var toastBody = 'No Schema could be loaded for the Affected Items table.';
              wssLogging.sendToast(toastType, toastBody, toastTitle);
            });
          }
        });
      }, function (error) {
        $scope.haveRights = false;
        $scope.loadingRequest = false;
        $scope.loadingDiary = false;
        $scope.loadingAttachments = false;
        $scope.loadingAssets = false;
        $scope.loadingComponents = false;
        var toastTitle = 'Request View Failed!';
        var toastType = 'error';
        var toastBody = 'Unable to retrieve the details of this request. Please contact your System Administrator.';
        wssLogging.sendToast(toastType, toastBody, toastTitle);
      });
    }, function () {
      //Session error
    });

    $scope.getIcon = function (callclass) {
      switch (callclass) {
        case "Incident":
          return "fa-exclamation-triangle";
        case "Service Request":
          return "fa-bullhorn";
        case "Change Request":
          return "fa-plus-circle";
        default:
          return "fa-tasks";
      }
    };

    $scope.getStyle = function (callclass) {
      switch (callclass) {
        case "Incident":
          return "color:orange;";
        case "Service Request":
          return "color: green;";
        case "Change Request":
          return "color: purple;";
        default:
          return "";
      }
    };
  }
})();
//# sourceMappingURL=request.details.ctrl.js.map