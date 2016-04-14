/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    var memoryService = function ($log, convertionService) {
        var memSvc = this;
        memSvc.memory = Array(256);
        function initialiseMemory(){
            for(let i = 0; i < 256; i++){
                memSvc.memory[i] = {
                    "address": convertionService.extend(convertionService.convert(i).from(10).to(16)).to(4).toUpperCase(),
                    "data": 0b0000000000000000
                };
            }
            return memSvc.memory;
        }
        
        memSvc.initialiseMemory = initialiseMemory;
    };

    memoryService.$inject = ['$log', 'convertionService'];

    angular.module('app.cpuModule').service('memoryService', memoryService);

}(window.angular));