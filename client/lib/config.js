(function (angular) {

    'use strict';
    function config($urlRouterProvider, $stateProvider, $locationProvider, $compileProvider, $httpProvider, $mdThemingProvider) {
        $locationProvider.html5Mode(true);
        $compileProvider.debugInfoEnabled(false);
        $httpProvider.defaults.cache = true;
        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey')
            .accentPalette('grey');
        $stateProvider
            .state('cpu', {
                url: '/cpu',
                templateUrl: 'client/cpu-simulator/main.html',
                controller: 'CpuController',
                controllerAs: 'cpuCtrl',
                resolve: {
                    memory(memoryService) { memoryService.initialiseMemory() }
                }
            });
        $urlRouterProvider.otherwise("/cpu");
    }

    config.$inject = ['$urlRouterProvider', '$stateProvider', '$locationProvider', '$compileProvider', '$httpProvider', '$mdThemingProvider'];
    angular.module('app').config(config);

})(window.angular);