(() => {
  'use strict';

  angular.module('swSelfService').directive('btiTreeSelector', [() => ({
    restrict: 'E',
    templateUrl: 'app/directives/bti-tree-selector/bti-tree-selector.tpl.html',
    scope: true,
    bindToController: {
      data: '=',
      display: '@',
      value: '@'
    },
    controllerAs: 'treeSelector',
    controller() {

      const updateData = () => {
        this.filterData = angular.copy(this.data);
      };

      updateData();

      this.focused = false;

      this.updateClass = cssClass => {
        this.class = cssClass;
      };

      this.focus = () => {
        alert('testing');
        this.focused = true;
      };

      this.blur = () => {
        this.focused = false;
      };

      this.hover = category => {
        this.category = category;
      };

      this.hoverOut = () => {
        this.category = '';
      };

      this.select = option => {
        this.selected = option.id;
        if (this.hasChildren(option)) {
          if (option.id === this.selected && this.prevData) {
            this.data = this.prevData;
            this.prevData = null;
            updateData();
          } else {
            this.prevData = this.data;
            this.data = { options: [option] };
            updateData();
          }
        }
      };

      this.hasChildren = option => option.children.length > 0;
      this.filter = pattern => {
        const filter = (el, i) => {
          let match = el.id.match(new RegExp(`.?(${pattern}).?`, 'i'));
          if (match) {
            return match;
          } else if (el.children.length) {
            for (let option of this.data.options) {
              if (angular.equals(option, el)) {
                option.children = el.children.filter(filter, this);
              }
            }
            // this.data.options[i].children = el.children.filter(filter, this);
            for (let child of el.children) {
              let match = filter(child, i);
              if (match) {
                return match;
              }
            }
          }

          return false;
        };
        this.data.options = this.filterData.options.filter(filter, this);
      };
    },
    link(scope, elem, attrs, ctrl) {
      elem.attr('class', '');
      ctrl.updateClass(attrs.class);
    }
  })]);
})();
//# sourceMappingURL=bti-tree-selector.dir.js.map