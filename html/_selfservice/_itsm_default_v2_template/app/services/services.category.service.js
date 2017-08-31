(function (){
    'use strict';
    angular
      .module('swSelfService')
      .factory('ServiceCategoryService', ServiceCategoryService);

      ServiceCategoryService.$inject=['$q', 'XMLMCService', 'store','wssHelpers','wssLogging'];

    function ServiceCategoryService($q, XMLMCService, store, wssHelpers, wssLogging) {

      var self = {
        'categoriesLoading': false,
        'catSubSQ': 'query/wss/services/services.category.subscriptions',
        'catDetSQ': 'query/wss/services/services.category.details',
        'treeData': [],
        'catList': []
      };

      self.unFlattenTree = function(){
        self.treeData = wssHelpers.unflatten(self.catList);
        return self.treeData;
      };

      self.getTreeData = function() {
        //Get category subscriptions
        var deferred = $q.defer();
        self.getCategorySubscriptions().then(function(response){
          self.categories = response;
          //Instantiate array to hold list of categories, and their relationship to one another
          self.catList = [];
          //Cycle through each of the objects in the response, building the catalog tree data
          angular.forEach(response, function(value, currTreeKey){
            //Split catType in to array
            var arrCatType = value.catalog_type.split('->');
            var strCurrentCat = "";
            self.parentId = "";
            angular.forEach(arrCatType, function(catType, catKey){
              var currCat = {};
              if(catKey !== 0){
                strCurrentCat += "->";
              }
              strCurrentCat += catType;
              currCat.label = catType;
              currCat.parentlabel = self.parentId;
              currCat.content = strCurrentCat;
              currCat.icon = value.www_image_path.replace('&[app.webroot]', '/sw');
              currCat.data = {};
              currCat.data.swValue = strCurrentCat;
              currCat.description = value.notes;
              self.catList.push(currCat);
              self.parentId = catType;
            });
          });
          self.treeData = wssHelpers.unflattenTreeview(self.catList, 'label');
          deferred.resolve(self.treeData);
        }, function(error){
          wssLogging.logger(error, "ERROR", "ServiceCategoryService::getTreeData", false, false);
          deferred.reject(error);
        });
        return deferred.promise;
      };

      self.getCategorySubscriptions = function() {
        var deferred = $q.defer();
        self.custDetails = store.get("custDetails");
        var totalCategories = 0;
        var catSubscriptions = [];
        var sqparams = "custid="+self.custDetails.keysearch;
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", self.catSubSQ);
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params){
            if(params.rowData) {
              if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                var intArrayLength = params.rowData.row.length;
                //obj is array
                for (var i = 0; i < intArrayLength; i++) {
                  catSubscriptions.push(params.rowData.row[i]);
                }
              } else {
                catSubscriptions.push(params.rowData.row);
              }
              deferred.resolve(catSubscriptions);
            } else {
              deferred.resolve('No Categories Returned.');
            }
          },
          onFailure: function(error){
            wssLogging.logger(error, "ERROR", "ServiceCategoryService::getCategorySubscriptions", false, false);
            deferred.reject(error);
          }
        });
        return deferred.promise;
      };

      self.getCategoryDetails = function(categoryId) {
        var deferred = $q.defer();
        var sqparams = "catid="+categoryId;
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", self.catDetSQ);
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params){
            if(params.rowData) {
              deferred.resolve(params.rowData.row);
            } else {
              deferred.resolve('No Category Details Returned.');
            }
          },
          onFailure: function(error){
            wssLogging.logger(error, "ERROR", "ServiceCategoryService::getCategoryDetails", false, false);
            deferred.reject(error);
          }
        });
        return deferred.promise;
      };

      return self;
    }
})();
