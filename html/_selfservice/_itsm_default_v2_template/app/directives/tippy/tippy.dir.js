/**
 * An Angular Wrapper for the Tippy library
 * Created by Rich Gordon
 *
 * <button tippy="I'm a button!!" /> || <button title="I'm a button" tippy />
 */

(function () {
  'use strict';
  angular
    .module('swSelfService')
    .directive('tippy', _tippy);

  function _tippy() {
    return {
      restrict: 'A',
      scope: {
        tippy: '@',
        title: '@'
      },
      link: function (scope, elem, attrs) {
        const contents = scope.tippy || scope.title || '';
        if (contents !== '') {
          const tooltip = angular.element('<div>' + contents + '</div>');
          tippy(elem[0], { html: tooltip[0] });
          if (scope.title && scope.title !== '') {
            elem.mouseover(() => {
              elem.attr('title', '');
            });

            elem.mouseleave(() => {
              elem.attr('title', scope.title);
            })
          }
        }
      }
    }
  }
})();
