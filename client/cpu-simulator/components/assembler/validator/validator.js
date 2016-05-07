/**
 *  @description    The validation controller that handles the validation process
 *  @author         Razvan Tomegea
 */
(function (angular) {
    'use strict';
    /**
     * Validation controller implementation
     * @param $rootScope        Angular global scope service
     * @param $mdDialog         Angular dialog service
     * @param validationFactory Validation factory service with the validation methods implementations
     * @param $log              Angular logging service
     * @constructor
     */
    function ValidationController($rootScope, $mdDialog, $mdMedia, validationFactory, $log) {
        // Stores the code
        // @example "ADD R1,1;\n.et1: ADD R0,5;\nADD R5,1;\nSEC;\nBCC .et1;\nOR R1,R5;\nXOR R2,R1;\nAND 1(R0),R2;\nINC R0;";
        //          "ADD R1,1;\nADD R5,1;\nSEC;\nBCC .et1;\nADD R1,R5;\nXOR R2,R1;\nAND 1(R0),R2;\nINC R0;\n.et1: ADD R0,5;";
        this.code = "ADD R1,1;\nADD R5,1;\nSEC;\nBCC .et1;\nADD R1,R5;\nXOR R2,R1;\nAND 1(R0),R2;\nINC R0;\n.et1: ADD R0,5;";
        // Get the validation methods
        this.validation = validationFactory;
        // The dialog control methods
        this.startAssemble = message => $mdDialog.hide(message);
        this.closeDialog = () => $mdDialog.hide();
        this.addCode = () => {
            $mdDialog.show({
                templateUrl: 'client/cpu-simulator/components/assembler/validator/code.html',
                clickOutsideToClose: true,
                fullScreen: ($mdMedia('sm') || $mdMedia('xs'))
            }).then(
                // Send the validated code to the decoder
                message => $rootScope.$broadcast(message, this.validation.highInstructionSet
                ), () => $log.log("No code has been assembled"));
        }
    }
    
    ValidationController.$inject = ['$rootScope', '$mdDialog', '$mdMedia', 'validationFactory', '$log'];
    
    angular.module('app.cpuModule.assemblyModule').controller('ValidationController', ValidationController);

    angular.module('app.cpuModule.assemblyModule').component('validator', {
        templateUrl: 'client/cpu-simulator/components/assembler/validator/validator.html',
        controller: ValidationController,
        controllerAs: 'validationCtrl'
    });

}(window.angular));