(function () {
	'use strict';

	angular.module('swSelfService').controller('ProfileDetailsCtrl', ProfileDetailsCtrl);
	ProfileDetailsCtrl.$inject = ['$scope', 'SWSessionService', 'ProfileService'];
	function ProfileDetailsCtrl($scope, SWSessionService, ProfileService) {
		$scope.profile = ProfileService;

		$scope.resetProfileDetails = function () {
			SWSessionService.checkActiveSession().then(function () {
				$scope.profile.getProfileDetails().then(function (user) {
					$scope.user = user;
				});
			});
		};

		$scope.submitProfileUpdate = function () {
			SWSessionService.checkActiveSession().then(function () {
				$scope.profile.updateProfileDetails($scope.user);
			});
		};

		$scope.resetProfileDetails();

		//Watch for logout broadcast to clean up session-specific data ready for a new user
		$scope.$on('logout', function () {
			$scope.profile = {};
		});
	}

	angular.module('swSelfService').controller('ProfileCICtrl', ProfileCICtrl);
	ProfileCICtrl.$inject = ['$scope', 'SWSessionService', 'ProfileService'];
	function ProfileCICtrl($scope, SWSessionService, ProfileService) {
		$scope.profile = ProfileService;

		SWSessionService.checkActiveSession().then(function () {
			$scope.profile.getCustCIs().then(function (cis) {
				$scope.cisArray = cis;
			});
		});
		//Watch for logout broadcast to clean up session-specific data ready for a new user
		$scope.$on('logout', function () {
			$scope.profile = {};
		});
	}

	angular.module('swSelfService').controller('ProfileKBCtrl', ProfileKBCtrl);
	ProfileKBCtrl.$inject = ['$scope', 'SWSessionService', 'ProfileService', 'wssLogging'];
	function ProfileKBCtrl($scope, SWSessionService, ProfileService, wssLogging) {
		$scope.profile = ProfileService;

		SWSessionService.checkActiveSession().then(function () {
			$scope.resetCustSubs();
		});

		$scope.resetCustSubs = function () {
			//-- get customer subscribed catalogs
			$scope.profile.getKBSubsCatIDs().then(function (kbnotifs) {
				//-- get all catalogs
				$scope.profile.getKBCatalogs().then(function (kbcats) {
					var kbCatArray = [];
					//-- for each catalog...
					for (var i = 0; i < kbcats.length; i++) {
						//-- if cutomer is subscribed to catalog...
						if (kbnotifs.indexOf(kbcats[i].catalogid) > -1) {
							kbCatArray.push({ id: kbcats[i].catalogid,
								name: kbcats[i].catalogname,
								subscribed: true });
						}
						//-- if cutomer is NOT subscribed to catalog...
						else {
								kbCatArray.push({ id: kbcats[i].catalogid,
									name: kbcats[i].catalogname,
									subscribed: false });
							}
					}
					$scope.kbCatArray = kbCatArray;
				});
			});
		};

		$scope.submitSubsUpdate = function () {
			$scope.profile.updateCustSubs($scope.kbCatArray);
		};

		//Watch for logout broadcast to clean up session-specific data ready for a new user
		$scope.$on('logout', function () {
			$scope.profile = {};
		});
	}
})();
//# sourceMappingURL=profile.ctrl.js.map