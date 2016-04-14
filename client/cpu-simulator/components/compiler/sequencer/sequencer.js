/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    
    'use strict';
    function SequenceController($rootScope, $scope, $log) {
        this.state = {
            "ST1": 0,
            "ST2": 0,
            "ST3": 0
        };

        $scope.$on('RESET', () => {
            this.state.ST1 = 1;
            this.state.ST2 = 0;
            this.state.ST3 = 0;
            $rootScope.$broadcast('EN1');
        });

        $scope.$on('OTHER', () => {
            this.state.ST1 = 0;
            this.state.ST2 = 0;
            this.state.ST3 = 1;
            $rootScope.$broadcast('EN3');
        });

        $scope.$on('NEXT', () => {
            this.state.ST1 = 1;
            this.state.ST2 = 0;
            this.state.ST3 = 0;
            $rootScope.$broadcast('EN1');
        });

    };

    SequenceController.$inject = ['$rootScope', '$scope', '$log'];

    angular.module('app.cpuModule.executionModule').component('sequencer', {
        templateUrl: 'client/cpu-simulator/components/compiler/sequencer/sequencer.html',
        controller: SequenceController,
        controllerAs: 'seqCtrl'
    });

}(window.angular));