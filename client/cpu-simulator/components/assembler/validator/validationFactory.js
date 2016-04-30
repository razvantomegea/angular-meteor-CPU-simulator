/**
 *  @description    This is the validation factory, where the entire validation functionality is implemented
 *  @author         Razvan Tomegea
 */
(function (angular) {
    'use strict';
    /**
     * Use the factory's returning validator to validate the code, using its built-in methods
     * @param $log                  Angular logging service
     * @param instructionService    Contains the instruction definitions
     * @returns                     {{
     *                                highInstructionSet: Array,
     *                                validCode: boolean,
     *                                syntaxError: {error: boolean, line: number},
     *                                invalidInstruction: {error: boolean, line: number},
     *                                verifyCodeSyntax: (function(String)),
     *                                validateCode: (function(String))
     *                              }}
     */
    function validationFactory($log, instructionService) {
        // Regular expresions definitions for the 4 instruction classes
        // Used: https://regex101.com/
        // Match: ".label: INSTRUCTION OPERAND1,OPERAND2;
        const twoOperandClassRegex = /^(\.[a-z0-9]{1,9}:(\s|\t))?([A-Z]{2,4}\s((R[0-9]{1,2})|(\(R[0-9]{1,2}\))|[0-9]{1,4}?(\(R[0-9]{1,2}\))),((R[0-9]{1,2})|(\(R[0-9]{1,2}\))|[0-9]{1,4}?(\(R[0-9]{1,2}\))|((0x)?[0-9A-F]{1,4}?));)$/;
        // Match: ".label: INSTRUCTION OPERAND;
        const oneOperandClassRegexS = /^(\.[a-z0-9]{1,9}:(\s|\t))?([A-Z]{2,4}\s((R[0-9]{1,2})|(\(R[0-9]{1,2}\))|[0-9]{1,4}?(\(R[0-9]{1,2}\)));)$/;
        // Match: ".label: INSTRUCTION .label;
        const branchOperandClassRegex = /^(\.[a-z0-9]{1,9}:(\s|\t))?([A-Z]{2,4}\s(\.([a-z0-9]{1,9}));)$/;
        // Match: ".label: INSTRUCTION;
        const noOperandClassRegex = /^(\.[a-z0-9]{1,9}:(\s|\t))?((([A-Z]{2,4})|((PUSH|POP)\s(PC|FLAG)));)$/;
        // Stores temporary the added instructions for error checking
        let instructionSet = [];
        // Validator that has the validation methods and instruction information
        // to ease the decodification process
        let validator = {
            // Contains information for each instruction
            // It is used to ease the decodification process
            highInstructionSet: [],
            // Valid code flag that tells if the code is ready or not
            // for decodification
            validCode: false,
            // Flag that indicates syntax error presence and
            // the line the syntax error comes from (not implemented yet)
            syntaxError: {
                error: false,
                line: 0
            },
            // Flag that indicates non existent or miss-used instruction
            // and the error line
            invalidInstruction: {
                error: false,
                line: 0
            },
            /**
             * This method verifies the code syntax
             * @param  {String} code - Contains the instructions
             */
            verifyCodeSyntax(code) {
                // Assume the code has errors
                this.validCode = false;
                // Get the instructions
                instructionSet = code.split("\n");
                // Counter for good instruction syntax
                let goodInstructionCount = 0;
                angular.forEach(instructionSet, item => {
                    if (
                        twoOperandClassRegex.test(item)
                        || oneOperandClassRegexS.test(item)
                        || noOperandClassRegex.test(item)
                        || branchOperandClassRegex.test(item)
                    ) {
                        // The instruction has to match to one of the regex patterns
                        goodInstructionCount++;
                    }
                    // If the counter is not equal to the instruction numbers we have a syntax error
                    this.syntaxError.error = goodInstructionCount !== instructionSet.length;
                });
            },
            /**
             * This method validates the code syntax
             * @param  {String} code - Contains the instructions
             */
            validateCode(code) {
                // Get the instructions
                instructionSet = code.split("\n");
                // Used for more than one invalid instruction cases
                let badInstructionCount = 0;
                // Reset any previous validation checks
                this.highInstructionSet = [];

                angular.forEach(instructionSet, item => {
                    // Saves instruction information
                    let currentInstruction = {
                        code: '',
                        class: 0
                    };
                    let classMatch, instructionTokens, opcode, labeledItem;
                    // Class of the current instruction
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
                        // If a labeled instruction is identified,
                        // it is cloned for future branch offset calculation
                        // and its label is removed
                        currentInstruction.label = item.slice(0, item.indexOf(":"));
                        labeledItem = item;
                        item = item.slice(item.indexOf(":") + 2, item.length);
                    }
                    // Separate the operands from the opcode
                    // to verify if the used instruction exists and
                    // if it's used conform its class specification
                    instructionTokens = item.split(" ");
                    opcode = (instructionTokens[0].indexOf(";") === -1)
                        ? instructionTokens[0]
                        : instructionTokens[0].substr(0,instructionTokens[0].length-1);
                    if (
                        !instructionService.instructionSet[opcode]
                        || (instructionService.instructionSet[opcode].class !== classMatch)
                    ) {
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