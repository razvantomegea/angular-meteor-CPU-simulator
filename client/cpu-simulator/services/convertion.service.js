/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    var convertionService = function () {
        var convSvc = this;

        function convert(num) {
            return {
                from: baseFrom => {
                    return {
                        to: baseTo => parseInt(num,baseFrom).toString(baseTo)
                    }
                }
            }
        }

        function extend(num) {
            return {
                to: bits => {
                    let bitNr = bits - num.length;
                    for (let i = 0; i < bitNr; i++) {
                        num = '0' + num;
                    }
                    return num;
                }
            }
        }

        convSvc.convert = convert;
        convSvc.extend = extend;
    };

    convertionService.$inject = [];

    angular.module('app.cpuModule').service('convertionService', convertionService);

}(window.angular));