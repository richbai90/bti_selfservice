(function () {
    'use strict';

    angular.module('swSelfService').factory('GlobalSearchService', GlobalSearchService);

    GlobalSearchService.$inject = [];

    function GlobalSearchService() {
        var self = {
            globalSearchString: '',
            knowledgeResults: [],
            serviceResults: [],
            requestResults: []
        };

        return self;
    }
})();
//# sourceMappingURL=global.search.service.js.map