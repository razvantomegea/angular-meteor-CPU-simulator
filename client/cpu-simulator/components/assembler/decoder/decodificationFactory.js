/**
 *  @description    This is the decodification factory, where the entire decodification functionality is implemented
 *  @author         Razvan Tomegea
 */
(function (angular) {
    'use strict';
    /**
     * Use the factory's returning methods to decode the instructions
     * @param $rootScope            Angular global scope service
     * @param $log                  Angular logging service
     * @param instructionService    Contains the instruction definitions
     * @param convertionService     Contains the number convertion implementations
     * @param registerFactory       Contains the register definitions
     * @returns                     {{
     *                                firstClassInstructionParsing: firstClassInstructionParsing,
     *                                secondClassInstructionParsing: secondClassInstructionParsing,
     *                                thirdClassInstructionParsing: thirdClassInstructionParsing,
     *                                forthClassInstructionParsing: forthClassInstructionParsing,
     *                                instructionDecodification: instructionDecodification
     *                              }}
     */
    function decodificationFactory($rootScope, $log, instructionService, dataHelpService, registerFactory) {
        return {
            firstClassInstructionParsing,
            secondClassInstructionParsing,
            thirdClassInstructionParsing,
            forthClassInstructionParsing,
            instructionDecodification
        };

        /**
         * Use this method to decode an instruction with two operands
         * @param instruction
         * @returns {{instruction, sourceIndex, destinationIndex, offset}}
         */
        function firstClassInstructionParsing(instruction) {
            // Remove the semicolon
            let firstClassInstruction = instruction.code.slice(0, -1);
            // Separate the opcode from the operands
            let instructionParts = firstClassInstruction.split(" ");
            // Opcode parsing
            let opcodeMnemonic = instructionParts[0];
            let opcodeMachineCode = instructionService.instructionSet[opcodeMnemonic].code;
            // Source operand parsing
            let source = instructionParts[1].split(",")[1];
            let indexOfSourceBracket = source.indexOf("(");
            // Check if the addressing mode is indirect or indexed
            let sourceOperandIndex = (indexOfSourceBracket > 0) ? source.slice(0, indexOfSourceBracket) : false;
            if (sourceOperandIndex) {
                // Convert the index to binary and extend it to 16 bits
                sourceOperandIndex = dataHelpService.extend(dataHelpService.convert(sourceOperandIndex).from(10).to(2)).to(16);
            }
            // Remove the existing brackets
            let sourceOperand = (indexOfSourceBracket === -1)
                ? source
                : (indexOfSourceBracket === 0)
                ? source.slice(1, -1)
                : source.slice(indexOfSourceBracket + 1, -1);
            // Get the operand/register codification and add the addressing mode codification
            let sourceOperandMachineCode = (sourceOperandIndex)
                ? '11' + registerFactory.generalRegisters[sourceOperand].code
                : (indexOfSourceBracket !== -1)
                ? '10' + registerFactory.generalRegisters[sourceOperand].code
                : (sourceOperand.indexOf('R') !== -1)
                ? '01' + registerFactory.generalRegisters[sourceOperand].code
                : '000000';
            // The offset is available only for direct addressing mode
            let offset = (sourceOperand.indexOf('R') === -1) ? sourceOperand : false;
            if (offset) {
                // Convert the offset to binary and extend it to 16 bits
                if (offset.indexOf("0x") !== -1) {
                    offset = dataHelpService.extend(dataHelpService.convert(offset).from(16).to(2)).to(16);
                } else {
                    offset = dataHelpService.extend(dataHelpService.convert(offset).from(10).to(2)).to(16);
                }
            }
            // Destination operand parsing
            let destination = instructionParts[1].split(",")[0];
            let indexOfDestinationBracket = destination.indexOf("(");
            // Check if the addressing mode is indirect or indexed
            let destinationOperandIndex = (indexOfDestinationBracket > 0) ? destination.slice(0, indexOfDestinationBracket) : false;
            if (destinationOperandIndex) {
                // Convert the index to binary and extend it to 16 bits
                destinationOperandIndex = dataHelpService.extend(dataHelpService.convert(destinationOperandIndex).from(10).to(2)).to(16);
            }
            // Remove the existing brackets
            let destinationOperand = (indexOfDestinationBracket === -1)
                ? destination
                : (indexOfDestinationBracket === 0)
                ? destination.slice(1, -1)
                : destination.slice(indexOfDestinationBracket + 1, -1);
            // Get the operand/register codification and add the addressing mode codification
            let destinationOperandMachineCode = (destinationOperandIndex)
                ? '11' + registerFactory.generalRegisters[destinationOperand].code
                : (indexOfDestinationBracket !== -1)
                ? '10' + registerFactory.generalRegisters[destinationOperand].code
                : '01' + registerFactory.generalRegisters[destinationOperand].code;
            let lowInstruction = opcodeMachineCode.concat(sourceOperandMachineCode, destinationOperandMachineCode);
            return {
                instruction: lowInstruction,
                sourceIndex: sourceOperandIndex,
                destinationIndex: destinationOperandIndex,
                offset: offset
            };
        }

        /**
         * Use this method to decode an instruction with one operand
         * @param instruction
         * @returns {{instruction, sourceIndex, destinationIndex, offset}}
         */
        function secondClassInstructionParsing(instruction) {
            // Remove the semicolon
            let secondClassInstruction = instruction.code.slice(0, -1);
            // Separate the opcode from the operands
            let instructionParts = secondClassInstruction.split(" ");
            // Opcode parsing
            let opcodeMnemonic = instructionParts[0];
            let opcodeMachineCode = instructionService.instructionSet[opcodeMnemonic].code;
            // Operand parsing
            let source = secondClassInstruction.split(" ")[1];
            let indexOfBracket = source.indexOf("(");
            // Check if the addressing mode is indirect or indexed
            let operandIndex = (indexOfBracket > 0) ? source.slice(0, indexOfBracket) : false;
            if (operandIndex) {
                // Convert the index to binary and extend it to 16 bits
                operandIndex = dataHelpService.extend(dataHelpService.convert(operandIndex).from(10).to(2)).to(16);
            }
            // Remove the existing brackets
            let operand = (indexOfBracket === -1)
                ? source
                : (indexOfBracket === 0)
                ? source.slice(1, -1)
                : source.slice(indexOfBracket + 1, -1);
            // Get the operand/register codification and add the addressing mode codification
            let operandMachineCode = (operandIndex)
                ? '11' + registerFactory.generalRegisters[operand].code
                : (indexOfBracket !== -1)
                ? '10' + registerFactory.generalRegisters[operand].code
                : (operand.indexOf('R') !== -1)
                ? '01' + registerFactory.generalRegisters[operand].code
                : '000000';
            // The offset is available only for direct addressing mode
            let offset = (operand.indexOf('R') === -1) ? operand : false;
            if (offset) {
                // Convert the offset to binary and extend it to 16 bits
                if (offset.indexOf("0x") !== -1) {
                    offset = dataHelpService.extend(dataHelpService.convert(offset).from(16).to(2)).to(16);
                } else {
                    offset = dataHelpService.extend(dataHelpService.convert(offset).from(10).to(2)).to(16);
                }
            }
            let lowInstruction = opcodeMachineCode.concat(operandMachineCode);
            return {
                instruction: lowInstruction,
                sourceIndex: false,
                destinationIndex: operandIndex,
                offset: offset
            };
        }

        /**
         * Use this method to decode a branch instruction
         * @param instruction
         * @returns {{instruction, sourceIndex, destinationIndex, offset}}
         */
        function thirdClassInstructionParsing(instruction) {
            // Remove the semicolon
            let thirdClassInstruction = instruction.code.slice(0, -1);
            // Separate the opcode from the label
            let instructionParts = thirdClassInstruction.split(" ");
            // Opcode parsing
            let opcodeMnemonic = instructionParts[0];
            let opcodeMachineCode = instructionService.instructionSet[opcodeMnemonic].code;
            // Offset
            let offset = thirdClassInstruction.split(" ")[1];
            return {
                instruction: opcodeMachineCode,
                sourceIndex: false,
                destinationIndex: false,
                offset: offset
            };
        }

        /**
         * Use this method to decode no operand instructions
         * @param instruction
         * @returns {{instruction, sourceIndex, destinationIndex, offset}}
         */
        function forthClassInstructionParsing(instruction) {
            // Remove the semicolon
            let opcodeMnemonic = instruction.code.slice(0, -1);
            // Opcode parsing
            let lowInstruction = instructionService.instructionSet[opcodeMnemonic].code;
            return {
                instruction: lowInstruction,
                sourceIndex: false,
                destinationIndex: false,
                offset: false
            };
        }

        /**
         * Use this method to decode the validated instruction set
         * @param highInstructionSet        The instructions to be decoded
         * @param lowInstructionSet The array that will contain the decoded instructions
         */
        function instructionDecodification(highInstructionSet, lowInstructionSet) {
            angular.forEach(highInstructionSet, (highInstruction, highInstructionIndex) => {
                let lowInstruction = '';
                switch (highInstruction.class) {
                    case 1:
                        lowInstruction = this.firstClassInstructionParsing(highInstruction);
                        // Split from 16 bit to 8 bit high part and low part
                        lowInstructionSet.push(lowInstruction.instruction.slice(0, 8), lowInstruction.instruction.slice(8, 16));
                        if (lowInstruction.offset) {
                            lowInstructionSet.push(lowInstruction.offset.slice(0, 8), lowInstruction.offset.slice(8, 16));
                        }
                        if (lowInstruction.sourceIndex) {
                            lowInstructionSet.push(lowInstruction.sourceIndex.slice(0, 8), lowInstruction.sourceIndex.slice(8, 16));
                        }
                        if (lowInstruction.destinationIndex) {
                            lowInstructionSet.push(lowInstruction.destinationIndex.slice(0, 8), lowInstruction.destinationIndex.slice(8, 16));
                        }
                        break;
                    case 2:
                        lowInstruction = this.secondClassInstructionParsing(highInstruction);
                        // Split from 16 bit to 8 bit high part and low part
                        lowInstructionSet.push(lowInstruction.instruction.slice(0, 8), lowInstruction.instruction.slice(8, 16));
                        if (lowInstruction.offset) {
                            lowInstructionSet.push(lowInstruction.offset.slice(0, 8), lowInstruction.offset.slice(8, 16));
                        }
                        if (lowInstruction.destinationIndex) {
                            lowInstructionSet.push(lowInstruction.destinationIndex.slice(0, 8), lowInstruction.destinationIndex.slice(8, 16));
                        }
                        break;
                    case 3:
                        lowInstruction = this.thirdClassInstructionParsing(highInstruction);
                        // Get the index of the labeled instruction
                        let labeledInstruction = highInstructionSet.filter(item => item.label === lowInstruction.offset);
                        let labeledInstructionIndex = highInstructionSet.indexOf(labeledInstruction[0]);
                        // Count the operands between the labeled instruction and the branch instruction
                        // Immediate operands and indexes are stored in the memory immediately after the instruction,
                        // so they must be counted in order to calculate the offset of the relative jump
                        // Note: The memory is on 8 bits, so the count has to be doubled
                        // and PC always indicates the next instruction, so we have to take this into count
                        let nextOperandCount = 0,
                            prevOperandCount = 0,
                            offset = 0,
                            jump = 0,
                            forwardJump = false,
                            backwardsJump = false;

                        angular.forEach(highInstructionSet, (brLblInstruction, brLblInstructionIndex) => {
                            // Iterate the instructions between the branch instruction and the labeled instruction
                            let operands = [];
                            // The operands and instructions are on 8 bits now, so we have to increment by two
                            // We must be between the branch instruction and the labeled instruction
                            if (
                                (highInstructionIndex < labeledInstructionIndex)
                                && (brLblInstructionIndex > highInstructionIndex)
                                && (brLblInstructionIndex < labeledInstructionIndex)
                            ) {
                                forwardJump = true;
                                if (brLblInstruction.class === 1) {
                                    // Separate the two operands
                                    operands = brLblInstruction.code.split(" ")[1].split(",");
                                    if (operands[0].indexOf("(") > 0) {
                                        // Indexed addressing mode
                                        nextOperandCount += 2;
                                    } else if ((operands[1].indexOf("(") > 0) || (/R/.test(operands[1]) === false)) {
                                        // Indexed or immediate addressing mode
                                        nextOperandCount += 2;
                                    }
                                }
                                if (brLblInstruction.class === 2) {
                                    operands = brLblInstruction.code.split(" ")[1];
                                    if (operands && (operands.indexOf("(") > 0)) {
                                        // Indexed addressing mode
                                        nextOperandCount += 2;
                                    }
                                }
                            } else if (forwardJump) {
                                jump = 2 * (labeledInstructionIndex - highInstructionIndex);
                                // Make offset even and take PC into count
                                offset = jump + nextOperandCount - 2;
                            } else if (
                                (highInstructionIndex > labeledInstructionIndex)
                                && (brLblInstructionIndex < highInstructionIndex)
                                && ((brLblInstructionIndex > labeledInstructionIndex) || (brLblInstructionIndex === labeledInstructionIndex))
                            ) {
                                backwardsJump = true;
                                if (brLblInstruction.class === 1) {
                                    // Separate the two operands
                                    operands = brLblInstruction.code.split(" ")[1].split(",");
                                    if (operands[0].indexOf("(") > 0) {
                                        // Indexed addressing mode
                                        prevOperandCount += 2;
                                    } else if ((operands[1].indexOf("(") > 0) || (/R/.test(operands[1]) === false)) {
                                        // Indexed or immediate addressing mode
                                        prevOperandCount += 2;
                                    }
                                } else if (brLblInstruction.class === 2) {
                                    operands = brLblInstruction.code.split(" ")[1];
                                    if (operands && (operands.indexOf("(") > 0)) {
                                        // Indexed addressing mode
                                        prevOperandCount += 2;
                                    }
                                }
                            } else if (backwardsJump) {
                                jump = 2 * (highInstructionIndex - labeledInstructionIndex);
                                // Take PC into count
                                offset = (jump + prevOperandCount + 2) | dataHelpService.OFFSET_SIGN_MASK;
                            }

                            lowInstruction.offset = dataHelpService.extend(dataHelpService.convert(offset).from(10).to(2)).to(8);
                        });
                        lowInstruction.instruction = lowInstruction.instruction.concat(lowInstruction.offset);
                        // Split from 16 bit to 8 bit high part and low part
                        lowInstructionSet.push(lowInstruction.instruction.slice(0, 8), lowInstruction.instruction.slice(8, 16));
                        break;
                    case 4:
                        lowInstruction = this.forthClassInstructionParsing(highInstruction);
                        // Split from 16 bit to 8 bit high part and low part
                        lowInstructionSet.push(lowInstruction.instruction.slice(0, 8), lowInstruction.instruction.slice(8, 16));
                        break;
                    default:
                        lowInstruction = '0000000000000000';
                }
            });
        }
    }

    decodificationFactory.$inject = ['$rootScope', '$log', 'instructionService', 'dataHelpService', 'registerFactory'];

    angular.module('app.cpuModule.assemblyModule').factory('decodificationFactory', decodificationFactory);

}(window.angular));