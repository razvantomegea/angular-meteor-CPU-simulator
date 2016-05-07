/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {

    'use strict';
    function CpuController($rootScope, $scope, $log, $timeout, registerFactory, $mdSidenav, memoryService) {

        this.toggleSidenav = name => $mdSidenav(name).toggle();
        this.navbarCollapsed = true;
        this.showMemory = true;
        this.showRegisters = true;
        this.showBuses = true;
        this.showCache = true;
        this.showBcg = true;
        this.clockTicks = [100, 500, 1000];
        this.codeRdy = false;
        this.running = false;
        this.stepping = false;
        this.nextStep = true;
        this.paused = false;
        this.stopped = false;

        this.run = () => {
            this.running = true;
            this.nextStep = false;
            if (this.stepping) { this.continueExecution(); }
            else { $rootScope.$broadcast('initialisePcSp'); }
        };

        this.step = () => {
            if (this.stepping) { this.continueExecution(); }
            else {
                this.stepping = true;
                $rootScope.$broadcast('initialisePcSp');
            }
        };

        this.continueExecution = () => {
            let currentPC = registerFactory.defaultRegisters['PC'];
            if (currentPC <= 2 + $rootScope.conditions.INSTRUCTION + 0x40) {
                //$timeout(() => {
                    $rootScope.$broadcast('executeNextInstruction');
                //}, $scope.clock);
            } else {
                $rootScope.conditions.ACKLOW = 1;
                $log.log("No more instructions!");
            }
        };

        $scope.clock = 100;

        $scope.$watch('clock', () => $rootScope.$broadcast('setClock', $scope.clock));

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
            rbus: 0,
            memRdBus: 0,
            memWrBus: 0
        };

        $scope.$on('EXECUTE', (event, instructionSet) => {
            $log.debug(instructionSet);
            this.codeRdy = true;
            angular.forEach(instructionSet, (instruction, instructionIndex) => {
                memoryService.memoryWrite(0x40 + instructionIndex, instruction);
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
        });

        $scope.$on('readyPcSp', () => $rootScope.$broadcast('reset'));

        $scope.$on('checkMoreInstructions', () => {
            if (this.running && !this.paused && !this.stopped) { this.continueExecution(); }
            else { this.nextStep = true;}
        });

        $scope.$on('IF', () => {
            $rootScope.conditions.CL4 = 0;
            $rootScope.conditions.CL3 = 0;
            $rootScope.conditions.CL2 = 0;
        });
    }

    CpuController.$inject = ['$rootScope', '$scope', '$log', '$timeout', 'registerFactory', '$mdSidenav', 'memoryService'];

    angular.module('app.cpuModule').controller('CpuController', CpuController);

}(window.angular));