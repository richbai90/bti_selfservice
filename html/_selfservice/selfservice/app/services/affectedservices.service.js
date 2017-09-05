(function () {
	'use strict';

	angular.module('swSelfService').factory('AffectedServicesService', AffectedServicesService);

	AffectedServicesService.$inject = ['$q', 'XMLMCService', 'store', 'wssLogging'];

	function AffectedServicesService($q, XMLMCService, store, wssLogging) {
		var self = {
			'notificationsLoading': false,
			'notifDetailsSQ': 'query/wss/notifications/affectedservices.list.select',
			'notifArray': [],
			'totalNotif': 0
		};

		self.custDetails = store.get("custDetails");
		self.instanceConfig = store.get("instanceConfig");

		self.getActiveNotifications = function () {
			self.notificationsLoading = true;
			var deferred = $q.defer();
			//Work out columns.
			var currPageNum = self.pageNo;
			var notifArray = [];
			var CIIDArray = [];
			var sqparams = "ssid=" + self.instanceConfig.selfServiceInstance;
			sqparams += "&custid=" + self.custDetails.keysearch;
			sqparams += "&fk_company_id=" + self.custDetails.fk_company_id;
			sqparams += "&site=" + self.custDetails.site;
			sqparams += "&department=" + self.custDetails.department;
			sqparams += "&subdepartment=" + self.custDetails.subdepartment;
			sqparams += "&cat=" + self.category;

			self.currCountSQ = self.notifDetailsSQ;
			//--if (self.totalNotif > 0) {

			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.currCountSQ);
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function (params) {
					/* if(params.rowData)
     {
     if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' )
     {
      var intArrayLength = params.rowData.row.length;
      //obj is array
      for (var i = 0; i < intArrayLength; i++)
      {
     notifArray.push(params.rowData.row[i]);
      }
     }
     else
     {
      notifArray.push(params.rowData.row);
     }
     self.notificationsLoading = false;
     deferred.resolve(notifArray);
     }
     else
     {
     self.notificationsLoading = false;
     deferred.resolve('');
     } */
					if (params.rowData) {
						if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
							var intArrayLength = params.rowData.row.length;
							//obj is array
							for (var i = 0; i < intArrayLength; i++) {
								//-- Prevent duplicate rows in Affected Services lists
								var strCIID = params.rowData.row[i].ci_auto_id;
								if (CIIDArray.indexOf(strCIID) == -1) {
									CIIDArray.push(strCIID);
									CIIDArray.push(params.rowData.row[i]);
									notifArray.push(params.rowData.row[i]);
								}
							}
						} else {
							notifArray.push(params.rowData.row);
						}
						self.notificationsLoading = false;
						deferred.resolve(notifArray);
					} else {
						self.notificationsLoading = false;
						deferred.resolve('');
					}
				},
				onFailure: function (error) {
					wssLogging.logger(error, "ERROR", "AffectedServicesService::getActiveNotifications", false, false);
				}
			});

			return deferred.promise;
		};
		return self;
	}
})();
//# sourceMappingURL=affectedservices.service.js.map