/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {

    'use strict';
    function BCGController($rootScope, $scope, $log, dataHelpService, commandFactory, registerFactory, microProgramService) {
        let commander = commandFactory;
        microProgramService.initializeMicroProgram();
        this.MAR = -1;
        this.MIR = 0;
        this.microinstructionDecoder = {
            miHi: 0,
            miLo: 0,
            sbus: 0,
            dbus: 0,
            alu: 0,
            rbus: 0,
            other: 0,
            memory: 0,
            succesor: 0,
            index: 0,
            condition: 0,
            uAdress: 0
        };

        this.base = 10;

        $scope.$on('setBase', (event, base) => this.base = base);

        $scope.$on('initialiseMarMir', () => this.initialiseMicroRegisters());

        $scope.$on('EN1', () => this.sendDbusSbusData());

        $scope.$on('receiveAlu', () => this.aluComputation());

        $scope.$on('rwMemory', () => this.memoryOperation());

        $scope.$on('memoryExchangeDone', () => {
            this.calculateBranchFunction();
            $rootScope.$broadcast('checkMoreInstructions');
        });

        this.decodeMicroinstruction = microinstruction => {
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getHi();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getLo();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getSbus();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getDbus();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getAlu();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getRbus();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getOther();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getMemory();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getSuccesor();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getIndex();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getCondition();
            commander.parseMicroinstruction(this.microinstructionDecoder, microinstruction).getuAddress();
        };

        this.initialiseMicroRegisters = () => {
            this.MAR = 0;
            this.MIR = microProgramService.microProgram[0];
            $rootScope.$broadcast('readyMarMir');
        };

        this.sendDbusSbusData = () => {
            this.MAR++;
            this.decodeMicroinstruction(this.MIR);
            $rootScope.$broadcast('sendSbus', this.microinstructionDecoder.sbus);
            $rootScope.$broadcast('sendDbus', this.microinstructionDecoder.dbus);
        };

        this.commandAlu = cmd => {
            switch (cmd) {
                case 0:
                    break;
                case 1:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.add($rootScope.dataBus.sbus, $rootScope.dataBus.dbus);
                    break;
                case 2:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.and($rootScope.dataBus.sbus, $rootScope.dataBus.dbus);
                    break;
                case 3:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.or($rootScope.dataBus.sbus, $rootScope.dataBus.dbus);
                    break;
                case 4:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.xor($rootScope.dataBus.sbus, $rootScope.dataBus.dbus);
                    break;
                case 5:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.asl($rootScope.dataBus.dbus);
                    break;
                case 6:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.asr($rootScope.dataBus.dbus);
                    break;
                case 7:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.lsr($rootScope.dataBus.dbus);
                    break;
                case 8:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.rol($rootScope.dataBus.dbus);
                    break;
                case 9:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.ror($rootScope.dataBus.dbus);
                    break;
                case 10:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.rlc($rootScope.dataBus.dbus);
                    break;
                case 11:
                    $rootScope.dataBus.rbus = commander.arithemticLogicUnit.rrc($rootScope.dataBus.dbus);
                    break;
                default:
                    $log.error("Unknown command");
            }
        };

        this.aluComputation = () => {
            this.commandAlu(this.microinstructionDecoder.alu);
            $rootScope.$broadcast('receiveRbus', this.microinstructionDecoder.rbus);
            $rootScope.$broadcast('other', this.microinstructionDecoder.other);
            $rootScope.$broadcast('operationDone');
        };

        this.memoryOperation = () => {
            $rootScope.$broadcast('exchangeMemory', this.microinstructionDecoder.memory);
        };

        this.calculateBranchFunction = () => {
            commander.getInstructionClass(registerFactory.defaultRegisters['IR']);
            $rootScope.conditions.g = !!commander.verifyCondition(this.microinstructionDecoder.succesor) && !!this.microinstructionDecoder.condition;
            if ($rootScope.conditions.g) {
                let index = commander.calculateIndex(this.microinstructionDecoder.index, registerFactory.defaultRegisters['IR']);
                this.MAR = this.microinstructionDecoder.uAdress + index;
                this.MIR = microProgramService.microProgram[this.MAR];
            } else {
                this.MIR = microProgramService.microProgram[this.MAR];
            }
        }
    }

    BCGController.$inject = ['$rootScope', '$scope', '$log', 'dataHelpService', 'commandFactory', 'registerFactory', 'microProgramService'];

    angular.module('app.cpuModule.executionModule').component('commander', {
        templateUrl: 'client/cpu-simulator/components/compiler/commander/commander.html',
        controller: BCGController,
        controllerAs: 'bcgCtrl'
    });

}(window.angular));