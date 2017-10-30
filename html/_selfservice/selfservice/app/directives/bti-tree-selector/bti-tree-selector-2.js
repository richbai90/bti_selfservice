'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').directive('btiTreeSelector', ['$timeout', function ($timeout) {
    return {
      restrict: 'E',
      templateUrl: 'app/directives/bti-tree-selector/bti-tree-selector.tpl2.html',
      transclude: true,
      scope: true,
      require: 'ngModel',
      bindToController: {
        data: '<',
        display: '@',
        value: '@',
        className: '@class',
        style: '@',
        onSelect: '<'
      },

      controllerAs: 'treeSelector',
      controller: function controller() {
        var _this = this;

        this.options = angular.copy(this.data);
        this.focused = false;
        this.currentLevel = { id: 'top', display: 'Top Level' };
        this.focusedCount = 0;

        function hasChildren(option) {
          return !Array.isArray(option) && option.children && option.children.length;
        }

        function getOptionByID(id, options) {
          var option = void 0;
          if (id === 'top') {
            return options;
          }
          var arrID = id.split(' -> ');
          if (arrID.length === 1) {
            option = options.find(function (el) {
              return el.id === id;
            });
          } else {
            option = arrID.reduce(function (acc, cv, ci) {
              return ci ? acc.children.find(function (el) {
                return el.name === cv;
              }) : options.find(function (el) {
                return el.name === acc;
              });
            }, arrID[0]);
          }

          return option;
        }

        var toggleExpand = function toggleExpand() {

          var self = _this;
          _this.expanding = false;
          $timeout(function () {
            return self.expanding = true;
          }, 50);
        };

        var updateOptions = function updateOptions(options, data) {
          var option = typeof options === 'string' ? getOptionByID(options, data) : options;
          var children = hasChildren(option);
          _this.options = angular.copy(children ? option.children : option);
        };

        var navigate = function navigate(crumb) {
          var option = getOptionByID.call(_this, crumb.id, _this.data);
          updateOptions.call(_this, option, _this.data);
          if (crumb.id === 'top') {
            _this.model.$setViewValue(_this.onSelect(undefined));
            _this.model.$setValidity('completeselect', false);
          } else {
            if (!option.children.length) {
              _this.model.$setViewValue(_this.onSelect([option]));
              _this.model.$setValidity('completeselect', true);
              _this.blur();
            } else {
              _this.model.$setValidity('completeselect', false);
              _this.model.$setViewValue(_this.onSelect(undefined));
              _this.focus();
            }
          }

          _this.currentLevel = angular.copy(crumb);
        };

        var select = function select(option, e) {
          angular.element(e.currentTarget).parent().focus();
          updateOptions(option.children, _this.data);
          _this.currentLevel = { id: option.id, display: option.name };
          if (!option.children.length) {
            _this.model.$setViewValue(_this.onSelect([option]));
            _this.model.$setValidity('completeselect', true);
            _this.blur();
          } else {
            _this.model.$setValidity('completeselect', false);
          }
        };

        this.keyPress = function (e) {
          if (_this.focused) {
            e.preventDefault();
            if ((e.which === 8 || e.which === 37) && _this.model.crumbs.length) {
              var prevCrumb = _this.model.crumbs.length - 2;
              if (prevCrumb >= 0) navigate(_this.model.crumbs[prevCrumb]);
            }
          }
        };

        this.expand = function () {
          if (_this.focusedCount <= 1) {
            _this.focusedCount += 2;
            _this.preventDeFocus = true;
          } else {
            _this.preventDeFocus = false;
          }
          _this.focused ? _this.blur(true) : _this.focus();
        };

        this.focus = function () {
          toggleExpand();
          _this.focusedCount++;
          _this.focused = true;
        };

        this.blur = function (force) {
          if (!_this.preventDeFocus && (force || !_this.options.length)) {
            _this.expanding = false;
            _this.focused = false;
            _this.focusedCount = 0;
          }
        };

        this.hover = function (category) {
          _this.category = category;
          _this.preventDeFocus = true;
        };

        this.hoverOut = function () {
          _this.category = '';
          _this.preventDeFocus = false;
        };

        this.select = select.bind(this);
        this.navigate = navigate.bind(this);
      },
      link: function link(scope, elem, attr, ctrl) {
        scope.treeSelector.model = ctrl;
        elem.attr('class', '');
      }
    };
  }]);
})();
//# sourceMappingURL=bti-tree-selector-2.js.map