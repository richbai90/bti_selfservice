(function () {
	'use strict';

	angular.module('swSelfService').controller('KnowledgeCtrl', KnowledgeCtrl);
	KnowledgeCtrl.$inject = ['$scope', 'SWSessionService', 'KnowledgeService', '$stateParams'];
	function KnowledgeCtrl($scope, SWSessionService, KnowledgeService, $stateParams) {
		$scope.knowledge = KnowledgeService;

		$scope.searchTypes = [{ display: "Natural language query (ask a question)", value: 1 }, { display: "Word search (any words can match)", value: 2 }, { display: "Word search (all words must match)", value: 3 }];

		$scope.searchCriteria = {};
		$scope.searchCriteria.maxResults = $stateParams.maxResults;
		$scope.searchCriteria.searchString = $stateParams.searchString;
		$scope.searchCriteria.searchOptions = [];
		$scope.searchCriteria.searchOptions.title = $stateParams.title;
		$scope.searchCriteria.searchOptions.keywords = $stateParams.keywords;
		$scope.searchCriteria.searchOptions.problem = $stateParams.problem;
		$scope.searchCriteria.searchOptions.solution = $stateParams.solution;
		$scope.searchResults = $stateParams.searchResults;
		$scope.showSearchStringAlert = false;

		$scope.knowledge.getKBCatList().then(function (kbcats) {
			$scope.kbcats = kbcats;
			$scope.knowledge.getDefaultSearchSettings().then(function (settings) {
				//-- This exposes to the template the booleans from System Settings.
				$scope.systemSettings = settings;

				if ($stateParams.boolLoadDefaultSearchSettings) {
					//-- Use default search settings from system settings
					$scope.setSrchCatFrmSysSetting();
					$scope.setSrchTypeFrmSysSetting();
				} else {
					//-- Use passed in search settings (if we are going back to search)
					$scope.searchCriteria.searchType = $stateParams.searchType;
					$scope.searchCriteria.catalog = $stateParams.catalog;
				}
			});
		});

		//-- Function to determine if "search section" is valid.
		//-- (At lease 1 search option must be selected if we are using a "word search")
		$scope.searchSectionValid = function () {
			if ($scope.searchCriteria.searchType != 1) {
				if (!$scope.someSelected($scope.searchCriteria.searchOptions)) {
					return false;
				}
			}
			return true;
		};

		//-- Function used to determine if at least 1 element of passed in object is set to true
		$scope.someSelected = function (object) {
			return Object.keys(object).some(function (key) {
				return object[key];
			});
		};

		$scope.setSrchTypeFrmSysSetting = function () {
			//-- Set search type based on system setting
			switch ($scope.systemSettings.searchType) {
				case "Natural language query (ask a question)":
					$scope.searchCriteria.searchType = 1;
					break;
				case "Word Search (any words can match)":
					$scope.searchCriteria.searchType = 2;
					break;
				case "Word Search (all words must match)":
					$scope.searchCriteria.searchType = 3;
					break;
				default:
					$scope.searchCriteria.searchType = 1;
			}
		};

		$scope.setSrchCatFrmSysSetting = function () {
			//-- Set catalog name based on system setting
			angular.forEach($scope.kbcats, function (kbcat, key) {
				if (kbcat.name == $scope.systemSettings.catalogName) {
					$scope.searchCriteria.catalog = kbcat;
				}
			});
		};

		$scope.submitKBSearch = function () {
			SWSessionService.checkActiveSession().then(function () {
				if ($scope.searchSectionValid()) {
					//-- Check that a search string has been entered
					if ($scope.searchCriteria.searchString !== "") {
						if ($scope.searchCriteria.maxResults <= 500 && $scope.searchCriteria.maxResults > 0) {
							$scope.knowledge.searchKB($scope.searchCriteria, true).then(function (kbArticleArray) {
								$scope.searchResults = kbArticleArray;
							});
						}
					} else {
						//-- if no search string entered...
						$scope.showSearchStringAlert = true;
					}
				}
			});
		};

		$scope.getExternalDocPath = function () {
			$scope.knowledge.getArticleDetails($stateParams.kbRef).then(function (articleDetails) {
				var externalUrl = "http://" + $location.host() + "/sw/kb/" + articleDetails.docPath;
				return externalUrl;
			});
		};

		$scope.resetSearchCriteria = function () {
			$scope.setSrchCatFrmSysSetting();
			$scope.setSrchTypeFrmSysSetting();
			$scope.searchCriteria.searchOptions.title = true;
			$scope.searchCriteria.searchOptions.keywords = true;
			$scope.searchCriteria.searchOptions.problem = true;
			$scope.searchCriteria.searchOptions.solution = true;
			$scope.searchCriteria.maxResults = 100;
			$scope.searchCriteria.searchString = "";
			$scope.searchResults = [];
			$scope.showSearchStringAlert = false;
		};

		//Watch for logout broadcast to clean up session-specific data ready for a new user
		$scope.$on('logout', function () {
			$scope.knowledge = {};
		});
	}

	angular.module('swSelfService').controller('KBArticleController', KBArticleController);
	KBArticleController.$inject = ['$scope', '$rootScope', 'SWSessionService', 'KnowledgeService', '$stateParams', '$window', '$location', '$state'];
	function KBArticleController($scope, $rootScope, SWSessionService, KnowledgeService, $stateParams, $window, $location, $state) {

		$scope.knowledge = KnowledgeService;

		SWSessionService.checkActiveSession().then(function () {
			$scope.loadArticleDetails($stateParams.kbRef);
		});

		$scope.loadArticleDetails = function (kbRef) {
			$scope.knowledge.getArticleDetails(kbRef).then(function (articleDetails) {
				$scope.incrementAccessCounter();
				//-- Check if docPath is defined to determine if document is Internal or External
				if (angular.isDefined(articleDetails.docPath)) {
					$scope.boolExternal = true;
					var externalUrl = "http://" + $location.host() + "/sw/kb/" + articleDetails.docPath;

					//-- Open external doxument in new window
					$window.open(externalUrl);

					//-- Return to search results in old window
					$scope.goBackToSearchPage();
				} else {
					$scope.boolExternal = false;

					//-- Internal document, so expose article details to template
					$scope.article = articleDetails;
					$scope.getRelatedArticles(kbRef);
					$scope.getRelatedTypes(kbRef);
					$scope.getProfileInfo(articleDetails.callProbCode);
				}
			});
		};

		$scope.getProfileInfo = function (strCode) {
			$scope.knowledge.getProfileInfo(strCode).then(function (strInfo) {
				$scope.profileInfo = strInfo;
			});
		};

		$scope.getRelatedArticles = function (kbRef) {
			$scope.knowledge.getRelatedArticles(kbRef).then(function (articleList) {
				$scope.arrRelatedArticles = articleList;
			});
		};

		$scope.getRelatedTypes = function (kbRef) {
			$scope.knowledge.getRelatedTypes(kbRef).then(function (typesString) {
				$scope.strRelatedTypes = typesString;
			});
		};

		$scope.incrementAccessCounter = function () {
			$scope.knowledge.incrementAccessCounter($stateParams.kbRef);
		};

		$scope.goToRelatedArticle = function (docRef) {
			//-- Go to new article but don't trigger state reload (basically just updates URL)
			$state.go('kbarticle', { kbRef: docRef }, {
				notify: false
			});
			//-- Load new article details without changing state
			$scope.loadArticleDetails(docRef);
		};

		$scope.goBackToSearchPage = function () {
			if (angular.isDefined($rootScope.fromStateName) && $rootScope.fromStateName === 'globalsearch') {
				$state.go("globalsearch");
			} else {
				var sc = $stateParams.searchCriteria;
				var so = $stateParams.searchOptions;

				$state.go("knowledge", { searchType: sc.searchType,
					searchString: sc.searchString,
					catalog: sc.catalog,
					keywords: so.keywords,
					title: so.title,
					problem: so.problem,
					solution: so.solution,
					maxResults: sc.maxResults,
					searchResults: $stateParams.searchResults,
					boolLoadDefaultSearchSettings: $stateParams.boolLoadDefaultSearchSettings });
			}
		};

		//Watch for logout broadcast to clean up session-specific data ready for a new user
		$scope.$on('logout', function () {
			$scope.knowledge = {};
		});
	}
})();
//# sourceMappingURL=knowledge.ctrl.js.map