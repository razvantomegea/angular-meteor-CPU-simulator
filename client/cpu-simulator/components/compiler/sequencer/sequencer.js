/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    
    'use strict';
    function SequenceController($rootScope, $scope, $timeout) {
        this.state = {
            "ST1": 0,
            "ST2": 0,
            "ST3": 0
        };

        $scope.$on('RESET', () => {
            $timeout(() => {
                this.state.ST1 = 1;
                this.state.ST2 = 0;
                this.state.ST3 = 0;
                $rootScope.$broadcast('EN1');
            }, 500);
        });

        $scope.$on('OTHER', () => {
            $timeout(() => {
                this.state.ST1 = 0;
                this.state.ST2 = 0;
                this.state.ST3 = 1;
                $rootScope.$broadcast('EN3');
            }, 500);

        });

        $scope.$on('NEXT', () => {
            $timeout(() => {
                this.state.ST1 = 1;
                this.state.ST2 = 0;
                this.state.ST3 = 0;
                $rootScope.$broadcast('EN1');
            }, 500);
        });

    }

    SequenceController.$inject = ['$rootScope', '$scope', '$timeout'];

    angular.module('app.cpuModule.executionModule').component('sequencer', {
        templateUrl: 'client/cpu-simulator/components/compiler/sequencer/sequencer.html',
        controller: SequenceController,
        controllerAs: 'seqCtrl'
    });

}(window.angular));