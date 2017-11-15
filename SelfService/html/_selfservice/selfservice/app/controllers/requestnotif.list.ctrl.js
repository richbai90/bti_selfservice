'use strict';

(function () {
	'use strict';

	angular.module('swSelfService').controller('RequestNotifServiceCtrl', RequestNotifServiceCtrl);
	RequestNotifServiceCtrl.$inject = ['$scope', 'SWSessionService', 'RequestNotifService', 'wssLogging'];
	function RequestNotifServiceCtrl($scope, SWSessionService, RequestNotifService, wssLogging) {
		$scope.notifications = RequestNotifService;
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
//# sourceMappingURL=requestnotif.list.ctrl.js.map