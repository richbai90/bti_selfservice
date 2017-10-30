'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').directive('btiTreeTranscluder', function () {
    return {
      link: function link(scope, el, attr, ctrl, transclude) {
        transclude(function (clone) {
          clone.attr('type', 'hidden');
          el.append(clone);
        });
      }
    };
  });
})();
//# sourceMappingURL=bti-tree-transcluder.dir.js.map