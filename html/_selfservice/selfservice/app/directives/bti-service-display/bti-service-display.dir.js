(function () {
  'use strict';

  angular.module('swSelfService').directive('btiServiceDisplay', ['ServicesService', 'SWSessionService', '$q', 'ServiceCategoryService', '$rootScope', '$state', 'wssHelpers', 'store', 'wssLogging', '$window', btiServiceDisplayDirective]);

  function btiServiceDisplayDirective(servicesService, swSession, $q, catServ, $rootScope, $state, wssHelpers, store, wssLogging, $window) {
    return {
      restrict: 'E',
      templateUrl: 'app/directives/bti-service-display/service-display.tpl.html',
      scope: {},
      controller: ServiceCategoryDirectiveController
    };

    function ServiceCategoryDirectiveController($scope) {
      $scope.custServices = servicesService;
      var selectedCategory = [0, 0];
      $scope.selectCategory = function (row, col) {
        $scope.currCat = _categories[row][col];
        $scope.categories[selectedCategory[0]][selectedCategory[1]].selected = false;
        $scope.categories[row][col].selected = true;
        selectedCategory = [row, col];
      };

      var _categories = [];
      var catTreeData = [];

      function addServicesToCategories(categories, services) {
        for (var i = 0; i < categories.length; i++) {
          if (Array.isArray(categories[i])) {
            addServicesToCategories(categories[i], services);
          } else {
            if (categories[i].children.length > 0) {
              addServicesToCategories(categories[i].children, services);
            }

            categories[i].services = services.reduce(function (acc, service) {
              if (service.pk_config_type === categories[i].content) {
                acc.push(service);
              }

              return acc;
            }, []);
          }
        }
      }

      //Check session, if active then get all services
      swSession.checkActiveSession().then(function () {
        servicesService.getCustServices().then(function (services) {
          getCatTreeData().then(function (categories) {
            _categories.push(categories.reduce(function (acc, cat) {
              if (!cat.hasOwnProperty('children')) {
                cat.children = [];
              }
              if (cat.parentlabel === '') {
                cat.open = true;
                cat.selected = false;
                if (acc.length < 6) {
                  acc.push(cat);
                } else {
                  _categories.push(acc);
                  acc = [];
                  acc.push(cat);
                }
              }
              return acc;
            }, []));
            addServicesToCategories(_categories, services);
            $scope.categories = _categories;
            console.log(_categories, services);
          });
        });
      });

      function getCatTreeData() {
        var deferred = $q.defer();
        if (catTreeData.length === 0) {
          catServ.getTreeData().then(function (response) {
            catTreeData = response;
            deferred.resolve(catTreeData);
          });
        } else {
          deferred.resolve(catTreeData);
        }
        return deferred.promise;
      }

      $scope.firstOpen = false;

      $scope.getCategorySize = function (categories) {
        return Math.floor(12 / categories.length);
      };

      $scope.isFav = function (serviceId) {
        if (angular.isDefined(servicesService.favServices) && servicesService.favServices[serviceId] === true) {
          return true;
        }
        return false;
      };

      $scope.addFav = function (subsId, servId) {
        servicesService.addCustomerFavourite(subsId, servId).then(function (response) {}, function (error) {
          var toastType = "error";
          var toastBody = 'Adding this Service to your list of favourites failed.';
          var toastTitle = "Service Favourite Failed!";
          wssLogging.sendToast(toastType, toastBody, toastTitle);
        });
      };

      $scope.delFav = function (servId) {
        servicesService.delCustomerFavourite(servId).then(function () {}, function (error) {
          var toastType = "error";
          var toastBody = 'Removing this Service from your list of favourites failed.';
          var toastTitle = "Service Favourite Failed!";
          wssLogging.sendToast(toastType, toastBody, toastTitle);
        });
      };

      $scope.canRaiseIncident = function (service) {
        return service.flg_allow_support === '1' && $scope.canLogCall() && servicesService.listType !== 'own' && servicesService.listType !== 'unsub';
      };

      $scope.canRaiseRequest = function (service) {
        return service.flg_allow_request === '1' && $scope.canLogCall() && servicesService.listType !== 'own' && servicesService.listType !== 'unsub';
      };

      $scope.canAddFav = function () {
        return servicesService.listType !== 'own' && servicesService.listType !== 'unsub';
      };

      $scope.canLogCall = function () {
        return wssHelpers.hasWebflag('OPTION_CAN_LOG_CALLS');
      };

      $scope.raiseRequest = function (service, requestClass) {
        store.remove("currDataForm");
        var dfId = '0';
        var dfClass = '';
        switch (requestClass) {
          case "Incident":
            if (angular.isDefined(service.fk_df_support) && service.fk_df_support > 0) {
              dfId = service.fk_df_support;
              dfClass = requestClass;
            }
            break;
          case "Service Request":
            if (angular.isDefined(service.fk_df_onreq) && service.fk_df_onreq > 0) {
              dfId = service.fk_df_onreq;
              dfClass = requestClass;
            }
            break;
          case "Subscription":
            if (angular.isDefined(service.fk_df_onsub) && service.fk_df_onsub > 0) {
              dfId = service.fk_df_onsub;
              dfClass = requestClass;
            }
            break;
        }
        $rootScope.dataFormID = dfId;
        $rootScope.dataFormClass = dfClass;

        if (dfId !== '0') {
          //Get subscription details
          servicesService.getSubscriptionRecord(service.subs_id).then(function (objSubscription) {
            var objRequest = {
              dataFormID: dfId,
              requestClass: dfClass,
              serviceDetails: service,
              subscription: objSubscription
            };
            store.set("currDataForm", objRequest);
            $state.go('requestwizard');
          });
        } else {
          wssLogging.logger('No Wizard has been set up for this Service [' + service.vsb_title + ']. Please contact your Service Desk with the name of the Service to report this configuration issue.', "ERROR", "ServiceListCtrl::raiseRequest", false, true, "Request Wizard Error!");
        }
      };

      $scope.selectCategoryGroup = function (cat, evt) {
        cat.open = !cat.open;
        evt.stopPropagation();
      };

      $scope.$on('logout', function () {
        $scope.custServices = {};
      });
    }
  }
})();
//# sourceMappingURL=bti-service-display.dir.js.map