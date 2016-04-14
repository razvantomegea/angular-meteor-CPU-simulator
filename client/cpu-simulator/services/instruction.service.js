/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    "use strict";
    var instructionService = function () {
        var instrSvc = this;
        instrSvc.instructionSet = {
            // Two operand instruction opcodes
            "MOV": {
                "code": "0000",
                "class": 1
            },
            "ADD": {
                "code": "0001",
                "class": 1
            },
            "SUB": {
                "code": "0010",
                "class": 1
            },
            "CMP": {
                "code": "0011",
                "class": 1
            },
            "AND": {
                "code": "0100",
                "class": 1
            },
            "OR": {
                "code": "0101",
                "class": 1
            },
            "XOR": {
                "code": "0110",
                "class": 1
            },
            // One operand instruction opcodes
            "CLR": {
                "code": "1100000000",
                "class": 2
            },
            "NEG": {
                "code": "1100000100",
                "class": 2
            },
            "INC": {
                "code": "1100001000",
                "class": 2
            },
            "DEC": {
                "code": "1100001100",
                "class": 2
            },
            "ASL": {
                "code": "1100010000",
                "class": 2
            },
            "ASR": {
                "code": "1100010100",
                "class": 2
            },
            "LSR": {
                "code": "1100011000",
                "class": 2
            },
            "ROL": {
                "code": "1100011100",
                "class": 2
            },
            "ROR": {
                "code": "1100100000",
                "class": 2
            },
            "RLC": {
                "code": "1100100100",
                "class": 2
            },
            "RRC": {
                "code": "1100101000",
                "class": 2
            },
            "JMP": {
                "code": "1100101100",
                "class": 2
            },
            "CALL": {
                "code": "1100110000",
                "class": 2
            },
            "PUSH": {
                "code": "1100110100",
                "class": 2
            },
            "POP": {
                "code": "1100111000",
                "class": 2
            },
            // Branch instruction opcodes
            "BR": {
                "code": 4,
                "class": 3
            },
            "BNE": {
                "code": "10000001",
                "class": 3
            },
            "BEQ": {
                "code": "10000010",
                "class": 3
            },
            "BPL": {
                "code": "10000011",
                "class": 3
            },
            "BMI": {
                "code": "10000100",
                "class": 3
            },
            "BCS": {
                "code": "10000101",
                "class": 3
            },
            "BCC": {
                "code": "10000110",
                "class": 3
            },
            "BVS": {
                "code": "10000111",
                "class": 3
            },
            "BVC": {
                "code": "10001000",
                "class": 3
            },
            // No operand instruction opcode
            "CLC": {
                "code": "1110000000000000",
                "class": 4
            },
            "CLV": {
                "code": "1110000100000000",
                "class": 4
            },
            "CLZ": {
                "code": "1110001000000000",
                "class": 4
            },
            "CLS": {
                "code": "1110001100000000",
                "class": 4
            },
            "CCC": {
                "code": "1110010000000000",
                "class": 4
            },
            "SEC": {
                "code": "1110010100000000",
                "class": 4
            },
            "SEV": {
                "code": "1110011000000000",
                "class": 4
            },
            "SEZ": {
                "code": "1110011100000000",
                "class": 4
            },
            "SES": {
                "code": "1110100000000000",
                "class": 4
            },
            "SCC": {
                "code": "1110100100000000",
                "class": 4
            },
            "NOP": {
                "code": "1110101000000000",
                "class": 4
            },
            "RET": {
                "code": "1110101100000000",
                "class": 4
            },
            "RETI": {
                "code": "1110110000000000",
                "class": 4
            },
            "HALT": {
                "code": "1110110100000000",
                "class": 4
            },
            "WAIT": {
                "code": "1110111000000000",
                "class": 4
            },
            "PUSH PC": {
                "code": "1110111100000000",
                "class": 4
            },
            "POP PC": {
                "code": "1111000000000000",
                "class": 4
            },
            "PUSH FLAG": {
                "code": "1111000100000000",
                "class": 4
            },
            "POP FLAG": {
                "code": "1111001000000000",
                "class": 4
            }
        };
    };

    instructionService.$inject = [];

    angular.module("app.cpuModule").service("instructionService", instructionService);

}(window.angular));