/**
 * @author c65722 []
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import Operation from "../Operation.mjs";
import Stream from "../lib/Stream.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Strip UDP header operation
 */
class StripUDPHeader extends Operation {

    /**
     * StripUDPHeader constructor
     */
    constructor() {
        super();

        this.name = "移除UDP标头";
        this.module = "Default";
        this.description = "从UDP数据报移除UDP标头，只输出载荷。";
        this.infoURL = "https://wikipedia.org/wiki/User_Datagram_Protocol";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const HEADER_LEN = 8;

        const s = new Stream(new Uint8Array(input));
        if (s.length < HEADER_LEN) {
            throw new OperationError("UDP标头长度至少8字节");
        }

        s.moveTo(HEADER_LEN);

        return s.getBytes().buffer;
    }

}

export default StripUDPHeader;
