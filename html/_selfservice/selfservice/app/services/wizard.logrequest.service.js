(function () {
  'use strict';

  angular.module('swSelfService').service('WizardLogService', WizardLogService);

  WizardLogService.$inject = ['$q', 'XMLMCService', 'store', '$filter', 'WizardLogHelpersService', 'wssLogging'];
  function WizardLogService($q, XMLMCService, store, $filter, WizardLogHelpersService, wssLogging) {

    var self = {
      unixToDateFilter: $filter("unixToDate"),
      unixToTimeFilter: $filter("unixToTime"),
      unixToDateTimeFilter: $filter("unixToDateTime"),
      momentToDateFilter: $filter("momentToDate"),
      momentToDateRangeFilter: $filter("momentToDateRange"),
      checkboxFilter: $filter("checkboxDisplay"),
      fileFilter: $filter("fileDisplay"),
      standardComponentFilter: $filter("standardComponentDisplay"),
      optionalComponentFilter: $filter("optionalComponentDisplay"),
      fileAttachments: []
    };

    self.wizardSubmit = function (wizdetails, stages, dataform, source) {
      self.custDetails = store.get("custDetails");
      self.sessionConfig = store.get("sessionConfig");
      self.wssConfig = store.get("wssConfig");
      var deferred = $q.defer();
      self.arrTableFields = [];
      self.arrCIs = [];
      self.arrStandardComponents = [];
      self.arrOptionalComponents = [];

      var boolUseDefaultCol = false;
      //Cycle through the wizard questions, build the API call
      angular.forEach(stages, function (stage, key) {
        angular.forEach(stage.questions, function (question, key) {
          var targetTable = '';
          var targetColumn = '';

          //If the question is a Custom Picker > File Attachment, populate self.fileAttachments with what we need for the log request
          if (question.type === 'Custom Picker' && question.pickername === 'File Attachments') {
            angular.forEach(question.answer, function (oFile, fileKey) {
              self.fileAttachments.push(oFile);
            });
          }

          if (question.type === 'Custom Picker' && question.pickername === 'Configuration Items') {
            angular.forEach(question.answer, function (oCI, oKey) {
              if (angular.isDefined(oCI.ck_config_item)) {
                self.arrCIs[oKey] = oCI.ck_config_item;
              }
            });
          }

          if (question.type === 'StandardComponentRadiobox') {
            angular.forEach(question.answer, function (oAnswer) {
              self.arrStandardComponents.push(oAnswer.componentoptions);
            });
          }

          if (question.type === 'OptionalComponentCheckbox') {
            angular.forEach(question.answer, function (oAnswer, intKey) {
              if (angular.isObject(oAnswer)) {
                self.arrOptionalComponents[intKey] = oAnswer;
              }
            });
          }

          //If we have a target column against the question, use that
          if (angular.isDefined(question.targetcolumn)) {
            var colArray = question.targetcolumn.split('.');
            targetTable = colArray[0];
            targetColumn = colArray[1];
          } else {
            //If no target column, use the default
            boolUseDefaultCol = true;
            targetTable = wizdetails.defaulttable;
            targetColumn = wizdetails.defaultcolumn;
          }

          //Add Table array if doesn't already exist
          if (!angular.isDefined(self.arrTableFields[targetTable])) {
            self.arrTableFields[targetTable] = [];
          }
          //Add Column array to Table array if doesn't already exist
          if (!angular.isDefined(self.arrTableFields[targetTable][targetColumn])) {
            self.arrTableFields[targetTable][targetColumn] = [];
          }

          //Process Answer Value
          var answerValue = self.getAnswer(question);
          //Add Prefix
          if (question.flg_prefixq === "1" && answerValue !== "") {
            answerValue = question.question + ": " + answerValue;
          }

          //Process update text columns
          if (boolUseDefaultCol && angular.isDefined(self.arrTableFields[targetTable][targetColumn].answervalue) && answerValue !== "") {
            self.arrTableFields[targetTable][targetColumn].answervalue = self.arrTableFields[targetTable][targetColumn].answervalue + "\n" + answerValue;
          } else if (angular.isDefined(self.arrTableFields[targetTable][targetColumn]) && answerValue !== "") {
            self.arrTableFields[targetTable][targetColumn].answervalue = answerValue;
          }
          //Set SLA Name
          if (targetTable === "opencall" && targetColumn === "itsm_sladef") {
            self.arrTableFields.opencall.itsm_slaname = [];
            self.arrTableFields.opencall.itsm_slaname.answervalue = question.answer.discol;
          }
          if (targetTable === "opencall" && targetColumn === "fk_company_id") {
            self.arrTableFields.opencall.companyname = [];
            self.arrTableFields.opencall.companyname.answervalue = question.answer.discol;
          }
        });
      });
      self.arrAdditionalCallValues = {};
      self.boolUseAdditional = false;
      for (var table in self.arrTableFields) {
        self.arrAdditionalCallValues[table] = {};
        for (var column in self.arrTableFields[table]) {
          if (angular.isDefined(self.arrTableFields[table][column].answervalue) && self.arrTableFields[table][column].answervalue !== "") {
            self.boolUseAdditional = true;
            self.arrAdditionalCallValues[table][column] = self.arrTableFields[table][column].answervalue;
          }
        }
      }

      self.objRequestDetails = [];
      //Variables from config
      self.objRequestDetails.strCallClass = self.sessionConfig.callClass;
      self.objRequestDetails.strCallStatus = self.wssConfig.logstatus;
      self.objRequestDetails.strProbCode = "";
      self.objRequestDetails.strSuppGroup = self.sessionConfig.assignGroup;
      self.objRequestDetails.strOwner = "";
      self.objRequestDetails.strPriority = self.wssConfig.sla;
      self.objRequestDetails.strSLAName = "";
      self.objRequestDetails.intSLAID = "0";
      self.objRequestDetails.strImpact = "";
      self.objRequestDetails.strUrgency = "";
      self.objRequestDetails.strSite = "";

      //Set request site
      if (angular.isDefined(self.arrTableFields.opencall) && angular.isDefined(self.arrTableFields.opencall.site) && angular.isDefined(self.arrTableFields.opencall.site.answervalue) && self.arrTableFields.opencall.site.answervalue !== '') {
        self.objRequestDetails.strSite = self.arrTableFields.opencall.site.answervalue;
      } else if (angular.isDefined(self.custDetails.site) && self.custDetails.site !== '') {
        self.objRequestDetails.strSite = self.custDetails.site;
      }

      //Set request Cost Center
      self.objRequestDetails.strCostCenter = "";
      if (angular.isDefined(self.arrTableFields.opencall) && angular.isDefined(self.arrTableFields.opencall.costcenter) && angular.isDefined(self.arrTableFields.opencall.costcenter.answervalue) && self.arrTableFields.opencall.costcenter.answervalue !== '') {
        self.objRequestDetails.strCostCenter = self.arrTableFields.opencall.costcenter.answervalue;
      } else if (angular.isDefined(self.custDetails.costcenter) && self.custDetails.costcenter !== '') {
        self.objRequestDetails.strCostCenter = self.custDetails.costcenter;
      }

      //If no additional values set against opencall, create new array to hold SLA etc info
      if (!angular.isDefined(self.arrAdditionalCallValues.opencall)) {
        self.arrAdditionalCallValues.opencall = [];
      }
      //Set logcall source
      self.arrAdditionalCallValues.opencall.logcall_source = 'SELFSERVICE';

      //If company was not set in wizard - get from customer details
      if (!angular.isDefined(self.arrAdditionalCallValues.opencall.fk_company_id)) {
        if (angular.isDefined(self.custDetails.fk_company_id) && self.custDetails.fk_company_id !== '') {
          self.arrAdditionalCallValues.opencall.fk_company_id = self.custDetails.fk_company_id;
          self.arrAdditionalCallValues.opencall.companyname = self.custDetails.companyname;
        }
      }

      //If department was not set in wizard - get from customer details
      if (!angular.isDefined(self.arrAdditionalCallValues.opencall.fk_dept_code)) {
        if (angular.isDefined(self.custDetails.department) && self.custDetails.department !== '') {
          self.arrAdditionalCallValues.opencall.fk_dept_code = self.custDetails.department;
        }
      }
      //Set owner to be assigning analyst from session config
      //This may be overwritten by the Dataform setting or Wizard answer later on
      if (angular.isDefined(self.sessionConfig.assignAnalsyt) && self.sessionConfig.assignAnalsyt !== '') {
        self.objRequestDetails.strOwner = self.sessionConfig.assignAnalsyt;
      }
      //Booleans to track when a value is set by a wizard answer
      var boolWizProbcode = false;
      var boolWizSuppgroup = false;
      var boolWizOwner = false;
      var boolWizPriority = false;
      var boolWizSLA = false;
      var boolWizImpact = false;
      var boolWizUrgency = false;

      //Get core opencall values if defined by Wizard answers
      //Set bools so that we know these values have been set by the wizard, and to not override with dataform values
      if (angular.isDefined(self.arrTableFields.opencall)) {
        if (angular.isDefined(self.arrTableFields.opencall.probcode) && self.arrTableFields.opencall.probcode.answervalue !== '') {
          self.objRequestDetails.strProbCode = self.arrTableFields.opencall.probcode.answervalue;
          boolWizProbcode = true;
        }
        if (angular.isDefined(self.arrTableFields.opencall.itsm_impact_level) && self.arrTableFields.opencall.itsm_impact_level.answervalue !== '') {
          self.objRequestDetails.strImpact = self.arrTableFields.opencall.itsm_impact_level.answervalue;
          boolWizImpact = true;
        }
        if (angular.isDefined(self.arrTableFields.opencall.itsm_urgency_level) && self.arrTableFields.opencall.itsm_urgency_level.answervalue !== '') {
          self.objRequestDetails.strUrgency = self.arrTableFields.opencall.itsm_urgency_level.answervalue;
          boolWizUrgency = true;
        }
        if (angular.isDefined(self.arrTableFields.opencall.suppgroup) && self.arrTableFields.opencall.suppgroup.answervalue !== '') {
          self.objRequestDetails.strSuppGroup = self.arrTableFields.opencall.suppgroup;
          boolWizSuppgroup = true;
        }
        if (angular.isDefined(self.arrTableFields.opencall.owner) && self.arrTableFields.opencall.owner.answervalue !== '') {
          self.objRequestDetails.strOwner = self.arrTableFields.opencall.owner.answervalue;
          boolWizOwner = true;
        }

        if (angular.isDefined(self.arrTableFields.opencall.itsm_sladef) && self.arrTableFields.opencall.itsm_sladef.answervalue !== '') {
          self.objRequestDetails.intSLAID = self.arrTableFields.opencall.itsm_sladef.answervalue;
          self.objRequestDetails.strSLAName = self.arrTableFields.opencall.itsm_slaname.answervalue;
          boolWizSLA = true;
        } else {
          //We have no SLA defined from the Wizard - get the SLA from the Default Priority
        }
      }

      if (angular.isDefined(dataform.pk_auto_id)) {
        //We have a dataform - get your settings from here!
        self.objRequestDetails.strCallClass = dataform.callclass;

        //Set Service ID against new Service Request
        if (angular.isDefined(dataform.service) && angular.isDefined(dataform.service.pk_auto_id)) {
          if (dataform.callclass === 'Service Request') {
            //Set catalogue request type
            self.arrAdditionalCallValues.opencall.itsm_catreq_type = 'REQUEST';
            //If Service Request, add Service & Cost details etc to request
            self.arrAdditionalCallValues.opencall.itsm_fk_service = dataform.service.pk_auto_id;
            self.arrAdditionalCallValues.opencall.request_qty = '1';
            self.arrAdditionalCallValues.opencall.request_cost = dataform.prices.totalCost.toString();
            self.arrAdditionalCallValues.opencall.request_price = dataform.prices.total.toString();
            self.arrAdditionalCallValues.opencall.request_sla_cost = dataform.prices.serviceLevelCost.toString();
            self.arrAdditionalCallValues.opencall.request_sla_price = dataform.prices.servicelevel.toString();
            self.arrAdditionalCallValues.opencall.request_comp_cost = dataform.prices.totalComponentCost.toString();
            self.arrAdditionalCallValues.opencall.request_comp_price = dataform.prices.totalComponentPrice.toString();
          } else {
            //Set catalogue request type
            self.arrAdditionalCallValues.opencall.itsm_catreq_type = 'SUPPORT';
            //If not Service Request, add the service details to the CI array for association later on
            self.arrCIs[dataform.service.pk_auto_id] = dataform.service.ck_config_item;
          }
        }
        //If summary has not been set against request, set it to the Title of the Service
        if (!angular.isDefined(self.arrAdditionalCallValues.opencall.itsm_title) || self.arrAdditionalCallValues.opencall.itsm_title === '') {
          if (angular.isDefined(dataform.service) && angular.isDefined(dataform.service.vsb_title)) {
            self.arrAdditionalCallValues.opencall.itsm_title = dataform.service.vsb_title;
          }
        }
        //Set the Workflow details against the request
        if (angular.isDefined(dataform.bpm_wf_id) && dataform.bpm_wf_id !== '') {
          self.arrAdditionalCallValues.opencall.bpm_workflow_id = dataform.bpm_wf_id;
          if (angular.isDefined(self.custDetails.fk_manager) && self.custDetails.fk_manager !== '') {
            self.arrAdditionalCallValues.opencall.bpm_managerid = self.custDetails.fk_manager;
          }
        }

        //Check if any of these values have been set by a Wizard answer
        //If not, then use the dataform value
        if (boolWizProbcode === false && angular.isDefined(dataform.probcode) && dataform.probcode !== '') {
          self.objRequestDetails.strProbCode = dataform.probcode;
        }
        if (boolWizSuppgroup === false && angular.isDefined(dataform.suppgroup) && dataform.suppgroup !== '') {
          self.objRequestDetails.strSuppGroup = dataform.suppgroup;
        }
        if (boolWizOwner === false && angular.isDefined(dataform.owner) && dataform.owner !== '') {
          self.objRequestDetails.strOwner = dataform.owner;
        }
        //Get Priority from Dataform Impact & Urgency, and Wizard-Specified SLA
        if (boolWizImpact === false && angular.isDefined(dataform.itsm_impact) && dataform.itsm_impact !== '') {
          self.arrAdditionalCallValues.opencall.itsm_impact_level = dataform.itsm_impact;
          self.objRequestDetails.strImpact = dataform.itsm_impact;
        }
        if (boolWizUrgency === false && angular.isDefined(dataform.itsm_urgency) && dataform.itsm_urgency !== '') {
          self.arrAdditionalCallValues.opencall.itsm_urgency_level = dataform.itsm_urgency;
          self.objRequestDetails.strUrgency = dataform.itsm_urgency;
        }
        if (angular.isDefined(dataform.cp_sla_first_flg) && parseInt(dataform.cp_sla_first_flg) > 0) {
          //Do Priority Calculation here
          switch (dataform.cp_sla_first_flg) {
            case "1":
              WizardLogHelpersService.getPriorityFromMatrix(self.objRequestDetails.intSLAID, self.objRequestDetails.strImpact, self.objRequestDetails.strUrgency).then(function (priorityResponse) {
                if (priorityResponse !== "") {
                  self.objRequestDetails.strPriority = priorityResponse;
                }
                deferred.resolve(priorityResponse);
              });
              break;
            case "2":
              //Get Priority from Wizard Impact, Urgency & SLA
              WizardLogHelpersService.getPriorityFromMatrix(self.objRequestDetails.intSLAID, self.objRequestDetails.strImpact, self.objRequestDetails.strUrgency).then(function (priorityResponse) {
                if (priorityResponse !== "") {
                  self.objRequestDetails.strPriority = priorityResponse;
                }
                deferred.resolve(priorityResponse);
              });
              break;
            case "3":
              //Use SLA from heirarchy to calculate Priority
              if (angular.isDefined(dataform.cp_sla_first) && dataform.cp_sla_first !== "") {
                switch (dataform.cp_sla_first) {
                  case "Service":
                    WizardLogHelpersService.getPriorityFromSLAService(self.objRequestDetails.intSLAID, dataform.service.fk_cmdb_id).then(function (priorityResponse) {
                      if (priorityResponse !== "") {
                        self.objRequestDetails.strPriority = priorityResponse;
                      }
                      deferred.resolve(priorityResponse);
                    });
                    break;
                  case "Subscription":
                    WizardLogHelpersService.getPriorityFromSLASubscription(self.objRequestDetails.intSLAID, dataform.service.subs_id).then(function (priorityResponse) {
                      if (priorityResponse !== "") {
                        self.objRequestDetails.strPriority = priorityResponse;
                      }
                      deferred.resolve(priorityResponse);
                    });
                    break;
                  case "Subscription then Service":
                    WizardLogHelpersService.getPriorityFromSLASubscription(self.objRequestDetails.intSLAID, dataform.service.subs_id).then(function (priorityResponse) {
                      if (priorityResponse === "") {
                        WizardLogHelpersService.getPriorityFromSLAService(self.objRequestDetails.intSLAID, dataform.service.fk_cmdb_id).then(function (priorityResponse) {
                          if (priorityResponse !== "") {
                            self.objRequestDetails.strPriority = priorityResponse;
                          }
                          deferred.resolve(priorityResponse);
                        });
                      } else {
                        self.objRequestDetails.strPriority = priorityResponse;
                        deferred.resolve(priorityResponse);
                      }
                    });
                    break;
                }
              } else {
                deferred.resolve(priorityResponse);
              }
              break;
          }
        } else {
          //Priority Flags not set in Dataform
          //Return whatever priority has been set previously
          deferred.resolve(self.objRequestDetails.strPriority);
        }
      } else {
        //We don't have a dataform - get your call settings from the config and wizard entries
        if (self.objRequestDetails.strPriority === '[Use Customer SLA]') {
          // If WSS detfault priority is [Use Customer Priority] take priority details from customer details,
          // then work out Impact & Urgency from either Wizard or SLA & Priority
          if (angular.isDefined(self.custDetails.sld) && self.custDetails.sld > 0) {
            self.objRequestDetails.strSLAName = self.custDetails.sld_name;
            self.objRequestDetails.intSLAID = self.custDetails.sld;
            self.arrAdditionalCallValues.opencall.itsm_slaname = self.objRequestDetails.strSLAName;
            self.arrAdditionalCallValues.opencall.itsm_sladef = self.objRequestDetails.intSLAID;
          }
          if (angular.isDefined(self.custDetails.priority) && self.custDetails.priority === '[Use SLA Default Priority]') {
            if (self.objRequestDetails.intSLAID !== '') {
              WizardLogHelpersService.getDefaultPriorityFromSLA(self.objRequestDetails.intSLAID).then(function (respPriority) {
                self.custDetails.priority = respPriority;
                self.objRequestDetails.strPriority = self.custDetails.priority;
                if (self.objRequestDetails.strImpact === "" || self.objRequestDetails.strUrgency === "") {
                  //No impact and urgency - try to get from matrix
                  WizardLogHelpersService.getPriorityMatrix(self.objRequestDetails.strPriority, self.objRequestDetails.intSLAID).then(function (objMatrix) {
                    if (angular.isDefined(objMatrix.impact) && angular.isDefined(objMatrix.urgency)) {
                      //If Impact not set via Wizard, use one from Matrix
                      if (self.objRequestDetails.strImpact === "") {
                        self.arrAdditionalCallValues.opencall.itsm_impact_level = objMatrix.impact;
                      }
                      //If Urgency not set via Wizard, use one from Matrix
                      if (self.objRequestDetails.strUrgency === "") {
                        self.arrAdditionalCallValues.opencall.itsm_urgency_level = objMatrix.urgency;
                      }
                    }
                    deferred.resolve(self.objRequestDetails);
                  }, function (error) {
                    //We have an SLA but no impact matrix;
                    deferred.resolve(self.objRequestDetails);
                  });
                }
              }, function (error) {
                wssLogging.logger(error, "ERROR", "WizardLogService::wizardSubmit", false, false);
              });
            } else {
              self.objRequestDetails.strPriority = self.custDetails.priority;
            }
          } else if (angular.isDefined(self.custDetails.priority)) {
            self.objRequestDetails.strPriority = self.custDetails.priority;
            if (self.objRequestDetails.strImpact === "" || self.objRequestDetails.strUrgency === "") {
              //No impact and urgency - try to get from matrix
              WizardLogHelpersService.getPriorityMatrix(self.objRequestDetails.strPriority, self.objRequestDetails.intSLAID).then(function (objMatrix) {
                if (angular.isDefined(objMatrix.impact) && angular.isDefined(objMatrix.urgency)) {
                  //If Impact not set via Wizard, use one from Matrix
                  if (self.objRequestDetails.strImpact === "") {
                    self.arrAdditionalCallValues.opencall.itsm_impact_level = objMatrix.impact;
                  }
                  //If Urgency not set via Wizard, use one from Matrix
                  if (self.objRequestDetails.strUrgency === "") {
                    self.arrAdditionalCallValues.opencall.itsm_urgency_level = objMatrix.urgency;
                  }
                }
                deferred.resolve(self.objRequestDetails);
              }, function (error) {
                //We have an SLA but no impact matrix;
                deferred.resolve(self.objRequestDetails);
              });
            }
          } else {
            deferred.resolve(self.objRequestDetails);
          }
        } else {
          WizardLogHelpersService.getPrioritySLA(self.objRequestDetails.strPriority).then(function (objSLA) {
            self.objRequestDetails.strSLAName = objSLA.fk_slad_name;
            self.objRequestDetails.intSLAID = objSLA.fk_slad;
            self.arrAdditionalCallValues.opencall.itsm_sladef = self.objRequestDetails.intSLAID;
            self.arrAdditionalCallValues.opencall.itsm_slaname = self.objRequestDetails.strSLAName;
            //If we have no Impact or Urgency set via the wizards, go get these from the priority matrix
            if (self.objRequestDetails.strImpact === "" || self.objRequestDetails.strUrgency === "") {
              WizardLogHelpersService.getPriorityMatrix(self.objRequestDetails.strPriority, self.objRequestDetails.intSLAID).then(function (objMatrix) {
                if (angular.isDefined(objMatrix.impact) && angular.isDefined(objMatrix.urgency)) {
                  //If Impact not set via Wizard, use one from Matrix
                  if (self.objRequestDetails.strImpact === "") {
                    self.arrAdditionalCallValues.opencall.itsm_impact_level = objMatrix.impact;
                  }
                  //If Urgency not set via Wizard, use one from Matrix
                  if (self.objRequestDetails.strUrgency === "") {
                    self.arrAdditionalCallValues.opencall.itsm_urgency_level = objMatrix.urgency;
                  }
                }
                deferred.resolve(self.objRequestDetails);
              }, function (error) {
                //We have an SLA but no impact matrix;
                deferred.resolve(self.objRequestDetails);
              });
            } else {
              //Impact and Urgency
              self.arrAdditionalCallValues.opencall.itsm_impact_level = self.objRequestDetails.strImpact;
              self.arrAdditionalCallValues.opencall.itsm_urgency_level = self.objRequestDetails.strUrgency;
              deferred.resolve(self.objRequestDetails);
            }
          }, function (error) {
            wssLogging.logger(error, "ERROR", "WizardLogService::wizardSubmit", false, false);
            deferred.reject(error);
          });
        }
      }
      return deferred.promise;
    };

    //Take call details, log request from this
    self.logRequest = function () {
      var deferred = $q.defer();
      var xmlmc = new XMLMCService.MethodCall();
      var strCallClass = self.objRequestDetails.strCallClass;
      if (strCallClass.toLowerCase() == 'service request') {} else if (self.objRequestDetails.strCallStatus === "Incoming") {
        xmlmc.addParam("logIncoming", "true");
        strCallClass = 'Incoming';
      }
      xmlmc.addParam("callClass", self.objRequestDetails.strCallClass);
      if (angular.isDefined(self.objRequestDetails.strPriority) && self.objRequestDetails.strPriority !== "") {
        xmlmc.addParam("slaName", self.objRequestDetails.strPriority);
      }
      if (self.objRequestDetails.strCostCenter !== "") {
        xmlmc.addParam("costCenter", self.objRequestDetails.strCostCenter);
      }
      if (self.objRequestDetails.strProbCode !== "") {
        xmlmc.addParam("probCode", self.objRequestDetails.strProbCode);
      }
      if (self.objRequestDetails.strSite !== "") {
        xmlmc.addParam("site", self.objRequestDetails.strSite);
      }
      xmlmc.addParam("groupId", self.objRequestDetails.strSuppGroup);
      if (self.objRequestDetails.strOwner !== "") {
        xmlmc.addParam("analystId", self.objRequestDetails.strOwner);
      }
      // If no values have been added to updatedb.update text, we need to set a default blank value
      var boolHaveUpdateTxt = true;
      if (!angular.isDefined(self.arrTableFields.updatedb)) boolHaveUpdateTxt = false;else if (!angular.isDefined(self.arrTableFields.updatedb.updatetxt)) boolHaveUpdateTxt = false;else if (!angular.isDefined(self.arrTableFields.updatedb.updatetxt.answervalue)) boolHaveUpdateTxt = false;

      if (boolHaveUpdateTxt) xmlmc.addParam("updateMessage", self.arrTableFields.updatedb.updatetxt.answervalue);else xmlmc.addParam("updateMessage", "");
      xmlmc.addParam("updateCode", "New Support Request");
      xmlmc.addParam("updateSource", "Customer Portal");

      if (angular.isDefined(self.fileAttachments) && typeof self.fileAttachments == "object") {
        for (var k in self.fileAttachments) {
          var objAttachment = {};
          if (self.fileAttachments.hasOwnProperty(k)) {
            objAttachment.fileName = self.fileAttachments[k].filename;
            objAttachment.fileData = self.fileAttachments[k].base64;
            objAttachment.mimeType = self.fileAttachments[k].filetype;
            xmlmc.addParam("fileAttachment", objAttachment);
          }
        }
        self.fileAttachments = [];
      }
      xmlmc.addParam("additionalCallValues", self.arrAdditionalCallValues);
      xmlmc.invoke("selfservice", "customerLogNewCall", {
        onSuccess: function (params) {
          if (self.arrCIs.length > 0) {
            self.attachCIs(params.callref, strCallClass);
          }
          self.addExtOC(params.callref);
          if (strCallClass === 'Service Request') {
            //Add request components
            if (self.arrStandardComponents.length > 0) {
              self.attachComponents(params.callref, self.arrStandardComponents);
            }
            //Add optional components
            if (self.arrOptionalComponents.length > 0) {
              self.attachComponents(params.callref, self.arrOptionalComponents);
            }
          }
          deferred.resolve(params);
        },
        onFailure: function (error) {
          wssLogging.logger(error, "ERROR", "WizardLogService::logRequest", false, false);
          deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    self.addExtOC = function (callref) {
      var q = Object.getOwnPropertyNames(self.arrTableFields);
      for (var p in q) {
        if (q[p].indexOf("extoc_") === 0) {
          var queryString = "callref=" + callref + "&table=" + q[p];
          var z = Object.getOwnPropertyNames(self.arrTableFields[q[p]]);
          for (var y in z) {
            if (z[y] === "length") {} else {
              if (angular.isDefined(self.arrTableFields[q[p]][z[y]].answervalue)) queryString += "&_swc_" + z[y] + "=" + encodeURIComponent(self.arrTableFields[q[p]][z[y]].answervalue);
            }
          }
          //				alert(queryString);
          var xmlmc = new XMLMCService.MethodCall();
          xmlmc.addParam("storedQuery", "query/wss/requests/request.extoc.add");
          xmlmc.addParam("parameters", queryString);
          xmlmc.invoke("data", "invokeStoredQuery", {
            onSuccess: function (params) {
              //Do nothing!
            },
            onFailure: function (error) {
              //Output error to log
              wssLogging.logger(error, "ERROR", "WizardLogService::addExtOC", true, false);
            }
          });
        }
      }
    };

    self.attachComponents = function (intCallref, objComponents) {
      angular.forEach(objComponents, function (objComponent) {
        var xmlmc = new XMLMCService.MethodCall();
        var sqparams = "callref=" + intCallref;
        sqparams += "&custid=" + self.custDetails.keysearch;
        sqparams += "&compid=" + objComponent.pk_auto_id;
        xmlmc.addParam("storedQuery", "query/wss/requests/request.component.add");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function (params) {
            //Do nothing!
          },
          onFailure: function (error) {
            //Output error to log
            wssLogging.logger(error, "ERROR", "WizardLogService::attachCIs", true, false);
          }
        });
      });
    };

    self.attachCIs = function (intCallref, strCallClass) {
      var strCIs = '';
      angular.forEach(self.arrCIs, function (strCIName, intCIKey) {
        if (strCIs !== '') {
          strCIs += ', ';
        }
        strCIs += intCIKey;
      });
      var xmlmc = new XMLMCService.MethodCall();
      var sqparams = "callref=" + intCallref;
      sqparams += "&callclass=" + strCallClass;
      sqparams += "&ciids=" + strCIs;
      xmlmc.addParam("storedQuery", "query/wss/requests/request.ci.attach");
      xmlmc.addParam("parameters", sqparams);
      xmlmc.invoke("data", "invokeStoredQuery", {
        onSuccess: function (params) {
          //Do nothing!
        },
        onFailure: function (error) {
          //Output error to log
          wssLogging.logger(error, "ERROR", "WizardLogService::attachCIs", true, false);
        }
      });
    };

    self.getAnswer = function (oQuestion) {
      var answerValue = '';
      if (angular.isDefined(oQuestion.answer) && oQuestion.answer !== '') {
        answerValue = oQuestion.answer;
      } else {
        //Answer not defined, or blank. Send back blank string for ignore
        return '';
      }

      switch (oQuestion.type) {
        case "Date":
          //Date is stored in a moment.js object - conversion required
          answerValue = "";
          if (angular.isDefined(oQuestion.answer) && oQuestion.answer !== "") {
            var useDate = "";
            if (oQuestion.validation_type === "Numeric") {
              //Grab the EPOCH from the moment object
              useDate = moment(oQuestion.answer).format('X');
            } else {
              //We have a display filter already to convert in to a string
              useDate = self.momentToDateFilter(oQuestion.answer);
            }
            answerValue = useDate;
          }
          break;
        case 'Date Range':
          //For Date Range, we can use one of our pre-defined display filters to build the output
          answerValue = self.momentToDateRangeFilter(oQuestion.answer);
          break;
        case 'Selectbox':
        case 'Radiobox':
        case 'SLARadiobox':
        case 'Custom Picker':
        case 'Option Selector - Single Select':
          answerValue = "";
          if (oQuestion.pickername === "File Attachments") {
            answerValue = self.fileFilter(oQuestion.answer);
          } else {
            //For Selectbox, Radiobox and Custom Picker we just want the KEYCOL value to be written to the request
            if (angular.isObject(oQuestion.answer) && angular.isDefined(oQuestion.answer.keycol)) {
              answerValue = oQuestion.answer.keycol;
            }
          }
          break;
        case "Checkbox":
          //For Checkbox, we already have a display filter to grab the selections - use this!
          answerValue = self.checkboxFilter(oQuestion.answer);
          break;
        case "StandardComponentRadiobox":
          answerValue = self.standardComponentFilter(oQuestion.answer);
          break;
        case "OptionalComponentCheckbox":
          answerValue = self.optionalComponentFilter(oQuestion.answer);
          break;
      }
      return answerValue;
    };

    //Take call details, populate
    self.populateOCWiz = function (intCallref, objWizDetails, objWizStages) {
      var strDefaultColumn = objWizDetails.defaulttable + '.' + objWizDetails.defaultcolumn;

      var i = 0;
      angular.forEach(objWizStages, function (oStage) {
        angular.forEach(oStage.questions, function (oQuestion) {

          var xmlmc = new XMLMCService.MethodCall();
          xmlmc.addParam("table", "itsm_oc_wiz");
          var useCol = strDefaultColumn;
          var strAnswer = self.getAnswer(oQuestion);
          if (angular.isDefined(oQuestion.targetcolumn) && oQuestion.targetcolumn !== "") {
            useCol = oQuestion.targetcolumn;
          }
          xmlmc.addData("binding", useCol);
          xmlmc.addData("fk_qid", oQuestion.pk_qid);
          xmlmc.addData("fk_wiz_stage_title", oStage.title);
          xmlmc.addData("fk_wiz_stage", oStage.pk_auto_id);
          xmlmc.addData("fk_wiz", oStage.fk_wiz);
          xmlmc.addData("question", oQuestion.question);
          xmlmc.addData("question_ans", strAnswer);
          xmlmc.addData("seq", i);
          xmlmc.addData("fk_callref", intCallref);

          xmlmc.invoke("data", "addRecord", {
            onSuccess: function (params) {
              //Do nothing!
            },
            onFailure: function (error) {
              //Output error to console
              wssLogging.logger(error, "ERROR", "WizardLogService::populateOCWiz", true, false);
            }
          });
          i++;
        });
      });
    };

    return self;
  }
})();
//# sourceMappingURL=wizard.logrequest.service.js.map