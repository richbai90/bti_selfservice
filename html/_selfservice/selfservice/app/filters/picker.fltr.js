(function () {
    'use strict';

    //Filter Picker - takes filter variable, passes it back to filter

    angular.module('swSelfService').filter('picker', function ($filter) {
        return function (value, filterName) {
            return $filter(filterName)(value);
        };
    });
})();
//# sourceMappingURL=picker.fltr.js.map