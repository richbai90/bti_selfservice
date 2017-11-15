'use strict';

(function () {
  'use strict';

  //Call Status Filter - Returns Call Status String from integer input

  angular.module('swSelfService')

  //Supportworks specific data filters
  .filter('callStatus', function () {
    return function (input) {
      var callStatuses = [];
      callStatuses[1] = "Active";
      callStatuses[2] = "Active";
      callStatuses[3] = "Active";
      callStatuses[4] = "On Hold";
      callStatuses[5] = "Active";
      callStatuses[6] = "Resolved";
      callStatuses[7] = "Active";
      callStatuses[8] = "Active";
      callStatuses[9] = "Active";
      callStatuses[10] = "Active";
      callStatuses[11] = "Active";
      callStatuses[15] = "Lost";
      callStatuses[16] = "Closed";
      callStatuses[17] = "Cancelled";
      callStatuses[18] = "Closed";
      return callStatuses[input];
    };
  }).filter('callRating', function () {
    return function (input) {
      var callRatings = [];
      callRatings[0] = '';
      callRatings[1] = '<i class="fa fa-frown-o fa-lg"></i>';
      callRatings[2] = '<i class="fa fa-meh-o fa-lg"></i>';
      callRatings[3] = '<i class="fa fa-smile-o fa-lg"></i>';
      return callRatings[input];
    };
  })
  //Match the service type associate to the value
  .filter('serviceType', function () {
    return function (input) {
      var serviceTypes = [];
      serviceTypes[0] = 'Technical Service';
      serviceTypes[1] = 'Business Service';
      return serviceTypes[input];
    };
  })
  //Match the service type associate to the value
  .filter('generalMatch', function () {
    return function (input) {
      var serviceTypes = [];
      serviceTypes[0] = 'No';
      serviceTypes[1] = 'Yes';
      return serviceTypes[input];
    };
  })
  // Date/Time Processing filters
  //UNIX to Strings
  .filter('unixToDateTime', function ($filter, $rootScope, store) {
    return function (input) {
      if (input > 0) {
        if (!angular.isDefined($rootScope.wssConfig)) {
          $rootScope.wssConfig = store.get("wssConfig");
        }
        return $filter('date')(input * 1000, $rootScope.wssConfig.datetimefmt, $rootScope.wssConfig.timezone);
      }
    };
  }).filter('unixToDate', function ($filter, $rootScope, store) {
    return function (input) {
      if (input > 0) {
        if (!angular.isDefined($rootScope.wssConfig)) {
          $rootScope.wssConfig = store.get("wssConfig");
        }
        return $filter('date')(input * 1000, $rootScope.wssConfig.datefmt, $rootScope.wssConfig.timezone);
      }
    };
  }).filter('unixToTime', function ($filter, $rootScope, store) {
    return function (input) {
      if (input > 0) {
        if (!angular.isDefined($rootScope.wssConfig)) {
          $rootScope.wssConfig = store.get("wssConfig");
        }
        return $filter('date')(input * 1000, $rootScope.wssConfig.timefmt, $rootScope.wssConfig.timezone);
      }
    };
  })

  //Moment to Strings
  .filter('momentToDateTime', function ($filter, $rootScope, store) {
    return function (input) {
      var returnString = "";
      if (angular.isObject(input)) {
        if (!angular.isDefined($rootScope.wssConfig)) {
          $rootScope.wssConfig = store.get("wssConfig");
        }
        var momentDate = moment(input).format('X');
        returnString = $filter('unixToDateTime')(momentDate);
      }
      return returnString;
    };
  }).filter('momentToDate', function ($filter, $rootScope, store) {
    return function (input) {
      var returnString = "";
      if (angular.isObject(input)) {
        if (!angular.isDefined($rootScope.wssConfig)) {
          $rootScope.wssConfig = store.get("wssConfig");
        }
        var momentDate = moment(input).format('X');
        returnString = $filter('unixToDate')(momentDate);
      }
      return returnString;
    };
  }).filter('momentToTime', function ($filter, $rootScope, store) {
    return function (input) {
      var returnString = "";
      if (angular.isObject(input)) {
        if (!angular.isDefined($rootScope.wssConfig)) {
          $rootScope.wssConfig = store.get("wssConfig");
        }
        var momentDate = moment(input).format('X');
        returnString = $filter('unixToTime')(momentDate);
      }
      return returnString;
    };
  })

  //Moment Ranges to Strings
  .filter('momentToDateTimeRange', function ($filter, $rootScope, store) {
    return function (input) {
      var returnString = "";
      if (angular.isObject(input)) {
        if (!angular.isDefined($rootScope.wssConfig)) {
          $rootScope.wssConfig = store.get("wssConfig");
        }
        var momentStartDate = moment(input.startDate).format('X');
        var momentEndDate = moment(input.endDate).format('X');
        returnString = $filter('unixToDateTime')(momentStartDate) + " to " + $filter('unixToDateTime')(momentEndDate);
      }
      return returnString;
    };
  }).filter('momentToDateRange', function ($filter, $rootScope, store) {
    return function (input) {
      var returnString = "";
      if (angular.isObject(input)) {
        if (!angular.isDefined($rootScope.wssConfig)) {
          $rootScope.wssConfig = store.get("wssConfig");
        }
        var momentStartDate = moment(input.startDate).format('X');
        var momentEndDate = moment(input.endDate).format('X');
        returnString = $filter('unixToDate')(momentStartDate) + " to " + $filter('unixToDate')(momentEndDate);
      }
      return returnString;
    };
  }).filter('momentToTimeRange', function ($filter, $rootScope, store) {
    return function (input) {
      var returnString = "";
      if (angular.isObject(input)) {
        if (!angular.isDefined($rootScope.wssConfig)) {
          $rootScope.wssConfig = store.get("wssConfig");
        }
        var momentStartDate = moment(input.startDate).format('X');
        var momentEndDate = moment(input.endDate).format('X');
        returnString = $filter('unixToTime')(momentStartDate) + " to " + $filter('unixToTime')(momentEndDate);
      }
      return returnString;
    };
  })

  //End of Date/Time processing

  //Text processing filters
  .filter('stripTags', function () {
    return function (input) {
      if (angular.isDefined(input)) {
        //  from: http://phpjs.org/functions/strip_tags/
        var allowed = '<a><br>';
        allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
          return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
      }
    };
  }).filter('ellipsesString', function () {
    return function (text, strLength) {
      if (angular.isDefined(text)) {
        if (!angular.isDefined(strLength)) {
          strLength = 254;
        }
        if (text.length >= strLength) {
          return text.substr(0, strLength) + '...';
        }
        return text;
      }
    };
  })

  //Output Selectbox & Radiobox answers within wizard
  .filter('optionDisplay', function () {
    return function (optionObject) {
      var strReturn = '';
      if (angular.isObject(optionObject) && angular.isDefined(optionObject.discol)) {
        strReturn = optionObject.discol;
      }
      return strReturn;
    };
  }).filter('checkboxDisplay', function () {
    return function (optionObject) {
      var strReturn = '';
      angular.forEach(optionObject, function (optVal, optKey) {
        if (optVal !== '') {
          if (strReturn !== '') {
            strReturn += ', ';
          }
          strReturn += optVal;
        }
      });
      return strReturn;
    };
  }).filter('standardComponentDisplay', function () {
    return function (optionObject) {
      var strReturn = '';
      angular.forEach(optionObject, function (optVal, optKey) {
        if (angular.isObject(optVal) && angular.isDefined(optVal.discol)) {
          if (strReturn !== '') {
            strReturn += ', ';
          }
          strReturn += optVal.discol;
        }
      });
      return strReturn;
    };
  }).filter('optionalComponentDisplay', function () {
    return function (optionObject) {
      var strReturn = '';
      angular.forEach(optionObject, function (optVal, optKey) {
        if (angular.isObject(optVal) && angular.isDefined(optVal.description)) {
          if (strReturn !== '') {
            strReturn += ', ';
          }
          strReturn += optVal.description;
        }
      });
      return strReturn;
    };
  }).filter('ciPickerDisplay', function () {
    return function (optionObject) {
      var strReturn = '';
      angular.forEach(optionObject, function (optVal, optKey) {
        if (angular.isObject(optVal)) {
          if (strReturn !== '') {
            strReturn += ', ';
          }
          strReturn += optVal.ck_config_item;
        }
      });
      return strReturn;
    };
  }).filter('fileDisplay', function () {
    return function (optionObject) {
      var strReturn = '';
      angular.forEach(optionObject, function (optVal, optKey) {
        if (strReturn !== '') {
          strReturn += ', ';
        }
        strReturn += optVal.filename;
      });
      return strReturn;
    };
  }).filter('faIconLgDisplay', function () {
    return function (strIcon) {
      var strReturn = '';
      if (strIcon !== '') strReturn = '<i class="fa fa-fw fa-lg ' + strIcon + '"></i>';
      return strReturn;
    };
  }).filter('faIcon2xDisplay', function () {
    return function (strIcon) {
      var strReturn = '';
      if (strIcon !== '') strReturn = '<i class="fa fa-fw fa-2x ' + strIcon + '"></i>';
      return strReturn;
    };
  }).filter('faIcon3xDisplay', function () {
    return function (strIcon) {
      var strReturn = '';
      if (strIcon !== '') strReturn = '<i class="fa fa-fw fa-3x ' + strIcon + '"></i>';
      return strReturn;
    };
  })

  //AngularJS Bytes filter from : https://gist.github.com/thomseddon/3511330
  .filter('bytes', function () {
    return function (bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
      if (typeof precision === 'undefined') precision = 1;
      var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
          number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    };
  }).filter('requestDetailsButton', function ($sce) {
    return function (strCallref) {
      //Requires a properly formatted callref string
      var strHtml = '<a class="btn btn-success btn-sm" href="#/requestdetails/' + strCallref + '" ui-sref="requestdetails({ requestID: ' + strCallref + ' })">' + strCallref + '</a>';
      return $sce.trustAsHtml(strHtml);
    };
  });
})();
//# sourceMappingURL=requests.fltr.js.map