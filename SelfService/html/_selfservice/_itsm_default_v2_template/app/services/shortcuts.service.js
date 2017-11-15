((sw) => {
  'use strict';
  sw.factory('shortcuts', () => {

    const defaultShortcuts = {
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
        "desc": "Request or view a service",
      },
      "_requests": {
        "sref": "requests.myrequests",
        "icon": "fa-tasks",
        "text": "Requests",
        "desc": "View or update your requests",
      },
      "_knowledge": {
        "sref": "knowledge",
        "icon": "fa-binoculars",
        "text": "Knowledge",
        "desc": "Search for help",
      },
      "_authorize": {
        "sref": "requestsauth.myauths",
        "icon": "fa-check-square-o",
        "badge": "numAuths",
        "text": "Authorize",
        "desc": "Authorize a request",
        "condition": "$scope | sessServ.numAuths > 0"
      },
    };

    const prepShortcuts = () => {
      return orderBy(wssLayout.homePage.shortcuts, merge({}, defaultShortcuts, wssLayout.homePage.shortcuts));
    };

    const shortcutKeys = shortcuts => {
      let shortcutKeys = Object.keys(shortcuts).filter(s => (!shortcuts[s].hidden && evalCondition(shortcuts[s].condition)));
      shortcutKeys.sort((a, b) => ((shortcuts[a].row || 0) - (shortcuts[b].row || 0)));
      return shortcutKeys;
    };
    const isObject = item => {
      return (item && typeof item === 'object' && !Array.isArray(item));
    };

    const merge = (target, ...sources) => {
      if (!sources.length) return target;
      const source = sources.shift();

      if (isObject(target) && isObject(source)) {
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            if (isObject(source[key])) {
              if (!target[key]) Object.assign(target, { [key]: {} });
              merge(target[key], source[key]);
            } else {
              Object.assign(target, { [key]: source[key] });
            }
          }
        }
      }

      return merge(target, ...sources);
    };

    const orderBy = (map, target) => {
      map = (Array.isArray(map) && map) || Object.keys(map);
      let reorderd = {};
      map.forEach(e => {
        reorderd[e] = target[e];
      });
      return merge({}, reorderd);
    };

    const valInScope = (v, $scope) => {
      if (!v) return v;
      let vParts = v.split('|');
      if (vParts[0].trim() !== '$scope') return false;
      return $scope.$eval(vParts[1].trim());
    };

    const evalShortcut = (sc, $scope) => {
      let valInObject = v => {
        return ((sc, v) => {
          return sc[v];
        })(sc, v)
      };
      for (let e of Object.entries(sc)) {
        sc[e[0]] = valInObject(e[1]) || valInScope(e[1], $scope) || e[1]
      }
    };
    const evalCondition = cond => typeof cond === 'undefined' || cond;
    const initShortcuts = $scope => {
      let shortcuts = prepShortcuts();
      shortcuts = shortcutKeys(shortcuts).reduce(
        (acc, cv) => {
          let shortcut = shortcuts[cv];
          evalShortcut(shortcut, $scope);
          let row = acc[(shortcuts[cv].row || 1) - 1];
          if (!Array.isArray(row)) {
            row = [];
            acc.push(row);
          }

          row.push(shortcut);
          return acc;
        }
        , []
      );

      return shortcuts;

    };
    const initFlatShortcuts = $scope => {
      let shortcuts = prepShortcuts();
      shortcuts = shortcutKeys(shortcuts).map(
        (key) => {
          let shortcut = shortcuts[key];
          evalShortcut(shortcut, $scope);
          return shortcut
        });

      return shortcuts;

    };

    return {
      isObject,
      valInScope,
      evalShortcut,
      evalCondition,
      initShortcuts,
      initFlatShortcuts
    }

  })
})(angular.module('swSelfService'));