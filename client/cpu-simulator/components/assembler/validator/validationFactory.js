/**
 * Created by razva on 4/10/2016.
 */
(function (angular) {

    'use strict';
    function validationFactory($log, instructionService) {
        const twoOperandClassRegex = /^(\.[a-z0-9]{1,9}:(\s|\t))?([A-Z]{2,4}\s((R[0-9]{1,2})|(\(R[0-9]{1,2}\))|[0-9]{1,4}?(\(R[0-9]{1,2}\))),((R[0-9]{1,2})|(\(R[0-9]{1,2}\))|[0-9]{1,4}?(\(R[0-9]{1,2}\))|((0x)?[0-9A-F]{1,4}?));)$/;
        const oneOperandClassRegexS = /^(\.[a-z0-9]{1,9}:(\s|\t))?([A-Z]{2,4}\s((R[0-9]{1,2})|(\(R[0-9]{1,2}\))|[0-9]{1,4}?(\(R[0-9]{1,2}\)));)$/;
        const branchOperandClassRegex = /^(\.[a-z0-9]{1,9}:(\s|\t))?([A-Z]{2,4}\s(\.([a-z0-9]{1,9}));)$/;
        const noOperandClassRegex = /^(\.[a-z0-9]{1,9}:(\s|\t))?((([A-Z]{2,4})|((PUSH|POP)\s(PC|FLAG)));)$/;
        
        let validator = {
            highMacroInstructionSet: [],
            validCode: false,
            syntaxError: {
                error: false,
                line: 0
            },
            invalidInstruction: {
                error: false,
                line: 0
            },
            verifyCodeSyntax(code) {
                this.validCode = false;
                let instructionSet = code.split("\n");
                let goodInstructionCount = 0;
                angular.forEach(instructionSet, (item) => {
                    if ((twoOperandClassRegex.test(item) === true) || (oneOperandClassRegexS.test(item) === true) || (noOperandClassRegex.test(item) === true) || (branchOperandClassRegex.test(item) === true)) {
                        goodInstructionCount++;
                    }
                    this.syntaxError.error = (goodInstructionCount !== instructionSet.length);
                });
            },
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