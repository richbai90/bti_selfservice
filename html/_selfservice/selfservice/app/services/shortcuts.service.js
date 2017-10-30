'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function (sw) {
  'use strict';

  sw.factory('shortcuts', function () {

    var defaultShortcuts = {
      "_support": {
        "ngClick": '$scope | raiseSupportRequest',
        "active": "requestwizard",
        "icon": "fa-life-ring",
        "text": "Support Me",
        "desc": "Raise a new support request",
        "condition": "canRaiseRequest"
      },
      "_services": {
        "sref": "services",
        "icon": "fa-cogs",
        "text": "Services",
        "desc": "Request or view a service"
      },
      "_requests": {
        "sref": "requests.myrequests",
        "icon": "fa-tasks",
        "text": "Requests",
        "desc": "View or update your requests"
      },
      "_knowledge": {
        "sref": "knowledge",
        "icon": "fa-binoculars",
        "text": "Knowledge",
        "desc": "Search for help"
      },
      "_authorize": {
        "sref": "requestsauth.myauths",
        "icon": "fa-check-square-o",
        "badge": "numAuths",
        "text": "Authorize",
        "desc": "Authorize a request",
        "condition": "$scope | sessServ.numAuths > 0"
      }
    };

    var prepShortcuts = function prepShortcuts() {
      return orderBy(wssLayout.homePage.shortcuts, merge({}, defaultShortcuts, wssLayout.homePage.shortcuts));
    };

    var shortcutKeys = function shortcutKeys(shortcuts) {
      var shortcutKeys = Object.keys(shortcuts).filter(function (s) {
        return !shortcuts[s].hidden && evalCondition(shortcuts[s].condition);
      });
      shortcutKeys.sort(function (a, b) {
        return (shortcuts[a].row || 0) - (shortcuts[b].row || 0);
      });
      return shortcutKeys;
    };
    var isObject = function isObject(item) {
      return item && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && !Array.isArray(item);
    };

    var merge = function merge(target) {
      for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }

      if (!sources.length) return target;
      var source = sources.shift();

      if (isObject(target) && isObject(source)) {
        for (var key in source) {
          if (source.hasOwnProperty(key)) {
            if (isObject(source[key])) {
              if (!target[key]) Object.assign(target, _defineProperty({}, key, {}));
              merge(target[key], source[key]);
            } else {
              Object.assign(target, _defineProperty({}, key, source[key]));
            }
          }
        }
      }

      return merge.apply(undefined, [target].concat(sources));
    };

    var orderBy = function orderBy(map, target) {
      map = Array.isArray(map) && map || Object.keys(map);
      var reorderd = {};
      map.forEach(function (e) {
        reorderd[e] = target[e];
      });
      return merge({}, reorderd);
    };

    var valInScope = function valInScope(v, $scope) {
      if (!v) return v;
      var vParts = v.split('|');
      if (vParts[0].trim() !== '$scope') return false;
      return $scope.$eval(vParts[1].trim());
    };

    var evalShortcut = function evalShortcut(sc, $scope) {
      var valInObject = function valInObject(v) {
        return function (sc, v) {
          return sc[v];
        }(sc, v);
      };
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.entries(sc)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var e = _step.value;

          sc[e[0]] = valInObject(e[1]) || valInScope(e[1], $scope) || e[1];
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    };
    var evalCondition = function evalCondition(cond) {
      return typeof cond === 'undefined' || cond;
    };
    var initShortcuts = function initShortcuts($scope) {
      var shortcuts = prepShortcuts();
      shortcuts = shortcutKeys(shortcuts).reduce(function (acc, cv) {
        var shortcut = shortcuts[cv];
        evalShortcut(shortcut, $scope);
        var row = acc[(shortcuts[cv].row || 1) - 1];
        if (!Array.isArray(row)) {
          row = [];
          acc.push(row);
        }

        row.push(shortcut);
        return acc;
      }, []);

      return shortcuts;
    };
    var initFlatShortcuts = function initFlatShortcuts($scope) {
      var shortcuts = prepShortcuts();
      shortcuts = shortcutKeys(shortcuts).map(function (key) {
        var shortcut = shortcuts[key];
        evalShortcut(shortcut, $scope);
        return shortcut;
      });

      return shortcuts;
    };

    return {
      isObject: isObject,
      valInScope: valInScope,
      evalShortcut: evalShortcut,
      evalCondition: evalCondition,
      initShortcuts: initShortcuts,
      initFlatShortcuts: initFlatShortcuts
    };
  });
})(angular.module('swSelfService'));
//# sourceMappingURL=shortcuts.service.js.map