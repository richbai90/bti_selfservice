(function () {
	'use strict';
	//-- ci status level icon filter - given a "status level" reurns the relevant icon for the status level. 

	angular.module('swSelfService').filter('statusLvlIcon', function () {
		return function (strStatusLvl) {
			var icon = "";
			switch (strStatusLvl) {
				case "Available":
					icon = "fa-arrow-circle-up";
					break;
				case "Decomissioned":
					icon = "fa-ban";
					break;
				case "Faulty":
					icon = "fa-exclamation-triangle";
					break;
				case "Operational":
					icon = "fa-check";
					break;
				case "Under-Repair":
					icon = "fa-gavel";
					break;
				default:
					icon = "fa-arrow-circle-up";
			}
			return icon;
		};
	})
	//-- ci status level colour filter - given a "status level" reurns the relevant colour for the status level icon. 
	.filter('statusLvlColor', function () {
		return function (strStatusLvl) {
			var colour = "";
			switch (strStatusLvl) {
				case "Available":
				case "Operational":
					colour = "green";
					break;
				case "Decomissioned":
				case "Faulty":
				case "Under-Repair":
					colour = "red";
					break;
				default:
					colour = "green";
			}
			return colour;
		};
	});
})();
//# sourceMappingURL=ci.fltr.js.map