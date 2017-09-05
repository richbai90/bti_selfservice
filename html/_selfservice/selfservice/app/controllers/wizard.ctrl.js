(function () {
  'use strict';

  //Main Services List controller

  angular.module('swSelfService').controller('WizardCtrl', WizardCtrl);
  WizardCtrl.$inject = ['$scope', 'WizardDataService', 'WizardLogService', 'store', 'wssLogging', '$state', 'SWSessionService'];

  function WizardCtrl($scope, WizardDataService, WizardLogService, store, wssLogging, $state, SWSessionService) {
    $scope.wizDataServ = WizardDataService;

    //Accordian Setup
    $scope.oneAtATime = true;

    //Clear stage arrays
    $scope.stageLoading = false;
    $scope.wizDataServ.wizardStages = {};
    $scope.currentStagePK = '';
    $scope.currentStageID = '';
    $scope.wizardDetails = [];
    $scope.wizardName = '';
    $scope.wizDataServ.dataForm = [];
    $scope.currService = [];
    $scope.currentArrKey = 0;
    $scope.showSubmit = false;
    $scope.requestLogging = false;
    $scope.boolSLASelected = true;

    $scope.stageFormHolder = {};

    //Controls display of answers in right-hand pane
    $scope.answeredQuestion = function (question) {
      if (angular.isObject(question.answer)) {
        var keys = Object.keys(question.answer);
        var len = keys.length;
        return len > 0;
      } else {
        return angular.isDefined(question.answer) && question.answer !== "";
      }
    };

    //Set stage to one that already exists in Wizard stages object - for accordian control
    $scope.setStage = function (stageKey) {
      if (stageKey !== $scope.currentArrKey) {
        $scope.currentArrKey = stageKey;
      }
    };

    //Controls whether a question is hidden
    $scope.isHidden = function (question) {
      if (question.flg_hidden === '0') {
        return false;
      }
      return true;
    };

    //Wizard has next stage
    $scope.hasNext = function () {
      $scope.showSubmit = false;
      if ($scope.currentStagePK !== '') {
        if ($scope.wizDataServ.wizardStages[$scope.currentArrKey].flg_endofwiz === "0") {
          return true;
        } else {
          $scope.showSubmit = true;
        }
      }
      return false;
    };

    //Wizard has previous stage
    $scope.hasPrevious = function () {
      if ($scope.currentArrKey > 0) {
        return true;
      }
      return false;
    };

    //Wizard on current stage
    $scope.isCurrentStage = function (stageId) {
      if ($scope.currentArrKey !== '') {
        if ($scope.currentArrKey === parseInt(stageId)) {
          return true;
        }
      }
      return false;
    };

    //Work out which wizard to use, from dataform or default
    $scope.determineWizard = function () {
      var currDataForm = store.get("currDataForm");
      $scope.wizDataServ.instanceConfig = store.get('instanceConfig');
      if (currDataForm && currDataForm.dataFormID !== '0') {
        //Get Wizard from Dataform
        $scope.wizDataServ.getDataform(currDataForm.dataFormID).then(function (dataformResponse) {
          $scope.wizardName = dataformResponse.fk_wizard;
          if (!angular.isDefined($scope.wizardName) || $scope.wizardName === null) {
            if (currDataForm.requestClass === 'Incident') {
              $scope.wizardName = WizardDataService.instanceConfig.defaultSupportWizard;
            } else {
              $scope.wizardName = WizardDataService.instanceConfig.defaultRequestWizard;
            }
          }
          $scope.wizDataServ.dataForm = dataformResponse;
          $scope.wizDataServ.dataForm.service = currDataForm.serviceDetails;
          $scope.wizDataServ.dataForm.subscription = currDataForm.subscription;
          $scope.wizDataServ.dataForm.prices = [];
          $scope.wizDataServ.dataForm.prices.basic = currDataForm.subscription.request_price;
          $scope.wizDataServ.dataForm.prices.customisation = 0;
          $scope.wizDataServ.dataForm.prices.optional = 0;
          $scope.currService = currDataForm.serviceDetails;
          //Get default SLA price
          $scope.wizDataServ.getDefaultSLAOptions($scope.wizDataServ.dataForm, $scope.wizDataServ.dataForm.service).then(function (slaOptions) {
            if (!$scope.boolSLASelected) {
              $scope.wizDataServ.dataForm.prices.servicelevel = "0.00";
              $scope.wizDataServ.dataForm.prices.serviceLevelCost = "0.00";
            } else {
              $scope.wizDataServ.dataForm.prices.servicelevel = slaOptions.price;
              $scope.wizDataServ.dataForm.prices.serviceLevelCost = slaOptions.total_cost;
            }
            $scope.wizDataServ.dataForm.prices.total = (parseFloat($scope.wizDataServ.dataForm.prices.basic) + parseFloat($scope.wizDataServ.dataForm.prices.customisation) + parseFloat($scope.wizDataServ.dataForm.prices.optional) + parseFloat($scope.wizDataServ.dataForm.prices.servicelevel)).toFixed(2);
            $scope.wizardSource = 'dataform';
            $scope.initialiseWizard();
          });
        }, function (error) {
          var toastType = "error";
          var toastBody = 'Unable to retrieve the Dataform for this Service Wizard. Please report this to your System Administrator.';
          var toastTitle = "Wizard Error!";
          wssLogging.sendToast(toastType, toastBody, toastTitle);
        });
      } else {
        //Get Default Wizard from instance config
        $scope.wizardName = $scope.wizDataServ.instanceConfig.defaultSupportWizard;
        $scope.wizardSource = 'default';
        $scope.initialiseWizard();
      }
    };

    //Kick off wizard generation
    $scope.initialiseWizard = function () {
      $scope.wizDataServ.getWizard($scope.wizardName).then(function (wizardResponse) {
        $scope.wizardDetails = wizardResponse;
        $scope.wizDataServ.getStageDetails($scope.wizardName, 1).then(function (stageResponse) {
          $scope.currentStagePK = stageResponse.pk_auto_id;
          $scope.currentStageID = stageResponse.sindex;
          $scope.wizDataServ.wizardStages[$scope.currentArrKey] = stageResponse;
          $scope.wizDataServ.wizardStages[$scope.currentArrKey].currentKey = $scope.currentArrKey;
          $scope.wizDataServ.getStageQuestions($scope.wizDataServ.wizardStages[$scope.currentArrKey].pk_auto_id).then(function (questionResponse) {
            $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions = questionResponse;
            $scope.hasNext();
            //If a Dataform and we're in the final wizard stage, then add the Component and SLA questions
            // to the questions array against the stage object
            if ($scope.wizardSource === 'dataform' && stageResponse.flg_endofwiz === '1') {
              //Get Standard Components
              $scope.wizDataServ.getStandardComponents($scope.currService.fk_cmdb_id, $scope.wizDataServ.dataForm.callclass).then(function (stCompResp) {
                if (stCompResp !== false) {
                  stCompResp.qindex = $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.length + 1;
                  stCompResp.pk_qid = "QSTCOMP";
                  $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.push(stCompResp);
                }
                $scope.wizDataServ.getOptionalComponents($scope.currService.fk_cmdb_id, $scope.wizDataServ.dataForm.callclass).then(function (opCompResp) {
                  if (opCompResp !== false) {
                    opCompResp.qindex = $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.length + 1;
                    opCompResp.pk_qid = "QOPCOMP";
                    $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.push(opCompResp);
                  }
                  $scope.wizDataServ.getSLAQuestion($scope.wizDataServ.dataForm, $scope.currService).then(function (dfSLAs) {
                    if (Object.keys(dfSLAs.options).length < 1) {
                      $scope.boolSLASelected = false;
                    }
                    $scope.stageLoading = false;
                    dfSLAs.qindex = $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.length + 1;
                    dfSLAs.pk_qid = "QSLA";
                    //Cycle through SLA question options, add to answer object if we match default value
                    if (angular.isDefined(dfSLAs.defaultvalue) && dfSLAs.defaultvalue !== "") {
                      angular.forEach(dfSLAs.options, function (qOptVal) {
                        if (qOptVal.keycol === dfSLAs.defaultvalue) {
                          dfSLAs.answer = qOptVal;
                        }
                      });
                    }
                    $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.push(dfSLAs);
                  }, function (error) {
                    $scope.stageLoading = false;
                    var toastType = "error";
                    var toastBody = 'Unable to build the SLA question for this Service Wizard. Please report this to your System Administrator.';
                    var toastTitle = "Wizard Error!";
                    wssLogging.sendToast(toastType, toastBody, toastTitle);
                  });
                });
              });
            } else {
              $scope.stageLoading = false;
              //$scope.wizDataServ.wizardStages[$scope.currentArrKey].questions = questionResponse;
            }
          }, function (error) {
            $scope.stageLoading = false;
            var toastType = "error";
            var toastBody = 'Unable to retrieve the questions for this Service Wizard Stage. Please report this to your System Administrator.';
            var toastTitle = "Wizard Error!";
            wssLogging.sendToast(toastType, toastBody, toastTitle);
          });
        }, function (error) {
          $scope.stageLoading = false;
          var toastType = "error";
          var toastBody = 'Unable to retrieve the Stage details for this Service Wizard Stage. Please report this to your System Administrator.';
          var toastTitle = "Wizard Error!";
          wssLogging.sendToast(toastType, toastBody, toastTitle);
        });
      }, function (error) {
        $scope.stageLoading = false;
        var toastType = "error";
        var toastBody = 'Unable to retrieve the Wizard details for this Service Wizard Stage. Please report this to your System Administrator.';
        var toastTitle = "Wizard Error!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
      });
    };

    $scope.isFormValid = function ($scope, ngForm) {
      var i = null;
      //$scope.$emit('$validate');
      $scope.$broadcast('$validate');

      if (!ngForm.$invalid) {
        return true;
      } else {
        // make the form fields '$dirty' so that the validation messages would be shown
        ngForm.$dirty = true;

        for (i in ngForm) {
          if (ngForm[i] && ngForm[i].hasOwnProperty && ngForm[i].hasOwnProperty('$dirty') && ngForm[i].$invalid === true && ngForm[i].hasOwnProperty('$dirty') && ngForm[i].$invalid === true) {
            // TODO: is 'field.$invalid' test required?
            ngForm[i].$invalid = true;
          }
        }
      }
    };

    //Go to next stage
    $scope.goToNext = function () {
      var ngForm = $scope.wizParentForm['stageForm_' + $scope.currentArrKey];
      if (!$scope.isFormValid($scope, ngForm)) {
        // trigger manual validation
        var toasterTitle = "Form incomplete!";
        var toasterBody = "All questions marked in <strong>RED</strong> must be completed before you can continue!";
        wssLogging.sendToast('error', toasterBody, toasterTitle);
        return;
      }

      if ($scope.wizDataServ.wizardStages[$scope.currentArrKey].flg_endofwiz !== "1") {

        //More stages to come
        var oCurrQuestions = [];
        var intLastQuestion = 0;
        var nextArrKey = $scope.currentArrKey + 1;
        var strAnswer = '';
        if (angular.isObject($scope.wizDataServ.wizardStages[nextArrKey])) {
          //So we already have next stages - user has navigated backwards
          //Is the next stage on the object the same as where the current jump would go to?
          //If so, increment currentArrKey
          //If not, remove everything from wizardStages after current stage, jump to next stage...
          oCurrQuestions = $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions;
          intLastQuestion = oCurrQuestions.length - 1;
          if (angular.isDefined(oCurrQuestions[intLastQuestion].flg_jumponanswer) && oCurrQuestions[intLastQuestion].flg_jumponanswer === "1") {
            //Get answer from final question
            if (angular.isObject(oCurrQuestions[intLastQuestion].answer) && angular.isDefined(oCurrQuestions[intLastQuestion].answer.keycol)) {
              //If answer is an object, then this has come from a Selectbox or Radiobox - LOGICAL choices
              strAnswer = oCurrQuestions[intLastQuestion].answer.keycol;
            } else {
              //Answer is a string - comes from a Text input - SURELY people don't use this??
              strAnswer = oCurrQuestions[intLastQuestion].answer;
            }
            //Get jump records for this question
            $scope.wizDataServ.getJumpRecords(oCurrQuestions[intLastQuestion].pk_qid).then(function (response) {
              var goToWizard = '';
              var goToStage = '';
              //Go through the returned jump records, if we have a match to the answer then jump to this wizard/stage
              angular.forEach(response, function (oJumpVal) {
                if (oJumpVal.check_value_func === strAnswer) {
                  goToWizard = oJumpVal.fk_nextwiz;
                  goToStage = oJumpVal.sindex;
                }
              });

              if (goToWizard === $scope.wizDataServ.wizardStages[nextArrKey].fk_wiz && goToStage === $scope.wizDataServ.wizardStages[nextArrKey].sindex) {
                //Same route - increment array key to update model
                $scope.currentArrKey++;
              } else {
                //Remove everything after current stage form wizardStages object
                var wizCopy = {};
                angular.forEach($scope.wizDataServ.wizardStages, function (wizStage, stageKey) {
                  if (stageKey < nextArrKey) {
                    wizCopy[stageKey] = wizStage;
                  }
                });
                $scope.wizDataServ.wizardStages = wizCopy;
                //Go get and populate the next stage!
                $scope.getNextStage(goToWizard, goToStage);
              }
            });
          } else {
            $scope.currentArrKey++;
          }
        } else {
          oCurrQuestions = $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions;
          intLastQuestion = oCurrQuestions.length - 1;
          if (angular.isDefined(oCurrQuestions[intLastQuestion].flg_jumponanswer) && oCurrQuestions[intLastQuestion].flg_jumponanswer === "1") {
            //Get answer from final question
            if (angular.isObject(oCurrQuestions[intLastQuestion].answer) && angular.isDefined(oCurrQuestions[intLastQuestion].answer.keycol)) {
              //If answer is an object, then this has come from a Selectbox or Radiobox - LOGICAL choices
              strAnswer = oCurrQuestions[intLastQuestion].answer.keycol;
            } else {
              //Answer is a string - comes from a Text input - SURELY people don't use this??
              strAnswer = oCurrQuestions[intLastQuestion].answer;
            }
            //Get jump records for this question
            $scope.wizDataServ.getJumpRecords(oCurrQuestions[intLastQuestion].pk_qid).then(function (response) {
              //Go through the returned jump records, if we have a match to the answer then jump to this wizard/stage
              angular.forEach(response, function (oJumpVal) {
                if (oJumpVal.check_value_func === strAnswer) {
                  $scope.getNextStage(oJumpVal.fk_nextwiz, oJumpVal.sindex);
                }
              });
            });
          } else {
            //We don't have a jump - continue to next incremental stage
            var nextStageID = parseInt($scope.currentStageID) + 1;
            $scope.getNextStage($scope.wizardName, nextStageID);
          }
        }
      } else {
        //          angular.forEach($scope.stageFormHolder[$scope.currentArrKey].$error.required, function(errVal, errKey){
        //            wssLogging.logger(errVal, "ERROR", "WizardCtrl::goToNext", true, false);
        //          });
      }
    };

    //Go to previous stage
    $scope.goToPrevious = function () {
      $scope.showSubmit = false;
      if ($scope.currentArrKey !== 0) {
        if ($scope.currentStagePK !== '') {
          if ($scope.wizDataServ.wizardStages[$scope.currentArrKey].flg_endofwiz === "1") {
            $scope.showSubmit = true;
          }
        }
        $scope.currentArrKey--;
      }
    };

    //Get and set next stage data
    $scope.getNextStage = function (strWizard, intStage, intQID) {
      $scope.wizDataServ.getStageDetails(strWizard, intStage).then(function (stageResponse) {
        $scope.currentStagePK = stageResponse.pk_auto_id;
        $scope.currentStageID = stageResponse.sindex;
        $scope.currentArrKey++;
        $scope.wizDataServ.wizardStages[$scope.currentArrKey] = stageResponse;
        $scope.wizDataServ.wizardStages[$scope.currentArrKey].currentKey = $scope.currentArrKey;
        $scope.wizDataServ.getStageQuestions($scope.currentStagePK).then(function (questionResponse) {
          //If a Dataform and we're in the final wizard stage, then add an SLA question
          // to the questions array against the stage object
          $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions = questionResponse;
          $scope.hasNext();
          if ($scope.wizardSource === 'dataform' && stageResponse.flg_endofwiz === '1') {
            $scope.wizDataServ.getStandardComponents($scope.currService.fk_cmdb_id, $scope.wizDataServ.dataForm.callclass).then(function (stCompResp) {
              if (stCompResp !== false) {
                stCompResp.qindex = $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.length + 1;
                stCompResp.pk_qid = "QSTCOMP";
                $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.push(stCompResp);
              }
              $scope.wizDataServ.getOptionalComponents($scope.currService.fk_cmdb_id, $scope.wizDataServ.dataForm.callclass).then(function (opCompResp) {
                if (opCompResp !== false) {
                  opCompResp.qindex = $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.length + 1;
                  opCompResp.pk_qid = "QOPCOMP";
                  $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.push(opCompResp);
                }
                $scope.wizDataServ.getSLAQuestion($scope.wizDataServ.dataForm, $scope.currService).then(function (dfSLAs) {
                  if (Object.keys(dfSLAs.options).length < 1) {
                    $scope.boolSLASelected = false;
                  }
                  $scope.stageLoading = false;
                  dfSLAs.qindex = $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.length + 1;
                  dfSLAs.pk_qid = "QSLA";
                  //Cycle through SLA question options, add to answer object if we match default value
                  if (angular.isDefined(dfSLAs.defaultvalue) && dfSLAs.defaultvalue !== "") {
                    angular.forEach(dfSLAs.options, function (qOptVal) {
                      if (qOptVal.keycol === dfSLAs.defaultvalue) {
                        dfSLAs.answer = qOptVal;
                      }
                    });
                  }
                  $scope.wizDataServ.wizardStages[$scope.currentArrKey].questions.push(dfSLAs);
                }, function (error) {
                  $scope.stageLoading = false;
                  var toastType = "error";
                  var toastBody = 'Unable to build the SLA question for this Service Wizard. Please report this to your System Administrator.';
                  var toastTitle = "Wizard Error!";
                  wssLogging.sendToast(toastType, toastBody, toastTitle);
                });
              });
            });
          } else {
            $scope.stageLoading = false;
          }
        }, function (error) {
          var toastType = "error";
          var toastBody = 'Unable to retrieve the questions for this Service Wizard Stage. Please report this to your System Administrator.';
          var toastTitle = "Wizard Error!";
          wssLogging.sendToast(toastType, toastBody, toastTitle);
        });
      }, function (error) {
        var toastType = "error";
        var toastBody = 'Unable to retrieve the Stage details for this Service Wizard Stage. Please report this to your System Administrator.';
        var toastTitle = "Wizard Error!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
      });
    };

    //Raise new request from provided wizard data
    $scope.raiseRequest = function () {
      var ngForm = $scope.wizParentForm['stageForm_' + $scope.currentArrKey];
      if (!$scope.isFormValid($scope, ngForm)) {
        // trigger manual validation
        var toasterTitle = "Form incomplete!";
        var toasterBody = "All questions marked in <strong>RED</strong> must be completed before this stage can continue!";
        wssLogging.sendToast('error', toasterBody, toasterTitle);
        return;
      } else if (!$scope.boolSLASelected) {
        var toasterTitle = "Configuration Error!";
        var toasterBody = "The Service definition has not been configured correctly. Please inform the System Administrator.";
        wssLogging.sendToast('error', toasterBody, toasterTitle);
        return;
      }

      //Doo the cost/price calculations before submission
      $scope.wizDataServ.componentChange();

      $scope.requestLogging = true;
      var dataformObj = {};
      if ($scope.wizardSource === 'dataform') {
        dataformObj = $scope.wizDataServ.dataForm;
      }

      WizardLogService.wizardSubmit($scope.wizardDetails, $scope.wizDataServ.wizardStages, dataformObj, $scope.wizardSource).then(function (submitResponse) {
        //Once we've built the Wizard data, log the request!
        WizardLogService.logRequest().then(function (response) {
          //Toaster with response
          WizardLogService.populateOCWiz(response.callref, $scope.wizardDetails, $scope.wizDataServ.wizardStages);
          store.remove("currDataForm");
          $scope.requestLogging = false;
          var toasterTitle = "Request raised successfully!";
          var toasterBody = "Reference: <strong>" + response.formattedcallref + "</strong>";
          wssLogging.sendToast('success', toasterBody, toasterTitle);
          $state.go('requestdetails', { requestID: response.formattedcallref });
        }, function (error) {

          if (error == "SLA invalid: 'Not configured'") {
            var toasterBody = "The SLA Priority definition in the Service has not been configured correctly. Please inform the System Administrator.";
          } else var toasterBody = "We've been unable to raise your request at this time. Please report this to your System Administrator should this behaviour continue.";

          store.remove("currDataForm");
          $scope.requestLogging = false;
          var toasterTitle = "Error raising request!";

          wssLogging.sendToast('error', toasterBody, toasterTitle);
        });
      }, function (error) {
        $scope.requestLogging = false;
        var toastType = "error";
        var toastBody = 'Unable to process the Wizard responses to raise your request at this time. Please report this to your System Administrator should this behaviour continue.';
        var toastTitle = "Error raising request!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
      });
    };

    //Initialise relevant question inputs - setting value to blank string
    //Fixes an issue with the Date fields
    $scope.initQuestion = function (question) {
      if (!angular.isObject(question.answer)) {
        question.answer = '';
      }
    };

    //Check session, if active then determine which wizard to use - run it!
    SWSessionService.checkActiveSession().then(function () {
      $scope.stageLoading = true;
      $scope.determineWizard();
    }, function () {
      //No active session - checkActiveSession will deal with this
    });
  }
})();
//# sourceMappingURL=wizard.ctrl.js.map