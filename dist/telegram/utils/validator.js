"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeInput = normalizeInput;
function normalizeInput(input) {
    const map = {
        а: 'A',
        А: 'A',
        в: 'B',
        В: 'B',
        е: 'E',
        Е: 'E',
        к: 'K',
        К: 'K',
        м: 'M',
        М: 'M',
        н: 'H',
        Н: 'H',
        о: 'O',
        О: 'O',
        р: 'P',
        Р: 'P',
        с: 'C',
        С: 'C',
        т: 'T',
        Т: 'T',
        у: 'Y',
        У: 'Y',
        х: 'X',
        Х: 'X',
    };
    return input
        .split('')
        .map((char) => map[char] || char)
        .filter((char) => /[A-Z0-9/-]/i.test(char))
        .join('')
        .toUpperCase()
        .trim();
}
//# sourceMappingURL=validator.js.map