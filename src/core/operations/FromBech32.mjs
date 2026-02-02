/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import { decode } from "../lib/Bech32.mjs";
import { toHex } from "../lib/Hex.mjs";

/**
 * From Bech32 operation
 */
class FromBech32 extends Operation {

    /**
     * FromBech32 constructor
     */
    constructor() {
        super();

        this.name = "Bech32解码";
        this.module = "Default";
        this.description = "Bech32 是一种编码方案，主要应用于比特币隔离见证地址（BIP-0173）。它采用 32 字符字母表，其中排除了易混淆的字符（1、b、i、o），并包含用于错误检测的校验和。<br><br>Bech32m（BIP-0350）是其更新版本，用于比特币 Taproot 地址。<br><br>自动检测功能会先尝试以 Bech32 格式解码，若校验和失败则尝试 Bech32m 格式。<br><br>输出格式选项允许您查看人类可读部分（HRP）及解码后的数据。";
        this.infoURL = "https://wikipedia.org/wiki/Bech32";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "编码方式",
                "type": "option",
                "value": ["自动检测", "Bech32", "Bech32m"]
            },
            {
                "name": "输出格式",
                "type": "option",
                "value": ["原始", "十六进制", "Bitcoin scriptPubKey", "HRP: Hex", "JSON"]
            }
        ];
        this.checks = [
            {
                // Bitcoin mainnet SegWit/Taproot addresses
                pattern: "^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,87}$",
                flags: "i",
                args: ["自动检测", "十六进制"]
            },
            {
                // Bitcoin testnet addresses
                pattern: "^tb1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,87}$",
                flags: "i",
                args: ["自动检测", "十六进制"]
            },
            {
                // AGE public keys
                pattern: "^age1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,87}$",
                flags: "i",
                args: ["自动检测", "HRP: Hex"]
            },
            {
                // AGE secret keys
                pattern: "^AGE-SECRET-KEY-1[QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L]{6,87}$",
                flags: "",
                args: ["自动检测", "HRP: Hex"]
            },
            {
                // Litecoin mainnet addresses
                pattern: "^ltc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,87}$",
                flags: "i",
                args: ["自动检测", "十六进制"]
            },
            {
                // Generic bech32 pattern
                pattern: "^[a-z]{1,83}1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{6,}$",
                flags: "i",
                args: ["自动检测", "十六进制"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const encoding = args[0];
        const outputFormat = args[1];

        input = input.trim();

        if (input.length === 0) {
            return "";
        }

        const decoded = decode(input, encoding);

        // Format output based on selected option
        switch (outputFormat) {
            case "原始":
                return decoded.data.map(b => String.fromCharCode(b)).join("");

            case "十六进制":
                return toHex(decoded.data, "");

            case "Bitcoin scriptPubKey": {
                // Convert to Bitcoin scriptPubKey format as shown in BIP-0173/BIP-0350
                // Format: [OP_version][length][witness_program]
                // OP_0 = 0x00, OP_1-OP_16 = 0x51-0x60
                if (decoded.witnessVersion === null || decoded.data.length < 2) {
                    // Not a SegWit address, fall back to hex
                    return toHex(decoded.data, "");
                }
                const witnessVersion = decoded.data[0];
                const witnessProgram = decoded.data.slice(1);

                // Convert witness version to OP code
                let opCode;
                if (witnessVersion === 0) {
                    opCode = 0x00; // OP_0
                } else if (witnessVersion >= 1 && witnessVersion <= 16) {
                    opCode = 0x50 + witnessVersion; // OP_1 = 0x51, ..., OP_16 = 0x60
                } else {
                    // Invalid witness version, fall back to hex
                    return toHex(decoded.data, "");
                }

                // Build scriptPubKey: [OP_version][length][program]
                const scriptPubKey = [opCode, witnessProgram.length, ...witnessProgram];
                return toHex(scriptPubKey, "");
            }

            case "HRP: Hex":
                return `${decoded.hrp}: ${toHex(decoded.data, "")}`;

            case "JSON":
                return JSON.stringify({
                    hrp: decoded.hrp,
                    encoding: decoded.encoding,
                    data: toHex(decoded.data, "")
                }, null, 2);

            default:
                return toHex(decoded.data, "");
        }
    }

}

export default FromBech32;
