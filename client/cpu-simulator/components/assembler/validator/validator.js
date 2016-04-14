/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {

    'use strict';
    function ValidationController($rootScope, $mdDialog, validationFactory, $log) {
        this.code = "ADD R1,1;\nMOV R5,1;\nSEC;\nBCC .et1;\nINC R0;\n.et1: ADD R0,5;";
        /*
         * Code sample
         ADD R1,1;
         MOV 1(R5),1;
         .et1: ADD R0,1(R2);
         INC R1;
         CLC;
         SEC;
         BCC .et1;
         INC R0;
         */
        this.validation = validationFactory;
        this.startAssemble = answer => $mdDialog.hide(answer);
        this.close = () => $mdDialog.hide();
        this.addCode = () => {
            $mdDialog.show({
                templateUrl: 'client/cpu-simulator/components/assembler/validator/code.html',
                clickOutsideToClose: true
            }).then(
                answer => $rootScope.$broadcast(answer, this.validation.highMacroInstructionSet
                ), () => $log.log("No code has been assembled"));
        }
    }
    
    ValidationController.$inject = ['$rootScope', '$mdDialog', 'validationFactory', '$log'];
    
    angular.module('app.cpuModule.assemblyModule').controller('ValidationController', ValidationController);

    angular.module('app.cpuModule.assemblyModule').component('validator', {
        templateUrl: 'client/cpu-simulator/components/assembler/validator/validator.html',
        controller: ValidationController,
        controllerAs: 'validationCtrl'
    });

}(window.angular));