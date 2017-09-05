(function (){
  'use strict';
  angular
    .module('swSelfService')
    .service('WizardDataService', WizardDataService);

  WizardDataService.$inject=['$rootScope','$q', 'XMLMCService','WizardFilterService','store','wssHelpers','$uibModal','wssLogging'];
  function WizardDataService($rootScope, $q, XMLMCService, WizardFilterService, store, wssHelpers, $uibModal, wssLogging) {

    var self = {
      addingFiles: false,
      isWssAdmin: wssHelpers.hasWebflag('OPTION_ADMIN'),
      defSLA: 0, //This is the SLA that we select as default, when more than one SLA is presented via the Dataform
      ciPicker: {
        tabSet: {
          'Your Services':'servyour',
          'All Services': 'servall',
          'Assets You Use': 'ciuse',
          'Assets You Own': 'ciown'
        },
        loadingItems: false,
        ciArray: [],
        outputConfigObject: [],
      },
      wizardStages: {}
    };

    self.openTableAdminModal = function(){
      $rootScope.adminModalSchema = 'table.schema';
      $rootScope.adminModalContent = 'table.ci.picker.'+self.ciPicker.currListType;
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'templates/admin/modal.tableconfig.tpl.html',
        controller: 'AdminTableController',
        size: 'lg',
        resolve: {
          items: function () {
            return '';
          }
        }
      });
      modalInstance.result.then(function () {
        //Saved changes - broadcast message to refresh form
        $rootScope.adminModalSchema = '';
        $rootScope.adminModalContent = '';
        self.ciPicker.setCIListSelect(self.ciPicker.currListType, false);
      }, function (){
        //Cancelled modal`
      });
    };

    //Setup Modal for CI selector
    self.ciPicker.openCIModal = function(question, size) {
      self.custDetails = store.get('custDetails');
      //self.instanceConfig = store.get('instanceConfig');
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'templates/wizard/wizard.custompicker.ci.modal.tpl.html',
        controller: 'ModalCIPickerCtrl',
        size: size,
        resolve: {
          items: function () {
            return question;
          }
        }
      });

      modalInstance.result.then(function (selectedItems) {
        question.answer = selectedItems;
      }, function () {
        //Modal Dismissed, don't do anything!
      });
    };

    self.ciPicker.setOrder = function(oColumn, oIndex){
      self.ciPicker[self.ciPicker.currListType].sortColumn = oIndex;
      self.ciPicker[self.ciPicker.currListType].sortOrder = !self.ciPicker[self.ciPicker.currListType].sortOrder;
      var strSortOrder = (self.ciPicker[self.ciPicker.currListType].sortOrder ? 'ASC' : 'DESC');
      self.ciPicker[self.ciPicker.currListType].outputConfigObject.outputOrderBy = oColumn.dbtable +'.'+oColumn.column+' '+strSortOrder;
      self.ciPicker.getCIs().then(function(response){
        self.ciPicker[self.ciPicker.currListType].ciArray = response;
        self.ciPicker.loadingItems = false;
      }, function(error){
        self.ciPicker.loadingItems = false;
        var connErrorType = 'error';
        var connErrorBody = 'The following error was returned when attempting to return your list of Assets or Services: '+error;
        var connErrorTitle = 'CI Search Error!';
        wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);
      });
    };

    self.ciPicker.setCIListSelect = function(servList, boolSkipConfig){
      if(!angular.isDefined(boolSkipConfig)){
        boolSkipConfig = true;
      }
      self.ciPicker.loadingItems = true;
      self.ciPicker.currListType = servList;
      if(angular.isDefined(self.ciPicker[servList]) && angular.isObject(self.ciPicker[servList].outputConfigObject) && boolSkipConfig === true) {
        //We've already got the config object - no need to re-query it, just get the CIs
        self.ciPicker.getCIs().then(function(response){
          self.ciPicker[self.ciPicker.currListType].ciArray = response;
          self.ciPicker.loadingItems = false;
        }, function(error){
          self.ciPicker.loadingItems = false;
          var connErrorType = 'error';
          var connErrorBody = 'The following error was returned when attempting to return your list of Assets or Services: '+error;
          var connErrorTitle = 'CI Search Error!';
          wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);
        });
      } else {
        self.ciPicker[servList] = {};
        //Get config, call API to get item array, then populate ciArray
        var ciConfSetting = 'table.ci.picker.'+servList;
        wssHelpers.getTableConfig(ciConfSetting).then(function(response){
          self.ciPicker[self.ciPicker.currListType].outputConfigObject = response;
          self.ciPicker.getCIs().then(function(response){
            self.ciPicker[self.ciPicker.currListType].ciArray = response;
            self.ciPicker.loadingItems = false;
          }, function(error){
            self.ciPicker.loadingItems = false;
            var connErrorType = 'error';
            var connErrorBody = 'The following error was returned when attempting to return your list of Assets or Services: '+error;
            var connErrorTitle = 'CI Search Error!';
            wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);
          });
          //Now, go get the CI's to populate the table with
        }, function(error){
          self.ciPicker.loadingItems = false;
          var connErrorType = 'error';
          var connErrorBody = 'The following error was returned when attempting to retrieve the Asset table configuration: '+error;
          var connErrorTitle = 'Table Configuration Error!';
          wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);
        });
      }
    };

    self.ciPicker.getCIs = function() {
      var deferred = $q.defer();
      //Work out columns.
      if(!angular.isDefined(self.ciPicker[self.ciPicker.currListType].outputConfigObject.strAddTables)){
        self.ciPicker[self.ciPicker.currListType].outputConfigObject.strAddTables = wssHelpers.processAdditionalTables(self.ciPicker[self.ciPicker.currListType].outputConfigObject);
      }
      var itemArray = [];
      var strDynFilter = '';
      var sqparams = "custid="+self.custDetails.keysearch;
      sqparams += "&table="+self.ciPicker[self.ciPicker.currListType].outputConfigObject.table;
      sqparams += "&columns="+self.ciPicker[self.ciPicker.currListType].outputConfigObject.outputSQLColumns;
      sqparams += "&orderby="+self.ciPicker[self.ciPicker.currListType].outputConfigObject.outputOrderBy;
      sqparams += "&appcodefilter="+self.ciPicker[self.ciPicker.currListType].outputConfigObject.enableAppcodeFilter;
      sqparams += "&dynfilter="+strDynFilter;
      sqparams += "&dynfiltercols="+self.ciPicker[self.ciPicker.currListType].outputConfigObject.filterSQLColumns;
      sqparams += "&addtables="+self.ciPicker[self.ciPicker.currListType].outputConfigObject.strAddTables;

      //Now get a page worth of data
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", self.ciPicker[self.ciPicker.currListType].outputConfigObject.recordsStoredQuery);
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(params.rowData) {
            if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                itemArray.push(params.rowData.row[i]);
              }
            } else {
              itemArray.push(params.rowData.row);
            }
          }
          deferred.resolve(itemArray);
        },
        onFailure: function(error){
          deferred.reject(error);
        }
      });

      return deferred.promise;
    };

    self.getDataform = function(intDataform) {
      var deferred = $q.defer();
      var sqparams = "dfid="+intDataform;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/services/services.dataform.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(angular.isObject(params.rowData.row)){
            deferred.resolve(params.rowData.row);
          } else {
            deferred.reject(params);
          }
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getDataform", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getWizard = function(strWizardName) {
      var deferred = $q.defer();
      var sqparams = "wizardname="+strWizardName;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/wizards/wizard.get.main");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(angular.isObject(params.rowData.row)){
            deferred.resolve(params.rowData.row);
          } else {
            deferred.reject(params);
          }
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getWizard", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getStageDetails = function(strWizardName, intStage) {
      var deferred = $q.defer();
      var sqparams = "wizardname="+strWizardName;
      sqparams += "&stage="+intStage;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/wizards/wizard.get.stage");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
		  if (angular.isObject(params.rowData)){
			  if(angular.isObject(params.rowData.row)){
				deferred.resolve(params.rowData.row);
			  } else {
				deferred.reject(params);
			  }
		  }
		  else{
			var connErrorType = 'error';
			var connErrorBody = 'This wizard has not been configured correctly. It does not have an identified last stage. Please inform the System Administrator.';
			var connErrorTitle = 'Wizard Configuration Error!';
			wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle, false, false);
		  }
        },
        onFailure: function(error){
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getStageQuestions = function(intStage) {
      const promises = [];
      var deferred = $q.defer();
      var sqparams = "stage="+intStage;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/wizards/wizard.get.questions");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(params.rowData) {
            var questionArray = [];
            if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                questionArray.push(params.rowData.row[i]);
              }
            } else {
              questionArray.push(params.rowData.row);
            }

            // Now we have our question array populated, cycle through them and add
            // any applicable options, filters and default value processing  for output
            angular.forEach(questionArray, function(qVal, qKey){

              //Process default value filtering
              if(angular.isDefined(qVal.defaultvalue) && qVal.defaultvalue !== ""){
                questionArray[qKey].defaultvalue = WizardFilterService.processFilter(qVal.defaultvalue, false);
              }

              //Apply filters to right-hand-side answer summary display
              questionArray[qKey].qfilter = "";
              switch(qVal.type) {
                case 'Date':
                  questionArray[qKey].qfilter = "momentToDate";
                  break;
                case 'Date Range':
                  questionArray[qKey].qfilter = "momentToDateRange";
                  break;
                case 'Selectbox':
                case 'Radiobox':
                case 'Option Selector - Single Select':
                  questionArray[qKey].qfilter = "optionDisplay";
                  break;
                case 'Custom Picker':
                  switch(qVal.pickername) {
                    case 'File Attachments':
                      questionArray[qKey].qfilter = "fileDisplay";
                      break;
                    case 'Configuration Items':
                      questionArray[qKey].qfilter = "ciPickerDisplay";
                      break;
                    default:
                      questionArray[qKey].qfilter = "optionDisplay";
                      break;
                  }
                  break;
                case 'Checkbox':
                  questionArray[qKey].qfilter = "checkboxDisplay";
                  //Now set a bool value in the question object - this is to track changes to the checkbox value
                  //for when a checkbox is marked as mandatory
                  questionArray[qKey].checked = false;
                  break;
                case 'Textbox':
                  questionArray[qKey].inputtype = 'text';
                  if(angular.isDefined(questionArray[qKey].validation_type)) {
                    switch(questionArray[qKey].validation_type) {
                      case 'Email Address':
                        questionArray[qKey].inputtype = 'email';
                        break;
                      case 'Numeric':
                        questionArray[qKey].inputtype = 'number';
                        break;
                    }
                  }
                  break;
              }
              //END filteredbyDates

              //Get/populate question options
              questionArray[qKey].options = [];
              if( qVal.type === 'Selectbox' ||
                  qVal.type === 'Radiobox'  ||
                  qVal.type === 'Checkbox'){

                const gettingQuestionOptions = self.getQuestionOptions(qVal).then(function(respOptions){
                  questionArray[qKey].options = respOptions;

                  //Cycle through question options, add to answer object if we match default value
                  if( angular.isDefined(questionArray[qKey].defaultvalue) &&
                      questionArray[qKey].defaultvalue !== ""){
                    angular.forEach(questionArray[qKey].options, function(qOptVal){
                      if(qOptVal.keycol === questionArray[qKey].defaultvalue){
                        if(qVal.type === 'Checkbox'){
                          questionArray[qKey].answer = {};
                          questionArray[qKey].answer[qOptVal.keycol] = qOptVal.discol;
                        } else {
                          questionArray[qKey].answer = qOptVal;
                        }
                      }
                    });
                  }
                });
                promises.push(gettingQuestionOptions)
              } else if (qVal.type === 'Custom Picker'){
                if(qVal.pickername === 'Customer Organisations' || qVal.pickername === 'All Organisations'){
                  //Get cust Related Organisations
                  const gettingOrgs = self.getOrgs(qVal.pickername).then(function(oOrgs){
                    //Then set picker options
                    questionArray[qKey].options = oOrgs;
                    //Cycle through question options, add to answer object if we match default value
                    if( angular.isDefined(questionArray[qKey].defaultvalue) &&
                        questionArray[qKey].defaultvalue !== ""){
                      angular.forEach(questionArray[qKey].options, function(qOptVal){
                        if(qOptVal.keycol === questionArray[qKey].defaultvalue){
                          questionArray[qKey].answer = qOptVal;
                        }
                      });
                    }
                  }, function(error){
                    wssLogging.logger(error, "ERROR", "WizardDataService::getStageQuestions-getOrgs", false, false);
                  });
                  promises.push(gettingOrgs)
                } else if (qVal.pickername === 'Category') {
                  //Get Probcodes
                  const gettingCategories = self.getProfileTree().then(function(oCodes){
                    //Then set tree data to picker options
                    questionArray[qKey].options = oCodes;
                    console.log(oCodes);
                  }, function(error){
                    wssLogging.logger(error, "ERROR", "WizardDataService::getStageQuestions-getProfileTree", false, false);
                  });
                  promises.push(gettingCategories)
                } else if (qVal.pickername === 'Configuration Items') {
                  //Set a default value for this isn't going to be easy...
                }
              }
            });
            $q.all(promises).then(() => {
              deferred.resolve(questionArray);
            });
          } else {
            deferred.reject('No Questions Found.');
          }
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getStageQuestions", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //Get customer specific, or all, organisations
    self.getOrgs = function(strRel) {
      self.custDetails = store.get('custDetails');
      var oOrgs = [];
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      if(strRel === "Customer Organisations") {
        var sqparams = "custid="+self.custDetails.keysearch;
        xmlmc.addParam("storedQuery", "query/wss/customer/customer.get.relorgs");
        xmlmc.addParam("parameters", sqparams);
      } else {
        xmlmc.addParam("storedQuery", "query/wss/customer/customer.get.allorgs");
      }
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(params.rowData) {
            if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
              var intArrayLength = params.rowData.row.length;
              for (var i = 0; i < intArrayLength; i++) {
                oOrgs.push(params.rowData.row[i]);
              }
            } else {
              oOrgs.push(params.rowData.row);
            }
            deferred.resolve(oOrgs);
          }
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getOrgs", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //Get question options that are hard-coded in the question
    self.getQuestionOptions = function(qObj) {
      var qOptions = [];
      var deferred = $q.defer();
      //Get static question options first
      var sqparams = "qid="+qObj.pk_qid;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/wizards/wizard.q.options.static");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(params.rowData) {
            if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                qOptions.push(params.rowData.row[i]);
              }
            } else {
              qOptions.push(params.rowData.row);
            }
          }

          //Now get dynamic wizard options
          if (angular.isDefined(qObj.dbtable) && qObj.dbtable !== "" &&
              angular.isDefined(qObj.keycol) && qObj.keycol !== "" &&
              angular.isDefined(qObj.txtcol) && qObj.txtcol !== ""
            ) {

            self.getDynamicInputData(qObj).then(function(dynData){
              angular.forEach(dynData, function(dynVal, dynKey){
                qOptions.push(dynVal);
              });
              deferred.resolve(qOptions);
            });
          } else {
              deferred.resolve(qOptions);
          }
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getQuestionOptions", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //Get dynamic input data from given table/keycol/discol/filter
    self.getDynamicInputData = function(qObj, strSelector){
      var qOptions = [];
      var deferred = $q.defer();
      var sqparams = "";
      var xmlmc = new XMLMCService.MethodCall();
      sqparams += "qtable="+qObj.dbtable;
      sqparams += "&qkeycol="+qObj.keycol;
      //Add display column if exists
      if(angular.isDefined(qObj.txtcol) && qObj.txtcol !== ""){
        sqparams += "&qdiscol="+qObj.txtcol;
      }
      if(angular.isDefined(qObj.filter) && qObj.filter !== ""){
        //Process provided question filter
        var strQFilter = WizardFilterService.processFilter(qObj.filter, true);
        strQFilter = xmlmc.encodeBase64(strQFilter);
        sqparams += "&qfilter="+strQFilter;
      }

      xmlmc.addParam("storedQuery", "query/wss/wizards/wizard.q.options.dynamic");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(params.rowData) {
            if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
              var intArrayLength = params.rowData.row.length;
              for (var i = 0; i < intArrayLength; i++) {
                qOptions.push(params.rowData.row[i]);
              }
            } else {
              qOptions.push(params.rowData.row);
            }
            deferred.resolve(qOptions);
          }
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getDynamicInputData", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //Get treeview data for Profile Code
    self.getProfileTree = function() {
      self.wssConfig = store.get('wssConfig');
      var deferred = $q.defer();
      self.treeData = [];
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("returnFullTree", "true");
      xmlmc.invoke("selfservice", "customerGetProfileCodeTree", {
        onSuccess: function(response){
          var catList = [];
          var inCatList = {};
          angular.forEach(response.ProfileChildNode, function(prVal, prKey){

            //Make all the levels available

            // var arrCatLevels = prVal.name.split(' -> ');
            // if(arrCatLevels.length <= self.wssConfig.logprofilelevels){
            //   inCatList[prVal.name] = prVal;
            // }
            inCatList[prVal.name] = prVal;
          });
          //Cycle through each of the objects in the response, building the catalog tree data
          angular.forEach(inCatList, function(value, currTreeKey){
            //Split catType in to array
            var arrCatType = value.name.split(' -> ');
            //Make all children available too
            // if(arrCatType.length <= self.wssConfig.logprofilelevels){
              var strCurrentCat = "";
              self.parentId = "";
              //Move through each category level, setting up the flat tree data array
              angular.forEach(arrCatType, function(catType, catKey){
                var currCat = {};
                if(catKey !== 0){
                  strCurrentCat += " -> ";
                }
                strCurrentCat += catType;
                currCat.id = strCurrentCat;
                currCat.parentlabel = self.parentId;
                currCat.name = catType;
                currCat.swValue = inCatList[strCurrentCat].code;
                catList.push(currCat);
                self.parentId = catType;
              });
            //}
          });
          //Unflatten treeview data, and return;
          self.treeData = wssHelpers.unflattenTreeview(catList, 'name');
          deferred.resolve(self.treeData);
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getProfileTree", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //Take selected probcode, populate question answer
    self.probcodeSelected = function(objItems){
      var objAnswer = [];
      if(angular.isDefined(objItems)){
        objAnswer.keycol = objItems[0].swValue;
        objAnswer.discol = objItems[0].id;
      }
      //If we con't have a keycol selected,
      if(!angular.isDefined(objAnswer.keycol)){
        return '';
      }
      return objAnswer;
    };

    //Take selected option, populate question answer
    self.optionSelected = function(objItems){
      var objAnswer = [];
      if(angular.isDefined(objItems)){
        objAnswer.keycol = objItems[0].id;
        objAnswer.discol = objItems[0].name;
      }
      //If we con't have a keycol selected,
      if(!angular.isDefined(objAnswer.keycol)){
        return '';
      }
      return objAnswer;
    };

    //Take selected option(s), populate question answer
    self.multiOptionSelected = function(objItems){
      var strAnswer = '';
      angular.forEach(objItems, function(itemVal){
        if(strAnswer !== '') strAnswer += ', ';
        strAnswer += itemVal.swname;
      });
      return strAnswer;
    };

    //This is to track changes to the checkbox values
    self.checkboxChanged = function(question) {
      question.checked = false;
      angular.forEach(question.answer, function(oVal, oKey){
        if(oVal.checked === true) question.checked = true;
      });
    };

    //Function to build option selector
    self.loadOptionData = function(question, parent){
      var deferred = $q.defer();
      var qOptions = [];
      var sqparams = "";
      var xmlmc = new XMLMCService.MethodCall();
      if (!parent) {
        //We don't have a parent. Go get first level options
        sqparams += "qtable="+question.dbtable;
        sqparams += "&qkeycol="+question.keycol;
        //Add display column if exists
        if(angular.isDefined(question.txtcol) && question.txtcol !== ""){
          sqparams += "&qdiscol="+question.txtcol;
        }
        //Add details column if exists
        if(angular.isDefined(question.prim_extdet) && question.prim_extdet !== ""){
          sqparams += "&qdetcol="+question.txtcol;
        }
        if(angular.isDefined(question.filter) && question.filter !== ""){
          //Process provided question filter
          sqparams += "&qfilter="+WizardFilterService.processFilter(question.filter, true);
        }
        xmlmc.addParam("storedQuery", "query/wss/wizards/wizard.q.options.dynamic");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params){
            if(params.rowData) {
              if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                var intArrayLength = params.rowData.row.length;
                for (var i = 0; i < intArrayLength; i++) {
                  var qOption = [];
                  qOption.id = params.rowData.row[i].keycol;
                  if(angular.isDefined(params.rowData.row[i].discol)){
                    qOption.name = params.rowData.row[i].discol;
                    qOption.swname = params.rowData.row[i].discol;
                  } else {
                    qOption.name = params.rowData.row[i].keycol;
                    qOption.swname = params.rowData.row[i].keycol;
                  }
                  if(angular.isDefined(params.rowData.row[i].detcol)){
                    qOption.name = qOption.name + " - " + params.rowData.row[i].detcol;
                  }
                  qOption.hasChildren = true;
                  qOptions.push(qOption);
                }
              } else {
                var singOption = [];
                singOption.id = params.rowData.row.keycol;
                if(angular.isDefined(params.rowData.row.discol)){
                  singOption.name = params.rowData.row.discol;
                  singOption.swname = params.rowData.row.discol;
                } else {
                  singOption.name = params.rowData.row.keycol;
                  singOption.swname = params.rowData.row.keycol;
                }
                if(angular.isDefined(params.rowData.row.detcol)){
                  singOption.name = singOption.name + " - " + params.rowData.row.detcol;
                }
                qOptions.push(singOption);
              }
              deferred.resolve(qOptions);
            }
          },
          onFailure: function(error){
            wssLogging.logger(error, "ERROR", "WizardDataService::loadOptionData-noParent", false, false);
            deferred.reject(error);
          }
        });
      }
      else {
        //We DO have a parent. Go get second level (selectable) options
        sqparams += "qtable="+question.sec_table;
        sqparams += "&qkeycol="+question.sec_keycol;
        //Add display column if exists
        if(angular.isDefined(question.sec_txtcol) && question.sec_txtcol !== ""){
          sqparams += "&qdiscol="+question.sec_txtcol;
        }
        //Add details column if exists
        if(angular.isDefined(question.sec_extdet) && question.sec_extdet !== ""){
          sqparams += "&qdetcol="+question.sec_extdet;
        }
        if(angular.isDefined(question.sec_filter) && question.sec_filter !== ""){
          //Process provided question filter
          sqparams += "&qfilter="+WizardFilterService.processFilter(question.sec_filter, true);
        }
        if(angular.isDefined(question.sec_filtercolumn) && question.sec_filtercolumn !== ""){
          //Process provided question filter
          sqparams += "&qfiltercol="+question.sec_filtercolumn;
          sqparams += "&qfiltercolval="+parent.id;
        }
        xmlmc.addParam("storedQuery", "query/wss/wizards/wizard.q.options.dynamic");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params){
            if(params.rowData) {
              if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                var intArrayLength = params.rowData.row.length;
                for (var i = 0; i < intArrayLength; i++) {
                  var qOption = [];
                  qOption.id = params.rowData.row[i].keycol;
                  if(angular.isDefined(params.rowData.row[i].discol)){
                    qOption.name = params.rowData.row[i].discol;
                    qOption.swname = params.rowData.row[i].discol;
                  } else {
                    qOption.name = params.rowData.row[i].keycol;
                    qOption.swname = params.rowData.row[i].keycol;
                  }
                  if(angular.isDefined(params.rowData.row[i].detcol)){
                    qOption.name = qOption.name + " - " + params.rowData.row[i].detcol;
                  }
                  qOptions.push(qOption);
                }
              } else {
                var singOption = [];
                singOption.id = params.rowData.row.keycol;
                if(angular.isDefined(params.rowData.row.discol)){
                  singOption.name = params.rowData.row.discol;
                  singOption.swname = params.rowData.row.discol;
                } else {
                  singOption.name = params.rowData.row.keycol;
                  singOption.swname = params.rowData.row.keycol;
                }
                if(angular.isDefined(params.rowData.row.detcol)){
                  singOption.name = singOption.name + " - " + params.rowData.row.detcol;
                }
                qOptions.push(singOption);
              }
              deferred.resolve(qOptions);
            } else {
              //No children from the option selector
              //Set parent object to not-expanded to remove loader
              parent._hsmeta.isActive = false;
              parent._hsmeta.isExpanded = false;
              var connErrorType = 'error';
              var connErrorBody = 'There are no options available against <strong>'+parent.name+"</strong>";
              var connErrorTitle = 'No Options Available!';
              wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);
            }
          },
          onFailure: function(error){
            wssLogging.logger(error, "ERROR", "WizardDataService::loadOptionData-hasParent", true, false);
            deferred.reject(error);
          }
        });
      }
      return deferred.promise;
    };

    //Get SLA's as specified in Dataform
    //Pass back in the format of a Radiobutton question
    self.getSLAQuestion = function(objDataform, objService) {
      var deferred = $q.defer();
      //Setup SLA Question object
      var objSLAQuestion = {};
      var strRelType = '';
      if( !angular.isDefined(objDataform.cp_sla_first) ||
          (angular.isDefined(objDataform.cp_sla_first) && objDataform.cp_sla_first === 'Service')){
            strRelType = 'SERV';
            //Go get SLA's aligned to Service
            self.getServSubSLA(objService.fk_cmdb_id, strRelType).then(function(objSLAs){
              //Get Class-specific default SLA & Priority
              self.getClassDefaultSLA(objService.fk_cmdb_id, strRelType, objDataform.callclass).then(function(respClassDefSLA){
                self.defSLA = respClassDefSLA;
                //Build SLA question around Service SLAs
                objSLAQuestion = self.buildSLAQuestion(objSLAs);
                deferred.resolve(objSLAQuestion);
              });
            }, function(error){
              wssLogging.logger(error, "ERROR", "WizardDataService::getSLAQuestion", false, false);
              deferred.reject(error);
            });
      } else if (angular.isDefined(objDataform.cp_sla_first) && objDataform.cp_sla_first === "Subscription"){
        strRelType = 'SUBS';
        //Go get SLA's aligned to Subscription
        self.getServSubSLA(objService.subs_id, strRelType).then(function(objSLAs){
          //Get Class-specific default SLA & Priority
          self.getClassDefaultSLA(objService.subs_id, strRelType, objDataform.callclass).then(function(respClassDefSLA){
            self.defSLA = respClassDefSLA;
            //Build SLA question around Subscription SLAs
            objSLAQuestion = self.buildSLAQuestion(objSLAs);
            deferred.resolve(objSLAQuestion);
          });
        }, function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getSLAQuestion", false, false);
          deferred.reject(error);
        });
      } else if (angular.isDefined(objDataform.cp_sla_first) && objDataform.cp_sla_first === "Subscription then Service"){
        strRelType = 'SUBS';
        //Go get SLA's aligned to Subscription, if there are none, get those aligned to Service
        self.getServSubSLA(objService.subs_id, strRelType).then(function(objSLAs){
          if(objSLAs.length === 0) {
            strRelType = 'SERV';
            //No SLAs associated to the Subscription - go get SLA's aligned to Service instead
            self.getServSubSLA(objService.fk_cmdb_id, strRelType).then(function(objSLAs){
              //Get Class-specific default SLA & Priority
              self.getClassDefaultSLA(objService.fk_cmdb_id, strRelType, objDataform.callclass).then(function(respClassDefSLA){
                self.defSLA = respClassDefSLA;
                //Build SLA question around Service SLAs
                objSLAQuestion = self.buildSLAQuestion(objSLAs);
                deferred.resolve(objSLAQuestion);
              });
            }, function(error){
              wssLogging.logger(error, "ERROR", "WizardDataService::getSLAQuestion", false, false);
              deferred.reject(error);
            });
          } else {
            //Get Class-specific default SLA & Priority
            self.getClassDefaultSLA(objService.subs_id, strRelType, objDataform.callclass).then(function(respClassDefSLA){
              self.defSLA = respClassDefSLA;
              //Build SLA question around Subscription SLAs
              objSLAQuestion = self.buildSLAQuestion(objSLAs);
              deferred.resolve(objSLAQuestion);
            });
          }
        }, function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getSLAQuestion", false, false);
          deferred.reject(error);
        });
      }
      return deferred.promise;
    };

    self.getDefaultSLAOptions = function(objDataform, objService) {
      var deferred = $q.defer();
      var returnPrice = "0.00";
      self.getSLAQuestion(objDataform, objService).then(function(slaQuestionResp){
        if(angular.isDefined(slaQuestionResp.defaultvalue) && slaQuestionResp.defaultvalue > 0) {
          angular.forEach(slaQuestionResp.options, function(slaQVal){
            if(slaQVal.keycol === slaQuestionResp.defaultvalue && angular.isDefined(slaQVal.slaoptions.price)) {
              returnPrice = slaQVal.slaoptions;
            }
          });
        }
        deferred.resolve(returnPrice);
      }, function(error) {
        deferred.resolve(returnPrice);
      });
      return deferred.promise;
    };

    //Get SLAs from Service or Subscription
    self.getServSubSLA = function(idServSub, slaType){
      var deferred = $q.defer();
      var sqparams = "slatype="+slaType;
      sqparams += "&sid="+idServSub;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/sla/sla.servsub.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          var slaArray = [];
          if(angular.isObject(params.rowData)){
            if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                slaArray.push(params.rowData.row[i]);
              }
            } else {
              slaArray.push(params.rowData.row);
            }
          }
          deferred.resolve(slaArray);
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getServSubSLA", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.getClassDefaultSLA = function(relId, relType, callClass){
      var slaId = '0';
      var deferred = $q.defer();
      var sqparams = "reltype="+relType;
      sqparams += "&relid="+relId;
      sqparams += "&callclass="+callClass;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/sla/sla.callclass.default.get");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          if(angular.isObject(params.rowData)){
            slaId = params.rowData.row.fk_slad;
          }
          deferred.resolve(slaId);
        },
        onFailure: function(error){
          wssLogging.logger(error, "WARN", "WizardDataService::getClassDefaultSLA", false, false);
          deferred.resolve(slaId);
        }
      });
      return deferred.promise;
    };

    self.getStandardComponents = function(intServId, strCallClass) {
      var deferred = $q.defer();
      if(strCallClass !== 'Service Request') {
        deferred.resolve(false);
      } else {
        var objStandardComponents = [];
        var objStandardComponentQuestion = {};
        //Get standard components first
        var sqparams = "servid="+intServId;
        sqparams += "&optional=false";
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", "query/wss/services/components.standard.get");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params){
            if(angular.isObject(params.rowData)){
              if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                var intArrayLength = params.rowData.row.length;
                //obj is array
                for (var i = 0; i < intArrayLength; i++) {
                  objStandardComponents.push(params.rowData.row[i]);
                }
              } else {
                objStandardComponents.push(params.rowData.row);
              }
              //Now get amendable components for each objStandardComponents
              angular.forEach(objStandardComponents, function(compVal, compKey){
                objStandardComponents[compKey].customComponents = [];
                if(compVal.flg_cancustomise === "1"){
                  var objCustomisedComponents = [];
                  //Get standard components first
                  var sqparams = "servid="+compVal.pk_auto_id;
                  var xmlmc = new XMLMCService.MethodCall();
                  xmlmc.addParam("storedQuery", "query/wss/services/components.alternate.get");
                  xmlmc.addParam("parameters", sqparams);
                  xmlmc.invoke("data", "invokeStoredQuery", {
                    onSuccess: function(params){
                      if(angular.isObject(params.rowData)){
                        if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                          var intArrayLength = params.rowData.row.length;
                          //obj is array
                          for (var i = 0; i < intArrayLength; i++) {
                            objCustomisedComponents.push(params.rowData.row[i]);
                          }
                        } else {
                          objCustomisedComponents.push(params.rowData.row);
                        }
                      }
                      objStandardComponents[compKey].customComponents =self.buildStandardCompQuestion(objCustomisedComponents);
                    },
                    onFailure: function(error){
                      wssLogging.logger(error, "WARN", "WizardDataService::getStandardComponents-CustomisedComponents", false, false);
                    }
                  });
                }
              });
            }

            if(objStandardComponents.length === 0){
              deferred.resolve(false);
            } else {
              objStandardComponentQuestion = self.buildStandardCompQuestion(objStandardComponents);
              deferred.resolve(objStandardComponentQuestion);
            }
          },
          onFailure: function(error){
            wssLogging.logger(error, "WARN", "WizardDataService::getStandardComponents", false, false);
            deferred.resolve(false);
          }
        });
      }
      return deferred.promise;
    };

    self.getOptionalComponents = function(intServId, strCallClass) {
      var deferred = $q.defer();
      if(strCallClass !== 'Service Request') {
        deferred.resolve(false);
      } else {
        var objStandardComponents = [];
        var objStandardComponentQuestion = {};
        //Get standard components first
        var sqparams = "servid="+intServId;
        sqparams += "&optional=true";
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", "query/wss/services/components.standard.get");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params){
            if(angular.isObject(params.rowData)){
              if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                var intArrayLength = params.rowData.row.length;
                //obj is array
                for (var i = 0; i < intArrayLength; i++) {
                  objStandardComponents.push(params.rowData.row[i]);
                }
              } else {
                objStandardComponents.push(params.rowData.row);
              }
            }
            if(objStandardComponents.length === 0){
              deferred.resolve(false);
            } else {
              objStandardComponentQuestion = self.buildOptionalCompQuestion(objStandardComponents);
              deferred.resolve(objStandardComponentQuestion);
            }
          },
          onFailure: function(error){
            wssLogging.logger(error, "WARN", "WizardDataService::getOptionalComponents", false, false);
            deferred.resolve(false);
          }
        });
      }
      return deferred.promise;
    };

    //Takes object containing Optional Components, build and returns a wizard question
    self.buildStandardCompQuestion = function(oComponents){
      var objQuestion = {};
      objQuestion.answer = {};
      objQuestion.question = 'Standard Components';
      objQuestion.qfilter = 'standardComponentDisplay';
      objQuestion.flg_hidden = '0';
      objQuestion.flg_prefixq = '1';
      objQuestion.type = 'StandardComponentRadiobox';
      objQuestion.options = [];
      angular.forEach(oComponents, function(objCompVal, objCompKey){
        var option = {};
        option.keycol = objCompVal.pk_auto_id;
        option.discol = objCompVal.description;
        option.componentoptions = objCompVal;
        objQuestion.answer[option.keycol] = option;
        objQuestion.options.push(option);
      });
      return objQuestion;
    };

    //Takes object containing Optional Components, build and returns a wizard question
    self.buildOptionalCompQuestion = function(oComponents){
      var objQuestion = {};
      objQuestion.answer = {};
      objQuestion.question = 'Optional Components';
      objQuestion.qfilter = 'optionalComponentDisplay';
      objQuestion.flg_hidden = '0';
      objQuestion.flg_prefixq = '1';
      objQuestion.type = 'OptionalComponentCheckbox';
      objQuestion.options = [];
      angular.forEach(oComponents, function(objCompVal, objCompKey){
        var option = {};
        option.keycol = objCompVal.pk_auto_id;
        option.discol = objCompVal.description;
        option.componentoptions = objCompVal;
        objQuestion.options.push(option);
      });
      return objQuestion;
    };

    //Takes object containing SLAs, build and returns a wizard question
    self.buildSLAQuestion = function(oSLAs){
      var objQuestion = {};
      objQuestion.answer = {};
      objQuestion.question = 'Service Level Options';
      objQuestion.targetcolumn = 'opencall.itsm_sladef';
      objQuestion.qfilter = 'optionDisplay';
      objQuestion.flg_mandatory = '1';
      objQuestion.flg_hidden = '0';
      objQuestion.type = 'SLARadiobox';
      objQuestion.options = [];
      angular.forEach(oSLAs, function(objSLAVal, objSLAKey){
        var option = {};
        option.keycol = objSLAVal.fk_sla;
        option.discol = objSLAVal.fk_sla_name;
        option.slaoptions = objSLAVal;
        if(objSLAKey === 0 ){
          objQuestion.defaultvalue = option.keycol;
        } else if (objSLAVal.fk_sla === self.defSLA) {
          objQuestion.defaultvalue = option.keycol;
        }
        objQuestion.options.push(option);
      });
      return objQuestion;
    };

    //Get Jump on value options for question
    self.getJumpRecords = function(qid){
      var deferred = $q.defer();
      var sqparams = "qid="+qid;
      var xmlmc = new XMLMCService.MethodCall();
      xmlmc.addParam("storedQuery", "query/wss/wizards/wizard.get.jumps");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function(params){
          var jumpArray = [];
          if(angular.isObject(params.rowData)){
            if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
              var intArrayLength = params.rowData.row.length;
              //obj is array
              for (var i = 0; i < intArrayLength; i++) {
                jumpArray.push(params.rowData.row[i]);
              }
            } else {
              jumpArray.push(params.rowData.row);
            }
          }
          deferred.resolve(jumpArray);
        },
        onFailure: function(error){
          wssLogging.logger(error, "ERROR", "WizardDataService::getJumpRecords", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    //When the SLA radiobutton is changed, recalculate the Service Costs
    self.slaChange = function(oOption) {
      if(angular.isDefined(oOption.slaoptions.price) && parseFloat(oOption.slaoptions.price).toFixed(2) > 0) {
        self.dataForm.prices.servicelevel = oOption.slaoptions.price;
      } else {
        self.dataForm.prices.servicelevel = "0.00";
      }
      if(angular.isDefined(oOption.slaoptions.total_cost) && parseFloat(oOption.slaoptions.total_cost).toFixed(2) > 0) {
        self.dataForm.prices.serviceLevelCost = oOption.slaoptions.total_cost;
      } else {
        self.dataForm.prices.serviceLevelCost = "0.00";
      }
      self.dataForm.prices.total = (parseFloat(self.dataForm.prices.basic) + parseFloat(self.dataForm.prices.customisation) + parseFloat(self.dataForm.prices.optional) + parseFloat(self.dataForm.prices.servicelevel)).toFixed(2);
    };

    //When a Componment is changed, or just prior to submitting a completed wizard, calculate costs/prices and update object
    self.componentChange = function() {
      var customisationCompCost = 0;
      var customisationCompPrice = 0;
      var optionalCompCost = 0;
      var optionalCompPrice = 0;

      //Get object keys to work out length of Wizard Stages object
      var keys = Object.keys(self.wizardStages);
      var intEndStage = keys.length - 1;

      angular.forEach(self.wizardStages[intEndStage].questions, function(objQuestion){
        if(objQuestion.pk_qid ===  'QSTCOMP') {
          angular.forEach(objQuestion.answer, function(objAnswerVal, intAnswerKey){
            if(objAnswerVal.keycol !== intAnswerKey){
              var cusPriceDiff = '0.00';
              var cusCost = '0.00';
              if(angular.isDefined(objAnswerVal.componentoptions.price_diff)){
                cusPriceDiff = objAnswerVal.componentoptions.price_diff;
              }
              if(angular.isDefined(objAnswerVal.componentoptions.total_cost_for_item)){
                cusCost = objAnswerVal.componentoptions.total_cost_for_item;
              }
              customisationCompPrice = (parseFloat(customisationCompPrice) + parseFloat(cusPriceDiff)).toFixed(2);
              customisationCompCost = (parseFloat(customisationCompCost) + parseFloat(cusCost)).toFixed(2);
            }
          });
          self.dataForm.prices.customisation = customisationCompPrice;
          self.dataForm.prices.customisationCost = customisationCompCost;
        }
        if(objQuestion.pk_qid === 'QOPCOMP'){
          angular.forEach(objQuestion.answer, function(objAnswerVal, intAnswerKey){
            if(angular.isObject(objAnswerVal)){
              var opPrice = '0.00';
              var opCost = '0.00';
              if(angular.isDefined(objAnswerVal.price)){
                opPrice = objAnswerVal.price;
              }
              if(angular.isDefined(objAnswerVal.total_cost_for_item)){
                opCost = objAnswerVal.total_cost_for_item;
              }
              optionalCompPrice = (parseFloat(optionalCompPrice) + parseFloat(opPrice)).toFixed(2);
              optionalCompCost = (parseFloat(optionalCompCost) + parseFloat(opCost)).toFixed(2);
            }
          });
          self.dataForm.prices.optional = optionalCompPrice;
          self.dataForm.prices.optionalCost = optionalCompCost;
        }
      });
      if(angular.isDefined(self.dataForm) && angular.isDefined(self.dataForm.prices)){
        self.dataForm.prices.totalComponentPrice = (parseFloat(customisationCompPrice) + parseFloat(optionalCompPrice) + parseFloat(self.dataForm.prices.basic)).toFixed(2);
        self.dataForm.prices.totalComponentCost = (parseFloat(customisationCompCost) + parseFloat(optionalCompCost)).toFixed(2);
        self.dataForm.prices.total = (parseFloat(self.dataForm.prices.basic) + parseFloat(self.dataForm.prices.customisation) + parseFloat(self.dataForm.prices.optional) + parseFloat(self.dataForm.prices.servicelevel)).toFixed(2);
        self.dataForm.prices.totalCost = (parseFloat(self.dataForm.prices.totalComponentCost)  + parseFloat(self.dataForm.prices.serviceLevelCost)).toFixed(2);
      }
    };

    //Check size of files being attached
    self.checkFiles = function (event, reader, fileList) {
      self.addingFiles = true;
      if (fileList.size > 10000000) {
        var fileError = "File ["+fileList.name+"] is too big!";
        var connErrorType = 'warning';
        var connErrorBody = "File ["+fileList.name+"] is too big!";
        var connErrorTitle = 'File Size Warning!';
        wssLogging.sendToast(connErrorType, connErrorBody, connErrorTitle);

        reader.abort();
      }
    };

    //
    self.filesAdded = function(event, reader, fileObjs, file){
      self.addingFiles = false;
    };

    return self;
  }
}());
