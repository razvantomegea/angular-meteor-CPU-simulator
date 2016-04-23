/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    function registerFactory($rootScope, $log, convertionService) {
        let regFactory = {
            updateGeneralRegister: updateGeneralRegister,
            updateDefaultRegister: updateDefaultRegister,
            setInterruptionFlag: setInterruptionFlag,
            getInterruptionFlag: getInterruptionFlag,
            setCarry: setCarry,
            getCarry: getCarry,
            setZero: setZero,
            getZero: getZero,
            setSign: setSign,
            getSign: getSign,
            setOverflow: setOverflow,
            getOverflow: getOverflow,
            setCZSV: setCZSV,
            incrementSP: incrementSP,
            decrementSP: decrementSP,
            incrementPC: incrementPC
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
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | $rootScope.INTR_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~$rootScope.INTR_FLAG_MASK;
            flags = convertionService.extend(convertionService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated interruption flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getCarry();
        }
        
        function getInterruptionFlag() {
            $rootScope.conditions.INTR = (convertionService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & $rootScope.INTR_FLAG_MASK) >> 7;
        }

        function setCarry(value) {
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | $rootScope.CARRY_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~$rootScope.CARRY_FLAG_MASK;
            flags = convertionService.extend(convertionService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated carry flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getCarry();
        }
        
        function getCarry() {
            $rootScope.conditions.C = (convertionService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & $rootScope.CARRY_FLAG_MASK) >> 3;
        }

        function setZero(value) {
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | $rootScope.ZERO_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~$rootScope.ZERO_FLAG_MASK;
            flags = convertionService.extend(convertionService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated zero flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getZero();
        }
        
        function getZero() {
            $rootScope.conditions.Z = (convertionService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & $rootScope.ZERO_FLAG_MASK) >> 2;
        }

        function setSign(value) {
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | $rootScope.SIGN_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~$rootScope.SIGN_FLAG_MASK;
            flags = convertionService.extend(convertionService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated sign flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getSign();
        }
        
        function getSign() {
            $rootScope.conditions.S = (convertionService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & $rootScope.SIGN_FLAG_MASK) >> 1;
        }

        function setOverflow(value) {
            let flags = (value === 1) ? parseInt(this.defaultRegisters['FLAGS'], 2) | $rootScope.OVERFLOW_FLAG_MASK : parseInt(this.defaultRegisters['FLAGS'], 2) & ~$rootScope.OVERFLOW_FLAG_MASK;
            flags = convertionService.extend(convertionService.convert(flags).from(10).to(2)).to(16);
            //$log.log("Updated overflow flag with", flags);
            this.updateDefaultRegister('FLAGS', flags);
            $rootScope.conditions.getOverflow();
        }
        
        function getOverflow() {
            $rootScope.conditions.V = convertionService.convert(regFactory.defaultRegisters["FLAGS"]).from(2).to(10) & $rootScope.OVERFLOW_FLAG_MASK;
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
            sp = convertionService.extend(convertionService.convert(sp).from(10).to(2)).to(16);
            this.updateDefaultRegister('SP', sp);
        }

        function decrementSP(){
            let sp = parseInt(this.defaultRegisters['SP'], 2);
            sp -= 2;
            sp = convertionService.extend(convertionService.convert(sp).from(10).to(2)).to(16);
            this.updateDefaultRegister('SP', sp);
        }

        function incrementPC(){
            let pc = parseInt(this.defaultRegisters['PC'], 2);
            pc += 2;
            pc = convertionService.extend(convertionService.convert(pc).from(10).to(2)).to(16);
            this.updateDefaultRegister('PC', pc);
        }
        
        return regFactory;
    
    }

    registerFactory.$inject = ['$rootScope', '$log', 'convertionService'];

    angular.module("app.cpuModule").factory("registerFactory", registerFactory);

}(window.angular));