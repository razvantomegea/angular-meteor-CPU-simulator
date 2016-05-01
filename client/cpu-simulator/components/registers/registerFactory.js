/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    function registerFactory($rootScope, $log, dataHelpService) {
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
                "code": "0000",
                "data": "0000000000000000"
            },
            "R1": {
                "code": "0001",
                "data": "0000000000000000"
            },
            "R2": {
                "code": "0010",
                "data": "0000000000000000"
            },
            "R3": {
                "code": "0011",
                "data": "0000000000000000"
            },
            "R4": {
                "code": "0100",
                "data": "0000000000000000"
            },
            "R5": {
                "code": "0101",
                "data": "0000000000000000"
            },
            "R6": {
                "code": "0110",
                "data": "0000000000000000"
            },
            "R7": {
                "code": "0111",
                "data": "0000000000000000"
            },
            "R8": {
                "code": "1000",
                "data": "0000000000000000"
            },
            "R9": {
                "code": "1001",
                "data": "0000000000000000"
            },
            "R10": {
                "code": "1010",
                "data": "0000000000000000"
            },
            "R11": {
                "code": "1011",
                "data": "0000000000000000"
            },
            "R12": {
                "code": "1100",
                "data": "0000000000000000"
            },
            "R13": {
                "code": "1101",
                "data": "0000000000000000"
            },
            "R14": {
                "code": "1110",
                "data": "0000000000000000"
            },
            "R15": {
                "code": "1111",
                "data": "0000000000000000"
            }
        };
        
        regFactory.defaultRegisters = {
            PC: "0000000000000000",
            IR: "0000000000000000",
            ADR: "0000000000000000",
            T: "0000000000000000",
            SP: "0000000000000000",
            IVR: "0000000000000000",
            FLAGS: "0000000000000000",
            MDR: "0000000000000000"
        };
        
        function updateGeneralRegister(reg, data){
            this.generalRegisters[reg].data = data;
            //$log.log("Updated register", reg, "with", data);
        }

        function updateDefaultRegister(reg, data){
            this.defaultRegisters[reg] = data;
            //$log.log("Updated register", reg, "with", data);
        }

        function setInterruptionFlag(value) {
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | dataHelpService.INTR_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~dataHelpService.INTR_FLAG_MASK;
            flags = dataHelpService.extend(dataHelpService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated interruption flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getCarry();
        }
        
        function getInterruptionFlag() {
            $rootScope.conditions.INTR = (dataHelpService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & dataHelpService.INTR_FLAG_MASK) >> 7;
        }

        function setCarry(value) {
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | dataHelpService.CARRY_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~dataHelpService.CARRY_FLAG_MASK;
            flags = dataHelpService.extend(dataHelpService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated carry flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getCarry();
        }
        
        function getCarry() {
            $rootScope.conditions.C = (dataHelpService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & dataHelpService.CARRY_FLAG_MASK) >> 3;
        }

        function setZero(value) {
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | dataHelpService.ZERO_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~dataHelpService.ZERO_FLAG_MASK;
            flags = dataHelpService.extend(dataHelpService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated zero flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getZero();
        }
        
        function getZero() {
            $rootScope.conditions.Z = (dataHelpService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & dataHelpService.ZERO_FLAG_MASK) >> 2;
        }

        function setSign(value) {
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | dataHelpService.SIGN_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~dataHelpService.SIGN_FLAG_MASK;
            flags = dataHelpService.extend(dataHelpService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated sign flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getSign();
        }
        
        function getSign() {
            $rootScope.conditions.S = (dataHelpService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & dataHelpService.SIGN_FLAG_MASK) >> 1;
        }

        function setOverflow(value) {
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | dataHelpService.OVERFLOW_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~dataHelpService.OVERFLOW_FLAG_MASK;
            flags = dataHelpService.extend(dataHelpService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated overflow flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getOverflow();
        }
        
        function getOverflow() {
            $rootScope.conditions.V = dataHelpService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & dataHelpService.OVERFLOW_FLAG_MASK;
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
            sp = dataHelpService.extend(dataHelpService.convert(sp).from(10).to(2)).to(16);
            this.updateDefaultRegister('SP', sp);
        }

        function decrementSP(){
            let sp = parseInt(this.defaultRegisters['SP'], 2);
            sp -= 2;
            sp = dataHelpService.extend(dataHelpService.convert(sp).from(10).to(2)).to(16);
            this.updateDefaultRegister('SP', sp);
        }

        function incrementPC(){
            let pc = parseInt(this.defaultRegisters['PC'], 2);
            pc += 2;
            pc = dataHelpService.extend(dataHelpService.convert(pc).from(10).to(2)).to(16);
            this.updateDefaultRegister('PC', pc);
        }

        function resetDataBus() { angular.forEach(this.dataBus, (busValue, busType) => this.dataBus[busType] = 0); }

        function initialisePcSp() {
            this.updateDefaultRegister('SP', dataHelpService.extend(dataHelpService.convert('0x00ff').from(16).to(2)).to(16));
            this.updateDefaultRegister('PC', dataHelpService.extend(dataHelpService.convert('0x0040').from(16).to(2)).to(16));
        };

        function sendDataOnSbus(data) {
            let sourceRegisterCode = 0;
            let sourceRegisterName = [];
            switch (data) {
                case 0:
                    break;
                case 1:
                    $rootScope.dataBus['sbus'] = 0;
                    //$log.log("Sent 0 on SBUS");
                    break;
                case 2:
                    $rootScope.dataBus['sbus'] = (~1 >>> 0) & dataHelpService.LOW_PART_MASK;
                    //$log.log("Sent -1 on SBUS");
                    break;
                case 3:
                    $rootScope.dataBus['sbus'] = 1;
                    //$log.log("Sent 1 on SBUS");
                    break;
                case 4:
                    this.dataBus['MDRSbus'] = parseInt(this.defaultRegisters['MDR'], 2);
                    $rootScope.dataBus['sbus'] = this.dataBus['MDRSbus'];
                    //$log.log("Sent MDR on SBUS");
                    break;
                case 5:
                    this.dataBus['MDRSbus'] = (~parseInt(this.defaultRegisters['MDR'], 2) >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['sbus'] = this.dataBus['MDRSbus'];
                    //$log.log("Sent !MDR on SBUS");
                    break;
                case 6:
                    sourceRegisterCode = (dataHelpService.SOURCE_REGISTER_MASK & parseInt(this.defaultRegisters['IR'], 2)) >> 6;
                    sourceRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', dataHelpService.extend(dataHelpService.convert(sourceRegisterCode).from(10).to(2)).to(4));
                    this.dataBus['genRegSbus'] = parseInt(this.generalRegisters[sourceRegisterName[0]]['data'], 2);
                    $rootScope.dataBus['sbus'] = this.dataBus['genRegSbus'];
                    //$log.log("Sent Register", sourceRegisterName, "on SBUS");
                    break;
                case 7:
                    sourceRegisterCode = (dataHelpService.SOURCE_REGISTER_MASK & parseInt(this.defaultRegisters['IR'], 2)) >> 6;
                    sourceRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', dataHelpService.extend(dataHelpService.convert(sourceRegisterCode).from(10).to(2)).to(4));
                    this.dataBus['genRegSbus'] = (~parseInt(this.generalRegisters[sourceRegisterName[0]]['data'], 2) >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['sbus'] = this.dataBus['genRegSbus'];
                    //$log.log("Sent Register", sourceRegisterName, "on SBUS");
                    break;
                case 8:
                    this.dataBus['TSbus'] = parseInt(this.defaultRegisters['T'], 2);
                    $rootScope.dataBus['sbus'] = this.dataBus['TSbus'];
                    //$log.log("Sent T on SBUS");
                    break;
                case 9:
                    this.dataBus['TSbus'] = (~parseInt(this.defaultRegisters['T'], 2) >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['sbus'] = this.dataBus['TSbus'];
                    //$log.log("Sent !T on SBUS");
                    break;
                case 10:
                    let offset = dataHelpService.OFFSET_MASK & parseInt(this.defaultRegisters['IR'], 2);
                    let offsetSign = (dataHelpService.OFFSET_SIGN_MASK & offset) >> 7;
                    this.dataBus['IRSbus'] = (offsetSign === 0) ? offset : -(~dataHelpService.OFFSET_SIGN_MASK & offset);
                    $rootScope.dataBus['sbus'] = this.dataBus['IRSbus'];
                    //$log.log("Sent OFFSET on SBUS");
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
                    //$log.log("Sent 0 on DBUS");
                    break;
                case 2:
                    this.dataBus['PCDbus'] = parseInt(this.defaultRegisters['PC'], 2);
                    $rootScope.dataBus['dbus'] = this.dataBus['PCDbus'];
                    //$log.log("Sent PC on DBUS");
                    break;
                case 3:
                    this.dataBus['ADRDbus'] = parseInt(this.defaultRegisters['ADR'], 2);
                    $rootScope.dataBus['dbus'] = this.dataBus['ADRDbus'];
                    //$log.log("Sent ADR on DBUS");
                    break;
                case 4:
                    this.dataBus['IVRDbus'] = parseInt(this.defaultRegisters['IVR'], 2);
                    $rootScope.dataBus['dbus'] = this.dataBus['IVRDbus'];
                    //$log.log("Sent IVR on DBUS");
                    break;
                case 5:
                    this.dataBus['FLAGSDbus'] = parseInt(this.defaultRegisters['FLAGS'], 2);
                    $rootScope.dataBus['dbus'] = this.dataBus['FLAGSDbus'];
                    //$log.log("Sent FLAGS on DBUS");
                    break;
                case 6:
                    this.dataBus['SPDbus'] = parseInt(this.defaultRegisters['SP'], 2);
                    $rootScope.dataBus['dbus'] = this.dataBus['SPDbus'];
                    //$log.log("Sent SP on DBUS");
                    break;
                case 7:
                    this.dataBus['MDRDbus'] = parseInt(this.defaultRegisters['MDR'], 2);
                    $rootScope.dataBus['dbus'] = this.dataBus['MDRDbus'];
                    //$log.log("Sent MDR on DBUS");
                    break;
                case 8:
                    this.dataBus['MDRDbus'] = (~parseInt(this.defaultRegisters['MDR'], 2) >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['dbus'] = this.dataBus['MDRDbus'];
                    //$log.log("Sent !MDR on DBUS");
                    break;
                case 9:
                    destinationRegisterCode = dataHelpService.DESTINATION_REGISTER_MASK & parseInt(this.defaultRegisters['IR'], 2);
                    destinationRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', dataHelpService.extend(dataHelpService.convert(destinationRegisterCode).from(10).to(2)).to(4));
                    //$log.log(destinationRegisterCode, destinationRegisterName[0]);
                    this.dataBus['genRegDbus'] = parseInt(this.generalRegisters[destinationRegisterName[0]]['data'], 2);
                    $rootScope.dataBus['dbus'] = this.dataBus['genRegDbus'];
                    //$log.log("Sent Register", destinationRegisterName, "on DBUS");
                    break;
                case 10:
                    destinationRegisterCode = dataHelpService.DESTINATION_REGISTER_MASK & parseInt(this.defaultRegisters['IR'], 2);
                    destinationRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', dataHelpService.extend(dataHelpService.convert(destinationRegisterCode).from(10).to(2)).to(4));
                    this.dataBus['genRegDbus'] = (~parseInt(this.generalRegisters[destinationRegisterName[0]]['data'], 2) >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['dbus'] = this.dataBus['genRegDbus'];
                    //$log.log("Sent Register", destinationRegisterName, "on DBUS");
                    break;
                case 11:
                    this.dataBus['TDbus'] = parseInt(this.defaultRegisters['T'], 2);
                    $rootScope.dataBus['dbus'] = this.dataBus['TDbus'];
                    //$log.log("Sent T on DBUS");
                    break;
                case 12:
                    this.dataBus['TDbus'] = (~parseInt(this.defaultRegisters['T'], 2) >>> 0) & dataHelpService.LOW_PART_MASK;
                    $rootScope.dataBus['dbus'] = this.dataBus['TDbus'];
                //$log.log("Sent !T on DBUS");
            }
        };

        function saveData(data) {
            switch (data) {
                case 0:
                    break;
                case 1:
                    let pc = dataHelpService.extend(dataHelpService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.updateDefaultRegister('PC', pc);
                    break;
                case 2:
                    let adr = dataHelpService.extend(dataHelpService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.updateDefaultRegister('ADR', adr);
                    break;
                case 3:
                    let ivr = dataHelpService.extend(dataHelpService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.updateDefaultRegister('IVR', ivr);
                    break;
                case 4:
                    let flags = dataHelpService.extend(dataHelpService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.updateDefaultRegister('FLAGS', flags);
                    break;
                case 5:
                    let sp = dataHelpService.extend(dataHelpService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.updateDefaultRegister('SP', sp);
                    break;
                case 6:
                    let mdr = dataHelpService.extend(dataHelpService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.updateDefaultRegister('MDR', mdr);
                    break;
                case 7:
                    let regData = dataHelpService.extend(dataHelpService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    let destinationRegisterCode = (dataHelpService.DESTINATION_REGISTER_MASK & parseInt(this.defaultRegisters['IR'], 2));
                    let destinationRegisterName = dataHelpService.getObjectPropertyByValue(this.generalRegisters, 'code', dataHelpService.extend(dataHelpService.convert(destinationRegisterCode).from(10).to(2)).to(4));
                    this.updateGeneralRegister(destinationRegisterName[0], regData);
                    break;
                case 8:
                    let temp = dataHelpService.extend(dataHelpService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.updateDefaultRegister('T', temp);
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
                    //$log.log("Setting ACKLOW to 1!");
                    break;
                case 14:
                    $rootScope.conditions.ILLEGAL = 1;
                    //$log.log("Setting ILLEGAL to 1!");
                    break;
                case 15:
                    $rootScope.conditions.ACKLOW = 0;
                    $rootScope.conditions.ILLEGAL = 0;
                    //$log.log("Setting ILLEGAL and ACKLOW to 0!");
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
                    //$log.log("Setting INTA and ACKLOW to 1!");
                    this.decrementSP();
                    $rootScope.dataBus.rbus = parseInt(this.defaultRegisters['IVR'], 2);
                    break;
                case 20:
                    this.incrementPC();
                    break;
                case 21:
                    $rootScope.dataBus.rbus = parseInt(this.defaultRegisters['FLAGS'], 2);
                    break;
                case 22:
                    this.setCarry(1);
                    $rootScope.dataBus.rbus = parseInt(this.defaultRegisters['FLAGS'], 2);
                    break;
                default:
                    $log.error("Unknown command");
            }
        };

        function memoryOperation(data) {
            let adr = parseInt(this.defaultRegisters['ADR'], 2);
            switch (data) {
                case 0:
                    break;
                case 1:
                    $rootScope.dataBus.memRdBus = 1;
                    this.defaultRegisters['IR'] = $rootScope.memory[adr].data + $rootScope.memory[adr + 1].data;
                    //$log.log('Instruction fetch:', this.defaultRegisters['IR'], 'from', dataHelpService.extend(dataHelpService.convert(adr).from(10).to(16)).to(4));
                    $rootScope.$broadcast("IF");
                    $log.log('IF');
                    break;
                case 2:
                    $rootScope.dataBus.memRdBus = 1;
                    this.defaultRegisters['MDR'] = $rootScope.memory[adr].data + $rootScope.memory[adr + 1].data;
                    //$log.log('Operand fetch:', this.defaultRegisters['MDR'], 'from', dataHelpService.extend(dataHelpService.convert(adr).from(10).to(16)).to(4));
                    $log.log('RD');
                    break;
                case 3:
                    $rootScope.$broadcast("memoryWrite");
                    $scope.$on('EN3', () => {
                        $log.log('WR');
                        $rootScope.dataBus.memWrBus = 1;
                        $rootScope.memory[adr].data = this.defaultRegisters['MDR'].slice(0, 8);
                        $rootScope.memory[adr + 1].data = this.defaultRegisters['MDR'].slice(8, 16);
                        //$log.log('Memory write:', this.defaultRegisters['MDR'], 'to', dataHelpService.extend(dataHelpService.convert(adr).from(10).to(16)).to(4));
                    });
                    break;
                default:
                    $log.error("Unknown command");
            }
        }
        
        return regFactory;
    
    }

    registerFactory.$inject = ['$rootScope', '$log', 'dataHelpService'];

    angular.module("app.cpuModule").factory("registerFactory", registerFactory);

}(window.angular));