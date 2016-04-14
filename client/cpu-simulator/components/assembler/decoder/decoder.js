/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {

    'use strict';
    function DecodeController($rootScope, $scope, decodificationFactory) {
        this.machineCodeIntructionSet = [''];
        this.decoder = decodificationFactory;
        
        $scope.$on('changedHighMacroInstructionSet', (message, data) => {
            this.decodeInstructions(data);
            $rootScope.conditions.INSTRUCTION = this.machineCodeIntructionSet.length;
            $rootScope.$broadcast('changedMachineMacroInstructionSet', this.machineCodeIntructionSet);
        });
        
        this.decodeInstructions = data => {
            this.highMacroInstructionSet = data;
            this.machineCodeIntructionSet = [];
            this.decoder.instructionDecodification(data, this.machineCodeIntructionSet);
        }
    }
    
    DecodeController.$inject = ['$rootScope', '$scope', 'decodificationFactory'];
    
    angular.module('app.cpuModule.assemblyModule').component('decoder', {
        templateUrl: 'client/templates/faculty/cpu-simulator/components/assembler/decoder/decoder.html',
        controller: DecodeController,
        controllerAs: 'decodeCtrl'
    });
        
}(window.angular));