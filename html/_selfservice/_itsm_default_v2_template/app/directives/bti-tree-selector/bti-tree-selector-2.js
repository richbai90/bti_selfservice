(() => {
  'use strict';
  angular
    .module('swSelfService')
    .directive('btiTreeSelector', [
      () => ({
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
          onSelect: '<',
        },

        controllerAs: 'treeSelector',
        controller ()  {
          this.options = angular.copy(this.data);
          this.focused = false;
          this.currentLevel = { id: 'top', display: 'Select a Category' };

          function hasChildren(option) {
            return (!Array.isArray(option) && (option.children && option.children.length));
          }

          function getOptionByID(id, options) {
            let option;
            if (id === 'top') {
              return options;
            }
            const arrID = id.split(' -> ');
            if (arrID.length === 1) {
              option = options.find(el => el.id === id);
            } else {
              option = arrID.reduce((acc, cv, ci) => (ci ? acc.children.find(el => el.name === cv) : options.find(el => el.name === acc)), arrID[0])
            }

            return option;
          }

          const updateOptions = (options, data) => {
            const option = typeof options === 'string' ? getOptionByID(options, data) : options;
            const children = hasChildren(option);
            this.options = angular.copy(children ? option.children : option);
          };


          const navigate = crumb => {
            const option = getOptionByID.call(this, crumb.id, this.data);
            updateOptions.call(this, option, this.data);
            if (crumb.id === 'top') {
              this.model.$setViewValue(this.onSelect(undefined));
              this.model.$setValidity('completeselect', false);
            } else {
              if (!option.children.length) {
                this.model.$setViewValue(this.onSelect([option]));
                this.model.$setValidity('completeselect', true);
              } else {
                this.model.$setValidity('completeselect', false);
                this.model.$setViewValue(this.onSelect(undefined))
                this.focus();
              }
            }

            this.currentLevel = crumb;
          };

          const select = option => {
            updateOptions(option.children, this.data);
            this.currentLevel = { id: option.id, display: option.name };
            if (!option.children.length) {
              this.model.$setViewValue(this.onSelect([option]));
              this.model.$setValidity('completeselect', true);
            } else {
              this.model.$setValidity('completeselect', false)
            }


          };

          this.focus = () => {
            this.focused = true
          };

          this.blur = () => {
            if (!this.preventDeFocus || !this.options.length) {
              this.focused = false;
            }
          };

          this.hover = category => {
            this.category = category;
            this.preventDeFocus = true;
          };

          this.hoverOut = () => {
            this.category = '';
            this.preventDeFocus = false;
          };

          this.select = select.bind(this);
          this.navigate = navigate.bind(this);

        },
        link(scope, elem, attr, ctrl) {
          scope.treeSelector.model = ctrl;
          elem.attr('class', '');
        }
      }),
    ])
})();