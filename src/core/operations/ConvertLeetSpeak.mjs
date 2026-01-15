/**
 * @author bartblaze []
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";

/**
 * Convert Leet Speak operation
 */
class ConvertLeetSpeak extends Operation {
    /**
     * ConvertLeetSpeak constructor
     */
    constructor() {
        super();

        this.name = "Leet Speak转换";
        this.module = "Default";
        this.description = "把英文内容转换为Leet Speak或者从Leet Speak恢复成原内容。（例：leet <=> 1337）";
        this.infoURL = "https://wikipedia.org/wiki/Leet";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "操作",
                type: "option",
                value: ["Leet Speak编码", "Leet Speak解码"],
                defaultIndex: 0
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const direction = args[0];

        if (direction === "Leet Speak编码") {
            return input.replace(/[a-z]/gi, char => {
                const leetChar = toLeetMap[char.toLowerCase()] || char;
                return char === char.toUpperCase() ? leetChar.toUpperCase() : leetChar;
            });
        } else if (direction === "Leet Speak解码") {
            return input.replace(/[48cd3f6h1jklmn0pqr57uvwxyz]/gi, char => {
                const normalChar = fromLeetMap[char] || char;
                return normalChar;
            });
        }
    }
}

const toLeetMap = {
    "a": "4",
    "b": "b",
    "c": "c",
    "d": "d",
    "e": "3",
    "f": "f",
    "g": "g",
    "h": "h",
    "i": "1",
    "j": "j",
    "k": "k",
    "l": "l",
    "m": "m",
    "n": "n",
    "o": "0",
    "p": "p",
    "q": "q",
    "r": "r",
    "s": "5",
    "t": "7",
    "u": "u",
    "v": "v",
    "w": "w",
    "x": "x",
    "y": "y",
    "z": "z"
};

const fromLeetMap = {
    "4": "a",
    "b": "b",
    "c": "c",
    "d": "d",
    "3": "e",
    "f": "f",
    "g": "g",
    "h": "h",
    "1": "i",
    "j": "j",
    "k": "k",
    "l": "l",
    "m": "m",
    "n": "n",
    "0": "o",
    "p": "p",
    "q": "q",
    "r": "r",
    "5": "s",
    "7": "t",
    "u": "u",
    "v": "v",
    "w": "w",
    "x": "x",
    "y": "y",
    "z": "z"
};

export default ConvertLeetSpeak;

