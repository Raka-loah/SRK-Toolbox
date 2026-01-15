/**
 * @author robinsandhu
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github
 */

import r from "jsrsasign";
import Operation from "../Operation.mjs";
import { fromBase64 } from "../lib/Base64.mjs";
import { toHex } from "../lib/Hex.mjs";
import { formatDnObj } from "../lib/PublicKey.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Parse X.509 CRL operation
 */
class ParseX509CRL extends Operation {

    /**
     * ParseX509CRL constructor
     */
    constructor() {
        super();

        this.name = "解析X.509证书吊销列表";
        this.module = "PublicKey";
        this.description = "解析证书吊销列表（Certificate Revocation List，CRL）";
        this.infoURL = "https://wikipedia.org/wiki/Certificate_revocation_list";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "输入格式",
                "type": "option",
                "value": ["PEM", "DER十六进制", "Base64", "原始"]
            }
        ];
        this.checks = [
            {
                "pattern": "^-+BEGIN X509 CRL-+\\r?\\n[\\da-z+/\\n\\r]+-+END X509 CRL-+\\r?\\n?$",
                "flags": "i",
                "args": ["PEM"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string} Human-readable description of a Certificate Revocation List (CRL).
     */
    run(input, args) {
        if (!input.length) {
            return "输入内容为空";
        }

        const inputFormat = args[0];

        let undefinedInputFormat = false;
        try {
            switch (inputFormat) {
                case "DER十六进制":
                    input = input.replace(/\s/g, "").toLowerCase();
                    break;
                case "PEM":
                    break;
                case "Base64":
                    input = toHex(fromBase64(input, null, "byteArray"), "");
                    break;
                case "原始":
                    input = toHex(Utils.strToArrayBuffer(input), "");
                    break;
                default:
                    undefinedInputFormat = true;
            }
        } catch (e) {
            throw "证书加载错误（请确保输入内容为证书）";
        }
        if (undefinedInputFormat) throw "未知的输入格式";

        const crl = new r.X509CRL(input);

        let out = `证书吊销列表 (CRL):
    版本： ${crl.getVersion() === null ? "1 (0x0)" : "2 (0x1)"}
    签名算法： ${crl.getSignatureAlgorithmField()}
    颁发者：\n${formatDnObj(crl.getIssuer(), 8)}
    最近更新： ${generalizedDateTimeToUTC(crl.getThisUpdate())}
    下次更新： ${generalizedDateTimeToUTC(crl.getNextUpdate())}\n`;

        if (crl.getParam().ext !== undefined) {
            out += `\tCRL扩展：\n${formatCRLExtensions(crl.getParam().ext, 8)}\n`;
        }

        out += `已吊销的证书：\n${formatRevokedCertificates(crl.getRevCertArray(), 4)}
签名值：\n${formatCRLSignature(crl.getSignatureValueHex(), 8)}`;

        return out;
    }
}

/**
 * Generalized date time string to UTC.
 * @param {string} datetime
 * @returns UTC datetime string.
 */
function generalizedDateTimeToUTC(datetime) {
    // Ensure the string is in the correct format
    if (!/^\d{12,14}Z$/.test(datetime)) {
        throw new OperationError(`datetime字符串 ${datetime} 构造失败`);
    }

    // Extract components
    let centuary = "20";
    if (datetime.length === 15) {
        centuary = datetime.substring(0, 2);
        datetime = datetime.slice(2);
    }
    const year = centuary + datetime.substring(0, 2);
    const month = datetime.substring(2, 4);
    const day = datetime.substring(4, 6);
    const hour = datetime.substring(6, 8);
    const minute = datetime.substring(8, 10);
    const second = datetime.substring(10, 12);

    // Construct ISO 8601 format string
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;

    // Parse using standard Date object
    const isoDateTime = new Date(isoString);

    return isoDateTime.toUTCString();
}

/**
 * Format CRL extensions.
 * @param {r.ExtParam[] | undefined} extensions
 * @param {Number} indent
 * @returns Formatted string detailing CRL extensions.
 */
function formatCRLExtensions(extensions, indent) {
    if (Array.isArray(extensions) === false || extensions.length === 0) {
        return indentString(`无CRL扩展。`, indent);
    }

    let out = ``;

    extensions.sort((a, b) => {
        if (!Object.hasOwn(a, "extname") || !Object.hasOwn(b, "extname")) {
            return 0;
        }
        if (a.extname < b.extname) {
            return -1;
        } else if (a.extname === b.extname) {
            return 0;
        } else {
            return 1;
        }
    });

    extensions.forEach((ext) => {
        if (!Object.hasOwn(ext, "extname")) {
            throw new OperationError(`CRL条目扩展对象缺少'extname'键： ${ext}`);
        }
        switch (ext.extname) {
            case "authorityKeyIdentifier":
                out += `X509v3 颁发机构密钥标识符：\n`;
                if (Object.hasOwn(ext, "kid")) {
                    out += `\tkeyid：${colonDelimitedHexFormatString(ext.kid.hex.toUpperCase())}\n`;
                }
                if (Object.hasOwn(ext, "issuer")) {
                    out += `\tDirName：${ext.issuer.str}\n`;
                }
                if (Object.hasOwn(ext, "sn")) {
                    out += `\tserial：${colonDelimitedHexFormatString(ext.sn.hex.toUpperCase())}\n`;
                }
                break;
            case "cRLDistributionPoints":
                out += `X509v3 CRL分发点：\n`;
                ext.array.forEach((distPoint) => {
                    const fullName = `全名：\n${formatGeneralNames(distPoint.dpname.full, 4)}`;
                    out += indentString(fullName, 4) + "\n";
                });
                break;
            case "cRLNumber":
                if (!Object.hasOwn(ext, "num")) {
                    throw new OperationError(`'cRLNumber' CRL条目扩展缺少'num'键： ${ext}`);
                }
                out += `X509v3 CRL号码：\n\t${ext.num.hex.toUpperCase()}\n`;
                break;
            case "issuerAltName":
                out += `X509v3 颁发者别名：\n${formatGeneralNames(ext.array, 4)}\n`;
                break;
            default:
                out += `${ext.extname}:\n`;
                out += `\t不支持的CRL扩展。试试Openssl命令行。\n`;
                break;
        }
    });

    return indentString(chop(out), indent);
}

/**
 * Format general names array.
 * @param {Object[]} names
 * @returns Multi-line formatted string describing all supported general name types.
 */
function formatGeneralNames(names, indent) {
    let out = ``;

    names.forEach((name) => {
        const key = Object.keys(name)[0];

        switch (key) {
            case "ip":
                out += `IP：${name.ip}\n`;
                break;
            case "dns":
                out += `DNS：${name.dns}\n`;
                break;
            case "uri":
                out += `URI：${name.uri}\n`;
                break;
            case "rfc822":
                out += `EMAIL：${name.rfc822}\n`;
                break;
            case "dn":
                out += `DIR：${name.dn.str}\n`;
                break;
            case "other":
                out += `OtherName：${name.other.oid}::${Object.values(name.other.value)[0].str}\n`;
                break;
            default:
                out += `${key}: 不支持的通用名称类型`;
                break;
        }
    });

    return indentString(chop(out), indent);
}

/**
 * Colon-delimited hex formatted output.
 * @param {string} hexString Hex String
 * @returns String representing input hex string with colon delimiter.
 */
function colonDelimitedHexFormatString(hexString) {
    if (hexString.length % 2 !== 0) {
        hexString = "0" + hexString;
    }

    return chop(hexString.replace(/(..)/g, "$&:"));
}

/**
 * Format revoked certificates array
 * @param {r.RevokedCertificate[] | null} revokedCertificates
 * @param {Number} indent
 * @returns Multi-line formatted string output of revoked certificates array
 */
function formatRevokedCertificates(revokedCertificates, indent) {
    if (Array.isArray(revokedCertificates) === false || revokedCertificates.length === 0) {
        return indentString("没有被吊销的证书。", indent);
    }

    let out=``;

    revokedCertificates.forEach((revCert) => {
        if (!Object.hasOwn(revCert, "sn") || !Object.hasOwn(revCert, "date")) {
            throw new OperationError("无效的吊销证书对象，缺少序列号或日期。");
        }

        out += `序列号： ${revCert.sn.hex.toUpperCase()}
    吊销日期： ${generalizedDateTimeToUTC(revCert.date)}\n`;
        if (Object.hasOwn(revCert, "ext") && Array.isArray(revCert.ext) && revCert.ext.length !== 0) {
            out += `\tCRL条目扩展：\n${indentString(formatCRLEntryExtensions(revCert.ext), 2*indent)}\n`;
        }
    });

    return indentString(chop(out), indent);
}

/**
 * Format CRL entry extensions.
 * @param {Object[]} exts
 * @returns Formatted multi-line string describing CRL entry extensions.
 */
function formatCRLEntryExtensions(exts) {
    let out = ``;

    const crlReasonCodeToReasonMessage = {
        0: "Unspecified",
        1: "Key Compromise",
        2: "CA Compromise",
        3: "Affiliation Changed",
        4: "Superseded",
        5: "Cessation Of Operation",
        6: "Certificate Hold",
        8: "Remove From CRL",
        9: "Privilege Withdrawn",
        10: "AA Compromise",
    };

    const holdInstructionOIDToName = {
        "1.2.840.10040.2.1": "Hold Instruction None",
        "1.2.840.10040.2.2": "Hold Instruction Call Issuer",
        "1.2.840.10040.2.3": "Hold Instruction Reject",
    };

    exts.forEach((ext) => {
        if (!Object.hasOwn(ext, "extname")) {
            throw new OperationError(`CRL条目扩展对象缺少'extname'键： ${ext}`);
        }
        switch (ext.extname) {
            case "cRLReason":
                if (!Object.hasOwn(ext, "code")) {
                    throw new OperationError(`'cRLReason' CRL条目扩展对象缺少'code'键： ${ext}`);
                }
                out += `X509v3 CRL原因编码：
    ${Object.hasOwn(crlReasonCodeToReasonMessage, ext.code) ? crlReasonCodeToReasonMessage[ext.code] : `无效的原因编码： ${ext.code}`}\n`;
                break;
            case "2.5.29.23": // Hold instruction
                out += `持有指令代码：\n\t${Object.hasOwn(holdInstructionOIDToName, ext.extn.oid) ? holdInstructionOIDToName[ext.extn.oid] : `${ext.extn.oid}: 未知的持有指令OID`}\n`;
                break;
            case "2.5.29.24": // Invalidity Date
                out += `失效日期：\n\t${generalizedDateTimeToUTC(ext.extn.gentime.str)}\n`;
                break;
            default:
                out += `${ext.extname}:\n`;
                out += `\t不支持的CRL扩展。试试Openssl命令行。\n`;
                break;
        }
    });

    return chop(out);
}

/**
 * Format CRL signature.
 * @param {String} sigHex
 * @param {Number} indent
 * @returns String representing hex signature value formatted on multiple lines.
 */
function formatCRLSignature(sigHex, indent) {
    if (sigHex.length % 2 !== 0) {
        sigHex = "0" + sigHex;
    }

    return indentString(formatMultiLine(chop(sigHex.replace(/(..)/g, "$&:"))), indent);
}

/**
 * Format string onto multiple lines.
 * @param {string} longStr
 * @returns String as a multi-line string.
 */
function formatMultiLine(longStr) {
    const lines = [];

    for (let remain = longStr ; remain !== "" ; remain = remain.substring(54)) {
        lines.push(remain.substring(0, 54));
    }

    return lines.join("\n");
}

/**
 * Indent a multi-line string by n spaces.
 * @param {string} input String
 * @param {number} spaces How many leading spaces
 * @returns Indented string.
 */
function indentString(input, spaces) {
    const indent = " ".repeat(spaces);
    return input.replace(/^/gm, indent);
}

/**
 * Remove last character from a string.
 * @param {string} s String
 * @returns Chopped string.
 */
function chop(s) {
    if (s.length < 1) {
        return s;
    }
    return s.substring(0, s.length - 1);
}

export default ParseX509CRL;
