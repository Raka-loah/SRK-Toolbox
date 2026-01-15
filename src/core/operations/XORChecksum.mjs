/**
 * @author Thomas Weißschuh [thomas@t-8ch.de]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { toHex } from "../lib/Hex.mjs";

/**
 * XOR Checksum operation
 */
class XORChecksum extends Operation {

    /**
     * XORChecksum constructor
     */
    constructor() {
        super();

        this.name = "XOR校验和";
        this.module = "Crypto";
        this.description = "异或校验和将输入数据按可配置大小的块进行分割，并对这些数据块执行异或运算以生成校验值。";
        this.infoURL = "https://wikipedia.org/wiki/XOR";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "块大小",
                type: "number",
                value: 4
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const blocksize = args[0];
        input = new Uint8Array(input);

        const res = Array(blocksize);
        res.fill(0);

        for (const chunk of Utils.chunked(input, blocksize)) {
            for (let i = 0; i < blocksize; i++) {
                res[i] ^= chunk[i];
            }
        }

        return toHex(res, "");
    }
}

export default XORChecksum;
