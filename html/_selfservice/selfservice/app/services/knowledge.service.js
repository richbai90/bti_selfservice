'use strict';

(function () {
	'use strict';

	angular.module('swSelfService').factory('KnowledgeService', KnowledgeService);

	KnowledgeService.$inject = ['$q', 'XMLMCService', 'store', 'wssLogging'];

	function KnowledgeService($q, XMLMCService, store, wssLogging) {
		var self = {
			'getDefSrchSettings': 'query/wss/knowledge/def.search.settings.select',
			'getRelatedTypesSQ': 'query/wss/knowledge/related.types.select',
			'getRelatedArticlesSQ': 'query/wss/knowledge/related.kbarticles.select',
			'getProfileInfoSQ': 'query/wss/knowledge/profile.info.select'

		};

		self.custDetails = store.get("custDetails");
		self.instanceConfig = store.get("instanceConfig");

		self.searchKB = function (searchCriteriaObj, boolSendToast) {
			var deferred = $q.defer();
			var xmlmc = new XMLMCService.MethodCall();
			var searchOperation;

			if (searchCriteriaObj.searchType == 1) {
				//-- Natural language query (ask a question)...
				searchOperation = "queryNatural";
				xmlmc.addParam("queryString", searchCriteriaObj.searchString);

				//-- Check if a catalog has been selected
				if (angular.isDefined(searchCriteriaObj.catalog) && searchCriteriaObj.catalog !== "" && searchCriteriaObj.catalog !== null) {
					xmlmc.addParam("catalogId", searchCriteriaObj.catalog.catalogId);
				}
			} else {
				searchOperation = "queryKeyword";
				xmlmc.addParam("queryString", searchCriteriaObj.searchString);

				//-- Check if a catalog has been selected
				if (angular.isDefined(searchCriteriaObj.catalog) && searchCriteriaObj.catalog !== "" && searchCriteriaObj.catalog !== null) {
					xmlmc.addParam("catalogId", searchCriteriaObj.catalog.catalogId);
				}

				if (searchCriteriaObj.searchType == 2) {
					//-- Word Search (any words can match)
					xmlmc.addParam("queryType", "any");
				} else {
					//-- Word Search (all words must match)
					xmlmc.addParam("queryType", "all");
				}
				xmlmc.addParam("searchTitle", searchCriteriaObj.searchOptions.title);
				xmlmc.addParam("searchKeywords", searchCriteriaObj.searchOptions.keywords);
				xmlmc.addParam("searchProblem", searchCriteriaObj.searchOptions.problem);
				xmlmc.addParam("searchSolution", searchCriteriaObj.searchOptions.solution);
			}

			xmlmc.addParam("maxResults", searchCriteriaObj.maxResults);

			xmlmc.invoke("knowledgebase", searchOperation, {
				onSuccess: function onSuccess(results) {
					if (!angular.isDefined(results)) {
						if (boolSendToast) {
							wssLogging.sendToast('warning', 'No knowledgebase documents match your criteria!');
						}
						deferred.resolve('');
					} else {
						var kbArticleArray = [];
						if (Object.prototype.toString.call(results.document) === '[object Array]') {
							//-- Multiple articles found
							var resultsArray = results.document;
							for (var resultCnt = 0; resultCnt < resultsArray.length; resultCnt++) {
								//-- Check article is visible to the public
								if (resultsArray[resultCnt].docflags == "1") {
									kbArticleArray.push(resultsArray[resultCnt]);
								}
							}
						} else {
							//-- 1 article found
							var result = results.document;

							//-- Check article is visible to the public
							if (result.docflags == "1") {
								kbArticleArray.push(result);
							}
						}
						if (kbArticleArray.length === 0) {
							if (boolSendToast) {
								wssLogging.sendToast('warning', 'No knowledgebase documents match your criteria!');
							}
							deferred.resolve('');
						} else {
							deferred.resolve(kbArticleArray);
						}
					}
				},
				onFailure: function onFailure(error) {
					deferred.resolve('');
					wssLogging.logger(error, "ERROR", "KnowledgeService::searchKB", false, false);
				}
			});
			return deferred.promise;
		};

		self.getArticleDetails = function (strDocRef) {
			var deferred = $q.defer();
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("docRef", strDocRef);
			xmlmc.invoke("knowledgebase", "documentGetInfo", {
				onSuccess: function onSuccess(params) {
					deferred.resolve(params);
				},
				onFailure: function onFailure(error) {
					deferred.resolve('');
					wssLogging.logger(error, "ERROR", "KnowledgeService::getArticleDetails", false, false);
				}
			});
			return deferred.promise;
		};

		self.getDocumentURL = function (strDocRef) {
			var deferred = $q.defer();
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("docRef", strDocRef);
			xmlmc.invoke("knowledgebase", "documentGetUrl", {
				onSuccess: function onSuccess(res) {
					deferred.resolve(res.url);
				},
				onFailure: function onFailure(error) {
					deferred.resolve('');
					wssLogging.logger(error, "ERROR", "KnowledgeService::getDocumentURL", false, false);
				}
			});
			return deferred.promise;
		};

		self.getKBCatList = function () {
			var deferred = $q.defer();
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.invoke("knowledgebase", "catalogList", {
				onSuccess: function onSuccess(params) {
					deferred.resolve(params.folder);
				},
				onFailure: function onFailure(error) {
					deferred.resolve('');
					wssLogging.logger(error, "ERROR", "KnowledgeService::getKBCatList", false, false);
				}
			});
			return deferred.promise;
		};

		self.getRelatedArticles = function (strDocRef) {
			var deferred = $q.defer();
			var arrRelatedArticles = [];
			var xmlmc = new XMLMCService.MethodCall();
			var sqparams = "docRef=" + strDocRef;
			xmlmc.addParam("storedQuery", self.getRelatedArticlesSQ);
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function onSuccess(params) {
					if (params.rowData) {
						if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
							var rowArray = params.rowData.row;
							for (var rowKey = 0; rowKey < rowArray.length; rowKey++) {
								arrRelatedArticles.push(rowArray[rowKey]);
							}
						} else {
							var row = params.rowData.row;
							arrRelatedArticles.push(row);
						}
						deferred.resolve(arrRelatedArticles);
					} else {
						deferred.resolve('');
					}
				},
				onFailure: function onFailure(error) {
					deferred.resolve('');
					wssLogging.logger(error, "ERROR", "KnowledgeService::getRelatedArticles", false, false);
				}
			});
			return deferred.promise;
		};

		self.getRelatedTypes = function (strDocRef) {
			var deferred = $q.defer();
			var arrRelatedTypes = [];
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.getRelatedTypesSQ);
			var sqparams = "docRef=" + strDocRef;
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function onSuccess(params) {
					if (params.rowData) {
						var strRelatedTypes = "";
						if (Object.prototype.toString.call(params.rowData.row) === '[object Array]') {
							var rowArray = params.rowData.row;
							angular.forEach(rowArray, function (row, key) {
								if (strRelatedTypes !== "") {
									strRelatedTypes += ", ";
								}
								strRelatedTypes += row.type_display;
							});
						} else {
							var row = params.rowData.row;
							strRelatedTypes = row.type_display;
						}
						deferred.resolve(strRelatedTypes);
					} else {
						deferred.resolve('');
					}
				},
				onFailure: function onFailure(error) {
					deferred.resolve('');
					wssLogging.logger(error, "ERROR", "KnowledgeService::getRelatedTypes", false, false);
				}
			});
			return deferred.promise;
		};

		self.getDefaultSearchSettings = function () {
			var deferred = $q.defer();
			var objSettings = [];
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.getDefSrchSettings);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function onSuccess(params) {
					if (params.rowData.row.length != 4) {
						wssLogging.sendToast('error', 'Error loading system settings. Please contact your Supportworks Administrator');
						wssLogging.logger("Wrong number of system settings.", "ERROR", "KnowledgeService::getDefaultSearchSettings", false, false);
						deferred.resolve('');
					} else {
						//-- Stored query returns ordered list of the 4 "KNOWLEDGEBASE.SELFSERVICE" system settings
						var arrSettings = params.rowData.row;

						//-- Sort out "string booleans"
						var boolChangeCat;
						if (arrSettings[0].setting_value == "True") {
							boolChangeCat = true;
						} else {
							boolChangeCat = false;
						}

						var boolChangeType;
						if (arrSettings[1].setting_value == "True") {
							boolChangeType = true;
						} else {
							boolChangeType = false;
						}

						objSettings = { boolChangeCat: boolChangeCat,
							boolChangeType: boolChangeType,
							catalogName: arrSettings[2].setting_value,
							searchType: arrSettings[3].setting_value };

						deferred.resolve(objSettings);
					}
				},
				onFailure: function onFailure(error) {
					deferred.resolve('');
					wssLogging.logger(error, "ERROR", "KnowledgeService::getDefaultSearchSettings", false, false);
				}
			});

			return deferred.promise;
		};

		self.incrementAccessCounter = function (strDocRef) {
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("docRef", strDocRef);
			xmlmc.invoke("knowledgebase", "documentIncreaseAccessCounter", {
				onSuccess: function onSuccess() {
					//-- successfully incremneted access counter
				},
				onFailure: function onFailure(error) {
					wssLogging.logger(error, "ERROR", "KnowledgeService::incrementAccessCounter", false, false);
				}
			});
		};

		self.getProfileInfo = function (strCode) {
			var deferred = $q.defer();
			var strInfo;
			var xmlmc = new XMLMCService.MethodCall();
			xmlmc.addParam("storedQuery", self.getProfileInfoSQ);
			var sqparams = "pCode=" + strCode;
			xmlmc.addParam("parameters", sqparams);
			xmlmc.invoke("data", "invokeStoredQuery", {
				onSuccess: function onSuccess(params) {
					if (params.rowData) {
						strInfo = params.rowData.row.info;
						deferred.resolve(strInfo);
					} else {
						deferred.resolve('');
						wssLogging.logger("Profile Info Not Found", "ERROR", "KnowledgeService::getProfileInfo", false, false);
					}
				},
				onFailure: function onFailure(error) {
					deferred.resolve('');
					wssLogging.logger(error, "ERROR", "KnowledgeService::getProfileInfo", false, false);
				}
			});

			return deferred.promise;
		};

		return self;
	}
})();
//# sourceMappingURL=knowledge.service.js.map