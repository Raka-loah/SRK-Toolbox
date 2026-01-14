/**
 * @author GCHQ Contributor [3]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Protobuf from "../lib/Protobuf.mjs";

/**
 * VarInt Decode operation
 */
class VarIntDecode extends Operation {

    /**
     * VarIntDecode constructor
     */
    constructor() {
        super();

        this.name = "VarInt解码";
        this.module = "Default";
        this.description = "把VarInt编码的整数进行解码。VarInt是效率较高的编码变长整数的方式，通常用于Protobuf。";
        this.infoURL = "https://developers.google.com/protocol-buffers/docs/encoding#varints";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {number}
     */
    run(input, args) {
        try {
            if (typeof BigInt === "function") {
                let result = BigInt(0);
                let offset = BigInt(0);
                for (let i = 0; i < input.length; i++) {
                    result |= BigInt(input[i] & 0x7f) << offset;
                    if (!(input[i] & 0x80)) break;
                    offset += BigInt(7);
                }
                return result.toString();
            } else {
                return Protobuf.varIntDecode(input).toString();
            }
        } catch (err) {
            throw new OperationError(err);
        }
    }

}

export default VarIntDecode;
