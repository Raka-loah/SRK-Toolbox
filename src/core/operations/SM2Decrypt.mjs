/**
 * @author flakjacket95 [dflack95@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github
 */

import OperationError from "../errors/OperationError.mjs";
import Operation from "../Operation.mjs";

import { SM2 } from "../lib/SM2.mjs";

/**
 * SM2Decrypt operation
 */
class SM2Decrypt extends Operation {

    /**
     * SM2Decrypt constructor
     */
    constructor() {
        super();

        this.name = "SM2解密";
        this.module = "Crypto";
        this.description = "解密使用SM2标准编码的消息。";
        this.infoURL = "https://zh.wikipedia.org/wiki/SM2";
        this.inputType = "string";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                name: "私钥",
                type: "string",
                value: "DEADBEEF"
            },
            {
                "name": "输入格式",
                "type": "option",
                "value": ["C1C3C2", "C1C2C3"],
                "defaultIndex": 0
            },
            {
                name: "曲线",
                type: "option",
                "value": ["sm2p256v1"],
                "defaultIndex": 0
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const [privateKey, inputFormat, curveName] = args;

        if (privateKey.length !== 64) {
            throw new OperationError("输入的私钥必须为32字节长度的十六进制");
        }

        const sm2 = new SM2(curveName, inputFormat);
        sm2.setPrivateKey(privateKey);

        const result = sm2.decrypt(input);
        return result;
    }

}

export default SM2Decrypt;
