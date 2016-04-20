(function (angular) {

    'use strict';
    function config($urlRouterProvider, $stateProvider, $locationProvider) {
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

    config.$inject = ['$urlRouterProvider', '$stateProvider', '$locationProvider'];
    angular.module('app').config(config);

})(window.angular);