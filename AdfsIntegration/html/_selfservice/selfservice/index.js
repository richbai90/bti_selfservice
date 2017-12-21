/* Entry point into the application */

(function () {

  requirejs(['libs/js-cookie/js-cookie'], function (Cookies) {
    $.getJSON('config/retrieve_config.php', function (ssoConfig) {
      if (ssoConfig.type === 'saml' && ssoConfig.ssoEnabled && !Cookies.get('ESPSessionState')) {
        if (location.search.match(/[?&]from_saml=/)) {
          return init();
        } else if (location.search.match(/[?&](LogoutState=)([^-]).+/)) {
          return init();
        } else {
          var url = document.createElement('a');
          url.href = ssoConfig.returnAddress;
          document.cookie = 'saml_auth=; Path=' + url.pathname + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'; // remove any saml_auth cookie currently existing
          window.location.href = (ssoConfig.serverAddress + '/sw/selfservice/' + ssoConfig.ssoAddress + '?wssinstance=' + encodeURIComponent(ssoConfig.selfServiceInstance) + '&returnto=' + encodeURIComponent(ssoConfig.returnAddress)).replace(/(http:|https:)?\/\//g, function ($0, $1) {
            return $1 ? $0 : '/';
          });
        }
      } else {
        return init();
      }
    });
  });


  function init() {
    requirejs.onError = function (err) {
      console.log(err.requireType);
      if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
      }

      throw err;
    };

    requirejs.config({
      //By default load any module IDs from js/lib
      baseUrl: 'app',
      //except, if the module ID starts with "app",
      //load it from the js/app directory. paths
      //config is relative to the baseUrl, and
      //never includes a ".js" extension since
      //the paths config could be for a directory.
      paths: {
        lib: '../lib'
      }
    });

    requirejs(["app/app.js"], function () {
      requirejs([
          /* LOAD SERVICES */
          "app/services/wss.logging.service.js",
          "app/services/wss.helpers.service.js",
          "app/services/session.service.js",
          "app/services/requests.service.js",
          "app/services/requests.list.service.js",
          "app/services/request.details.service.js",
          "app/services/request.interact.service.js",
          "app/services/services.service.js",
          "app/services/services.details.service.js",
          "app/services/services.category.service.js",
          "app/services/wizard.data.service.js",
          "app/services/wizard.filter.service.js",
          "app/services/wizard.logrequest.service.js",
          "app/services/wizard.logrequest.helpers.service.js",
          "app/services/notifications.service.js",
          "app/services/profile.service.js",
          "app/services/knowledge.service.js",
          "app/services/affectedservices.service.js",
          "app/services/global.search.service.js",
          "app/services/requestnotif.service.js",
          "app/services/shortcuts.service.js",

          /* LOAD ANGULAR CONTROLLERS */
          "app/controllers/login.ctrl.js",
          "app/controllers/password.ctrl.js",
          "app/controllers/login.manual.ctrl.js",
          "app/controllers/login.sso.ctrl.js",
          "app/controllers/navbar.ctrl.js",
          "app/controllers/dashboard.ctrl.js",
          "app/controllers/request.list.ctrl.js",
          "app/controllers/request.list.auth.ctrl.js",
          "app/controllers/request.details.ctrl.js",
          "app/controllers/service.list.ctrl.js",
          "app/controllers/service.details.ctrl.js",
          "app/controllers/modal.tree.ctrl.js",
          "app/controllers/wizard.ctrl.js",
          "app/controllers/modal.cipicker.ctrl.js",
          "app/controllers/admin.table.ctrl.js",
          "app/controllers/notifications.list.ctrl.js",
          "app/controllers/profile.ctrl.js",
          "app/controllers/knowledge.ctrl.js",
          "app/controllers/affectedservices.list.ctrl.js",
          "app/controllers/global.search.ctrl.js",
          "app/controllers/requestnotif.list.ctrl.js",
          "app/controllers/login.saml.ctrl.js",

          /* LOAD ANGULAR DIRECTIVES */
          "app/directives/navbar/wss-navbar.dir.js",
          "app/directives/wss-page-header/wss-page-header.dir.js",
          "app/directives/wss-request-header/wss-request-header.dir.js",
          "app/directives/sw-spinner/sw-spinner.dir.js",
          "app/directives/request-list/request-list.dir.js",
          "app/directives/request-list/request-list.auth.dir.js",
          "app/directives/auto-grow/auto-grow.dir.js",
          "app/directives/wizard/wizard.dir.js",
          "app/directives/wizard/wizard.stage.dir.js",
          "app/directives/wizard/wizard.question.dir.js",
          "app/directives/focus-element/focus-element.dir.js",
          "app/directives/bti-service-display/bti-service-display.dir.js",
          "app/directives/expand/expand.dir.js",
          "app/directives/on-finish-render/onFinishRender.dir.js",
          "app/directives/bti-tree-selector/bti-tree-selector-2.js",
          "app/directives/bti-bread-crumbs/bti-bread-crumbs.js",

          /* LOAD CUSTOM FILTERS */
          "app/filters/picker.fltr.js",
          "app/filters/requests.fltr.js",
          "app/filters/ci.fltr.js",
          "app/filters/notifications.fltr.js",

          /* LOAD ADDITIONAL JS */
          "app/additional-js.js",],
        function () {
          angular.bootstrap(document, ['swSelfService']);
        })
    })

  }
})();

