(function () {
	'use strict';
	//-- CMBD status level icon filter for use with Affected Service Notification list - given a "cmdb status level" returns the relevant icon. 

	angular.module('swSelfService').filter('cmdbStatusLvlIcon', function () {
		return function (strStatusLvl) {
			var icon = "";
			switch (strStatusLvl) {
				case "Unavailable":
				case "Deactivated":
					icon = "fa-ban";
					break;
				case "Faulty":
				case "Impacted":
					icon = "fa-exclamation-triangle";
					break;
				case "Available":
				case "Active":
					icon = "fa-check";
					break;
				default:
					icon = "fa-question-circle";
			}
			return icon;
		};
	})
	//-- ci status level colour filter - given a "status level" reurns the relevant colour for the status level icon. 
	.filter('cmdbStatusLvlColor', function () {
		return function (strStatusLvl) {
			var colour = "";
			switch (strStatusLvl) {
				case "Available":
				case "Active":
					colour = "green";
					break;
				case "Faulty":
				case "Impacted":
					colour = "#FFC663";
					break;
				case "Unavailable":
				case "Deactivated":
					colour = "red";
					break;
				default:
					colour = "green";
			}
			return colour;
		};
	}).filter('serviceTitle', function () {
		return function (strDesc, strCmdbStatus, strFail, strImpact) {
			var strReturn = "";
			switch (strCmdbStatus) {
				case "Available":
				case "Active":
					strReturn = strDesc;
					break;
				case "Faulty":
				case "Impacted":
					strReturn = strDesc + "<br>" + strImpact;
					break;
				case "Unavailable":
				case "Deactivated":
					strReturn = strDesc + "<br>" + strFail;
					break;
				default:
					strReturn = strDesc;
			}
			return strReturn;
		};
	}).filter('requestTitle', function () {
		return function (strTitle, strCallClass, strProbTitle) {
			var strReturn = "";
			switch (strCallClass) {
				case "Problem":
				case "Known Error":
					strReturn = strProbTitle;
					break;
				default:
					strReturn = strTitle;
			}
			return strReturn;
		};
	}).filter('requestNotifStatus', function () {
		return function (strStatus, strCallClass) {
			//var strNewStatus = app.callStatus(strStatus);
			return strCallClass + " : " + strStatus;
		};
	}).filter('requestNotifClass', function () {
		return function (strCallClass) {
			var icon = "";
			switch (strCallClass) {
				case "Problem":
					icon = "fa-wrench";
					break;
				case "Known Error":
					icon = "fa-lightbulb-o";
					break;
				case "Change Request":
					icon = "fa-plus-circle";
					break;
				case "Release Request":
					icon = "hfa-problem";
					break;
				default:
					icon = "fa-question-circle";
			}
			return icon;
		};
	});
})();
//# sourceMappingURL=notifications.fltr.js.map