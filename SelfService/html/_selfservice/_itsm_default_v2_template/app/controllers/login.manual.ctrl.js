(function () {
    'use strict';
    angular
        .module('swSelfService')
        .controller('LoginManualController', LoginManualController);

    LoginManualController.$inject = ['$scope','$rootScope','SWSessionService','$state','store','RequestService','wssLogging', '$location','$window'];

    function LoginManualController($scope, $rootScope, SWSessionService, $state, store, RequestService, wssLogging, $location, $window)
    {
      //$scope.loggingIn allows the tracking of when a customer has clicked the Login button, to when the login process has finished.
      $scope.loggingIn = false;
      $scope.images = wssBranding.loginImage;
      $scope.sessServ = SWSessionService;
      $scope.screenWidth = $window.innerWidth;

      $scope.login = function () {
        $scope.loggingIn = true;
        //Password is not in sccope - so that this isn't visible in plain text using Angular Batarang or the like
        //So when hitting the login button, get the login password directly from the input element in the DOM
        var formPassword = document.querySelector( '#login-password' );
        $scope.sessServ.login($scope.username, formPassword.value).then(function(sessionData){
          formPassword = {};
          $scope.sessServ.getSelfServiceConfig($scope.username).then(function(){
            $scope.wssConfig = store.get("wssConfig");
            $scope.sessServ.getCustomerDetails($scope.username, $scope.wssConfig.ac_id).then(function(custDetails){
              //Get number of authorisations, stick it in rootScope
              RequestService.getAuthCount().then(function(response) {
                $scope.sessServ.numAuths = response;
                var objNewCustDetails = store.get("custDetails");
                objNewCustDetails.authCount = $scope.sessServ.numAuths;
                store.set("custDetails", objNewCustDetails);

                //In case the state before was new_password
                var stateBefore = $rootScope.goToPath.substring($rootScope.goToPath.indexOf("/")+1,$rootScope.goToPath.lastIndexOf("/"));

                if ( stateBefore !=="new_password" &&
                     $rootScope.goToPath !== '/' &&
                     $rootScope.goToPath !== '/login' &&
                     $rootScope.goToPath !== '/loginsso' &&
                     $rootScope.goToPath !== '/loginmanual'){
                  var newPath = $rootScope.goToPath;
                  $rootScope.goToPath = '';
                  $location.path(newPath);
                } else {
                  $state.go('home');
                }
              }, function(error){
                $scope.loggingIn = false;
                var toastType = "error";
                var toastBody = "There has been an error in retrieving your authorisations count.";
                var toastTitle = "Logon Error!";
                wssLogging.sendToast(toastType, toastBody, toastTitle);
                if($rootScope.goToPath !== ''){
                  var newPath = $rootScope.goToPath;
                  $rootScope.goToPath = '';
                  $location.path(newPath);
                } else {
                  $state.go('home');
                }
              });
            });
          });
        }, function(error) {
          $scope.loggingIn = false;
          formPassword = {};
        });
      };

      $scope.requestPassword = function (){
        $scope.sessServ.requestResetCustomerPassword($scope.username).then(function(responseRequest){
          $state.go('login');
        }, function(error){
          $state.go('login');
        });
      };

      if(!angular.isDefined($scope.sessServ.sspConfig)){
        $state.go('login');
      } else {
        if($scope.sessServ.sspConfig.ssoEnabled === true){
          $state.go('home');
        } else {
          $state.go('loginmanual');
        }
      }

      //Watch for logout broadcast to clean up session-specific data ready for a new user
      $scope.$on('logout',function(){
      //  SWSessionService = {};
      });

    }

})();
