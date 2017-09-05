(function () {
	'use strict';

	angular.module('swSelfService').controller('NotificationCtrl', NotificationCtrl);
	NotificationCtrl.$inject = ['$scope', 'SWSessionService', 'NotificationService', 'wssLogging'];
	function NotificationCtrl($scope, SWSessionService, NotificationService, wssLogging) {
		$scope.notifications = NotificationService;
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
//# sourceMappingURL=notifications.list.ctrl.js.map