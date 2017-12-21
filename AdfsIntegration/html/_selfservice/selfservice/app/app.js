'use strict';


(function () {

  'use strict';
  var dependencies = ['angular-storage', 'ngSanitize', 'ui.router', 'ngCookies', 'toaster', 'ngAnimate', 'angularUtils.directives.dirPagination', 'ui.bootstrap', 'ng-backstretch', 'angular-ladda', 'jcs-autoValidate', 'naif.base64', 'ct.ui.router.extras', 'angularBootstrapNavTree', 'daterangepicker', 'ng-fusioncharts', 'hierarchical-selector', 'angular-timeline', 'angular-json-editor', 'hbSwXmlmc', 'mp.deepBlur', 'cp.ngConfirm', 'angucomplete-alt'];

  var module = angular.module('swSelfService', dependencies);

  module.config(function ($stateProvider, $urlRouterProvider, paginationTemplateProvider, JSONEditorProvider) {

    var $delegate = $stateProvider.state;
    $stateProvider.state = function (name, definition) {
      if (!definition.resolve) {
        definition.resolve = {};
      }

      return $delegate.apply(this, arguments);
    };

    $stateProvider.state('login', {
      url: '/login',
      controller: 'LoginController',
      templateUrl: 'templates/login.tpl.html',
      data: {
        loginState: true
      },
      resolve: {
        sspConfig: function sspConfig(SWSessionService) {
          return SWSessionService.getSSPSetup();
        },
        saml_auth: function saml_auth($cookies) {
          return $cookies.get('saml_auth');
        }
      }
    }).state('saml', {
      url: '/saml',
      controller: 'SamlLoginController',
      templateUrl: 'templates/login.sso.tpl.html',
      data: {
        loginState: true
      },
      params: {
        saml: {
          claim: '',
          config: {},
        }
      }
    }).state('new_password', {
      url: '/new_password/:token',
      controller: 'PasswordController',
      templateUrl: 'templates/resetPassword.tpl.html',
      params: {
        /*selfServiceID: {
         value: '0',
         },
         userId: {
         value: '0',
         },*/
        token: {
          value: '0'
        }
      },
      data: {
        loginState: false
      }
    }).state('loginmanual', {
      url: '/loginmanual',
      controller: 'LoginManualController',
      templateUrl: 'templates/login.manual.tpl.html',
      data: {
        loginState: true
      }
    }).state('loginsso', {
      url: '/loginsso',
      controller: 'LoginSSOController',
      templateUrl: 'templates/login.sso.tpl.html',
      data: {
        loginState: true
      }
    }).state('home', {
      url: '/home',
      controller: 'DashboardController',
      templateUrl: 'templates/dashboard/dashboard.tpl.html',
      data: {
        requiresLogin: true
      }
    }).state('profile', {
      cache: false,
      url: '/profile',
      templateUrl: 'templates/profile/profile.tpl.html',
      data: {
        requiresLogin: true
      }
    }).state('knowledge', {
      cache: false,
      url: '/knowledge',
      templateUrl: 'templates/knowledge/knowledge.tpl.html',
      params: {
        searchType: 1,
        searchString: "",
        catalog: {},
        keywords: true,
        title: true,
        problem: true,
        solution: true,
        maxResults: 100,
        searchResults: [],
        boolLoadDefaultSearchSettings: true
      },
      data: {
        requiresLogin: true
      }
    }).state('kbarticle', {
      cache: false,
      url: '/kbarticle/:kbRef',
      controller: 'KBArticleController',
      templateUrl: 'templates/knowledge/knowledge.article.tpl.html',
      params: {
        searchCriteria: {},
        searchOptions: [],
        searchResults: [],
        boolLoadDefaultSearchSettings: true
      },
      data: {
        requiresLogin: true
      }
    }).state('globalsearch', {
      cache: false,
      url: '/search',
      controller: 'GlobalSearchCtrl',
      templateUrl: 'templates/knowledge/global/global.search.tpl.html',
      data: {
        requiresLogin: true
      }
    }).state('services', {
      cache: false,
      url: '/services',
      controller: 'ServiceListCtrl',
      templateUrl: 'templates/services/services.tpl.html',
      data: {
        requiresLogin: true
      }
    }).state('servicedetails', {
      url: '/servicedetails/:serviceName',
      controller: 'ServiceDetailsController',
      templateUrl: 'templates/services/details/service.details.tpl.html',
      params: {
        serviceName: {
          value: '0'
        },
        serviceID: {
          value: '0'
        }
      },
      data: {
        requiresLogin: true
      }
    }).state('requests', {
      abstract: true,
      url: '/requests',
      controller: 'RequestListCtrl',
      templateUrl: 'templates/requests/lists/requests.tpl.html',
      data: {
        requiresLogin: true
      }
    }).state('requests.myrequests', {
      url: '/myrequests',
      controller: 'RequestListCustCtrl',
      template: '<request-list></request-list>'
    }).state('requests.teamrequests', {
      url: '/teamrequests',
      controller: 'RequestListTeamCtrl',
      template: '<request-list></request-list>'
    }).state('requests.siterequests', {
      url: '/siterequests',
      controller: 'RequestListSiteCtrl',
      template: '<request-list></request-list>'
    }).state('requests.orgrequests', {
      url: '/orgrequests',
      controller: 'RequestListOrgCtrl',
      template: '<request-list></request-list>'
    }).state('requests.relorgrequests', {
      url: '/relorgrequests',
      controller: 'RequestListRelOrgCtrl',
      template: '<request-list></request-list>'
    }).state('requestdetails', {
      cache: false,
      url: '/requestdetails/:requestID',
      controller: 'RequestDetailsController',
      templateUrl: 'templates/requests/details/request.details.tpl.html',
      data: {
        requiresLogin: true
      }
    }).state('requestwizard', {
      cache: false,
      url: '/requestwizard/:wizardName',
      controller: 'WizardCtrl',
      templateUrl: 'templates/wizard/raiseRequest.tpl.html',
      data: {
        requiresLogin: true
      },
      resolve: {
        PreviousState: ["$state", function ($state) {
          return {
            name: $state.current.name,
            params: $state.params,
            URL: $state.href($state.current.name, $state.params)
          };
        }]
      }
    }).state('requestsauth', {
      abstract: true,
      url: '/requestsauth',
      controller: 'RequestListAuthCtrl',
      templateUrl: 'templates/requests/lists/requests.auth.tpl.html',
      data: {
        requiresLogin: true
      }
    }).state('requestsauth.myauths', {
      url: '/myauths',
      controller: 'RequestListMyAuthCtrl',
      template: '<request-list-auth></request-list-auth>'
    }).state('requestsauth.managerauths', {
      url: '/managerauths',
      controller: 'RequestListManAuthCtrl',
      template: '<request-list-auth></request-list-auth>'
    });
    $urlRouterProvider.otherwise('/login');

    JSONEditorProvider.configure({
      defaults: {
        options: {
          iconlib: 'fontawesome4',
          theme: 'bootstrap3sm',
          ajax: true,
          disable_collapse: true
        }
      }
    });
  });
  //Request Service needed to check the counter of the authorisations
  module.run(function ($rootScope, $state, $cookies, SWSessionService, RequestService, defaultErrorMessageResolver, $location, store, wssLogging, $timeout) {
    $rootScope.goToPath = '';
    $rootScope.goToPath = $location.path();
    //SWSessionService.getSSPSetup().then(function (sspResponse) {
    //$state.go('home');
    //}, function (error) {
    //  wssLogging.logger(error, 'ERROR', 'app::init', true, true, 'Initialization Error');
    //});

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
      toState.resolve.promise = [
        'SWSessionService', '$cookies',
        function (SWSessionService, $cookies) {
          if ($cookies.get('swSessionID') && toState.data && toState.data.requiresLogin) {
            return SWSessionService.bindSession($cookies.get('swSessionID'));
          } else if ($cookies.get('ESPSessionState') && toState.data && toState.data.requiresLogin) {
            return SWSessionService.getSessionInfo().then(function () {
              if ($cookies.get('swSessionID')) {
                SWSessionService.bindSession($cookies.get('swSessionID'));
              }
            })
          } else {
            e.preventDefault();
            $location.search('LogoutState', 1);
            $state.go('home');
          }
          ;
        }]

      if (store.get('stateTransitionInProgres')) {
        // e.preventDefault();
      } else {
        store.set('stateTransitionInProgres', true);
      }
      if ($location.path() !== '/' && $location.path() !== '/login' && $location.path() !== '/loginmanual' && $location.path() !== '/loginsso' && $location.path() !== '/new_password' && $location.path().indexOf('saml') === -1) {
        //Store the location path in rootScope - when hitting a login controller
        //we can then route to this state - accessing Requests and Services directly!

        $rootScope.goToPath = $location.path();
      }
      if (toState.data && toState.data.requiresLogin) {
        //If the page requires login, and the sessionID is not in the cookies, return to login page
        if (!$cookies.get('ESPSessionState')) {
          e.preventDefault();
          if (SWSessionService.normalLogoff !== true) {
            SWSessionService.sessionEnded = true;
          }
          if (fromState.url !== '^' && fromState.name !== 'login' && fromState.name !== 'loginsso' && fromState.name !== 'loginmanual' && fromState.name !== 'saml') {
            wssLogging.sendToast('error', 'Your session appears to have expired. Please log on again.', 'Session Error!');
          }
          $state.go('login');
        }
      } else {
        // If state doesn't require login - it's a login page!
        // If we have a current active session, just go back home
        // To prevent customers attempting to get to one of the login pages when they already have a session
        if ($cookies.get('ESPSessionState') && toState.data && toState.data.loginState && (!location.search.match(/[?&](LogoutState=)([^-]).+/))) {
          e.preventDefault();
          $state.go('home');
        }
      }
    });

    $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
      store.set('stateTransitionInProgres', false);
      //Refresh the counter of the authorisation if the session exits
      //Storaging in the session service and the local storage
      if ($cookies.get('swSessionID')) {
        RequestService.getAuthCount().then(function (response) {
          //$scope.sessServ.numAuths = response;
          SWSessionService.numAuths = response;
          var objNewCustDetails = store.get("custDetails");
          objNewCustDetails.authCount = response;
          store.set("custDetails", objNewCustDetails);
          SWSessionService.numAuths = response;
        });
      }

      $rootScope.fromStateName = fromState.name;
      $rootScope.toStateName = toState.name;
      if (fromState.name === '' && toState.name !== 'login' && toState.name !== 'loginmanual' && toState.name !== 'loginsso' && toState.name !== 'saml') {
        //Capture and process page refreshes
        var newState = store.get('newState');
        if (newState === 'requestwizard') {
          // If trying to refresh page on requestwizard, take back to home
          // Do not refresh wizard page as Angular data for current wizard will be lost!
          $state.go('home');
        } else if (newState !== '') {
          store.set('refreshing', true)
          //this is a page refresh - go to state immediately prior to refresh
          // var newStateParams = store.get('newStateParams');
          // $state.go(newState, newStateParams);
        }
      } else if (toState.name !== 'login' && toState.name !== 'loginmanual' && toState.name !== 'loginsso' && toState.name !== 'saml') {
        //Set current page state in localStorage when change successful
        //This is so we can keep the current state if the browser is refreshed
        store.set('newState', toState.name);
        store.set('newStateParams', toParams);
      } else if (toState.name === 'login' || toState.name === 'loginmanual' || toState.name === 'loginsso' || toState.name === 'new_password' || toState.name === 'saml') {

        //Trying to get to login state - already logged in?
        if ($cookies.get('ESPSessionState')) {
          //If already logged in, go home
          e.preventDefault();
          $state.go('home');
        }
      } else {
        //State Change as normal
      }
    });

//Add custom validation messages
    defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
      errorMessages.updateTextMinimum = 'Your update is too short!';
      errorMessages.updateTextRequired = 'You need to provide a description when updating requests!';
      errorMessages.loginUsernameRequired = 'You need to enter your username!';
      errorMessages.fileAttachMaxSize = 'Files must not exceed 10 MB!';
      errorMessages.fileAttachMaxFiles = 'You only upload up to 5 files at a time!';
      errorMessages.wizardText = 'This field is required';
      errorMessages.wizardSingleSelect = 'Please select one of the above options';
      errorMessages.wizardMultiSelect = 'Please select one or more of the above options';
      errorMessages.wizardFileSelect = 'Please attach one or more files to this request';
      errorMessages.wizardDateSelect = 'Please select a date, above';
      errorMessages.wizardDateRangeSelect = 'Please select a date range, above';
    });

    module.controller('swSelfServiceCtrl', function ($scope, store) {});
  })
})();
//# sourceMappingURL=app.js.map