/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    var memoryService = function ($rootScope, $log, dataHelpService) {
        $rootScope.memoryMap = [];
        this.memory = new DataView(new ArrayBuffer(256));
        $rootScope.mreq = 0;
        $rootScope.memoryBusy = false;
        this.initialiseMemory = () => {
            for (let i = 0; i < 256; i++) {
                this.memory.setUint8(i, 0);
                $rootScope.memoryMap[i] = 0;
            }
        };

        this.memoryWrite = (address, data) => {
            this.memory.setUint8(address, data);
            $rootScope.memoryMap[address] = data;
        };

        this.memoryRead = (address) => this.memory.getUint16(address);
    };

    memoryService.$inject = ['$rootScope', '$log', 'dataHelpService'];

    angular.module('app.cpuModule').service('memoryService', memoryService);

}(window.angular));