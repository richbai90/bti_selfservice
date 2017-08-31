(function () {
  'use strict';

  //Main Services List controller
  angular
    .module('swSelfService')
    .controller('ServiceListCtrl', ServiceListCtrl);
  ServiceListCtrl.$inject = ['$rootScope', '$scope', '$q', '$state', 'SWSessionService', 'wssHelpers', 'ServicesService', 'ServiceCategoryService', 'paginationService', 'store', '$uibModal', 'wssLogging', '$window', 'GlobalSearchService'];
  function ServiceListCtrl($rootScope, $scope, $q, $state, SWSessionService, wssHelpers, ServicesService, ServiceCategoryService, paginationService, store, $uibModal, wssLogging, $window, GlobalSearchService) {
    $scope.serviceListSelect = 'cust';
    $scope.custServices = ServicesService;
    $scope.catServ = ServiceCategoryService;
    $scope.catTreeData = [];
    $scope.custServices.servicesLoading = false;
    $scope.custServices.selectedService = null;
    $scope.custServices.pageNo = 1;
    $scope.windowWidth = $window.innerWidth;

    //Accordion Settings for side panel
    $scope.accStatus = {
      closeOthers: false,
      detailsOpen: false,
      activeRequest: false,
      closeRequest: false
    };
    //
    // //Check session, if active then get paged services
    // SWSessionService.checkActiveSession().then(function(){
    //   $scope.custServices.getPagedServices();
    // }, function(){
    //   //
    // });

    let selectedCategory = [0, 0];
    $scope.selectCategory = function (row, col) {
      $scope.currCat = _categories[row][col];
      $scope.categories[selectedCategory[0]][selectedCategory[1]].selected = false;
      $scope.categories[row][col].selected = true;
      selectedCategory = [row, col];
    };

    const _categories = [];
    let catTreeData = [];

    function addServicesToCategories(categories, services) {
      for (let i = 0; i < categories.length; i++) {
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
    $scope.getAllCustServices = () => {
      SWSessionService.checkActiveSession().then(() => {
        ServicesService.getCustServices().then(services => {
          getCatTreeData().then(categories => {
            _categories.push(categories.reduce((acc, cat) => {
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
          });
        });
      });
    };


    function getCatTreeData() {
      const deferred = $q.defer();
      if (catTreeData.length === 0) {
        $scope.catServ.getTreeData().then(function (response) {
          catTreeData = response;
          deferred.resolve(catTreeData);
        });
      } else {
        deferred.resolve(catTreeData);
      }
      return deferred.promise;
    }

    $scope.firstOpen = true;

    $scope.getCategorySize = function (categories) {
      return Math.floor(12 / categories.length);
    };

    $scope.getCatTreeData = function () {
      let deferred = $q.defer();
      if ($scope.catTreeData.length === 0) {
        $scope.catServ.getTreeData().then(function (response) {
          $scope.catTreeData = response;
          deferred.resolve($scope.catTreeData)
        })
      } else {
        deferred.resolve($scope.catTreeData)
      }
      return deferred.promise;
    };

    // Setup Modal for Service Category selector
    $scope.openCategoryTree = function (size) {
      $scope.catServ.getTreeData().then(function (response) {
        $scope.catTreeData = response;
        $scope.openCategoryModal(size);
      });
    };

    $scope.openCategoryModal = function (size) {
      let modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'templates/services/services.searchwell.categorytree.tpl.html',
        controller: 'ModalTreeCtrl',
        size: size,
        resolve: {
          items: function () {
            $scope.treeDataModal = [];
            $scope.treeDataModal.currBranch = $scope.currTreeBranch;
            $scope.treeDataModal.objTree = $scope.catTreeData;
            return $scope.treeDataModal;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        if (angular.isDefined(selectedItem.data)) {
          $scope.custServices.category = selectedItem.data.swValue;
          $scope.currTreeBranch = selectedItem.uid;
        }
      }, function () {
        //Modal Dismissed
      });
    };

    $scope.clearCategory = function () {
      $scope.custServices.category = "";
    };

    $scope.clearSearch = function () {
      $scope.custServices.search = "";
    };

    $scope.clearSearchwell = function () {
      paginationService.setCurrentPage('servicePage', 1);
      $scope.clearCategory();
      $scope.clearSearch();
    };

    $scope.getNextPage = function (pageNum) {
      $scope.custServices.selectedRequest = null;
      $scope.custServices.pageNo = pageNum;
    };

    $scope.setGlobalSearch = function () {
      $scope.custServices.listType = 'cust';
      $scope.custServices.search = GlobalSearchService.globalSearchString;
      $scope.custServices.getPagedServices();
    };
    //

    $scope.getCustFaveServices = function () {
      SWSessionService.checkActiveSession().then(function () {
        $scope.custServices.listType = 'fav';
        $scope.custServices.getPagedServices();
      });
    };

    $scope.selectCategoryGroup = function (cat, evt) {
      cat.open = !cat.open;
      evt.stopPropagation();
    };


    $scope.setServiceListSelect = function (servList) {
      $scope.clearSearchwell();
      SWSessionService.checkActiveSession().then(function () {
        $scope.custServices.listType = servList;
        $scope.custServices.getPagedServices();
      });
    };

    $scope.getDetails = function (serviceId) {
      //Calling to the getServiceDetails from the services.service
      $scope.custServices.getServiceDetails(serviceId).then(
        function (objServDetails) {
          if (objServDetails.rowData) {
            if (objServDetails.rowData.row) {
              $scope.serviceDetails = objServDetails.rowData.row.details;
            }
            else {
              $scope.serviceDetails = "";
            }
          }
          else {
            $scope.serviceDetails = "";
          }
        },
        function (error) {
          //
        });
    };

    $scope.getActiveRequest = function (serviceId) {
      //Calling to the activeRequest from the services.service
      $scope.custServices.activeRequest(serviceId).then(
        function (objRequest) {
          $scope.RequestActive = objRequest;
        },
        function (error) {
          //console.log("Not active request associated to this service");
        }
      );
    };

    $scope.getCloseRequest = function (serviceId) {
      //Calling to the closeRequest from the services.service
      $scope.custServices.closeRequest(serviceId).then(
        function (objRequest) {
          $scope.RequestClose = objRequest;
        },
        function (error) {
          //console.log("Not closed request associated to this service");
        }
      );
    };

    $scope.selectService = function (service) {
      $scope.custServices.selectedService = service;
      $scope.accStatus = {
        closeOthers: false,
        detailsOpen: false,
        activeRequest: false,
        closeRequest: false
      };
    };

    $scope.subscribeSection = function () {

      return $scope.custServices.listType === 'unsub';


    };

    $scope.ownDetailsSection = function () {

      return $scope.custServices.listType === 'own';


    };

    $scope.displayOwnDetails = function (service) {

      if ($scope.custServices.listType === 'own') {
        $state.go('servicedetails', { serviceName: service.vsb_title, serviceID: service.fk_cmdb_id });
      }
    };

    $scope.isFav = function (serviceId) {
      return angular.isDefined($scope.custServices.favServices) && $scope.custServices.favServices[serviceId] === true;

    };

    $scope.addFav = function (subsId, servId) {
      $scope.custServices.addCustomerFavourite(subsId, servId).then(function (response) {
      }, function (error) {
        let toastType = "error";
        let toastBody = 'Adding this Service to your list of favourites failed.';
        let toastTitle = "Service Favourite Failed!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
      });
    };

    $scope.delFav = function (servId) {
      $scope.custServices.delCustomerFavourite(servId).then(function () {
      }, function (error) {
        let toastType = "error";
        let toastBody = 'Removing this Service from your list of favourites failed.';
        let toastTitle = "Service Favourite Failed!";
        wssLogging.sendToast(toastType, toastBody, toastTitle);
      });
    };

    $scope.canRaiseIncident = function (service) {
      return (service.flg_allow_support === '1' &&
      $scope.canLogCall() &&
      $scope.custServices.listType !== 'own' &&
      $scope.custServices.listType !== 'unsub');
    };

    $scope.canRaiseRequest = function (service) {
      return (service.flg_allow_request === '1' &&
      $scope.canLogCall() &&
      $scope.custServices.listType !== 'own' &&
      $scope.custServices.listType !== 'unsub');
    };
    //
    // $scope.canAddFav = function () {
    //   return ($scope.custServices.listType !== 'own' &&
    //   $scope.custServices.listType !== 'unsub');
    // };
    //
    $scope.canLogCall = function () {
      return wssHelpers.hasWebflag('OPTION_CAN_LOG_CALLS');
    };
    //
    $scope.raiseRequest = function (service, requestClass) {
      store.remove("currDataForm");
      let dfId = '0';
      let dfClass = '';
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
        $scope.custServices.getSubscriptionRecord(service.subs_id).then(function (objSubscription) {
          let objRequest = {
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

    //Watch for logout broadcast to clean up session-specific data ready for a new user
    $scope.$on('logout', function () {
      $scope.custServices = {};
    });

  }
})();
