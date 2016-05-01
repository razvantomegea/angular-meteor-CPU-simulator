/**
 * Created by razva on 4/10/2016.
 */
(function (angular) {

    'use strict';
    function commandFactory($rootScope, $log, dataHelpService) {
        
        let cmdFactory = {
            calculateIndex,
            verifyCondition,
            getInstructionClass,
            parseMicroinstruction
        };

        cmdFactory.arithemticLogicUnit = {
            add(op1, op2) { return op1 + op2; },
            and(op1, op2) { return op1 & op2; },
            or(op1, op2) { return op1 | op2; },
            xor(op1, op2) { return op1 ^ op2; },
            asl(op) {
                let msb = parseInt(Math.log2(op));
                let carry = op >> msb;
                $rootScope.$broadcast('setCarry', carry);
                return op << 1;
            },
            asr(op) {
                let carry = op & 1;
                $rootScope.$broadcast('setCarry', carry);
                return op >> 1;
            },
            lsr(op) {
                let carry = op & 1;
                $rootScope.$broadcast('setCarry', carry);
                return (op >>> 1) & dataHelpService.LOW_PART_MASK;
            },
            rol(op) {
                let msb = parseInt(Math.log2(op));
                let carry = op >> msb;
                $rootScope.$broadcast('setCarry', carry);
                //$log.log("ROL of", op);
                return parseInt(Math.log2(op)) | (op << 1);
            },
            ror(op) {
                let carry = op & 1;
                $rootScope.$broadcast('setCarry', carry);
                return (op >> 1) | 1;
            },
            rlc(op) {
                let msb = parseInt(Math.log2(op));
                return msb | (op << 1);
            },
            rrc(op) {
                let carry = op & 1;
                return carry | (op >> 1);
            }
        };

        function calculateIndex(index, instruction) {
            instruction = parseInt(instruction, 2);
            let machineCodeIndex = 0;
            switch (index) {
                case 0:
                    machineCodeIndex = 0;
                    break;
                case 1:
                    machineCodeIndex = (dataHelpService.SOURCE_ADDRESSING_MASK & instruction) >> 10;
                    break;
                case 2:
                    machineCodeIndex = (dataHelpService.DESTINATION_ADDRESSING_MASK & instruction) >> 4;
                    break;
                case 3:
                    machineCodeIndex = (dataHelpService.NOT_FIRST_CLASS_OPCODE_MASK & instruction) >> 8;
                    break;
                case 4:
                    machineCodeIndex = (dataHelpService.NOT_FIRST_CLASS_OPCODE_MASK & instruction) >> 7;
                    break;
                case 5:
                    machineCodeIndex = (dataHelpService.FIRST_CLASS_OPCODE_MASK & instruction) >> 12;
                    break;
                default:
                    $log.error("Unknown index");
            }

            return machineCodeIndex;
        }

        function verifyCondition(condition) {
            switch (condition) {
                case 0:
                    return false;
                case 1:
                    return true;
                case 2:
                    return $rootScope.conditions["ACKLOW"] === 1;
                case 3:
                    return $rootScope.conditions["ILLEGAL"] === 0;
                case 4:
                    return $rootScope.conditions["CL4"] === 1;
                case 5:
                    return $rootScope.conditions["CL3"] === 1;
                case 6:
                    return $rootScope.conditions["CL2"] === 1;
                case 7:
                    return $rootScope.conditions["C"] === 1;
                case 8:
                    return $rootScope.conditions["C"] === 0;
                case 9:
                    return $rootScope.conditions["Z"] === 1;
                case 10:
                    return $rootScope.conditions["Z"] === 0;
                case 11:
                    return $rootScope.conditions["S"] === 1;
                case 12:
                    return $rootScope.conditions["S"] === 0;
                case 13:
                    return $rootScope.conditions["V"] === 1;
                case 14:
                    return $rootScope.conditions["V"] === 0;
                case 15:
                    return $rootScope.conditions["INTR"] === 0;
                default:
                    $log.error("Unknown condition");
            }
        }

        function getInstructionClass(instruction) {
            instruction = parseInt(instruction, 2);
            let instructionClass = (instruction & dataHelpService.NOT_FIRST_CLASS_MASK) >> 13;
            if (instructionClass === 7) { return $rootScope.conditions.CL4 = 1; }
            if (instructionClass === 6) { return $rootScope.conditions.CL2 = 1; }
            if (instructionClass === 4) { return $rootScope.conditions.CL3 = 1; }
        }

        function parseMicroinstruction(object, microinstruction) {
            return {
                getHi() { object.miHi = ~~(microinstruction / Math.pow(2, 8)); },
                getLo() { object.miLo = microinstruction % Math.pow(2, 8); },
                getSbus() { object.sbus = (object.miHi & dataHelpService.SBUS_MASK) >> 27; },
                getDbus() { object.dbus = (object.miHi & dataHelpService.DBUS_MASK) >> 23; },
                getAlu() { object.alu = (object.miHi & dataHelpService.ALU_MASK) >> 19; },
                getRbus() { object.rbus = (object.miHi & dataHelpService.RBUS_MASK) >> 15; },
                getOther() { object.other = (object.miHi & dataHelpService.OTHER_MASK) >> 10; },
                getMemory() { object.memory = (object.miHi & dataHelpService.MEMORY_MASK) >> 8; },
                getSuccesor() { object.succesor = (object.miHi & dataHelpService.SUCCESOR_MASK) >> 4; },
                getIndex() { object.index = (object.miHi & dataHelpService.INDEX_MASK) >> 1; },
                getCondition() { object.condition = object.miHi % 2; },
                getuAddress() { object.uAdress = object.miLo; }
            }
        }

        return cmdFactory;

    }

    commandFactory.$inject = ['$rootScope', '$log', 'dataHelpService'];

    angular.module('app.cpuModule.executionModule').factory('commandFactory', commandFactory);

}(window.angular));