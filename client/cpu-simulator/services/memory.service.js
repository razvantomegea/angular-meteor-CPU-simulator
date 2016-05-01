/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    var memoryService = function ($rootScope, $log, dataHelpService) {
        $rootScope.memory = Array(256);
        $rootScope.mreq = 0;
        $rootScope.memoryBusy = false;
        this.initialiseMemory = () => {
            for (let i = 0; i < 256; i++) {
                $rootScope.memory[i] = {
                    "address": dataHelpService.extend(dataHelpService.convert(i).from(10).to(16)).to(4).toUpperCase(),
                    "data": 0b0000000000000000
                };
            }
        };
    };

    memoryService.$inject = ['$rootScope', '$log', 'dataHelpService'];

    angular.module('app.cpuModule').service('memoryService', memoryService);

}(window.angular));