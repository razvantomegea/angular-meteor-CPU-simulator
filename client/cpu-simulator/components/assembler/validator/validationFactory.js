/*
 *  This is the validation factory, where the entire validation functionality is implemented
 */
(function (angular) {

    'use strict';
    /**
     * Use the factory returning object to validate the code
     * using built-in methods
     * @param  {object} $log               Angular console logging service
     * @param  {object} instructionService Use this service to get the instruction definitions
     * @return {object}                    Returns the validator with the validation built-in methods
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
        
        // Array that will contain the inserted instructions
        // This array is used for validation and syntax verification purposes
        let instructionSet = [];

        // The validator object implementation 
        let validator = {

            // Array of objects that contain information for each instruction
            // It is used to ease the decodification process
            highInstructionSet: [],

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

            // This method verifies that code syntax
            verifyCodeSyntax(code) {

                // Assume the code is invalid
                this.validCode = false;

                // Counter for good instruction syntax
                let goodInstructionCount = 0;

                // Get the instructions
                instructionSet = code.split("\n");
                
                angular.forEach(instructionSet, item => {
                    if (twoOperandClassRegex.test(item) || oneOperandClassRegexS.test(item) || noOperandClassRegex.test(item) || branchOperandClassRegex.test(item)) {
                        
                        // If the current iterated instruction is valid
                        // inctement the counter
                        goodInstructionCount++;
                    }

                    // If the counter is not equal to the number of instructions
                    // there is a syntax error
                    this.syntaxError.error = (goodInstructionCount !== instructionSet.length);
                });
            },

            // This method validates the code
            validateCode(code) {

                // Counter for invalid instructions
                let badInstructionCount = 0;

                // Clear the current instructionset
                this.highInstructionSet = [];

                angular.forEach(instructionSet, item => {
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
                    this.highInstructionSet.push(currentInstruction);
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