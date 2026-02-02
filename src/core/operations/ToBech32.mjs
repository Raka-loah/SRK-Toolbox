/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import { encode } from "../lib/Bech32.mjs";
import { fromHex } from "../lib/Hex.mjs";

/**
 * To Bech32 operation
 */
class ToBech32 extends Operation {

    /**
     * ToBech32 constructor
     */
    constructor() {
        super();

        this.name = "Bech32编码";
        this.module = "Default";
        this.description = "Bech32 是一种编码方案，主要应用于比特币隔离见证地址（BIP-0173）。它采用 32 字符字母表，其中排除了易混淆的字符（1、b、i、o），并包含用于错误检测的校验和。<br><br>Bech32m（BIP-0350）是其更新版本，用于比特币 Taproot 地址。<br><br>自动检测功能会先尝试以 Bech32 格式解码，若校验和失败则尝试 Bech32m 格式。<br><br>输出格式选项允许您查看人类可读部分（HRP）及解码后的数据。";
        this.infoURL = "https://wikipedia.org/wiki/Bech32";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "人类可读部分（HRP）",
                "type": "string",
                "value": "bc"
            },
            {
                "name": "编码方式",
                "type": "option",
                "value": ["Bech32", "Bech32m"]
            },
            {
                "name": "输入格式",
                "type": "option",
                "value": ["原始字节", "十六进制"]
            },
            {
                "name": "模式",
                "type": "option",
                "value": ["通用", "Bitcoin SegWit"]
            },
            {
                "name": "见证版本（Witness Version）",
                "type": "number",
                "value": 0,
                "hint": "SegWit 隔离见证版本 (0-16)。只用于比特币隔离见证（Bitcoin SegWit）模式。"
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const hrp = args[0];
        const encoding = args[1];
        const inputFormat = args[2];
        const mode = args[3];
        const witnessVersion = args[4];

        let inputArray;
        if (inputFormat === "十六进制") {
            // Convert hex string to bytes
            const hexStr = new TextDecoder().decode(new Uint8Array(input)).replace(/\s/g, "");
            inputArray = fromHex(hexStr);
        } else {
            inputArray = new Uint8Array(input);
        }

        if (mode === "Bitcoin SegWit") {
            // Prepend witness version to the input data
            const withVersion = new Uint8Array(inputArray.length + 1);
            withVersion[0] = witnessVersion;
            withVersion.set(inputArray, 1);
            return encode(hrp, withVersion, encoding, true);
        }

        return encode(hrp, inputArray, encoding, false);
    }

}

export default ToBech32;
