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
                "NONE": "0000",
                "Pd0s": "0001",
                "Pd-1": "0010",
                "Pd1": "0011",
                "PdMDRs": "0100",
                "PdNMDRs": "0101",
                "PdRGs": "0110",
                "PdNRGs": "0111",
                "PdTs": "1000",
                "PdNTs": "1001",
                "PdIR[OFF]": "1010"
            },
            "DBUS": {
                "NONE": "0000",
                "Pd0d": "0001",
                "PdPC": "0010",
                "PdADR": "0011",
                "PdIVR": "0100",
                "PdFLAG": "0101",
                "PdSP": "0110",
                "PdMDRd": "0111",
                "PdNMDRd": "1000",
                "PdRGd": "1001",
                "PdNRGd": "1010",
                "PdTd": "1011",
                "PdNTd": "1100"
            },
            "ALU": {
                "NONE": "0000",
                "SUM": "0001",
                "AND": "0010",
                "OR": "0011",
                "XOR": "0100",
                "ASL": "0101",
                "ASR": "0110",
                "LSR": "0111",
                "ROL": "1000",
                "ROR": "1001",
                "RLC": "1010",
                "RRC": "1011"
            },
            "RBUS": {
                "NONE": "0000",
                "PmPC": "0001",
                "PmADR": "0010",
                "PmIVR": "0011",
                "PmFLAG": "0100",
                "PmSP": "0101",
                "PmMDR": "0110",
                "PmRG": "0111",
                "PmT": "1000"
            },
            "MEM": {
                "NONE": "00",
                "IFCH": "01",
                "RD": "10",
                "WR": "11"
            },
            "OTHER": {
                "NONE": "00000",
                "A(1)C": "00001",
                "A(0)C": "00010",
                "A(1)Z": "00011",
                "A(0)Z": "00100",
                "A(1)S": "00101",
                "A(0)S": "00110",
                "A(1)V": "00111",
                "A(0)V": "01000",
                "A(1)CZSV": "01001",
                "A(0)CZSV": "01010",
                "A(1)BVI": "01011",
                "A(0)BVI": "01100",
                "A(1)BE0": "01101",
                "A(1)BE1": "01110",
                "(A(0)BE,A(0)BI)": "01111",
                "A(0)BPO": "10000",
                "+2SP": "10001",
                "-2SP": "10010",
                "(INTA,-2SP)": "10011",
                "+2PC": "10100",
                "PdCOND": "10101",
                "(Cin,PdCOND)": "10110"
            }
        };
        
        this.succesors = {
            "STEP": "0000",
            "JUMPI": "0001",
            "IF ACKLOW": "0010",
            "IF NCIL": "0011",
            "IF CL4": "0100",
            "IF CL3": "0101",
            "IF CL2": "0110",
            "IF C": "0111",
            "IF NC": "1000",
            "IF Z": "1001",
            "IF NZ": "1010",
            "IF S": "1011",
            "IF NS": "1100",
            "IF V": "1101",
            "IF NV": "1110",
            "IF NINTR": "1111"
        };

        this.indexes = {
            "INDEX0": "000",
            // MAS
            "INDEX1": "001",
            // MAD
            "INDEX2": "010",
            // CL3 (1OP)
            "INDEX3": "011",
            // CL2 (BR) & CL4 (NO-OP)
            "INDEX4": "100",
            // CL1 (2OP)
            "INDEX5": "101"
        };

        this.labels = {
            "IF": "00",
            "ILLEGAL": "02",
            "PWFAIL": "03",
            "INT": "04",
            "CL": "0A",
            "FOSAM": "0E",
            "FOSAD": "0F",
            "FOSAI": "10",
            "FOSAX": "11",
            "FOSEND": "13",
            "FODAM": "14",
            "FODAD": "15",
            "FODAI": "16",
            "FODAX": "17",
            "FODEND": "19",
            "EX": "1A",
            "MOV": "1B",
            "ADD": "1C",
            "SUB": "1D",
            "CMP": "1E",
            "AND": "1F",
            "OR": "20",
            "XOR": "21",
            "CLR": "22",
            "NEG": "23",
            "INC": "24",
            "DEC": "25",
            "ASL": "26",
            "ASR": "27",
            "LSR": "28",
            "ROL": "29",
            "ROR": "2A",
            "RLC": "28",
            "RRC": "2C",
            "JMP": "2D",
            "CALL": "2E",
            "PUSH": "2F",
            "POP": "30",
            "CALL2": "31",
            "PUSH2": "34",
            "POP2": "35",
            "DWRITE": "37",
            "BR": "3B",
            "BNE": "3D",
            "BEQ": "3F",
            "BPL": "41",
            "BMI": "43",
            "BCS": "45",
            "BCC": "47",
            "BVS": "49",
            "BVC": "4B",
            "CLC": "4D",
            "CLV": "4F",
            "CLZ": "51",
            "CLS": "53",
            "CCC": "55",
            "SEC": "57",
            "SEV": "59",
            "5EZ": "5B",
            "SES": "5D",
            "SCC": "5F",
            "NOP": "61",
            "RET": "63",
            "RETI": "65",
            "HALT": "67",
            "WAIT": "69",
            "PUSH PC": "6B",
            "POP PC": "6D",
            "PUSH FLAG": "6F",
            "POP FLAG": "71",
            "RETI2": "73",
            "INTRTEST": "75"
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
                let TF = (microCommands[8] === "T") ? "1" : "0";
                let uADR = this.labels[microCommands[9]];
                uADR = (uADR === undefined) ? "00000000" : dataHelpService.extend(dataHelpService.convert(uADR).from(16).to(2)).to(8);
                let microInstruction = SBUS.concat(DBUS, ALU, RBUS, OTHER, MEM, SUCCESOR, INDEX, TF, uADR);
                this.microProgram.push(microInstruction);
            });
        };
    };

    microProgramService.$inject = ['$log', 'dataHelpService'];

    angular.module('app.cpuModule').service('microProgramService', microProgramService);

}(window.angular));