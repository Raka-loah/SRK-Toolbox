/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import Stream from "../lib/Stream.mjs";
import {toHexFast, fromHex} from "../lib/Hex.mjs";
import {toBinary} from "../lib/Binary.mjs";
import {objToTable, bytesToLargeNumber} from "../lib/Protocol.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import BigNumber from "bignumber.js";

/**
 * Parse TCP operation
 */
class ParseTCP extends Operation {

    /**
     * ParseTCP constructor
     */
    constructor() {
        super();

        this.name = "解析TCP";
        this.module = "Default";
        this.description = "解析TCP首部和载荷（如果有）。";
        this.infoURL = "https://wikipedia.org/wiki/Transmission_Control_Protocol";
        this.inputType = "string";
        this.outputType = "json";
        this.presentType = "html";
        this.args = [
            {
                name: "输入格式",
                type: "option",
                value: ["十六进制", "原始"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const format = args[0];

        if (format === "十六进制") {
            input = fromHex(input);
        } else if (format === "原始") {
            input = Utils.strToArrayBuffer(input);
        } else {
            throw new OperationError("未知的输入格式。");
        }

        const s = new Stream(new Uint8Array(input));
        if (s.length < 20) {
            throw new OperationError("TCP首部需要至少20字节。");
        }

        // Parse Header
        const TCPPacket = {
            "来源连接端口": s.readInt(2),
            "目的连接端口": s.readInt(2),
            "序列号": bytesToLargeNumber(s.getBytes(4)),
            "确认号": s.readInt(4),
            "资料偏移": s.readBits(4),
            "标志符": {
                "保留": toBinary(s.readBits(3), "", 3),
                "NS": s.readBits(1),
                "CWR": s.readBits(1),
                "ECE": s.readBits(1),
                "URG": s.readBits(1),
                "ACK": s.readBits(1),
                "PSH": s.readBits(1),
                "RST": s.readBits(1),
                "SYN": s.readBits(1),
                "FIN": s.readBits(1),
            },
            "窗口大小": s.readInt(2),
            "校验和": "0x" + toHexFast(s.getBytes(2)),
            "紧急指针": "0x" + toHexFast(s.getBytes(2))
        };

        // Parse options if present
        let windowScaleShift = 0;
        if (TCPPacket["资料偏移"] > 5) {
            let remainingLength = TCPPacket["资料偏移"] * 4 - 20;

            const options = {};
            while (remainingLength > 0) {
                const option = {
                    "Kind": s.readInt(1)
                };

                let opt = { name: "Reserved", length: true };
                if (Object.prototype.hasOwnProperty.call(TCP_OPTION_KIND_LOOKUP, option.Kind)) {
                    opt = TCP_OPTION_KIND_LOOKUP[option.Kind];
                }

                // Add Length and Value fields
                if (opt.length) {
                    option.Length = s.readInt(1);

                    if (option.Length > 2) {
                        if (Object.prototype.hasOwnProperty.call(opt, "parser")) {
                            option.Value = opt.parser(s.getBytes(option.Length - 2));
                        } else {
                            option.Value = option.Length <= 6 ?
                                s.readInt(option.Length - 2):
                                "0x" + toHexFast(s.getBytes(option.Length - 2));
                        }

                        // Store Window Scale shift for later
                        if (option.Kind === 3 && option.Value) {
                            windowScaleShift = option.Value["移位偏移量"];
                        }
                    }
                }
                options[opt.name] = option;

                const length = option.Length || 1;
                remainingLength -= length;
            }
            TCPPacket.Options = options;
        }

        if (s.hasMore()) {
            TCPPacket.Data = "0x" + toHexFast(s.getBytes());
        }

        // Improve values
        TCPPacket["资料偏移"] = `${TCPPacket["资料偏移"]} (${TCPPacket["资料偏移"] * 4} 字节)`;
        const trueWndSize = BigNumber(TCPPacket["窗口大小"]).multipliedBy(BigNumber(2).pow(BigNumber(windowScaleShift)));
        TCPPacket["窗口大小"] = `${TCPPacket["窗口大小"]} (扩大后: ${trueWndSize})`;

        return TCPPacket;
    }

    /**
     * Displays the TCP Packet in a tabular style
     * @param {Object} data
     * @returns {html}
     */
    present(data) {
        return objToTable(data);
    }

}

// Taken from https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xhtml
// on 2022-05-30
const TCP_OPTION_KIND_LOOKUP = {
    0: { name: "End of Option List", length: false },
    1: { name: "No-Operation", length: false },
    2: { name: "Maximum Segment Size", length: true },
    3: { name: "Window Scale", length: true, parser: windowScaleParser },
    4: { name: "SACK Permitted", length: true },
    5: { name: "SACK", length: true },
    6: { name: "Echo (obsoleted by option 8)", length: true },
    7: { name: "Echo Reply (obsoleted by option 8)", length: true },
    8: { name: "Timestamps", length: true, parser: tcpTimestampParser },
    9: { name: "Partial Order Connection Permitted (obsolete)", length: true },
    10: { name: "Partial Order Service Profile (obsolete)", length: true },
    11: { name: "CC (obsolete)", length: true },
    12: { name: "CC.NEW (obsolete)", length: true },
    13: { name: "CC.ECHO (obsolete)", length: true },
    14: { name: "TCP Alternate Checksum Request (obsolete)", length: true, parser: tcpAlternateChecksumParser },
    15: { name: "TCP Alternate Checksum Data (obsolete)", length: true },
    16: { name: "Skeeter", length: true },
    17: { name: "Bubba", length: true },
    18: { name: "Trailer Checksum Option", length: true },
    19: { name: "MD5 Signature Option (obsoleted by option 29)", length: true },
    20: { name: "SCPS Capabilities", length: true },
    21: { name: "Selective Negative Acknowledgements", length: true },
    22: { name: "Record Boundaries", length: true },
    23: { name: "Corruption experienced", length: true },
    24: { name: "SNAP", length: true },
    25: { name: "Unassigned (released 2000-12-18)", length: true },
    26: { name: "TCP Compression Filter", length: true },
    27: { name: "Quick-Start Response", length: true },
    28: { name: "User Timeout Option (also, other known unauthorized use)", length: true },
    29: { name: "TCP Authentication Option (TCP-AO)", length: true },
    30: { name: "Multipath TCP (MPTCP)", length: true },
    69: { name: "Encryption Negotiation (TCP-ENO)", length: true },
    70: { name: "Reserved (known unauthorized use without proper IANA assignment)", length: true },
    76: { name: "Reserved (known unauthorized use without proper IANA assignment)", length: true },
    77: { name: "Reserved (known unauthorized use without proper IANA assignment)", length: true },
    78: { name: "Reserved (known unauthorized use without proper IANA assignment)", length: true },
    253: { name: "RFC3692-style Experiment 1 (also improperly used for shipping products) ", length: true },
    254: { name: "RFC3692-style Experiment 2 (also improperly used for shipping products) ", length: true }
};

/**
 * Parses the TCP Alternate Checksum Request field
 * @param {Uint8Array} data
 */
function tcpAlternateChecksumParser(data) {
    const lookup = {
        0: "TCP Checksum",
        1: "8-bit Fletchers's algorithm",
        2: "16-bit Fletchers's algorithm",
        3: "Redundant Checksum Avoidance"
    }[data[0]];

    return `${lookup} (0x${toHexFast(data)})`;
}

/**
 * Parses the TCP Timestamp field
 * @param {Uint8Array} data
 */
function tcpTimestampParser(data) {
    const s = new Stream(data);

    if (s.length !== 8)
        return `错误：时间戳字段必须为8个字节(接收到 0x${toHexFast(data)})`;

    const tsval = bytesToLargeNumber(s.getBytes(4)),
        tsecr = bytesToLargeNumber(s.getBytes(4));

    return {
        "当前时间戳": tsval,
        "应答回复": tsecr
    };
}

/**
 * Parses the Window Scale field
 * @param {Uint8Array} data
 */
function windowScaleParser(data) {
    if (data.length !== 1)
        return `错误：窗口扩大值需要1个字节(接收到 0x${toHexFast(data)})`;

    return {
        "移位偏移量": data[0],
        "乘数": 1 << data[0]
    };
}

export default ParseTCP;
