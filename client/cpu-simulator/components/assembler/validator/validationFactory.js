/*
 *  This is the validation factory, where the entire validation functionality is implemented
 */
(function (angular) {
    'use strict';
    /**
     * Use the factory returning object to validate the code
     * using built-in methods
     * @param  {Object} $log               - Angular console logging service
     * @param  {Object} instructionService - Use this service to get the instruction definitions
     * @return {Object}                    - Returns the validator with the validation built-in methods
     */
    function validationFactory($log, instructionService) {
        // Regular expresions definitions for the 4 instruction classes
        // Match: ".label: INSTRUCTION OPERAND1,OPERAND2;
        const twoOperandClassRegex = /^(\.[a-z0-9]{1,9}:(\s|\t))?([A-Z]{2,4}\s((R[0-9]{1,2})|(\(R[0-9]{1,2}\))|[0-9]{1,4}?(\(R[0-9]{1,2}\))),((R[0-9]{1,2})|(\(R[0-9]{1,2}\))|[0-9]{1,4}?(\(R[0-9]{1,2}\))|((0x)?[0-9A-F]{1,4}?));)$/;
        // Match: ".label: INSTRUCTION OPERAND;
        const oneOperandClassRegexS = /^(\.[a-z0-9]{1,9}:(\s|\t))?([A-Z]{2,4}\s((R[0-9]{1,2})|(\(R[0-9]{1,2}\))|[0-9]{1,4}?(\(R[0-9]{1,2}\)));)$/;
        // Match: ".label: INSTRUCTION .label;
        const branchOperandClassRegex = /^(\.[a-z0-9]{1,9}:(\s|\t))?([A-Z]{2,4}\s(\.([a-z0-9]{1,9}));)$/;
        // Match: ".label: INSTRUCTION;
        const noOperandClassRegex = /^(\.[a-z0-9]{1,9}:(\s|\t))?((([A-Z]{2,4})|((PUSH|POP)\s(PC|FLAG)));)$/;
        // The validator object implementation
        let validator = {
            // Array of objects that contain information for each instruction
            // It is used to ease the decodification process
            highMacroInstructionSet: [],
            // Valid code flag that enables the assembly and execution
            validCode: false,
            // Syntax error flag that saves the line of the error
            // Indicates the line the syntax error comes from (not implemented yet)
            syntaxError: {
                error: false,
                line: 0
            },
            // Invalid instruction flag
            // Indicates the invalid instruction line, as well
            invalidInstruction: {
                error: false,
                line: 0
            },
            /**
             * This method verifies the code syntax
             * @param  {String} code - The code containing the instructions
             */
            verifyCodeSyntax(code) {
                // Assume the code is invalid
                this.validCode = false;
                // Get the instructions
                let instructionSet = code.split("\n");
                // Counter for good instruction syntax
                let goodInstructionCount = 0;
                angular.forEach(instructionSet, (item) => {
                    if (twoOperandClassRegex.test(item) || oneOperandClassRegexS.test(item) || noOperandClassRegex.test(item) || branchOperandClassRegex.test(item)) {
                        // The instruction has to match to one of the regex patterns
                        goodInstructionCount++;
                    }
                    // If the counter is not equal to the instruction numbers we have a syntax error
                    this.syntaxError.error = (goodInstructionCount !== instructionSet.length);
                });
            },
            /**
             * This method validates the code syntax
             * @param  {String} code - The code containing the instructions
             */
            validateCode(code) {
                let instructionSet = code.split("\n");
                let badInstructionCount = 0;
                this.highMacroInstructionSet = [];
                angular.forEach(instructionSet, (item) => {
                    let currentInstruction = {
                        code: '',
                        class: 0
                    };

                    let classMatch, instructionTokens, opcode, labeledItem;
                    classMatch = twoOperandClassRegex.test(item)
                        ? 1
                        : oneOperandClassRegexS.test(item)
                        ? 2
                        : branchOperandClassRegex.test(item)
                        ? 3
                        : noOperandClassRegex.test(item)
                        ? 4
                        : null;
                    if (item.indexOf(":") !== -1) {
                        currentInstruction.label = item.slice(0, item.indexOf(":"));
                        labeledItem = item;
                        item = item.slice(item.indexOf(":") + 2, item.length);
                    }
                    instructionTokens = item.split(" ");
                    opcode = (instructionTokens[0].indexOf(";") === -1) ? instructionTokens[0] : instructionTokens[0].substr(0,instructionTokens[0].length-1);
                    if ((instructionService.instructionSet[opcode] === undefined) || (instructionService.instructionSet[opcode].class !== classMatch)) {
                        this.invalidInstruction.error = true;
                        this.invalidInstruction.line = instructionSet.indexOf(labeledItem) + 1;
                        badInstructionCount++;
                        $log.error("Invalid instruction at line", this.invalidInstruction.line);
                        return;
                    }
                    currentInstruction.code = item;
                    currentInstruction.class = classMatch;
                    this.highMacroInstructionSet.push(currentInstruction);
                    this.invalidInstruction.error = (badInstructionCount !== 0);
                });

                this.validCode = !this.invalidInstruction.error;
            }
        };
        return validator;
    }

    validationFactory.$inject = ['$log', 'instructionService'];
    angular.module('app.cpuModule.assemblyModule').factory('validationFactory', validationFactory);

}(window.angular));