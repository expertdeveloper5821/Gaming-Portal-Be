"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printError = exports.printSuccess = void 0;
function printSuccess(message) {
    console.log('\x1b[32m%s\x1b[0m', message); // Green color
}
exports.printSuccess = printSuccess;
function printError(message) {
    console.log('\x1b[31m%s\x1b[0m', message); // Red color
}
exports.printError = printError;
