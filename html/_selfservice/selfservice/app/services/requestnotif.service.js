(function () {
	'use strict';

	angular.module('swSelfService').factory('RequestNotifService', RequestNotifService);

	RequestNotifService.$inject = ['$q', 'XMLMCService', 'store', 'wssLogging'];

	function RequestNotifService($q, XMLMCService, store, wssLogging) {
		var self = {
			'notificationsLoading': false,
			'notifDetailsSQ': 'query/wss/notifications/requestnotif.list.select',
			'notifArray': [],
			'totalNotif': 0
		};

		self.getActiveNotifications = function () {
			self.custDetails = store.get("custDetails");
			self.instanceConfig = store.get("instanceConfig");
			self.notificationsLoading = true;
			var deferred = $q.defer();
			//Work out columns.
			var currPageNum = self.pageNo;
			var notifArray = [];
			var sqparams = "ssid=" + self.instanceConfig.selfServiceInstance;
			sqparams += "&custid=" + self.custDetails.keysearch;
			sqparams += "&cat=" + self.category;

			self.currCountSQ = self.notifDetailsSQ;
			//--if (self.totalNotif > 0) {

			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.currCountSQ);
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function (params) {
					if (params.rowData) {
						if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
							var intArrayLength = params.rowData.row.length;
							//obj is array
							for (var i = 0; i < intArrayLength; i++) {
								notifArray.push(params.rowData.row[i]);
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
					wssLogging.logger(error, "ERROR", "RequestNotifService::getActiveNotifications", false, false);
				}
			});

			return deferred.promise;
		};
		return self;
	}
})();
//# sourceMappingURL=requestnotif.service.js.map