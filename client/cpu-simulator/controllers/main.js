/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    
    'use strict';
    function CpuController($rootScope, $scope, $log, $timeout, memoryService, microProgramService, convertionService, registerFactory) {
        
        $rootScope.getObjectPropertyByValue = getObjectPropertyByValue;

        // Standard 32b High and Low masks
        $rootScope.HIGH_PART_MASK = 0b11111111111111110000000000000000;
        $rootScope.LOW_PART_MASK = 0b00000000000000001111111111111111;

        // Instruction register masks
        $rootScope.FIRST_CLASS_MASK = 0b1000000000000000;
        $rootScope.FIRST_CLASS_OPCODE_MASK = 0b0111000000000000;
        $rootScope.SOURCE_ADDRESSING_MASK = 0b0000110000000000;
        $rootScope.SOURCE_REGISTER_MASK = 0b0000001111000000;
        $rootScope.DESTINATION_ADDRESSING_MASK = 0b0000000000110000;
        $rootScope.DESTINATION_REGISTER_MASK = 0b0000000000001111;
        $rootScope.NOT_FIRST_CLASS_MASK = 0b1110000000000000;
        $rootScope.OFFSET_MASK = 0b0000000011111111;
        $rootScope.OFFSET_SIGN_MASK = 0b0000000010000000;
        $rootScope.NOT_FIRST_CLASS_OPCODE_MASK = 0b0001111100000000;

        // Microinstruction register masks
        $rootScope.SBUS_MASK = 0b1111000000000000000000000000000;
        $rootScope.DBUS_MASK = 0b0000111100000000000000000000000;
        $rootScope.ALU_MASK = 0b0000000011110000000000000000000;
        $rootScope.RBUS_MASK = 0b0000000000001111000000000000000;
        $rootScope.OTHER_MASK = 0b0000000000000000111110000000000;
        $rootScope.MEMORY_MASK = 0b0000000000000000000001100000000;
        $rootScope.SUCCESOR_MASK = 0b0000000000000000000000011110000;
        $rootScope.INDEX_MASK = 0b0000000000000000000000000001110;
        $rootScope.CONDITION_MASK = 0b0000000000000000000000000000001;

        // Flag register masks
        $rootScope.INTR_FLAG_MASK = 0b0000000010000000;
        $rootScope.CARRY_FLAG_MASK = 0b0000000000001000;
        $rootScope.ZERO_FLAG_MASK = 0b0000000000000100;
        $rootScope.SIGN_FLAG_MASK = 0b0000000000000010;
        $rootScope.OVERFLOW_FLAG_MASK = 0b0000000000000001;

        // Exceptions and conditions
        $rootScope.conditions = {
            g: false,
            INSTRUCTION: 0,
            ILLEGAL: 0,
            ACKLOW: 0,
            HALT: 0,
            CL4: 0,
            CL3: 0,
            CL2: 0,
            INTR: 0,
            INTA: 0,
            C: 0,
            Z: 0,
            S: 0,
            V: 0,
            getIntr: registerFactory.getInterruptionFlag,
            getCarry: registerFactory.getCarry,
            getZero: registerFactory.getZero,
            getSign: registerFactory.getSign,
            getOverflow: registerFactory.getOverflow
        };

        // Bus data
        $rootScope.dataBus = {
            sbus: 0,
            dbus: 0,
            rbus: 0
        };

        // Main memory
        $rootScope.memory = memoryService.initialiseMemory();

        // Microcode
        $rootScope.microProgram = microProgramService.initializeMicroProgram(microProgramService.mnemonicMicroinstructionSet);
        $rootScope.labels = microProgramService.labels;
        $scope.$on('changedMachineMacroInstructionSet', (message, data) => {
            angular.forEach(data, (instruction, index) => {
                let indexedAddress = 0x40 + index;
                indexedAddress = (convertionService.extend(convertionService.convert(indexedAddress).from(10).to(16)).to(4)).toUpperCase();
                angular.forEach($scope.memory, (entry) => {
                    if(entry.address === indexedAddress){
                        entry.data = instruction;
                    }
                });
            });

            $rootScope.conditions.ILLEGAL = 0;
            $rootScope.conditions.ACKLOW = 0;
            $rootScope.conditions.HALT = 0;
            $rootScope.conditions.INTR = 0;
            $rootScope.conditions.INTA = 0;
            $rootScope.conditions.C = 0;
            $rootScope.conditions.Z = 0;
            $rootScope.conditions.S = 0;
            $rootScope.conditions.V = 0;
            $rootScope.$broadcast('INIT');
        });

        $scope.$on('RDY', () => $rootScope.$broadcast('RESET'));

        $scope.$on('CHECK', () => {
            let currentPC = parseInt(registerFactory.defaultRegisters['PC'], 2);
            if(currentPC <= $rootScope.conditions.INSTRUCTION + 0x40) {
                $timeout(() => {
                    $rootScope.$broadcast('NEXT')
                }, 1000);
            } else {
                $rootScope.conditions.ACKLOW = 1;
                $log.log("No more instructions!");
            }
        });

        $scope.$on('IF', () => {
            $rootScope.conditions.CL4 = 0;
            $rootScope.conditions.CL3 = 0;
            $rootScope.conditions.CL2 = 0;
        });
        
        function getObjectPropertyByValue(obj, subProperty, value) {
            let result = [];
            if (!subProperty) {
                result = Object.keys(obj).filter((item) => obj[item] === value);
                $log.log("Found", result.length, "items for", obj, "with property value", value);
                return result;
            } else {
                result = Object.keys(obj).filter((item) => obj[item][subProperty] === value);
                $log.log("Found", result.length, "items for", obj, "with property value", value);
                return result;
            }
        }
    }

    CpuController.$inject = ['$rootScope', '$scope', '$log', '$timeout', 'memoryService', 'microProgramService', 'convertionService', 'registerFactory'];

    angular.module('app.cpuModule').controller('CpuController', CpuController);

}(window.angular));