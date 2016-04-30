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
    function DecodeController($rootScope, $scope, decodificationFactory) {
        // Store the decoded instructions
        this.lowInstructionSet = [];
        // Get the decodification methods
        this.decoder = decodificationFactory;
        
        $scope.$on('ASSEMBLE', (event, highInstructionSet) => {
            this.decodeInstructions(highInstructionSet);
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
    
    DecodeController.$inject = ['$rootScope', '$scope', 'decodificationFactory'];
    
    angular.module('app.cpuModule.assemblyModule').component('decoder', {
        templateUrl: 'client/cpu-simulator/components/assembler/decoder/decoder.html',
        controller: DecodeController,
        controllerAs: 'decodeCtrl'
    });
        
}(window.angular));