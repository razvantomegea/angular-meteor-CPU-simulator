/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    var dataHelpService = function () {

        // Standard 32b High and Low masks
        this.HIGH_PART_MASK = 0b11111111111111110000000000000000;
        this.LOW_PART_MASK = 0b00000000000000001111111111111111;

        // Standard 16b High and Low masks
        this.HIGH16_PART_MASK = 0b1111111100000000;
        this.LOW16_PART_MASK = 0b0000000011111111;

        // Instruction register masks
        this.FIRST_CLASS_MASK = 0b1000000000000000;
        this.FIRST_CLASS_OPCODE_MASK = 0b0111000000000000;
        this.SOURCE_ADDRESSING_MASK = 0b0000110000000000;
        this.SOURCE_REGISTER_MASK = 0b0000001111000000;
        this.DESTINATION_ADDRESSING_MASK = 0b0000000000110000;
        this.DESTINATION_REGISTER_MASK = 0b0000000000001111;
        this.NOT_FIRST_CLASS_MASK = 0b1110000000000000;
        this.OFFSET_MASK = 0b0000000011111111;
        this.OFFSET_SIGN_MASK = 0b0000000010000000;
        this.NOT_FIRST_CLASS_OPCODE_MASK = 0b0001111100000000;

        // Microinstruction register masks
        this.SBUS_MASK = 0b1111000000000000000000000000000;
        this.DBUS_MASK = 0b0000111100000000000000000000000;
        this.ALU_MASK = 0b0000000011110000000000000000000;
        this.RBUS_MASK = 0b0000000000001111000000000000000;
        this.OTHER_MASK = 0b0000000000000000111110000000000;
        this.MEMORY_MASK = 0b0000000000000000000001100000000;
        this.SUCCESOR_MASK = 0b0000000000000000000000011110000;
        this.INDEX_MASK = 0b0000000000000000000000000001110;
        this.CONDITION_MASK = 0b0000000000000000000000000000001;

        // Flag register masks
        this.INTR_FLAG_MASK = 0b0000000010000000;
        this.CARRY_FLAG_MASK = 0b0000000000001000;
        this.ZERO_FLAG_MASK = 0b0000000000000100;
        this.SIGN_FLAG_MASK = 0b0000000000000010;
        this.OVERFLOW_FLAG_MASK = 0b0000000000000001;

        this.convert = num => {
            return {
                from: baseFrom => {
                    return {
                        to: baseTo => parseInt(num,baseFrom).toString(baseTo)
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

        this.getObjectPropertyByValue = (obj, subProperty, value) => {
            let result = [];
            if (!subProperty) {
                result = Object.keys(obj).filter((item) => obj[item] === value);
                //$log.log("Found", result.length, "items for", obj, "with property value", value);
                return result;
            } else {
                result = Object.keys(obj).filter((item) => obj[item][subProperty] === value);
                //$log.log("Found", result.length, "items for", obj, "with property value", value);
                return result;
            }
        };
    };

    dataHelpService.$inject = [];

    angular.module('app.cpuModule').service('dataHelpService', dataHelpService);

}(window.angular));