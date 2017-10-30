'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').controller('GlobalSearchCtrl', GlobalSearchCtrl);
  GlobalSearchCtrl.$inject = ['$scope', 'SWSessionService', 'KnowledgeService', 'ProfileService', 'ServicesService', 'RequestListService', '$state', 'GlobalSearchService'];
  function GlobalSearchCtrl($scope, SWSessionService, KnowledgeService, ProfileService, ServicesService, RequestListService, $state, GlobalSearchService) {
    $scope.searchService = GlobalSearchService;
    $scope.knowledge = KnowledgeService;
    $scope.profile = ProfileService;
    $scope.custServices = ServicesService;
    $scope.custRequests = RequestListService;

    $scope.globalSearchString = "";
    $scope.searchService.kbResults = [];

    //KB Search Params Setup
    $scope.searchService.searchingKB = false;
    $scope.kbSearchCriteria = {};
    $scope.kbSearchCriteria.searchType = 2;
    $scope.kbSearchCriteria.maxResults = 100;
    $scope.kbSearchCriteria.searchOptions = [];
    $scope.kbSearchCriteria.searchOptions.title = true;
    $scope.kbSearchCriteria.searchOptions.keywords = true;
    $scope.kbSearchCriteria.searchOptions.problem = true;
    $scope.kbSearchCriteria.searchOptions.solution = true;
    $scope.kbSearchCriteria.searchOptions.catalog = "";

    $scope.doSearch = function () {
      SWSessionService.checkActiveSession().then(function () {
        //Switch to global search state
        $state.go("globalsearch");

        //Do KB Search First
        $scope.doKBSearch();
        //Now do Service Search
        $scope.doServiceSearch();
        //Now do Request Search
        $scope.doRequestSearch();
      });
    };

    $scope.doKBSearch = function () {
      $scope.searchService.searchingKB = true;
      $scope.kbSearchCriteria.searchString = $scope.searchService.globalSearchString;
      $scope.knowledge.searchKB($scope.kbSearchCriteria, false).then(function (kbArticleArray) {
        $scope.searchService.knowledgeResults = kbArticleArray;
        $scope.searchService.searchingKB = false;
      });
    };

    $scope.doServiceSearch = function () {
      $scope.custServices.listType = 'cust';
      $scope.custServices.search = GlobalSearchService.globalSearchString;
      $scope.custServices.getPagedServices();
    };

    $scope.doRequestSearch = function () {
      $scope.custRequests.requestPage = 'cust';
      $scope.custRequests.callStatus = 'all';
      $scope.custRequests.search = GlobalSearchService.globalSearchString;
      $scope.custRequests.pageNo = 1;
      $scope.custRequests.getPagedRequests();
    };

    //Watch for logout broadcast to clean up session-specific data ready for a new user
    $scope.$on('logout', function () {
      $scope.knowledge = {};
    });
  }
})();
//# sourceMappingURL=global.search.ctrl.js.map