/**
 * Created by Razvan Tomegea on 2/28/2016.
 */
(function (angular) {
    'use strict';
    var microProgramService = function ($log, dataHelpService) {
        /**
         * Microinstruction format
         *
         *    4B     4B     4B    4B     5B      2B      4B        3B     1B        8B           <==   39B
         * | SBUS | RBUS | ALU | RBUS | OTHER | MEM | SUCCESOR | INDEX | T/F | uADR (LABEL) |
         *
         **/
        this.microProgram = [];

        this.microcommands = {
            "SBUS": {
                "NONE": 0b0000,
                "Pd0s": 0b0001,
                "Pd-1": 0b0010,
                "Pd1": 0b0011,
                "PdMDRs": 0b0100,
                "PdNMDRs": 0b0101,
                "PdRGs": 0b0110,
                "PdNRGs": 0b0111,
                "PdTs": 0b1000,
                "PdNTs": 0b1001,
                "PdIR[OFF]": 0b1010
            },
            "DBUS": {
                "NONE": 0b0000,
                "Pd0d": 0b0001,
                "PdPC": 0b0010,
                "PdADR": 0b0011,
                "PdIVR": 0b0100,
                "PdFLAG": 0b0101,
                "PdSP": 0b0110,
                "PdMDRd": 0b0111,
                "PdNMDRd": 0b1000,
                "PdRGd": 0b1001,
                "PdNRGd": 0b1010,
                "PdTd": 0b1011,
                "PdNTd": 0b1100
            },
            "ALU": {
                "NONE": 0b0000,
                "SUM": 0b0001,
                "AND": 0b0010,
                "OR": 0b0011,
                "XOR": 0b0100,
                "ASL": 0b0101,
                "ASR": 0b0110,
                "LSR": 0b0111,
                "ROL": 0b1000,
                "ROR": 0b1001,
                "RLC": 0b1010,
                "RRC": 0b1011
            },
            "RBUS": {
                "NONE": 0b0000,
                "PmPC": 0b0001,
                "PmADR": 0b0010,
                "PmIVR": 0b0011,
                "PmFLAG": 0b0100,
                "PmSP": 0b0101,
                "PmMDR": 0b0110,
                "PmRG": 0b0111,
                "PmT": 0b1000
            },
            "MEM": {
                "NONE": 0b00,
                "IFCH": 0b01,
                "RD": 0b10,
                "WR": 0b11
            },
            "OTHER": {
                "NONE": 0b00000,
                "A(1)C": 0b00001,
                "A(0)C": 0b00010,
                "A(1)Z": 0b00011,
                "A(0)Z": 0b00100,
                "A(1)S": 0b00101,
                "A(0)S": 0b00110,
                "A(1)V": 0b00111,
                "A(0)V": 0b01000,
                "A(1)CZSV": 0b01001,
                "A(0)CZSV": 0b01010,
                "A(1)BVI": 0b01011,
                "A(0)BVI": 0b01100,
                "A(1)BE0": 0b01101,
                "A(1)BE1": 0b01110,
                "(A(0)BE,A(0)BI)": 0b01111,
                "A(0)BPO": 0b10000,
                "+2SP": 0b10001,
                "-2SP": 0b10010,
                "(INTA,-2SP)": 0b10011,
                "+2PC": 0b10100,
                "PdCOND": 0b10101,
                "(Cin,PdCOND)": 0b10110
            }
        };
        
        this.succesors = {
            "STEP": 0b0000,
            "JUMPI": 0b0001,
            "IF ACKLOW": 0b0010,
            "IF NCIL": 0b0011,
            "IF CL4": 0b0100,
            "IF CL3": 0b0101,
            "IF CL2": 0b0110,
            "IF C": 0b0111,
            "IF NC": 0b1000,
            "IF Z": 0b1001,
            "IF NZ": 0b1010,
            "IF S": 0b1011,
            "IF NS": 0b1100,
            "IF V": 0b1101,
            "IF NV": 0b1110,
            "IF NINTR": 0b1111
        };

        this.indexes = {
            "INDEX0": 0b000,
            // MAS
            "INDEX1": 0b001,
            // MAD
            "INDEX2": 0b010,
            // CL3 (1OP)
            "INDEX3": 0b011,
            // CL2 (BR) & CL4 (NO-OP)
            "INDEX4": 0b100,
            // CL1 (2OP)
            "INDEX5": 0b101
        };

        this.labels = {
            "IF": 0x00,
            "ILLEGAL": 0x02,
            "PWFAIL": 0x03,
            "INT": 0x04,
            "CL": 0x0A,
            "FOSAM": 0x0E,
            "FOSAD": 0x0F,
            "FOSAI": 0x10,
            "FOSAX": 0x11,
            "FOSEND": 0x13,
            "FODAM": 0x14,
            "FODAD": 0x15,
            "FODAI": 0x16,
            "FODAX": 0x17,
            "FODEND": 0x19,
            "EX": 0x1A,
            "MOV": 0x1B,
            "ADD": 0x1C,
            "SUB": 0x1D,
            "CMP": 0x1E,
            "AND": 0x1F,
            "OR": 0x20,
            "XOR": 0x21,
            "CLR": 0x22,
            "NEG": 0x23,
            "INC": 0x24,
            "DEC": 0x25,
            "ASL": 0x26,
            "ASR": 0x27,
            "LSR": 0x28,
            "ROL": 0x29,
            "ROR": 0x2A,
            "RLC": 0x28,
            "RRC": 0x2C,
            "JMP": 0x2D,
            "CALL": 0x2E,
            "PUSH": 0x2F,
            "POP": 0x30,
            "CALL2": 0x31,
            "PUSH2": 0x34,
            "POP2": 0x35,
            "DWRITE": 0x37,
            "BR": 0x3B,
            "BNE": 0x3D,
            "BEQ": 0x3F,
            "BPL": 0x41,
            "BMI": 0x43,
            "BCS": 0x45,
            "BCC": 0x47,
            "BVS": 0x49,
            "BVC": 0x4B,
            "CLC": 0x4D,
            "CLV": 0x4F,
            "CLZ": 0x51,
            "CLS": 0x53,
            "CCC": 0x55,
            "SEC": 0x57,
            "SEV": 0x59,
            "5EZ": 0x5B,
            "SES": 0x5D,
            "SCC": 0x5F,
            "NOP": 0x61,
            "RET": 0x63,
            "RETI": 0x65,
            "HALT": 0x67,
            "WAIT": 0x69,
            "PUSH PC": 0x6B,
            "POP PC": 0x6D,
            "PUSH FLAG": 0x6F,
            "POP FLAG": 0x71,
            "RETI2": 0x73,
            "INTRTEST": 0x75
        };

        this.mnemonicMicroinstructionSet = [
            // IF
            "Pd0s, PdPC, SUM, PmADR, +2PC, IFCH, IF ACKLOW, INDEX0, T, PWFAIL",
            "NONE, NONE, NONE, NONE, NONE, NONE, IF NCIL, INDEX0, T, CL",
            // ILLEGAL
            "NONE, NONE, NONE, NONE, A(1)BE1, NONE, JUMPI, INDEX0, T, INT",
            // PWFAIL
            "NONE, NONE, NONE, NONE, A(1)BE0, NONE, JUMPI, INDEX0, T, INT",
            // INT
            "Pd0s, PdFLAG, SUM, PmMDR, (INTA,-2SP), NONE, STEP, INDEX0, F",
            "Pd0s, PdSP, SUM, PmADR, -2SP, WR, STEP, INDEX0, F",
            "Pd0s, PdPC, SUM, PmMDR, NONE, NONE, STEP, INDEX0, F",
            "Pd0s, PdSP, SUM, PmADR, NONE, WR, STEP, INDEX0, F",
            "Pd0s, PdIVR, SUM, PmADR, NONE, RD, STEP, INDEX0, F",
            "Pd0s, PdMDRd, SUM, PmPC, (A(0)BE,A(0)BI), NONE, JUMPI, INDEX0, T, IF",
            // CL
            "NONE, NONE, NONE, NONE, NONE, NONE, IF CL4, INDEX4, T, CLC",
            "NONE, NONE, NONE, NONE, NONE, NONE, IF CL3, INDEX4, T, BR",
            "NONE, NONE, NONE, NONE, NONE, NONE, IF CL2, INDEX2, T, FODAM",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX1, T, FOSAM",
            // FOSAM
            "Pd0s, PdPC, SUM, PmADR, +2PC, RD, JUMPI, INDEX0, T, FOSEND",
            // FOSAD
            "PdRGs, Pd0d, SUM, PmT, NONE, NONE, JUMPI, INDEX2, T, FODAM",
            // FOSAI
            "PdRGs, Pd0d, SUM, PmADR, +2PC, RD, JUMPI, INDEX0, T, FOSEND",
            // FOSAX
            "Pd0s, PdPC, SUM, PmADR, +2PC, RD, STEP, INDEX0, F",
            "PdRGs, PdMDRd, SUM, PmADR, NONE, RD, STEP, INDEX0, F",
            // FOSEND
            "Pd0s, PdMDRd, SUM, PmT, NONE, NONE, JUMPI, INDEX2, T, FODAM",
            // FODAM
            "Pd0s, PdPC, SUM, PmADR, +2PC, RD, JUMPI, INDEX0, T, FODEND",
            // FODAD
            "Pd0s, PdRGd, SUM, PmMDR, NONE, NONE, JUMPI, INDEX0, T, FODEND",
            // FODAI
            "Pd0s, PdRGd, SUM, PmADR, NONE, RD, JUMPI, INDEX0, T, FODEND",
            // FODAX
            "Pd0s, PdPC, SUM, PmADR, +2PC, RD, STEP, INDEX0, F",
            "PdMDRs, PdRGd, SUM, PmADR, NONE, RD, STEP, INDEX0, F",
            // FODEND
            "NONE, NONE, NONE, NONE, NONE, NONE, IF CL2, INDEX3, T, CLR",
            // EX
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX5, T, MOV",
            // MOV
            "PdTs, Pd0d, SUM, PmMDR, NONE, NONE, JUMPI, INDEX2, T, DWRITE",
            // ADD
            "PdTs, PdMDRd, SUM, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // SUB
            "PdNTs, PdMDRd, SUM, PmMDR, (Cin,PdCOND), NONE, JUMPI, INDEX2, T, DWRITE",
            // CMP
            "PdTs, PdMDRd, SUM, NONE, (Cin,PdCOND), NONE, JUMPI, INDEX0, T, INTRTEST",
            // AND
            "PdTs, PdMDRd, AND, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // OR
            "PdTs, PdMDRd, OR, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // XOR
            "PdTs, PdMDRd, XOR, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // CLR
            "PdMDRs, PdNMDRd, SUM, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // NEG
            "Pd0s, PdNMDRd, SUM, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // INC
            "Pd1, PdMDRd, SUM, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // DEC
            "Pd-1, PdMDRd, SUM, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // ASL
            "Pd0s, PdMDRd, ASL, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // ASR
            "Pd0s, PdMDRd, ASR, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // LSR
            "Pd0s, PdMDRd, LSR, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // ROL
            "Pd0s, PdMDRd, ROL, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // ROR
            "Pd0s, PdMDRd, ROR, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // RLC
            "Pd0s, PdMDRd, RLC, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // RRC
            "Pd0s, PdMDRd, RRC, PmMDR, PdCOND, NONE, JUMPI, INDEX2, T, DWRITE",
            // JMP
            "Pd0s, PdMDRd, SUM, PmPC, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // CALL
            "PdMDRs, PdPC, SUM, PmT, NONE, NONE, JUMPI, INDEX0, T, CALL2",
            // PUSH
            "NONE, NONE, NONE, NONE, -2SP, NONE, JUMPI, INDEX0, T, PUSH2",
            // POP
            "Pd0s, PdADR, SUM, PmT, NONE, NONE, JUMPI, INDEX0, T, POP2",
            // CALL2
            "Pd0s, PdPC, SUM, PmMDR, -2SP, NONE, STEP, INDEX0, F",
            "Pd0s, PdSP, SUM, PmADR, NONE, WR, STEP, INDEX0, F",
            "Pd0s, PdTd, SUM, PmPC, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // PUSH2
            "Pd0s, PdSP, SUM, PmADR, NONE, WR, JUMPI, INDEX0, T, INTRTEST",
            // POP2
            "Pd0s, PdSP, SUM, PmADR, NONE, RD, STEP, INDEX0, F",
            "Pd0s, PdTd, SUM, PmADR, +2SP, NONE, JUMPI, INDEX2, T, DWRITE",
            // DWRITE
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, ILLEGAL",
            "Pd0s, PdMDRd, SUM, PmRG, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, WR, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, WR, JUMPI, INDEX0, T, INTRTEST",
            // BR
            "PdIR[OFF], PdPC, SUM, PmPC, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, NOP",
            // BNE
            "NONE, NONE, NONE, NONE, NONE, NONE, IF NZ, INDEX0, T, BR",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, NOP",
            // BEQ
            "NONE, NONE, NONE, NONE, NONE, NONE, IF Z, INDEX0, T, BR",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, NOP",
            // BPL
            "NONE, NONE, NONE, NONE, NONE, NONE, IF NS, INDEX0, T, BR",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, NOP",
            // BMI
            "NONE, NONE, NONE, NONE, NONE, NONE, IF S, INDEX0, T, BR",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, NOP",
            // BCS
            "NONE, NONE, NONE, NONE, NONE, NONE, IF NC, INDEX0, T, BR",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, NOP",
            // BCC
            "NONE, NONE, NONE, NONE, NONE, NONE, IF C, INDEX0, T, BR",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, NOP",
            // BVS
            "NONE, NONE, NONE, NONE, NONE, NONE, IF NV, INDEX0, T, BR",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, NOP",
            // BVC
            "NONE, NONE, NONE, NONE, NONE, NONE, IF V, INDEX0, T, BR",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, NOP",
            // CLC
            "NONE, NONE, NONE, NONE, A(0)C, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // CLV
            "NONE, NONE, NONE, NONE, A(0)V, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // CLZ
            "NONE, NONE, NONE, NONE, A(0)Z, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // CLS
            "NONE, NONE, NONE, NONE, A(0)S, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // CCC
            "NONE, NONE, NONE, NONE, A(0)CZSV, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // SEC
            "NONE, NONE, NONE, NONE, A(1)C, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // SEV
            "NONE, NONE, NONE, NONE, A(1)V, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // SEZ
            "NONE, NONE, NONE, NONE, A(1)Z, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // SES
            "NONE, NONE, NONE, NONE, A(1)S, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // SCC
            "NONE, NONE, NONE, NONE, A(1)CZSV, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // NOP
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // RET
            "Pd0s, PdSP, SUM, PmADR, NONE, RD, STEP, INDEX0, F",
            "Pd0s, PdMDRd, SUM, PmPC, +2SP, NONE, JUMPI, INDEX0, T, INTRTEST",
            // RETI
            "Pd0s, PdSP, SUM, PmADR, NONE, RD, STEP, INDEX0, F",
            "Pd0s, PdMDRd, SUM, PmPC, +2SP, NONE, JUMPI, INDEX0, T, RETI2",
            // HALT
            "NONE, NONE, NONE, NONE, A(0)BPO, NONE, JUMPI, INDEX0, T, INTRTEST",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // WAIT
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T,WAIT",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INTRTEST",
            // PUSH PC
            "Pd0s, PdPC, SUM, PmMDR, -2SP, NONE, STEP, INDEX0, F",
            "Pd0s, PdSP, SUM, PmADR, NONE, WR, JUMPI, INDEX0, T, INTRTEST",
            // POP PC
            "Pd0s, PdSP, SUM, PmADR, NONE, RD, STEP, INDEX0, F",
            "Pd0s, PdMDRd, SUM, PmPC, +2SP, NONE, JUMPI, INDEX0, T, INTRTEST",
            // PUSH FLAG
            "Pd0s, PdFLAG, SUM, PmMDR, -2SP, NONE, STEP, INDEX0, F",
            "Pd0s, PdSP, SUM, PmADR, NONE, WR, JUMPI, INDEX0, T, INTRTEST",
            // POP FLAG
            "Pd0s, PdSP, SUM, PmADR, NONE, RD, STEP, INDEX0, F",
            "Pd0s, PdMDRd, SUM, PmFLAG, +2SP, NONE, JUMPI, INDEX0, T, INTRTEST",
            // RETI2
            "Pd0s, PdSP, SUM, PmADR, NONE, RD, STEP, INDEX0, F",
            "Pd0s, PdMDRd, SUM, PmFLAG, +2SP, NONE, JUMPI, INDEX0, T, INTRTEST",
            // INTRTEST
            "NONE, NONE, NONE, NONE, NONE, NONE, IF NINTR, INDEX0, T, IF",
            "NONE, NONE, NONE, NONE, NONE, NONE, JUMPI, INDEX0, T, INT"
        ];
        
        this.initializeMicroProgram = () => {
            angular.forEach(this.mnemonicMicroinstructionSet, (instruction, instructionIndex) => {
                let microCommands = instruction.split(", ");
                let SBUS = this.microcommands.SBUS[microCommands[0]];
                let DBUS = this.microcommands.DBUS[microCommands[1]];
                let ALU = this.microcommands.ALU[microCommands[2]];
                let RBUS = this.microcommands.RBUS[microCommands[3]];
                let OTHER = this.microcommands.OTHER[microCommands[4]];
                let MEM = this.microcommands.MEM[microCommands[5]];
                let SUCCESOR = this.succesors[microCommands[6]];
                let INDEX = this.indexes[microCommands[7]];
                let TF = (microCommands[8] === "T") ? 0b1 : 0b0;
                let uADR = this.labels[microCommands[9]];
                let microInstruction = SBUS * Math.pow(2, 35) +
                    DBUS * Math.pow(2, 31) +
                    ALU * Math.pow(2, 27) +
                    RBUS * Math.pow(2, 23) +
                    OTHER * Math.pow(2, 18) +
                    MEM * Math.pow(2, 16) +
                    SUCCESOR * Math.pow(2, 12) +
                    INDEX * Math.pow(2, 9) +
                    TF * Math.pow(2, 8) +
                    (uADR || 0);
                $log.debug("Microinstruction:", instruction, "\n", microInstruction.toString(2));
                this.microProgram.push(microInstruction);
            });
        };
    };

    microProgramService.$inject = ['$log', 'dataHelpService'];

    angular.module('app.cpuModule').service('microProgramService', microProgramService);

}(window.angular));