(function(angular){
	
  'use strict';
	angular.module('app').config(config);
	config.$inject = ['$urlRouterProvider', '$stateProvider', '$locationProvider'];

	function config($urlRouterProvider, $stateProvider, $locationProvider){
		$locationProvider.html5Mode(true);

		$stateProvider
			.state('cpu', {
				url: '/cpu',
				templateUrl: 'client/cpu-simulator/main.html',
				controller: 'CpuController',
				controllerAs: 'cpuCtrl'
			});
		$urlRouterProvider.otherwise("/cpu");
	}

})(window.angular);