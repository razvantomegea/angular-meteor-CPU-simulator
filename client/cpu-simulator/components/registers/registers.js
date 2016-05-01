/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {

    'use strict';
    function RegistersController($scope, $rootScope, $log, dataHelpService, registerFactory, $timeout) {

        this.registers = registerFactory;
        this.clock = 100;

        $scope.$on('setClock', (event, clock) => this.clock = clock);

        $scope.$on('initialisePcSp', () => {
            this.registers.initialisePcSp();
            this.registers.resetDataBus();
            $rootScope.$broadcast('readyPcSp');
        });

        $scope.$on('sendSbus', (msg, data) => {
            this.registers.resetDataBus();
            this.registers.sendDataOnSbus(data)
        });

        $scope.$on('sendDbus', (msg, data) => {
            this.registers.resetDataBus();
            this.registers.sendDataOnDbus(data);
            $rootScope.$broadcast('receiveAlu');
        });

        $scope.$on('setCarry', (msg, data) => {
            this.registers.registers.setCarry(data);
        });

        $scope.$on('receiveRbus', (msg, data) => {
            this.registers.dataBus['regRbus'] = $rootScope.dataBus['rbus'];
            this.registers.saveData(data);
        });

        $scope.$on('other', (msg, data) => this.registers.specialOperation(data));

        $scope.$on('exchangeMemory', (msg, data) => {
            $log.log('MACK');
            $rootScope.mreq = 0;
            $rootScope.memoryBusy = true;
            this.registers.memoryOperation(data);
            $rootScope.memoryBusy = false;
            $timeout(() => {
                $rootScope.dataBus.memRdBus = 0;
                $rootScope.dataBus.memWrBus = 0;
            }, this.clock);
            $rootScope.$broadcast('memoryExchangeDone');
        });
    }

    RegistersController.$inject = ['$scope', '$rootScope', '$log', 'dataHelpService', 'registerFactory', '$timeout'];

    angular.module('app.cpuModule').component('registers', {
        templateUrl: 'client/cpu-simulator/components/registers/registers.html',
        controller: RegistersController,
        controllerAs: 'regCtrl'
    });

}(window.angular));