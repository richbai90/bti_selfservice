(() => {
  'use strict';
  angular
    .module('swSelfService')
    .directive('btiTreeTranscluder', () => ({
          link(scope, el, attr, ctrl, transclude) {
            transclude(clone => {
              clone.attr('type', 'hidden');
              el.append(clone);
            });
          }
        }
      )
    );

})();
