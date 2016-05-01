/**
 *  @description    The decodification controller that handles the decodification process
 *  @author         Razvan Tomegea
 */
(function (angular) {
    'use strict';
    /**
     * Decodification controller implementation
     * @param $rootScope                Angular global scope service
     * @param $scope                    Angular local scope service
     * @param decodificationFactory     Decodification factory service (decodification methods implementations)
     * @constructor
     */
    function DecodeController($rootScope, $scope, decodificationFactory, $mdToast) {
        // Store the decoded instructions
        this.lowInstructionSet = [];
        // Get the decodification methods
        this.decoder = decodificationFactory;
        this.showAsmMessage = () => {
            $mdToast.show(
                $mdToast.show({
                    controller: ($scope, $mdToast) => {
                        $scope.closeAsmMessage = () => $mdToast.hide();
                    },
                    template: '<md-toast layout="row" layout-align="space-between center">' +
                                '<i class="material-icons">thumb_up</i>' +
                                '<p>Code assembled successfully!</p>' +
                                '<span flex></span>' +
                                '<md-button ng-click="closeAsmMessage()">Close</md-button>' +
                                '</md-toast>',
                    position: 'bottom right',
                    hideDelay: 3000
                }));
        };
        
        $scope.$on('ASSEMBLE', (event, highInstructionSet) => {
            this.decodeInstructions(highInstructionSet);
            this.showAsmMessage();
            // Set the global instruction counter in order to know when to stop the execution
            $rootScope.conditions.INSTRUCTION = this.lowInstructionSet.length;
            $rootScope.$broadcast('EXECUTE', this.lowInstructionSet);
        });
        
        this.decodeInstructions = instructionSet => {
            this.highInstructionSet = instructionSet;
            this.lowInstructionSet = [];
            this.decoder.instructionDecodification(this.highInstructionSet, this.lowInstructionSet);
        }
    }
    
    DecodeController.$inject = ['$rootScope', '$scope', 'decodificationFactory', '$mdToast'];
    
    angular.module('app.cpuModule.assemblyModule').component('decoder', {
        templateUrl: 'client/cpu-simulator/components/assembler/decoder/decoder.html',
        controller: DecodeController,
        controllerAs: 'decodeCtrl'
    });
        
}(window.angular));