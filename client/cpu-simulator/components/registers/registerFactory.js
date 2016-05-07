/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    function registerFactory($rootScope, $log, dataHelpService, memoryService) {
        let regFactory = {
            updateGeneralRegister,
            updateDefaultRegister,
            setInterruptionFlag,
            getInterruptionFlag,
            setCarry,
            getCarry,
            setZero,
            getZero,
            setSign,
            getSign,
            setOverflow,
            getOverflow,
            setCZSV,
            incrementSP,
            decrementSP,
            incrementPC,
            resetDataBus,
            initialisePcSp,
            sendDataOnSbus,
            sendDataOnDbus,
            saveData,
            specialOperation,
            memoryOperation,
            dataBus: {
                "genRegSbus": 2,
                "genRegDbus": 0,
                "PCSbus": 4,
                "PCDbus": 0,
                "IRSbus": 0,
                "IRDbus": 5,
                "ADRSbus": 0,
                "ADRDbus": 0,
                "TSbus": 0,
                "TDbus": 0,
                "SPSbus": 0,
                "SPDbus": 6,
                "IVRSbus": 0,
                "IVRDbus": 0,
                "FLAGSSbus": 0,
                "FLAGSDbus": 0,
                "MDRSbus": 0,
                "MDRDbus": 0,
                "regRbus": 0
            }
        };

        regFactory.generalRegisters = {
            "R0": {
                "code": 0b0000,
                "data": 0
            },
            "R1": {
                "code": 0b0001,
                "data": 0
            },
            "R2": {
                "code": 0b0010,
                "data": 0
            },
            "R3": {
                "code": 0b0011,
                "data": 0
            },
            "R4": {
                "code": 0b0100,
                "data": 0
            },
            "R5": {
                "code": 0b0101,
                "data": 0
            },
            "R6": {
                "code": 0b0110,
                "data": 0
            },
            "R7": {
                "code": 0b0111,
                "data": 0
            },
            "R8": {
                "code": 0b1000,
                "data": 0
            },
            "R9": {
                "code": 0b1001,
                "data": 0
            },
            "R10": {
                "code": 0b1010,
                "data": 0
            },
            "R11": {
                "code": 0b1011,
                "data": 0
            },
            "R12": {
                "code": 0b1100,
                "data": 0
            },
            "R13": {
                "code": 0b1101,
                "data": 0
            },
            "R14": {
                "code": 0b1110,
                "data": 0
            },
            "R15": {
                "code": 0b1111,
                "data": 0
            }
        };

        regFactory.defaultRegisters = {
            PC: 0,
            IR: 0,
            ADR: 0,
            T: 0,
            SP: 0,
            IVR: 0,
            FLAGS: 0,
            MDR: 0
        };

        function updateGeneralRegister(reg, data){
            this.generalRegisters[reg].data = data;
        }

        function updateDefaultRegister(reg, data){
            this.defaultRegisters[reg] = data;
        }

        function setInterruptionFlag(value) {
            let flags = (value === 1)
                ? this.defaultRegisters['FLAGS'] | dataHelpService.INTR_FLAG_MASK
                : this.defaultRegisters['FLAGS'] & ~dataHelpService.INTR_FLAG_MASK;
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getCarry();
        }

        function getInterruptionFlag() {
            $rootScope.conditions.INTR = (regFactory.defaultRegisters["FLAGS"] & dataHelpService.INTR_FLAG_MASK) >> 7;
        }

        function setCarry(value) {
            let flags = (value === 1)
                ? this.defaultRegisters['FLAGS'] | dataHelpService.CARRY_FLAG_MASK
                : this.defaultRegisters['FLAGS'] & ~dataHelpService.CARRY_FLAG_MASK;
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getCarry();
        }

        function getCarry() {
            $rootScope.conditions.C = (regFactory.defaultRegisters["FLAGS"] & dataHelpService.CARRY_FLAG_MASK) >> 3;
        }

        function setZero(value) {
            let flags = (value === 1)
                ? this.defaultRegisters['FLAGS'] | dataHelpService.ZERO_FLAG_MASK
                : this.defaultRegisters['FLAGS'] & ~dataHelpService.ZERO_FLAG_MASK;
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getZero();
        }

        function getZero() {
            $rootScope.conditions.Z = (regFactory.defaultRegisters["FLAGS"] & dataHelpService.ZERO_FLAG_MASK) >> 2;
        }

        function setSign(value) {
            let flags = (value === 1)
                ? this.defaultRegisters['FLAGS'] | dataHelpService.SIGN_FLAG_MASK
                : this.defaultRegisters['FLAGS'] & ~dataHelpService.SIGN_FLAG_MASK;
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getSign();
        }

        function getSign() {
            $rootScope.conditions.S = (regFactory.defaultRegisters["FLAGS"] & dataHelpService.SIGN_FLAG_MASK) >> 1;
        }

        function setOverflow(value) {
            let flags = (value === 1)
                ? this.defaultRegisters['FLAGS'] | dataHelpService.OVERFLOW_FLAG_MASK
                : this.defaultRegisters['FLAGS'] & ~dataHelpService.OVERFLOW_FLAG_MASK;
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getOverflow();
        }

        function getOverflow() {
            $rootScope.conditions.V = regFactory.defaultRegisters["FLAGS"] & dataHelpService.OVERFLOW_FLAG_MASK;
        }

        function setCZSV(value) {
            this.setCarry(value);
            this.setZero(value);
            this.setSign(value);
            this.setOverflow(value);
        }

        function incrementSP(){
            let sp = parseInt(this.defaultRegisters['SP'], 2);
            sp += 2;
            this.updateDefaultRegister('SP', sp);
        }

        function decrementSP(){
            let sp = this.defaultRegisters['SP'];
            sp -= 2;
            this.updateDefaultRegister('SP', sp);
        }

        function incrementPC(){
            let pc = this.defaultRegisters['PC'];
            pc += 2;
            this.updateDefaultRegister('PC', pc);
        }

        function resetDataBus() { angular.forEach(this.dataBus, (busValue, busType) => this.dataBus[busType] = 0); }

        function initialisePcSp() {
            this.updateDefaultRegister('SP', 0x00ff);
            this.updateDefaultRegister('PC', 0x0040);
        };

        function sendDataOnSbus(data) {
            let sourceRegisterCode = 0;
            let sourceRegisterName = [];
            switch (data) {
                case 0:
                    break;
                case 1:
                    $rootScope.dataBus['sbus'] = 0;
                    break;
                case 2:
                    $rootScope.dataBus['sbus'] = (~1 >>> 0) & dataHelpService.LOW_PART_MASK;
                    break;
                case 3:
                    $rootScope.dataBus['sbus'] = 1;
                    break;
                case 4:
                    this.dataBus['MDRSbus'] = this.defaultRegisters['MDR'];
                    $rootScope.dataBus['sbus'] = this.dataBus['MDRSbus'];
                    break;
                case 5:
                    this.dataBus['MDRSbus'] = (~this.defaultRegisters['MDR'] >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['sbus'] = this.dataBus['MDRSbus'];
                    break;
                case 6:
                    sourceRegisterCode = (dataHelpService.SOURCE_REGISTER_MASK & this.defaultRegisters['IR']) >> 6;
                    sourceRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', sourceRegisterCode);
                    this.dataBus['genRegSbus'] = this.generalRegisters[sourceRegisterName[0]]['data'];
                    $rootScope.dataBus['sbus'] = this.dataBus['genRegSbus'];
                    break;
                case 7:
                    sourceRegisterCode = (dataHelpService.SOURCE_REGISTER_MASK & this.defaultRegisters['IR']) >> 6;
                    sourceRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', sourceRegisterCode);
                    this.dataBus['genRegSbus'] = (~this.generalRegisters[sourceRegisterName[0]]['data'] >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['sbus'] = this.dataBus['genRegSbus'];
                    break;
                case 8:
                    this.dataBus['TSbus'] = this.defaultRegisters['T'];
                    $rootScope.dataBus['sbus'] = this.dataBus['TSbus'];
                    break;
                case 9:
                    this.dataBus['TSbus'] = (~this.defaultRegisters['T'] >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['sbus'] = this.dataBus['TSbus'];
                    break;
                case 10:
                    let offset = dataHelpService.OFFSET_MASK & this.defaultRegisters['IR'];
                    let offsetSign = (dataHelpService.OFFSET_SIGN_MASK & offset) >> 7;
                    this.dataBus['IRSbus'] = (offsetSign === 0) ? offset : -(~dataHelpService.OFFSET_SIGN_MASK & offset);
                    $rootScope.dataBus['sbus'] = this.dataBus['IRSbus'];
                    break;
                default:
                    $log.error("Unknown command");
            }
        };

        function sendDataOnDbus(data) {
            let destinationRegisterCode = 0;
            let destinationRegisterName = [];
            switch (data) {
                case 0:
                    break;
                case 1:
                    $rootScope.dataBus['dbus'] = 0;
                    break;
                case 2:
                    this.dataBus['PCDbus'] = this.defaultRegisters['PC'];
                    $rootScope.dataBus['dbus'] = this.dataBus['PCDbus'];
                    break;
                case 3:
                    this.dataBus['ADRDbus'] = this.defaultRegisters['ADR'];
                    $rootScope.dataBus['dbus'] = this.dataBus['ADRDbus'];
                    break;
                case 4:
                    this.dataBus['IVRDbus'] = this.defaultRegisters['IVR'];
                    $rootScope.dataBus['dbus'] = this.dataBus['IVRDbus'];
                    break;
                case 5:
                    this.dataBus['FLAGSDbus'] = this.defaultRegisters['FLAGS'];
                    $rootScope.dataBus['dbus'] = this.dataBus['FLAGSDbus'];
                    break;
                case 6:
                    this.dataBus['SPDbus'] = this.defaultRegisters['SP'];
                    $rootScope.dataBus['dbus'] = this.dataBus['SPDbus'];
                    break;
                case 7:
                    this.dataBus['MDRDbus'] = this.defaultRegisters['MDR'];
                    $rootScope.dataBus['dbus'] = this.dataBus['MDRDbus'];
                    break;
                case 8:
                    this.dataBus['MDRDbus'] = (~this.defaultRegisters['MDR'] >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['dbus'] = this.dataBus['MDRDbus'];
                    break;
                case 9:
                    destinationRegisterCode = dataHelpService.DESTINATION_REGISTER_MASK & this.defaultRegisters['IR'];
                    destinationRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', destinationRegisterCode);
                    this.dataBus['genRegDbus'] = this.generalRegisters[destinationRegisterName[0]]['data'];
                    $rootScope.dataBus['dbus'] = this.dataBus['genRegDbus'];
                    break;
                case 10:
                    destinationRegisterCode = dataHelpService.DESTINATION_REGISTER_MASK & this.defaultRegisters['IR'];
                    destinationRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', destinationRegisterCode);
                    this.dataBus['genRegDbus'] = (~this.generalRegisters[destinationRegisterName[0]]['data'] >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['dbus'] = this.dataBus['genRegDbus'];
                    break;
                case 11:
                    this.dataBus['TDbus'] = this.defaultRegisters['T'];
                    $rootScope.dataBus['dbus'] = this.dataBus['TDbus'];
                    break;
                case 12:
                    this.dataBus['TDbus'] = (~this.defaultRegisters['T'] >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['dbus'] = this.dataBus['TDbus'];
                default:
                    $log.error("Unknown command");
            }
        };

        function saveData(data) {
            switch (data) {
                case 0:
                    break;
                case 1:
                    this.updateDefaultRegister('PC', $rootScope.dataBus.rbus);
                    break;
                case 2:
                    this.updateDefaultRegister('ADR', $rootScope.dataBus.rbus);
                    break;
                case 3:
                    this.updateDefaultRegister('IVR', $rootScope.dataBus.rbus);
                    break;
                case 4:
                    this.updateDefaultRegister('FLAGS', $rootScope.dataBus.rbus);
                    break;
                case 5:
                    this.updateDefaultRegister('SP', $rootScope.dataBus.rbus);
                    break;
                case 6:
                    this.updateDefaultRegister('MDR', $rootScope.dataBus.rbus);
                    break;
                case 7:
                    let destinationRegisterCode = (dataHelpService.DESTINATION_REGISTER_MASK & this.defaultRegisters['IR']);
                    let destinationRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', destinationRegisterCode);
                    this.updateGeneralRegister(destinationRegisterName[0], $rootScope.dataBus.rbus);
                    break;
                case 8:
                    this.updateDefaultRegister('T', $rootScope.dataBus.rbus);
                    break;
                default:
                    $log.error("Unknown command");
            }
        };

        function specialOperation(data) {
            switch (data) {
                case 0:
                    break;
                case 1:
                    this.setCarry(1);
                    break;
                case 2:
                    this.setCarry(0);
                    break;
                case 3:
                    this.setZero(1);
                    break;
                case 4:
                    this.setZero(0);
                    break;
                case 5:
                    this.setSign(1);
                    break;
                case 6:
                    this.setSign(0);
                    break;
                case 7:
                    this.setOverflow(1);
                    break;
                case 8:
                    this.setOverflow(0);
                    break;
                case 9:
                    this.setCZSV(1);
                    break;
                case 10:
                    this.setCZSV(0);
                    break;
                case 11:
                    this.setInterruptionFlag(1);
                    break;
                case 12:
                    this.setInterruptionFlag(0);
                    break;
                case 13:
                    $rootScope.conditions.ACKLOW = 1;
                    break;
                case 14:
                    $rootScope.conditions.ILLEGAL = 1;
                    break;
                case 15:
                    $rootScope.conditions.ACKLOW = 0;
                    $rootScope.conditions.ILLEGAL = 0;
                    this.setInterruptionFlag(0);
                    break;
                case 16:
                    $rootScope.conditions.HALT = 0;
                    break;
                case 17:
                    this.incrementSP();
                    break;
                case 18:
                    this.decrementSP();
                    break;
                case 19:
                    $rootScope.conditions.INTA = 1;
                    this.decrementSP();
                    $rootScope.dataBus.rbus = this.defaultRegisters['IVR'];
                    break;
                case 20:
                    this.incrementPC();
                    break;
                case 21:
                    $rootScope.dataBus.rbus = this.defaultRegisters['FLAGS'];
                    break;
                case 22:
                    this.setCarry(1);
                    $rootScope.dataBus.rbus = this.defaultRegisters['FLAGS'];
                    break;
                default:
                    $log.error("Unknown command");
            }
        };

        function memoryOperation(data) {
            let adr = this.defaultRegisters['ADR'];
            switch (data) {
                case 0:
                    break;
                case 1:
                    $rootScope.dataBus.memRdBus = 1;
                    this.defaultRegisters['IR'] = memoryService.memoryRead(adr);
                    $rootScope.$broadcast("IF");
                    $log.log('IF');
                    break;
                case 2:
                    $rootScope.dataBus.memRdBus = 1;
                    this.defaultRegisters['MDR'] = memoryService.memoryRead(adr);
                    $log.log('RD');
                    break;
                case 3:
                    $rootScope.$broadcast("memoryWrite");
                    $rootScope.$on('EN3', () => {
                        $log.log('WR');
                        $rootScope.dataBus.memWrBus = 1;
                        memoryService.memoryWrite(adr, this.defaultRegisters['MDR']);
                    });
                    break;
                default:
                    $log.error("Unknown command");
            }
        }

        return regFactory;

    }

    registerFactory.$inject = ['$rootScope', '$log', 'dataHelpService', 'memoryService'];

    angular.module("app.cpuModule").factory("registerFactory", registerFactory);

}(window.angular));