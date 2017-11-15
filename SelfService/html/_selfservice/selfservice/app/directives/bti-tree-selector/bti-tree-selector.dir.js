'use strict';

(function () {
  'use strict';

  angular.module('swSelfService').directive('btiTreeSelector', [function () {
    return {
      restrict: 'E',
      templateUrl: 'app/directives/bti-tree-selector/bti-tree-selector.tpl.html',
      scope: true,
      bindToController: {
        data: '=',
        display: '@',
        value: '@'
      },
      controllerAs: 'treeSelector',
      controller: function controller() {
        var _this = this;

        var updateData = function updateData() {
          _this.filterData = angular.copy(_this.data);
        };

        updateData();

        this.focused = false;

        this.updateClass = function (cssClass) {
          _this.class = cssClass;
        };

        this.focus = function () {
          alert('testing');
          _this.focused = true;
        };

        this.blur = function () {
          _this.focused = false;
        };

        this.hover = function (category) {
          _this.category = category;
        };

        this.hoverOut = function () {
          _this.category = '';
        };

        this.select = function (option) {
          _this.selected = option.id;
          if (_this.hasChildren(option)) {
            if (option.id === _this.selected && _this.prevData) {
              _this.data = _this.prevData;
              _this.prevData = null;
              updateData();
            } else {
              _this.prevData = _this.data;
              _this.data = { options: [option] };
              updateData();
            }
          }
        };

        this.hasChildren = function (option) {
          return option.children.length > 0;
        };
        this.filter = function (pattern) {
          var filter = function filter(el, i) {
            var match = el.id.match(new RegExp('.?(' + pattern + ').?', 'i'));
            if (match) {
              return match;
            } else if (el.children.length) {
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = _this.data.options[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var option = _step.value;

                  if (angular.equals(option, el)) {
                    option.children = el.children.filter(filter, _this);
                  }
                }
                // this.data.options[i].children = el.children.filter(filter, this);
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

              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = el.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var child = _step2.value;

                  var _match = filter(child, i);
                  if (_match) {
                    return _match;
                  }
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }
            }

            return false;
          };
          _this.data.options = _this.filterData.options.filter(filter, _this);
        };
      },
      link: function link(scope, elem, attrs, ctrl) {
        elem.attr('class', '');
        ctrl.updateClass(attrs.class);
      }
    };
  }]);
})();
//# sourceMappingURL=bti-tree-selector.dir.js.map