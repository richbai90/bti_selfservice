(function () {
    'use strict';
    angular
        .module('swSelfService')
        .directive('swNavbar',swNavbarDirective);
    function swNavbarDirective()
    {
      return {
        restrict: 'A',
        templateUrl: 'app/directives/navbar/wss-navbar.tpl.html',
        controller: 'NavBarController'
      };
    }
})();
