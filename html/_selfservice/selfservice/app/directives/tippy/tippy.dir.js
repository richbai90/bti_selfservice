/**
 * An Angular Wrapper for the Tippy library
 * Created by Rich Gordon
 *
 * <button tippy="I'm a button!!" /> || <button title="I'm a button" tippy />
 */

(function () {
  'use strict';

  angular.module('swSelfService').directive('tippy', _tippy);

  function _tippy() {
    return {
      restrict: 'A',
      scope: {
        tippy: '@',
        title: '@'
      },
      link: function (scope, elem, attrs) {
        var contents = scope.tippy || scope.title || '';
        if (contents !== '') {
          var tooltip = angular.element('<div>' + contents + '</div>');
          tippy(elem[0], { html: tooltip[0] });
        }
      }
    };
  }
})();
//# sourceMappingURL=tippy.dir.js.map