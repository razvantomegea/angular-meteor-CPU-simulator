/**
 * Main module and dependencies
 */
(function (angular) {

    'use strict';
    angular.module('app.cpuModule.assemblyModule', []);

    angular.module('app.cpuModule.executionModule', []);

    angular.module('app.cpuModule', [
        'app.cpuModule.assemblyModule',
        'app.cpuModule.executionModule'
    ]);

    angular.module('app', [
        'angular-meteor',
        'ui.router',
        'ngAnimate',
        'ngMaterial',
        'ngMdIcons',
        'app.cpuModule'
    ]);

})(window.angular);