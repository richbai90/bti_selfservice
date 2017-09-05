(function () {
	'use strict';

	angular.module('swSelfService').factory('ProfileService', ProfileService);

	ProfileService.$inject = ['$q', 'XMLMCService', 'store', 'wssLogging'];

	function ProfileService($q, XMLMCService, store, wssLogging) {
		var self = {
			'notificationsLoading': false,
			'getProfileDetailsSQ': 'query/wss/profile/profile.details.select',
			'getCustCIsSQ': 'query/wss/profile/profile.cis.select',
			'getKBCatsSQ': 'query/wss/profile/profile.kb.cats.select',
			'getKBSubsSQ': 'query/wss/profile/profile.kb.subs.select',
			'userObj': []
		};

		self.getProfileDetails = function () {
			self.custDetails = store.get("custDetails");
			self.instanceConfig = store.get("instanceConfig");

			var deferred = $q.defer();
			var userObj = [];
			var sqparams = "custid=" + self.custDetails.keysearch;
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.getProfileDetailsSQ);
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function (params) {
					if (params.rowData) {
						userObj = params.rowData.row;
						deferred.resolve(userObj);
					} else {
						deferred.resolve('');
					}
				},
				onFailure: function (error) {
					wssLogging.logger(error, "ERROR", "ProfileService::getProfileDetails", false, false);
				}
			});

			return deferred.promise;
		};

		//-- Updates customer profile with details from passed in user object 
		self.updateProfileDetails = function (user) {
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("table", "userdb");
			xmlmc.addData("keysearch", self.custDetails.keysearch);
			xmlmc.addData("firstname", user.firstname);
			xmlmc.addData("surname", user.surname);
			xmlmc.addData("email", user.email);
			xmlmc.addData("mobiletel", user.mobiletel);
			xmlmc.addData("location", user.location);
			xmlmc.invoke("data", "updateRecord", {
				onSuccess: function (params) {
					if (params.rowsEffected === "0") {
						//-- Nothing updated, so don't send toast
					} else {
						wssLogging.sendToast('success', 'Profile updated successfully!');
					}
				},
				onFailure: function (error) {
					wssLogging.logger(error, "ERROR", "ProfileService::updateProfileDetails", false, false);
				}
			});
		};

		//-- Adds customer knowledgbase subscription for passed in category
		self.addCustSub = function (category) {
			var xmlmc = new XMLMCService.MethodCall();

			xmlmc.addParam("table", "userdb_kbnotif");

			xmlmc.addData("fk_keysearch", self.custDetails.keysearch);
			xmlmc.addData("fk_cat_id", category.id);
			xmlmc.addData("fk_cat_name", category.name);

			xmlmc.invoke("data", "addRecord", {
				onSuccess: function (params) {
					wssLogging.sendToast('success', 'Knowledge Base subscriptions updated successfully!');
				},
				onFailure: function (error) {
					wssLogging.logger(error, "ERROR", "ProfileService::addCustSub", false, false);
				}
			});
		};

		//-- Removes customer knowledgbase subscription with the passed in ID
		self.removeCustSub = function (id) {
			var xmlmc = new XMLMCService.MethodCall();

			xmlmc.addParam("table", "userdb_kbnotif");
			xmlmc.addParam("keyValue", id);
			xmlmc.invoke("data", "deleteRecord", {
				onSuccess: function (params) {
					wssLogging.sendToast('success', 'Knowledge Base subscriptions updated successfully!');
				},
				onFailure: function (error) {
					wssLogging.logger(error, "ERROR", "ProfileService::removeCustSub", false, false);
				}
			});
		};

		//-- Updates customer Knowledge base subscriptions
		self.updateCustSubs = function (catArray) {
			angular.forEach(catArray, function (category) {
				//-- For each potential subscription get the subscription ID
				self.getKBSubKey(category.id).then(function (key) {
					//-- If subscription does not exist...
					if (key == "") {
						//-- ...and a subscription is required...
						if (category.subscribed) {
							//-- ...add subscription
							self.addCustSub(category);
						}
					} else {
						//-- If subscription exists and subscription not required...
						if (!category.subscribed) {
							//-- ...delete subscription
							self.removeCustSub(key);
						}
					}
				});
			});
		};

		//-- Returns array of CI's owned by customer
		self.getCustCIs = function () {
			var deferred = $q.defer();
			var ciArray = [];
			var sqparams = "custid=" + self.custDetails.keysearch;
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.getCustCIsSQ);
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function (params) {
					if (params.rowData) {
						if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
							var intArrayLength = params.rowData.row.length;
							//obj is array
							for (var i = 0; i < intArrayLength; i++) {
								ciArray.push(params.rowData.row[i]);
							}
						} else {
							ciArray.push(params.rowData.row);
						}
						deferred.resolve(ciArray);
					} else {
						deferred.resolve('');
					}
				},
				onFailure: function (error) {
					wssLogging.logger(error, "ERROR", "ProfileService::getCustCIs", false, false);
				}
			});

			return deferred.promise;
		};

		//-- Returns an array containing all knowledgbase catalogs (name and ID) 
		self.getKBCatalogs = function () {
			var deferred = $q.defer();
			var kbCatsArray = [];
			var sqparams = "custid=" + self.custDetails.keysearch;
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.getKBCatsSQ);
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function (params) {
					if (params.rowData) {
						if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
							var rowArray = params.rowData.row;
							for (var row = 0; row < rowArray.length; row++) {
								kbCatsArray.push(rowArray[row]);
							}
						} else {
							var row = params.rowData.row;
							kbCatsArray.push(row);
						}
						deferred.resolve(kbCatsArray);
					} else {
						deferred.resolve('');
					}
				},
				onFailure: function (error) {
					wssLogging.logger(error, "ERROR", "ProfileService::getKBCatalogs", false, false);
				}
			});

			return deferred.promise;
		};

		//-- Returns an array of catalog IDs customer is subscribed to
		self.getKBSubsCatIDs = function () {
			var deferred = $q.defer();
			var kbSubsCatIDArray = [];
			var sqparams = "custid=" + self.custDetails.keysearch;
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.getKBSubsSQ);
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function (params) {
					if (params.rowData) {
						if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
							var rowArray = params.rowData.row;
							for (var row = 0; row < rowArray.length; row++) {
								kbSubsCatIDArray.push(rowArray[row].fk_cat_id);
							}
						} else {
							var row = params.rowData.row;
							kbSubsCatIDArray.push(row.fk_cat_id);
						}
						deferred.resolve(kbSubsCatIDArray);
					} else {
						deferred.resolve('');
					}
				},
				onFailure: function (error) {
					wssLogging.logger(error, "ERROR", "ProfileService::getKBSubsCatIDs", false, false);
				}
			});

			return deferred.promise;
		};

		//-- Returns the primary key of of the customer subscription record for the passed in category ID
		self.getKBSubKey = function (catID) {
			var deferred = $q.defer();
			var kbSubsCatIDArray = [];
			var sqparams = "custid=" + self.custDetails.keysearch;
			sqparams += "&catid=" + catID;
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.getKBSubsSQ);
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function (params) {
					if (params.rowData) {
						var key = params.rowData.row.pk_auto_id;
						deferred.resolve(key);
					} else {
						deferred.resolve('');
					}
				},
				onFailure: function (error) {
					wssLogging.logger(error, "ERROR", "ProfileService::getKBSubKey", false, false);
				}
			});

			return deferred.promise;
		};

		return self;
	}
})();
//# sourceMappingURL=profile.service.js.map