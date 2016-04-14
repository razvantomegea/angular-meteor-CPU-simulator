/**
 * Created by razva on 4/10/2016.
 */
(function (angular) {

    'use strict';
    function commandFactory($rootScope, $log) {
        
        let cmdFactory = {
            calculateIndex: calculateIndex,
            verifyCondition: verifyCondition,
            getInstructionClass: getInstructionClass,
            parseMicroinstruction: parseMicroinstruction
        };
        
        cmdFactory.arithemticLogicUnit = {
            add: (op1, op2) => {
                $log.log("SUM of", op1, op2);
                return op1 + op2;
            },
            and: (op1, op2) => {
                $log.log("AND of", op1, op2);
                return op1 & op2;
            },
            or: (op1, op2) => {
                $log.log("OR of", op1, op2);
                return op1 | op2;
            },
            xor: (op1, op2) => {
                $log.log("XOR of", op1, op2);
                return op1 ^ op2;
            },
            asl: (op) => {
                let msb = parseInt(Math.log2(op));
                let carry = op >> msb;
                $rootScope.$broadcast('setCarry', carry);
                $log.log("ASL of", op);
                return op << 1;
            },
            asr: (op) => {
                let carry = op & 1;
                $rootScope.$broadcast('setCarry', carry);
                $log.log("ASR of", op);
                return op >> 1;
            },
            lsr: (op) => {
                let carry = op & 1;
                $rootScope.$broadcast('setCarry', carry);
                $log.log("LSR of", op);
                return (op >>> 1) & $rootScope.LOW_PART_MASK;
            },
            rol: (op) => {
                let msb = parseInt(Math.log2(op));
                let carry = op >> msb;
                $rootScope.$broadcast('setCarry', carry);
                $log.log("ROL of", op);
                return parseInt(Math.log2(op)) | (op << 1);
            },
            ror: (op) => {
                let carry = op & 1;
                $rootScope.$broadcast('setCarry', carry);
                $log.log("ROR of", op);
                return (op >> 1) | 1;
            },
            rlc: (op) => {
                let msb = parseInt(Math.log2(op));
                $log.log("RLC of", op);
                return msb | (op << 1);
            },
            rrc: (op) => {
                let carry = op & 1;
                $log.log("RRC of", op);
                return carry | (op >> 1);
            }
        }
        
        function calculateIndex(index, instruction) {
            instruction = parseInt(instruction, 2);
            let machineCodeIndex = 0;
            switch (index) {
                case 0:
                    machineCodeIndex = 0;
                    break;
                case 1:
                    machineCodeIndex = ($rootScope.SOURCE_ADDRESSING_MASK & instruction) >> 10;
                    $log.log("Source addressing mode index is", machineCodeIndex);
                    break;
                case 2:
                    machineCodeIndex = ($rootScope.DESTINATION_ADDRESSING_MASK & instruction) >> 4;
                    $log.log("Destination addressing mode index is", machineCodeIndex);
                    break;
                case 3:
                    machineCodeIndex = ($rootScope.NOT_FIRST_CLASS_OPCODE_MASK & instruction) >> 8;
                    $log.log("Third class instruction opcode index is", machineCodeIndex);
                    break;
                case 4:
                    machineCodeIndex = ($rootScope.NOT_FIRST_CLASS_OPCODE_MASK & instruction) >> 7;
                    $log.log("Other class instruction opcode index is", machineCodeIndex);
                    break;
                case 5:
                    machineCodeIndex = ($rootScope.FIRST_CLASS_OPCODE_MASK & instruction) >> 12;
                    $log.log("First class instruction opcode index is", machineCodeIndex);
                    break;
                default:
                    $log.error("Unknown index");
            }

            return machineCodeIndex;
        }

        function verifyCondition(condition) {
            switch (condition) {
                case 0:
                    $log.log('STEP');
                    return false;
                case 1:
                    $log.log('JUMPI');
                    return true;
                case 2:
                    $log.log('ACKLOW check');
                    return $rootScope.conditions["ACKLOW"] === 1;
                case 3:
                    $log.log('ILLEGAL check');
                    return $rootScope.conditions["ILLEGAL"] === 0;
                case 4:
                    $log.log('CL4 check');
                    return $rootScope.conditions["CL4"] === 1;
                case 5:
                    $log.log('CL3 check');
                    return $rootScope.conditions["CL3"] === 1;
                case 6:
                    $log.log('CL2 check');
                    return $rootScope.conditions["CL2"] === 1;
                case 7:
                    $log.log('CARRY check');
                    return $rootScope.conditions["C"] === 1;
                case 8:
                    $log.log('!CARRY check');
                    return $rootScope.conditions["C"] === 0;
                case 9:
                    $log.log('ZERO check');
                    return $rootScope.conditions["Z"] === 1;
                case 10:
                    $log.log('!ZERO check');
                    return $rootScope.conditions["Z"] === 0;
                case 11:
                    $log.log('SIGN check');
                    return $rootScope.conditions["S"] === 1;
                case 12:
                    $log.log('!SIGN check');
                    return $rootScope.conditions["S"] === 0;
                case 13:
                    $log.log('OVERFLOW check');
                    return $rootScope.conditions["V"] === 1;
                case 14:
                    $log.log('!OVERFLOW check');
                    return $rootScope.conditions["V"] === 0;
                case 15:
                    $log.log('!INTR check');
                    return $rootScope.conditions["INTR"] === 0;
                default:
                    $log.error("Unknown condition");
            }
        }

        function getInstructionClass(instruction) {
            instruction = parseInt(instruction, 2);
            let instructionClass = (instruction & $rootScope.NOT_FIRST_CLASS_MASK) >> 13;
            if (instructionClass=== 7) {
                $log.log('We have a 4th class instruction');
                $rootScope.conditions.CL4 = 1;
                return;
            }
            if (instructionClass=== 6) {
                $log.log('We have a 2nd class instruction');
                $rootScope.conditions.CL2 = 1;
                return;
            }
            if (instructionClass=== 4) {
                $log.log('We have a 3rd class instruction');
                $rootScope.conditions.CL3 = 1;
                return;
            }
            $log.log('We have a 1st class instruction');
        }
        
        function parseMicroinstruction(object, microinstruction) {
            return {
                getHi: () => object.miHi = ~~(microinstruction / Math.pow(2, 8)),
                getLo: () => object.miLo = microinstruction % Math.pow(2, 8),
                getSbus: () => object.sbus = (object.miHi & $rootScope.SBUS_MASK) >> 27,
                getDbus: () => object.dbus = (object.miHi & $rootScope.DBUS_MASK) >> 23,
                getAlu: () => object.alu = (object.miHi & $rootScope.ALU_MASK) >> 19,
                getRbus: () => object.rbus = (object.miHi & $rootScope.RBUS_MASK) >> 15,
                getOther: () =>  object.other = (object.miHi & $rootScope.OTHER_MASK) >> 10,
                getMemory: () => object.memory = (object.miHi & $rootScope.MEMORY_MASK) >> 8,
                getSuccesor: () => object.succesor = (object.miHi & $rootScope.SUCCESOR_MASK) >> 4,
                getIndex: () => object.index = (object.miHi & $rootScope.INDEX_MASK) >> 1,
                getCondition: () => object.condition = object.miHi % 2,
                getuAddress: () => object.uAdress = object.miLo
            }
        }
        
        return cmdFactory;
        
    }
    
    commandFactory.$inject = ['$rootScope', '$log'];
    
    angular.module('app.cpuModule.executionModule').factory('commandFactory', commandFactory);
    
}(window.angular));