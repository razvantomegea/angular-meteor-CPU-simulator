/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    
    'use strict';
    function CpuController($rootScope, $scope, $log, $timeout, registerFactory, $mdSidenav, dataHelpService) {

        this.toggleSidenav = name => $mdSidenav(name).toggle();
        this.navbarCollapsed = true;

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

        $scope.$on('EXECUTE', (event, data) => {
            angular.forEach(data, (instruction, index) => {
                let indexedAddress = 0x40 + index;
                indexedAddress = (dataHelpService.extend(dataHelpService.convert(indexedAddress).from(10).to(16)).to(4)).toUpperCase();
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
            $rootScope.$broadcast('initialisePcSp');
        });

        $scope.$on('readyPcSp', () => $rootScope.$broadcast('reset'));

        $scope.$on('checkMoreInstructions', () => {
            let currentPC = parseInt(registerFactory.defaultRegisters['PC'], 2);
            if(currentPC <= 2 + $rootScope.conditions.INSTRUCTION + 0x40) {
                $timeout(() => {
                    $rootScope.$broadcast('executeNextInstruction');
                }, 500);
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
    }

    CpuController.$inject = ['$rootScope', '$scope', '$log', '$timeout', 'registerFactory', '$mdSidenav', 'dataHelpService'];

    angular.module('app.cpuModule').controller('CpuController', CpuController);

}(window.angular));