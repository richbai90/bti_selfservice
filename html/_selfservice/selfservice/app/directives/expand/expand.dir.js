'use strict';

(function () {

  angular.module('swSelfService').directive('expand', ['Resize', function (Resize) {
    return {
      link: function link(scope, elem, attr) {

        new Resize(elem, function () {

          var h = 0;
          [].slice.call(elem.children()).forEach(function (e) {
            h += $(e).height();
          });
          elem.css('max-height', h + 'px');
        });
      }
    };
  }]);
})();
//# sourceMappingURL=expand.dir.js.map