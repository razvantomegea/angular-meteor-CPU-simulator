/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    
    'use strict';
    function SequenceController($rootScope, $scope, $timeout, $log) {
        this.state = 0;
        this.clock = 100;

        $scope.$on('setClock', (event, clock) => {
            this.clock = clock;
            $log.debug("Clock set");
        });

        $scope.$on('reset', () => {
            $log.log('RESET');
            $timeout(() => {
                this.state = 0;
                $rootScope.$broadcast('initialiseMarMir');
            }, this.clock);
        });

        $scope.$on('readyMarMir', () => {
            $log.log('STATE 1: EN1');
            $timeout(() => {
                this.state = 1;
                $rootScope.$broadcast('EN1');
            }, this.clock);
        });

        $scope.$on('operationDone', () => {
            $log.log('MREQ');
            $rootScope.mreq = 1;
            if ($rootScope.memoryBusy) {
                $log.log('STATE 2: BSY');
                this.state = 2;
            } else {
                this.state = 3;
                $log.log('STATE 3: !BSY');
                $timeout(() => {
                    $rootScope.$broadcast('rwMemory');
                }, this.clock);
            }
        });

        $scope.$on('memoryWrite', (msg, data) => {
            $log.log('STATE 3: EN3');
            $timeout(() => {
                $rootScope.$broadcast('EN3', data);
            }, this.clock);
        });

        $scope.$on('executeNextInstruction', () => {
            $log.log('STATE 1: EN1');
            $timeout(() => {
                this.state = 1;
                $rootScope.$broadcast('EN1');
            }, this.clock);
        });

    }

    SequenceController.$inject = ['$rootScope', '$scope', '$timeout', '$log'];

    angular.module('app.cpuModule.executionModule').component('sequencer', {
        templateUrl: 'client/cpu-simulator/components/compiler/sequencer/sequencer.html',
        controller: SequenceController,
        controllerAs: 'seqCtrl'
    });

}(window.angular));