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
            let sourceOperandIndex = (indexOfSourceBracket > 0) ? parseInt(source.slice(0, indexOfSourceBracket)) : null;
            // Remove the existing brackets
            let sourceOperand = (indexOfSourceBracket === -1)
                ? source
                : (indexOfSourceBracket === 0)
                ? source.slice(1, -1)
                : source.slice(indexOfSourceBracket + 1, -1);
            // Get the operand/register codification and add the addressing mode codification
            let sourceOperandMachineCode = (sourceOperandIndex)
                ? (0b11 << 4) + registerFactory.generalRegisters[sourceOperand].code
                : (indexOfSourceBracket !== -1)
                ? (0b10 << 4) + registerFactory.generalRegisters[sourceOperand].code
                : (sourceOperand.indexOf('R') !== -1)
                ? (0b01 << 4) + registerFactory.generalRegisters[sourceOperand].code
                : 0;
            // The offset is available only for direct addressing mode
            let offset = (sourceOperand.indexOf('R') === -1) ? parseInt(sourceOperand) : null;
            // Destination operand parsing
            let destination = instructionParts[1].split(",")[0];
            let indexOfDestinationBracket = destination.indexOf("(");
            // Check if the addressing mode is indirect or indexed
            let destinationOperandIndex = (indexOfDestinationBracket > 0) ? parseInt(destination.slice(0, indexOfDestinationBracket)) : null;
            // Remove the existing brackets
            let destinationOperand = (indexOfDestinationBracket === -1)
                ? destination
                : (indexOfDestinationBracket === 0)
                ? destination.slice(1, -1)
                : destination.slice(indexOfDestinationBracket + 1, -1);
            // Get the operand/register codification and add the addressing mode codification
            let destinationOperandMachineCode = (destinationOperandIndex)
                ? (0b11 << 4) + registerFactory.generalRegisters[destinationOperand].code
                : (indexOfDestinationBracket !== -1)
                ? (0b10 << 4) + registerFactory.generalRegisters[destinationOperand].code
                : (0b01 << 4) + registerFactory.generalRegisters[destinationOperand].code;
            let lowInstruction = (opcodeMachineCode << 12) + (sourceOperandMachineCode << 6) + destinationOperandMachineCode;
            $log.debug("Assembled instruction:", firstClassInstruction, lowInstruction.toString(2));
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
            let operandIndex = (indexOfBracket > 0) ? parseInt(source.slice(0, indexOfBracket)) : null;
            // Remove the existing brackets
            let operand = (indexOfBracket === -1)
                ? source
                : (indexOfBracket === 0)
                ? source.slice(1, -1)
                : source.slice(indexOfBracket + 1, -1);
            // Get the operand/register codification and add the addressing mode codification
            let operandMachineCode = (operandIndex)
                ? (0b11 << 4) + registerFactory.generalRegisters[operand].code
                : (indexOfBracket !== -1)
                ? (0b10 << 4) + registerFactory.generalRegisters[operand].code
                : (operand.indexOf('R') !== -1)
                ? (0b01 << 4) + registerFactory.generalRegisters[operand].code
                : 0;
            // The offset is available only for direct addressing mode
            let offset = (operand.indexOf('R') === -1) ? parseInt(operand) : null;
            let lowInstruction = (opcodeMachineCode << 6) + operandMachineCode;
            $log.debug("Assembled instruction:", secondClassInstruction, lowInstruction.toString(2));
            return {
                instruction: lowInstruction,
                sourceIndex: null,
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
            let lowInstruction = instructionService.instructionSet[opcodeMnemonic].code;
            // Offset
            let offset = thirdClassInstruction.split(" ")[1];
            $log.debug("Assembled instruction:", thirdClassInstruction, lowInstruction.toString(2));
            return {
                instruction: lowInstruction,
                sourceIndex: null,
                destinationIndex: null,
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
            let forthClassInstruction = instruction.code.slice(0, -1);
            // Opcode parsing
            let lowInstruction = instructionService.instructionSet[forthClassInstruction].code;
            $log.debug("Assembled instruction:", forthClassInstruction, lowInstruction.toString(2));
            return {
                instruction: lowInstruction,
                sourceIndex: null,
                destinationIndex: null,
                offset: null
            };
        }

        /**
         * Use this method to decode the validated instruction set
         * @param highInstructionSet        The instructions to be decoded
         * @param lowInstructionSet The array that will contain the decoded instructions
         */
        function instructionDecodification(highInstructionSet) {
            let instructionCounter = 0,
                lowInstructionSet = [];
                    angular.forEach(highInstructionSet, (highInstruction, highInstructionIndex) => {
                let lowInstruction = '';
                switch (highInstruction.class) {
                    case 1:
                        lowInstruction = this.firstClassInstructionParsing(highInstruction);
                        // Split from 16 bit to 8 bit high part and low part
                        lowInstructionSet.push(
                            (lowInstruction.instruction & dataHelpService.HIGH16_PART_MASK) >> 8,
                            (lowInstruction.instruction & dataHelpService.LOW16_PART_MASK)
                        );
                        instructionCounter += 2;
                        if (lowInstruction.offset) {
                            lowInstructionSet.push(
                                (lowInstruction.offset & dataHelpService.HIGH16_PART_MASK) >> 8,
                                (lowInstruction.offset & dataHelpService.LOW16_PART_MASK)
                            );
                            instructionCounter += 2;
                        }
                        if (lowInstruction.sourceIndex) {
                            lowInstructionSet.push(
                                (lowInstruction.sourceIndex & dataHelpService.HIGH16_PART_MASK) >> 8,
                                (lowInstruction.sourceIndex & dataHelpService.LOW16_PART_MASK)
                            );
                            instructionCounter += 2;
                        }
                        if (lowInstruction.destinationIndex) {
                            lowInstructionSet.push(
                                (lowInstruction.destinationIndex & dataHelpService.HIGH16_PART_MASK) >> 8,
                                (lowInstruction.destinationIndex & dataHelpService.LOW16_PART_MASK)
                            );
                            instructionCounter += 2;
                        }
                        break;
                    case 2:
                        lowInstruction = this.secondClassInstructionParsing(highInstruction);
                        // Split from 16 bit to 8 bit high part and low part
                        lowInstructionSet.push(
                            (lowInstruction.instruction & dataHelpService.HIGH16_PART_MASK) >> 8,
                            (lowInstruction.instruction & dataHelpService.LOW16_PART_MASK)
                        );
                        instructionCounter += 2;
                        if (lowInstruction.offset) {
                            lowInstructionSet.push(
                                (lowInstruction.offset & dataHelpService.HIGH16_PART_MASK) >> 8,
                                (lowInstruction.offset & dataHelpService.LOW16_PART_MASK)
                            );
                            instructionCounter += 2;
                        }
                        if (lowInstruction.destinationIndex) {
                            lowInstructionSet.push(
                                (lowInstruction.destinationIndex & dataHelpService.HIGH16_PART_MASK) >> 8,
                                (lowInstruction.destinationIndex & dataHelpService.LOW16_PART_MASK)
                            );
                            instructionCounter += 2;
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

                            lowInstruction.offset = offset;
                        });
                        lowInstruction.instruction = (lowInstruction.instruction << 8) + lowInstruction.offset;
                        // Split from 16 bit to 8 bit high part and low part
                        lowInstructionSet.push(
                            (lowInstruction.instruction & dataHelpService.HIGH16_PART_MASK) >> 8,
                            (lowInstruction.instruction & dataHelpService.LOW16_PART_MASK)
                        );
                        instructionCounter += 2;
                        break;
                    case 4:
                        lowInstruction = this.forthClassInstructionParsing(highInstruction);
                        // Split from 16 bit to 8 bit high part and low part
                        lowInstructionSet.push(
                            (lowInstruction.instruction & dataHelpService.HIGH16_PART_MASK) >> 8,
                            (lowInstruction.instruction & dataHelpService.LOW16_PART_MASK)
                        );
                        instructionCounter += 2;
                        break;
                    default:
                        lowInstruction = 0;
                }
            });
            return {
                lowInstructionSet,
                instructionCounter
            };
        }
    }

    decodificationFactory.$inject = ['$rootScope', '$log', 'instructionService', 'dataHelpService', 'registerFactory'];

    angular.module('app.cpuModule.assemblyModule').factory('decodificationFactory', decodificationFactory);

}(window.angular));