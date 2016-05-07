/**
 * Created by razva on 5/7/2016.
 */
(function (angular) {
    'use strict';
    var baseFilter = function () {

        this.convert = num => {
            return {
                from: baseFrom => {
                    return {
                        to: baseTo => parseInt(num,baseFrom).toString(baseTo).toUpperCase()
                    }
                }
            }
        };

        this.extend = num => {
            return {
                to: bits => {
                    let bitNr = bits - num.length;
                    for (let i = 0; i < bitNr; i++) {
                        num = '0' + num;
                    }
                    return num;
                }
            }
        };

        this.convertToBase = (number, base) => this.convert(number).from(10).to(base);

        return this.convertToBase;
    };

    baseFilter.$inject = [];

    angular.module('app.cpuModule').filter('baseFilter', baseFilter);

}(window.angular));