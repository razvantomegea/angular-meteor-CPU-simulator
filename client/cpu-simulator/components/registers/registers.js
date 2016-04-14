/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    function RegistersController($scope, $rootScope, $log, convertionService, registerFactory) {

        this.registers = registerFactory;

        $scope.$on('INIT', () => {
            this.initialisePcSp();
            $rootScope.$broadcast('RDY');
        });

        $scope.$on('sendSbus', (msg, data) => this.sendDataOnSbus(data));

        $scope.$on('sendDbus', (msg, data) => {
            this.sendDataOnDbus(data);
            $rootScope.$broadcast('receiveAlu');
        });

        $scope.$on('setCarry', (msg, data) => {
            this.registers.setCarry(data);
        });

        $scope.$on('receiveRbus', (msg, data) => this.saveData(data));

        $scope.$on('other', (msg, data) => this.specialOperation(data));

        $scope.$on('exchangeMemory', (msg, data) => {
            this.memoryOperation(data);
            $rootScope.$broadcast('DONE');
        });
        
        this.initialisePcSp = () => {
            this.registers.updateDefaultRegister('SP', convertionService.extend(convertionService.convert('0x003f').from(16).to(2)).to(16));
            this.registers.updateDefaultRegister('PC', convertionService.extend(convertionService.convert('0x0040').from(16).to(2)).to(16));
        }
        
        this.sendDataOnSbus = data => {
            let sourceRegisterCode = 0;
            let sourceRegisterName = [];
            switch (data){
                case 0:
                    break;
                case 1:
                    $rootScope.dataBus['sbus'] = 0;
                    $log.log("Sent 0 on SBUS");
                    break;
                case 2:
                    $rootScope.dataBus['sbus'] = (~1 >>> 0) & $rootScope.LOW_PART_MASK;
                    $log.log("Sent -1 on SBUS");
                    break;
                case 3:
                    $rootScope.dataBus['sbus'] = 1;
                    $log.log("Sent 1 on SBUS");
                    break;
                case 4:
                    $rootScope.dataBus['sbus'] = parseInt(this.registers.defaultRegisters['MDR'], 2);
                    $log.log("Sent MDR on SBUS");
                    break;
                case 5:
                    $rootScope.dataBus['sbus'] = (~parseInt(this.registers.defaultRegisters['MDR'], 2) >>> 0) & $rootScope.LOW_PART_MASK;
                    $log.log("Sent !MDR on SBUS");
                    break;
                case 6:
                    sourceRegisterCode = ($rootScope.SOURCE_REGISTER_MASK & parseInt(this.registers.defaultRegisters['IR'], 2)) >> 6;
                    sourceRegisterName = $rootScope.getObjectPropertyByValue(this.registers.generalRegisters, 'code', convertionService.extend(convertionService.convert(sourceRegisterCode).from(10).to(2)).to(4));
                    $rootScope.dataBus['sbus'] = parseInt(this.registers.generalRegisters[sourceRegisterName[0]]['data'], 2);
                    $log.log("Sent Register",sourceRegisterName, "on SBUS");
                    break;
                case 7:
                    sourceRegisterCode = ($rootScope.SOURCE_REGISTER_MASK & parseInt(this.registers.defaultRegisters['IR'], 2)) >> 6;
                    sourceRegisterName = $rootScope.getObjectPropertyByValue(this.registers.generalRegisters, 'code', convertionService.extend(convertionService.convert(sourceRegisterCode).from(10).to(2)).to(4));
                    $rootScope.dataBus['sbus'] = (~parseInt(this.registers.generalRegisters[sourceRegisterName[0]]['data'], 2) >>> 0) & $rootScope.LOW_PART_MASK;
                    $log.log("Sent Register",sourceRegisterName, "on SBUS");
                    break;
                case 8:
                    $rootScope.dataBus['sbus'] = parseInt(this.registers.defaultRegisters['T'], 2);
                    $log.log("Sent T on SBUS");
                    break;
                case 9:
                    $rootScope.dataBus['sbus'] = (~parseInt(this.registers.defaultRegisters['T'], 2) >>> 0) & $rootScope.LOW_PART_MASK;
                    $log.log("Sent !T on SBUS");
                    break;
                case 10:
                    let offset = $rootScope.OFFSET_MASK & parseInt(this.registers.defaultRegisters['IR'], 2);
                    let offsetSign = ($rootScope.OFFSET_SIGN_MASK & offset) >> 7;
                    $rootScope.dataBus['sbus'] = (offsetSign === 0) ? offset : -(~$rootScope.OFFSET_SIGN_MASK & offset);
                    $log.log("Sent OFFSET on SBUS");
                    break;
                default:
                    $log.error("Unknown command");
            }
        }
        
        this.sendDataOnDbus = data => {
            let destinationRegisterCode = 0;
            let destinationRegisterName = [];
            switch (data){
                case 0:
                    break;
                case 1:
                    $rootScope.dataBus['dbus'] = 0;
                    $log.log("Sent 0 on DBUS");
                    break;
                case 2:
                    $rootScope.dataBus['dbus'] = parseInt(this.registers.defaultRegisters['PC'], 2);
                    $log.log("Sent PC on DBUS");
                    break;
                case 3:
                    $rootScope.dataBus['dbus'] = parseInt(this.registers.defaultRegisters['ADR'], 2);
                    $log.log("Sent ADR on DBUS");
                    break;
                case 4:
                    $rootScope.dataBus['dbus'] = parseInt(this.registers.defaultRegisters['IVR'], 2);
                    $log.log("Sent IVR on DBUS");
                    break;
                case 5:
                    $rootScope.dataBus['dbus'] = parseInt(this.registers.defaultRegisters['FLAGS'], 2);
                    $log.log("Sent FLAGS on DBUS");
                    break;
                case 6:
                    $rootScope.dataBus['dbus'] = parseInt(this.registers.defaultRegisters['SP'], 2);
                    $log.log("Sent SP on DBUS");
                    break;
                case 7:
                    $rootScope.dataBus['dbus'] = parseInt(this.registers.defaultRegisters['MDR'], 2);
                    $log.log("Sent MDR on DBUS");
                    break;
                case 8:
                    $rootScope.dataBus['dbus'] = (~parseInt(this.registers.defaultRegisters['MDR'], 2) >>> 0) & $rootScope.LOW_PART_MASK;
                    $log.log("Sent !MDR on DBUS");
                    break;
                case 9:
                    destinationRegisterCode = $rootScope.DESTINATION_REGISTER_MASK & parseInt(this.registers.defaultRegisters['IR'], 2);
                    destinationRegisterName = $rootScope.getObjectPropertyByValue(this.registers.generalRegisters, 'code', convertionService.extend(convertionService.convert(destinationRegisterCode).from(10).to(2)).to(4));
                    $log.log(destinationRegisterCode, destinationRegisterName[0]);
                    $rootScope.dataBus['dbus'] = parseInt(this.registers.generalRegisters[destinationRegisterName[0]]['data'], 2);
                    $log.log("Sent Register",destinationRegisterName, "on DBUS");
                    break;
                case 10:
                    destinationRegisterCode = $rootScope.DESTINATION_REGISTER_MASK & parseInt(this.registers.defaultRegisters['IR'], 2);
                    destinationRegisterName = $rootScope.getObjectPropertyByValue(this.registers.generalRegisters, 'code', convertionService.extend(convertionService.convert(destinationRegisterCode).from(10).to(2)).to(4));
                    $rootScope.dataBus['dbus'] = (~parseInt(this.registers.generalRegisters[destinationRegisterName[0]]['data'], 2) >>> 0) & $rootScope.LOW_PART_MASK;
                    $log.log("Sent Register",destinationRegisterName, "on DBUS");
                    break;
                case 11:
                    $rootScope.dataBus['dbus'] = parseInt(this.registers.defaultRegisters['T'], 2);
                    $log.log("Sent T on DBUS");
                    break;
                case 12:
                    $rootScope.dataBus['dbus'] = (~parseInt(this.registers.defaultRegisters['T'], 2) >>> 0) & $rootScope.LOW_PART_MASK;
                    $log.log("Sent !T on DBUS");
                default:
                    $log.error("Unknown command");
            }
        }
        
        this.saveData = data => {
            switch (data) {
                case 0:
                    break;
                case 1:
                    let pc = convertionService.extend(convertionService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.registers.updateDefaultRegister('PC', pc);
                    break;
                case 2:
                    let adr = convertionService.extend(convertionService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.registers.updateDefaultRegister('ADR', adr);
                    break;
                case 3:
                    let ivr = convertionService.extend(convertionService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.registers.updateDefaultRegister('IVR', ivr);
                    break;
                case 4:
                    let flags = convertionService.extend(convertionService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.registers.updateDefaultRegister('FLAGS', flags);
                    break;
                case 5:
                    let sp = convertionService.extend(convertionService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.registers.updateDefaultRegister('SP', sp);
                    break;
                case 6:
                    let mdr = convertionService.extend(convertionService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.registers.updateDefaultRegister('MDR', mdr);
                    break;
                case 7:
                    let regData = convertionService.extend(convertionService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    let destinationRegisterCode = ($rootScope.DESTINATION_REGISTER_MASK & parseInt(this.registers.defaultRegisters['IR'], 2));
                    let destinationRegisterName = $rootScope.getObjectPropertyByValue(this.registers.generalRegisters, 'code', convertionService.extend(convertionService.convert(destinationRegisterCode).from(10).to(2)).to(4));
                    this.registers.updateGeneralRegister(destinationRegisterName[0], regData);
                    break;
                case 8:
                    let temp = convertionService.extend(convertionService.convert($rootScope.dataBus.rbus).from(10).to(2)).to(16);
                    this.registers.updateDefaultRegister('T', temp);
                    break;
                default:
                    $log.error("Unknown command");
            }
        }
        
        this.specialOperation = data => {
            switch (data){
                case 0:
                    break;
                case 1:
                    this.registers.setCarry(1);
                    break;
                case 2:
                    this.registers.setCarry(0);
                    break;
                case 3:
                    this.registers.setZero(1);
                    break;
                case 4:
                    this.registers.setZero(0);
                    break;
                case 5:
                    this.registers.setSign(1);
                    break;
                case 6:
                    this.registers.setSign(0);
                    break;
                case 7:
                    this.registers.setOverflow(1);
                    break;
                case 8:
                    this.registers.setOverflow(0);
                    break;
                case 9:
                    this.registers.setCZSV(1);
                    break;
                case 10:
                    this.registers.setCZSV(0);
                    break;
                case 11:
                    this.registers.setInterruptionFlag(1);
                    break;
                case 12:
                    this.registers.setInterruptionFlag(0);
                    break;
                case 13:
                    $rootScope.conditions.ACKLOW = 1;
                    $log.log("Setting ACKLOW to 1!");
                    break;
                case 14:
                    $rootScope.conditions.ILLEGAL = 1;
                    $log.log("Setting ILLEGAL to 1!");
                    break;
                case 15:
                    $rootScope.conditions.ACKLOW = 0;
                    $rootScope.conditions.ILLEGAL = 0;
                    $log.log("Setting ILLEGAL and ACKLOW to 0!");
                    this.registers.setInterruptionFlag(0);
                    break;
                case 16:
                    $rootScope.conditions.HALT = 0;
                    break;
                case 17:
                    this.registers.incrementSP();
                    break;
                case 18:
                    this.registers.decrementSP();
                    break;
                case 19:
                    $rootScope.conditions.INTA = 1;
                    $log.log("Setting INTA and ACKLOW to 1!");
                    this.registers.decrementSP();
                    $rootScope.dataBus.rbus = parseInt(this.registers.defaultRegisters['IVR'], 2);
                    break;
                case 20:
                    this.registers.incrementPC();
                    break;
                case 21:
                    $rootScope.dataBus.rbus = parseInt(this.registers.defaultRegisters['FLAGS'], 2);
                    break;
                case 22:
                    this.registers.setCarry(1);
                    $rootScope.dataBus.rbus = parseInt(this.registers.defaultRegisters['FLAGS'], 2);
                    break;
                default:
                    $log.error("Unknown command");
            }
        }
        
        this.memoryOperation = data => {
            let adr = parseInt(this.registers.defaultRegisters['ADR'], 2);
            switch (data) {
                case 0:
                    break;
                case 1:
                    this.registers.defaultRegisters['IR'] = $rootScope.memory[adr].data;
                    $log.log('Instruction fetch:', this.registers.defaultRegisters['IR'], 'from', convertionService.extend(convertionService.convert(adr).from(10).to(16)).to(4));
                    $rootScope.$broadcast("IF");
                    break;
                case 2:
                    this.registers.defaultRegisters['MDR'] = $rootScope.memory[adr].data;
                    $log.log('Operand fetch:', this.registers.defaultRegisters['MDR'], 'from', convertionService.extend(convertionService.convert(adr).from(10).to(16)).to(4));
                    break;
                case 3:
                    $rootScope.memory[adr].data = this.registers.defaultRegisters['MDR'] ;
                    $log.log('Memory write:', this.registers.defaultRegisters['MDR'], 'to', convertionService.extend(convertionService.convert(adr).from(10).to(16)).to(4));
                    break;
                default:
                    $log.error("Unknown command");
            }
        }
    };

    RegistersController.$inject = ['$scope', '$rootScope', '$log', 'convertionService', 'registerFactory'];

    angular.module('app.cpuModule').component('registers', {
            bindings: {
                generalRegisters: '=',
                defaultRegisters: '='
            },
            templateUrl: 'client/templates/faculty/cpu-simulator/components/registers/registers.html',
            controller: RegistersController,
            controllerAs: 'regCtrl'
        });

}(window.angular));