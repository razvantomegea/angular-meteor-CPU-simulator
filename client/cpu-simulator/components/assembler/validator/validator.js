/**
 *  @description    The validation controller that handles the validation workflow
 *  @author         Razvan Tomegea
 */
(function (angular) {
    'use strict';
    /**
     * Validation controller implementation
     * @param $rootScope        Angular global scope service
     * @param $mdDialog         Angular dialog service
     * @param validationFactory Validation factory service (validation methods implementations)
     * @param $log              Angular logging service
     * @constructor
     */
    function ValidationController($rootScope, $mdDialog, validationFactory, $log) {
        /**
         * Stores the code
         * @type {string}
         * @example
         * ADD R1,1;
         * MOV 1(R5),1;
         * .et1: ADD R0,1(R2);
         * INC R1;
         * CLC;
         * SEC;
         * BCC .et1;
         * INC R0;
         */
        this.code = "ADD R1,1;\nMOV R5,1;\nSEC;\nBCC .et1;\nOR R1,R5;\nXOR R2,R1;\nAND 1(R0),R2;\nINC R0;\n.et1: ADD R0,5;";
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