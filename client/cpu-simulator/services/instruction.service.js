/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    "use strict";
    var instructionService = function () {
        this.instructionSet = {
            // Two operand instruction opcodes
            "MOV": {
                "code": 0b0000,
                "class": 1
            },
            "ADD": {
                "code": 0b0001,
                "class": 1
            },
            "SUB": {
                "code": 0b0010,
                "class": 1
            },
            "CMP": {
                "code": 0b0011,
                "class": 1
            },
            "AND": {
                "code": 0b0100,
                "class": 1
            },
            "OR": {
                "code": 0b0101,
                "class": 1
            },
            "XOR": {
                "code": 0b0110,
                "class": 1
            },
            // One operand instruction opcodes
            "CLR": {
                "code": 0b1100000000,
                "class": 2
            },
            "NEG": {
                "code": 0b1100000100,
                "class": 2
            },
            "INC": {
                "code": 0b1100001000,
                "class": 2
            },
            "DEC": {
                "code": 0b1100001100,
                "class": 2
            },
            "ASL": {
                "code": 0b1100010000,
                "class": 2
            },
            "ASR": {
                "code": 0b1100010100,
                "class": 2
            },
            "LSR": {
                "code": 0b1100011000,
                "class": 2
            },
            "ROL": {
                "code": 0b1100011100,
                "class": 2
            },
            "ROR": {
                "code": 0b1100100000,
                "class": 2
            },
            "RLC": {
                "code": 0b1100100100,
                "class": 2
            },
            "RRC": {
                "code": 0b1100101000,
                "class": 2
            },
            "JMP": {
                "code": 0b1100101100,
                "class": 2
            },
            "CALL": {
                "code": 0b1100110000,
                "class": 2
            },
            "PUSH": {
                "code": 0b1100110100,
                "class": 2
            },
            "POP": {
                "code": 0b1100111000,
                "class": 2
            },
            // Branch instruction opcodes
            "BR": {
                "code": 4,
                "class": 3
            },
            "BNE": {
                "code": 0b10000001,
                "class": 3
            },
            "BEQ": {
                "code": 0b10000010,
                "class": 3
            },
            "BPL": {
                "code": 0b10000011,
                "class": 3
            },
            "BMI": {
                "code": 0b10000100,
                "class": 3
            },
            "BCS": {
                "code": 0b10000101,
                "class": 3
            },
            "BCC": {
                "code": 0b10000110,
                "class": 3
            },
            "BVS": {
                "code": 0b10000111,
                "class": 3
            },
            "BVC": {
                "code": 0b10001000,
                "class": 3
            },
            // No operand instruction opcode
            "CLC": {
                "code": 0b1110000000000000,
                "class": 4
            },
            "CLV": {
                "code": 0b1110000100000000,
                "class": 4
            },
            "CLZ": {
                "code": 0b1110001000000000,
                "class": 4
            },
            "CLS": {
                "code": 0b1110001100000000,
                "class": 4
            },
            "CCC": {
                "code": 0b1110010000000000,
                "class": 4
            },
            "SEC": {
                "code": 0b1110010100000000,
                "class": 4
            },
            "SEV": {
                "code": 0b1110011000000000,
                "class": 4
            },
            "SEZ": {
                "code": 0b1110011100000000,
                "class": 4
            },
            "SES": {
                "code": 0b1110100000000000,
                "class": 4
            },
            "SCC": {
                "code": 0b1110100100000000,
                "class": 4
            },
            "NOP": {
                "code": 0b1110101000000000,
                "class": 4
            },
            "RET": {
                "code": 0b1110101100000000,
                "class": 4
            },
            "RETI": {
                "code": 0b1110110000000000,
                "class": 4
            },
            "HALT": {
                "code": 0b1110110100000000,
                "class": 4
            },
            "WAIT": {
                "code": 0b1110111000000000,
                "class": 4
            },
            "PUSH PC": {
                "code": 0b1110111100000000,
                "class": 4
            },
            "POP PC": {
                "code": 0b1111000000000000,
                "class": 4
            },
            "PUSH FLAG": {
                "code": 0b1111000100000000,
                "class": 4
            },
            "POP FLAG": {
                "code": 0b1111001000000000,
                "class": 4
            }
        };
    };

    instructionService.$inject = [];

    angular.module("app.cpuModule").service("instructionService", instructionService);

}(window.angular));