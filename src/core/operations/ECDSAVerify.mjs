/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { fromBase64 } from "../lib/Base64.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import r from "jsrsasign";
import Utils from "../Utils.mjs";

/**
 * ECDSA Verify operation
 */
class ECDSAVerify extends Operation {

    /**
     * ECDSAVerify constructor
     */
    constructor() {
        super();

        this.name = "ECDSA验证";
        this.module = "Ciphers";
        this.description = "使用PEM编码的EC公钥和签名验证信息。";
        this.infoURL = "https://wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "输入格式",
                type: "option",
                value: [
                    "自动检测",
                    "ASN.1十六进制",
                    "P1363十六进制",
                    "JSON Web签名（JWS）",
                    "原始JSON"
                ]
            },
            {
                name: "消息摘要算法",
                type: "option",
                value: [
                    "SHA-256",
                    "SHA-384",
                    "SHA-512",
                    "SHA-1",
                    "MD5"
                ]
            },
            {
                name: "ECDSA公钥(PEM)",
                type: "text",
                value: "-----BEGIN PUBLIC KEY-----"
            },
            {
                name: "信息",
                type: "text",
                value: ""
            },
            {
                name: "消息格式",
                type: "option",
                value: ["原始", "十六进制", "Base64"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let inputFormat = args[0];
        const [, mdAlgo, keyPem, msg, msgFormat] = args;

        if (keyPem.replace("-----BEGIN PUBLIC KEY-----", "").length === 0) {
            throw new OperationError("请输入公钥。");
        }

        // detect input format
        let inputJson;
        if (inputFormat === "自动检测") {
            try {
                inputJson = JSON.parse(input);
                if (typeof(inputJson) === "object") {
                    inputFormat = "原始JSON";
                }
            } catch {}
        }

        if (inputFormat === "自动检测") {
            const hexRegex = /^[a-f\d]{2,}$/gi;
            if (hexRegex.test(input)) {
                if (input.substring(0, 2) === "30" && r.ASN1HEX.isASN1HEX(input)) {
                    inputFormat = "ASN.1十六进制";
                } else {
                    inputFormat = "P1363十六进制";
                }
            }
        }

        let inputBase64;
        if (inputFormat === "自动检测") {
            try {
                inputBase64 = fromBase64(input, "A-Za-z0-9-_", false);
                inputFormat = "JSON Web签名（JWS）";
            } catch {}
        }

        // convert to ASN.1 signature
        let signatureASN1Hex;
        switch (inputFormat) {
            case "自动检测":
                throw new OperationError("无法检测到签名格式");
            case "ASN.1十六进制":
                signatureASN1Hex = input;
                break;
            case "P1363十六进制":
                signatureASN1Hex = r.KJUR.crypto.ECDSA.concatSigToASN1Sig(input);
                break;
            case "JSON Web签名（JWS）":
                if (!inputBase64) inputBase64 = fromBase64(input, "A-Za-z0-9-_");
                signatureASN1Hex = r.KJUR.crypto.ECDSA.concatSigToASN1Sig(toHexFast(inputBase64));
                break;
            case "原始JSON": {
                if (!inputJson) inputJson = JSON.parse(input);
                if (!inputJson.r) {
                    throw new OperationError('签名JSON中没有"r"值');
                }
                if (!inputJson.s) {
                    throw new OperationError('签名JSON中没有"s"值');
                }
                signatureASN1Hex = r.KJUR.crypto.ECDSA.hexRSSigToASN1Sig(inputJson.r, inputJson.s);
                break;
            }
        }

        // verify signature
        const internalAlgorithmName = mdAlgo.replace("-", "") + "withECDSA";
        const sig = new r.KJUR.crypto.Signature({ alg: internalAlgorithmName });
        const key = r.KEYUTIL.getKey(keyPem);
        if (key.type !== "EC") {
            throw new OperationError("提供的密钥不是EC密钥。");
        }
        if (!key.isPublic) {
            throw new OperationError("提供的密钥不是公钥。");
        }
        sig.init(key);
        const messageStr = Utils.convertToByteString(msg, msgFormat);
        sig.updateString(messageStr);
        const result = sig.verify(signatureASN1Hex);
        return result ? "验证成功" : "验证失败";
    }
}

export default ECDSAVerify;
