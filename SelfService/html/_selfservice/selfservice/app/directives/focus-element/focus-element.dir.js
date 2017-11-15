'use strict';

(function () {
    'use strict';

    angular.module('swSelfService').directive('focusElement', function ($timeout) {
        return {
            restrict: 'A',
            link: function link(_scope, _element) {
                $timeout(function () {
                    _element[0].focus();
                }, 0);
            }
        };
    });
})();
//# sourceMappingURL=focus-element.dir.js.map