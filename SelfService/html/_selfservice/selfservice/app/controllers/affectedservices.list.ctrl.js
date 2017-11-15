'use strict';

(function () {
	'use strict';

	angular.module('swSelfService').controller('AffectedServicesCtrl', AffectedServicesCtrl);
	AffectedServicesCtrl.$inject = ['$scope', 'SWSessionService', 'AffectedServicesService', 'wssLogging'];
	function AffectedServicesCtrl($scope, SWSessionService, AffectedServicesService, wssLogging) {
		$scope.notifications = AffectedServicesService;
		$scope.notifications.notificationsLoading = false;
		$scope.notifArray = [];

		SWSessionService.checkActiveSession().then(function () {
			$scope.notifications.getActiveNotifications().then(function (notifs) {
				$scope.notifArray = notifs;
			});
		});

		//Watch for logout broadcast to clean up session-specific data ready for a new user
		$scope.$on('logout', function () {
			$scope.notifications = {};
		});
	}
})();
//# sourceMappingURL=affectedservices.list.ctrl.js.map