(() => {

  angular.module('swSelfService').directive('expand', ['Resize', Resize => ({
    link: (scope, elem, attr) => {

      new Resize(elem, () => {

        let h = 0;
        [].slice.call(elem.children()).forEach(e => {
          h += $(e).height();
        });
        elem.css('max-height', h + 'px');
      });
    }
  })]);
})();
//# sourceMappingURL=expand.dir.js.map