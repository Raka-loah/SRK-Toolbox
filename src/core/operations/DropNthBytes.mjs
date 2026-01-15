/**
 * @author Oshawk [oshawk@protonmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Drop nth bytes operation
 */
class DropNthBytes extends Operation {

    /**
     * DropNthBytes constructor
     */
    constructor() {
        super();

        this.name = "删除每N个字节";
        this.module = "Default";
        this.description = "删除字符串的每N个字节。";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "删除每N个字节",
                type: "number",
                value: 4
            },
            {
                name: "起始位置",
                type: "number",
                value: 0
            },
            {
                name: "应用到每一行",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const n = args[0];
        const start = args[1];
        const eachLine = args[2];

        if (parseInt(n, 10) !== n || n <= 0) {
            throw new OperationError("'删除每N个字节'必须为正整数");
        }
        if (parseInt(start, 10) !== start || start < 0) {
            throw new OperationError("'起始位置'必须为非负整数");
        }

        let offset = 0;
        const output = [];
        for (let i = 0; i < input.length; i++) {
            if (eachLine && input[i] === 0x0a) {
                output.push(0x0a);
                offset = i + 1;
            } else if (i - offset < start || (i - (start + offset)) % n !== 0) {
                output.push(input[i]);
            }
        }

        return output;
    }

}

export default DropNthBytes;
