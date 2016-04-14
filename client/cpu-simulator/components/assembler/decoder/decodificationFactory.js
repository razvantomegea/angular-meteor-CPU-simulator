/**
 * Created by razva on 4/10/2016.
 */
(function (angular) {

    'use strict';
    function decodificationFactory($rootScope, $log, instructionService, convertionService, registerFactory) {
        
        return {
            firstClassInstructionParsing: parseFirstClassInstruction,
            secondClassInstructionParsing: parseSecondClassInstruction,
            thirdClassInstructionParsing: parseThirdClassInstruction,
            forthClassInstructionParsing: parseForthClassInstruction,
            instructionDecodification: decodeInstructions
        };
        
        function parseFirstClassInstruction(instruction) {
            $log.log(instruction);
            let firstClassInstruction = instruction.code.slice(0, -1);
            let instructionParts = firstClassInstruction.split(" ");

            // Opcode parsing
            let opcodeMnemonic = instructionParts[0];
            let opcodeMachineCode = instructionService.instructionSet[opcodeMnemonic].code;

            // Source operand parsing
            let source = instructionParts[1].split(",")[1];
            let indexOfSourceBracket = source.indexOf("(");
            let sourceOperandIndex = (indexOfSourceBracket > 0) ? source.slice(0,indexOfSourceBracket) : false;
            if (sourceOperandIndex) {
                sourceOperandIndex = convertionService.extend(convertionService.convert(sourceOperandIndex).from(10).to(2)).to(16);
            }
            let sourceOperand = (indexOfSourceBracket === -1)
                ? source
                : (indexOfSourceBracket === 0)
                    ? source.slice(1, -1)
                    : source.slice(indexOfSourceBracket + 1, -1);
            let sourceOperandMachineCode = (sourceOperandIndex)
                ? '11' + registerFactory.generalRegisters[sourceOperand].code
                : (indexOfSourceBracket !== -1)
                    ? '10' + registerFactory.generalRegisters[sourceOperand].code
                    : (sourceOperand.indexOf('R') !== -1)
                        ? '01' + registerFactory.generalRegisters[sourceOperand].code
                        : '000000';
            let offset = (sourceOperand.indexOf('R') === -1) ? sourceOperand : false;
            if(offset){
                if(offset.indexOf("0x") !== -1){
                    offset = convertionService.extend(convertionService.convert(offset).from(16).to(2)).to(16);
                } else{
                    offset = convertionService.extend(convertionService.convert(offset).from(10).to(2)).to(16);
                }
            }

            // Destination operand parsing
            let destination = instructionParts[1].split(",")[0];
            let indexOfDestinationBracket = destination.indexOf("(");
            let destinationOperandIndex = (indexOfDestinationBracket > 0) ? destination.slice(0,indexOfDestinationBracket) : false;
            if (destinationOperandIndex) {
                destinationOperandIndex = convertionService.extend(convertionService.convert(destinationOperandIndex).from(10).to(2)).to(16);
            }
            let destinationOperand = (indexOfDestinationBracket === -1)
                ? destination
                : (indexOfDestinationBracket === 0)
                    ? destination.slice(1, -1)
                    : destination.slice(indexOfDestinationBracket + 1, -1);
            let destinationOperandMachineCode = (destinationOperandIndex)
                ? '11' + registerFactory.generalRegisters[destinationOperand].code
                : (indexOfDestinationBracket !== -1)
                    ? '10' + registerFactory.generalRegisters[destinationOperand].code
                    : '01' + registerFactory.generalRegisters[destinationOperand].code;
            let machineCodeInstruction = opcodeMachineCode.concat(sourceOperandMachineCode, destinationOperandMachineCode);
            return {
                instruction: machineCodeInstruction,
                sourceIndex: sourceOperandIndex,
                destinationIndex: destinationOperandIndex,
                offset: offset
            };
        }

        function parseSecondClassInstruction(instruction) {
            $log.log(instruction);
            let thirdClassInstruction = instruction.code.slice(0, -1);
            let instructionParts = thirdClassInstruction.split(" ");

            // Opcode parsing
            let opcodeMnemonic = instructionParts[0];
            let opcodeMachineCode = instructionService.instructionSet[opcodeMnemonic].code;

            // Operand parsing
            let source = thirdClassInstruction.split(" ")[1];
            let indexOfBracket = source.indexOf("(");
            let operandIndex = (indexOfBracket > 0) ? source.slice(0,indexOfBracket) : false;
            if (operandIndex) {
                operandIndex = convertionService.extend(convertionService.convert(operandIndex).from(10).to(2)).to(16);
            }
            let operand = (indexOfBracket === -1)
                ? source
                : (indexOfBracket === 0)
                ? source.slice(1,-1)
                : source.slice(indexOfBracket + 1, -1);
            let operandMachineCode = (operandIndex)
                ? '11' + registerFactory.generalRegisters[operand].code
                : (indexOfBracket !== -1)
                ? '10' + registerFactory.generalRegisters[operand].code
                : (operand.indexOf('R') !== -1)
                ? '01' + registerFactory.generalRegisters[operand].code
                : '000000';
            let offset = (operand.indexOf('R') === -1) ? operand : false;
            if(offset){
                if(offset.indexOf("0x") !== -1){
                    offset = convertionService.extend(convertionService.convert(offset).from(16).to(2)).to(16);
                } else{
                    offset = convertionService.extend(convertionService.convert(offset).from(10).to(2)).to(16);
                }
            }
            let machineCodeInstruction = opcodeMachineCode.concat(operandMachineCode);
            return {
                instruction: machineCodeInstruction,
                sourceIndex: false,
                destinationIndex: operandIndex,
                offset: offset
            };
        }

        function parseThirdClassInstruction(instruction) {
            $log.log(instruction);
            let secondClassInstruction = instruction.code.slice(0, -1);
            let instructionParts = secondClassInstruction.split(" ");

            // Opcode parsing
            let opcodeMnemonic = instructionParts[0];
            let opcodeMachineCode = instructionService.instructionSet[opcodeMnemonic].code;

            // Offset
            let offset = secondClassInstruction.split(" ")[1];
            let machineCodeInstruction = opcodeMachineCode;
            return {
                instruction: machineCodeInstruction,
                sourceIndex: false,
                destinationIndex: false,
                offset: offset
            };
        }

        function parseForthClassInstruction(instruction) {
            $log.log(instruction);

            // Opcode parsing
            let opcodeMnemonic = instruction.code.slice(0, -1);
            let machineCodeInstruction = instructionService.instructionSet[opcodeMnemonic].code;
            return {
                instruction: machineCodeInstruction,
                sourceIndex: false,
                destinationIndex: false,
                offset: false
            };
        }
        
        function decodeInstructions(instructionSetData, machineCodeIntructionSet) {
            angular.forEach(instructionSetData, (instruction, instructionIndex) => {
                let machineCodeInstruction = '';
                switch (instruction.class) {
                    case 1:
                        machineCodeInstruction = this.firstClassInstructionParsing(instruction);
                        machineCodeIntructionSet.push(machineCodeInstruction.instruction);
                        if(machineCodeInstruction.offset){
                            machineCodeIntructionSet.push(machineCodeInstruction.offset);
                        }
                        if(machineCodeInstruction.sourceIndex){
                            machineCodeIntructionSet.push(machineCodeInstruction.sourceIndex);
                        }
                        if(machineCodeInstruction.destinationIndex){
                            machineCodeIntructionSet.push(machineCodeInstruction.destinationIndex);
                        }
                        break;
                    case 2:
                        machineCodeInstruction = this.secondClassInstructionParsing(instruction);
                        machineCodeIntructionSet.push(machineCodeInstruction.instruction);
                        if(machineCodeInstruction.offset){
                            machineCodeIntructionSet.push(machineCodeInstruction.offset);
                        }
                        if(machineCodeInstruction.destinationIndex){
                            machineCodeIntructionSet.push(machineCodeInstruction.destinationIndex);
                        }
                        break;
                    case 3:
                        machineCodeInstruction = this.thirdClassInstructionParsing(instruction);
                        let labeledInstruction = instructionSetData.filter((item) => {
                            return item.label === machineCodeInstruction.offset;
                        });

                        let labeledInstructionIndex = instructionSetData.indexOf(labeledInstruction[0]);
                        angular.forEach(instructionSetData, (item, idx) => {
                            let nextOperandCount = 0;
                            let prevOperandCount = 0;
                            let operands = [];
                            if (item.class === 1) {
                                operands = item.code.split(" ")[1].split(",");
                            }
                            if (item.class === 2) {
                                operands = item.code.split(" ")[1];
                            }
                            if ((instructionIndex < labeledInstructionIndex) && (idx > instructionIndex) && (idx < labeledInstructionIndex)) {
                                if (operands[0] && (operands[0].indexOf("(") > 0)) {
                                    nextOperandCount++;
                                }
                                if (operands[1] && ((operands[1].indexOf("(") > 0) || (operands[1].indexOf("R") === -1))) {
                                    nextOperandCount++;
                                }
                                if (operands && (operands.indexOf("(") > 0)) {
                                    nextOperandCount++;
                                }
                            }
                            if ((instructionIndex > labeledInstructionIndex) && (labeledInstructionIndex <= idx) && (instructionIndex > idx)) {
                                if (operands[0] && (operands[0].indexOf("(") > 0)) {
                                    prevOperandCount++;
                                }
                                if (operands[1] && ((operands[1].indexOf("(") > 0) || (operands[1].indexOf("R") === -1))) {
                                    prevOperandCount++;
                                }
                                if (operands && (operands.indexOf("(") > 0)) {
                                    prevOperandCount++;
                                }
                            }
                            if (item.label === machineCodeInstruction.offset) {
                                let offset = 0;
                                if (instructionIndex < idx) {
                                    offset = idx - instructionIndex - nextOperandCount - 1;
                                } else {
                                    offset = (instructionIndex + prevOperandCount - idx + 1) | $rootScope.OFFSET_SIGN_MASK;
                                }
                                machineCodeInstruction.offset = convertionService.extend(convertionService.convert(offset).from(10).to(2)).to(8);
                                $log.log("The branch offset is", machineCodeInstruction.offset);
                            }
                        });

                        machineCodeInstruction.instruction = machineCodeInstruction.instruction.concat(machineCodeInstruction.offset);
                        machineCodeIntructionSet.push(machineCodeInstruction.instruction);
                        break;
                    case 4:
                        machineCodeInstruction = this.forthClassInstructionParsing(instruction);
                        machineCodeIntructionSet.push(machineCodeInstruction.instruction);
                        break;
                    default:
                        machineCodeInstruction = '0000000000000000';
                }

                $log.log(machineCodeInstruction);
            });
        }
    }
    
    decodificationFactory.$inject = ['$rootScope', '$log', 'instructionService', 'convertionService', 'registerFactory'];
    
    angular.module('app.cpuModule.assemblyModule').factory('decodificationFactory', decodificationFactory);
    
}(window.angular));